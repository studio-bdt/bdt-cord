import { Redis } from '@upstash/redis'
const redis = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
  const codes = await redis.smembers('public_rooms')
  if (!codes.length) return res.json([])
  const rooms = await Promise.all(codes.map(code => redis.hgetall(`room:${code}`)))
  res.json(rooms.filter(Boolean).map(r => ({ ...r, messages: undefined })))
}