import { Redis } from '@upstash/redis'
const redis = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })

export default async function handler(req, res) {
  const codes = await redis.smembers('public_rooms')
  for (const code of codes) {
    await redis.del(`room:${code}`)
    await redis.del(`messages:${code}`)
    await redis.srem('public_rooms', code)
  }
  res.json({ deleted: codes })
}