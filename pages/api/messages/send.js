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
  const { code, author, text, color } = req.body
  const roomCode = code?.toUpperCase()
  if (!roomCode || !author || !text || !store.rooms[roomCode]) return res.status(400).end()
  const msg = { id: Date.now() + '-' + Math.random().toString(36).slice(2), author, text: text.slice(0, 2000), color, ts: Date.now() }
  store.rooms[roomCode].messages.push(msg)
  if (store.rooms[roomCode].messages.length > 200) store.rooms[roomCode].messages = store.rooms[roomCode].messages.slice(-200)
  await pusher.trigger(`room-${roomCode}`, 'message', msg)
  res.status(201).json(msg)
}