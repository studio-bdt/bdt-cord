import Pusher from 'pusher'
import { Redis } from '@upstash/redis'
const redis = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })
const pusher = new Pusher({ appId: process.env.PUSHER_APP_ID, key: process.env.PUSHER_KEY, secret: process.env.PUSHER_SECRET, cluster: process.env.PUSHER_CLUSTER, useTLS: true })

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  let body = req.body
  if (typeof body === 'string') {
    try { body = JSON.parse(body) } catch { return res.status(400).end() }
  }

  const { code, author, action } = body
  const roomCode = code?.toUpperCase()
  if (!roomCode || !author) return res.status(400).end()

  const delta = action === 'join' ? 1 : -1
  const members = await redis.hincrby(`room:${roomCode}`, 'members', delta)
  const actual = Math.max(0, members)

  if (actual === 0) {
    await redis.del(`room:${roomCode}`)
    await redis.del(`messages:${roomCode}`)
    await redis.srem('public_rooms', roomCode)
  }

  await pusher.trigger(`room-${roomCode}`, 'presence', { author, action, members: actual })
  res.status(200).json({ members: actual })
}