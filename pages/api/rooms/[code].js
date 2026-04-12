import { Redis } from '@upstash/redis'
const redis = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
  const { code } = req.query
  const roomCode = (Array.isArray(code) ? code[0] : code)?.toUpperCase()
  const room = await redis.hgetall(`room:${roomCode}`)
  if (!room) return res.status(404).json({ error: 'Room not found' })
  const messages = await redis.lrange(`messages:${roomCode}`, -100, -1)
  res.json({ ...room, messages: messages.map(m => JSON.parse(m)) })
}