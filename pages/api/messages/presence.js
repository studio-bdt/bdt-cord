import Pusher from 'pusher'
const store = global._store || (global._store = { rooms: {} })

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
})

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { code, author, action } = req.body
  const roomCode = code?.toUpperCase()
  if (!roomCode || !author || !store.rooms[roomCode]) return res.status(400).end()
  const delta = action === 'join' ? 1 : -1
  store.rooms[roomCode].members = Math.max(0, (store.rooms[roomCode].members || 0) + delta)
  await pusher.trigger(`room-${roomCode}`, 'presence', { author, action, members: store.rooms[roomCode].members })
  res.status(200).json({ members: store.rooms[roomCode].members })
}