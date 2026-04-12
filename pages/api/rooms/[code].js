import { getRoom, getMessages } from '../../../lib/store'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
  const { code } = req.query
  const roomCode = (Array.isArray(code) ? code[0] : code)?.toUpperCase()
  const room = getRoom(roomCode)
  if (!room) return res.status(404).json({ error: 'Room not found' })
  res.json({ ...room, messages: getMessages(roomCode) })
}