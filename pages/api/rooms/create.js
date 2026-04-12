import { Redis } from '@upstash/redis'
const redis = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })
const WORDS = ['QWER', 'TYUI', 'UIOP', 'ASDF', 'HJKL', 'ZXCV', 'VBNM', 'GOAT', 'NEOR', 'SAMZ', 'KAMI', 'ROOM']

function genCode() {
  return WORDS[Math.floor(Math.random() * WORDS.length)] + '-' + Math.floor(10 + Math.random() * 90)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { name, topic, visibility, createdBy } = req.body
  if (!name || !createdBy) return res.status(400).json({ error: 'name and createdBy required' })

  let code = genCode()
  let attempts = 0
  while (await redis.exists(`room:${code}`) && attempts++ < 20) code = genCode()

  const room = { code, name, topic: topic || '', visibility: visibility || 'public', createdBy, members: 0, createdAt: Date.now() }
  await redis.hset(`room:${code}`, room)
  if (visibility === 'public') await redis.sadd('public_rooms', code)

  res.status(201).json({ ...room, messages: [] })
}