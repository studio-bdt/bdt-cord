const store = global._store || (global._store = { rooms: {} })

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
  const { code } = req.query
  const roomCode = (Array.isArray(code) ? code[0] : code)?.toUpperCase()
  const room = store.rooms[roomCode]
  if (!room) return res.status(404).json({ error: 'Room not found' })
  res.json(room)
}