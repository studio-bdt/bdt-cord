const store = global._store || (global._store = { rooms: {} })
const WORDS = ['QWER', 'TYUI', 'UIOP', 'ASDF', 'GHJK', 'HJKL', 'ZXCV', 'VBNM', 'GOAT', 'NEOR', 'SAMZ', 'KAMI', 'VROM']

function genCode() {
  return WORDS[Math.floor(Math.random() * WORDS.length)] + '-' + Math.floor(10 + Math.random() * 90)
}

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { name, topic, visibility, createdBy } = req.body
  if (!name || !createdBy) return res.status(400).json({ error: 'name and createdBy required' })
  let code
  let attempts = 0
  do { code = genCode(); attempts++ } while (store.rooms[code] && attempts < 20)
  store.rooms[code] = { code, name, topic: topic || '', visibility: visibility || 'public', createdBy, members: 0, messages: [], createdAt: Date.now() }
  res.status(201).json(store.rooms[code])
}