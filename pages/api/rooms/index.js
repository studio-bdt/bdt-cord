const store = global._store || (global._store = { rooms: {} })

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
  const rooms = Object.values(store.rooms)
    .filter(r => r.visibility === 'public')
    .map(({ messages, ...r }) => r)
  res.json(rooms)
}