import Pusher from 'pusher'
const pusher = new Pusher({ appId: process.env.PUSHER_APP_ID, key: process.env.PUSHER_KEY, secret: process.env.PUSHER_SECRET, cluster: process.env.PUSHER_CLUSTER, useTLS: true })

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { code, author } = req.body
  if (!code || !author) return res.status(400).end()
  await pusher.trigger(`room-${code.toUpperCase()}`, 'typing', { author })
  res.status(200).end()
}