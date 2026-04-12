import Pusher from 'pusher'
import { Redis } from '@upstash/redis'
const redis = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })
const pusher = new Pusher({ appId: process.env.PUSHER_APP_ID, key: process.env.PUSHER_KEY, secret: process.env.PUSHER_SECRET, cluster: process.env.PUSHER_CLUSTER, useTLS: true })

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { code, author, text, color } = req.body
  const roomCode = code?.toUpperCase()
  if (!roomCode || !author || !text) return res.status(400).end()
  if (!await redis.exists(`room:${roomCode}`)) return res.status(404).end()
  const msg = { id: Date.now() + '-' + Math.random().toString(36).slice(2), author, text: text.slice(0, 2000), color, ts: Date.now() }
  await redis.rpush(`messages:${roomCode}`, JSON.stringify(msg))
  await redis.ltrim(`messages:${roomCode}`, -200, -1)
  await pusher.trigger(`room-${roomCode}`, 'message', msg)
  res.status(201).json(msg)
}