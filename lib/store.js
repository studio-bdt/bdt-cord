const store = { rooms: {} }

export function getRoom(code) {
  return store.rooms[code] || null
}

export function getAllPublicRooms() {
  return Object.values(store.rooms)
    .filter(r => r.visibility === 'public')
    .map(r => ({ ...r, messages: undefined }))
}

export function createRoom({ code, name, topic, visibility, createdBy }) {
  store.rooms[code] = { code, name, topic, visibility, createdBy, members: 0, messages: [], createdAt: Date.now() }
  return store.rooms[code]
}

export function addMessage(code, msg) {
  if (!store.rooms[code]) return null
  store.rooms[code].messages.push(msg)
  if (store.rooms[code].messages.length > 200) {
    store.rooms[code].messages = store.rooms[code].messages.slice(-200)
  }
  return msg
}

export function getMessages(code) {
  return store.rooms[code]?.messages || []
}

export function updateMembers(code, delta) {
  if (!store.rooms[code]) return
  store.rooms[code].members = Math.max(0, (store.rooms[code].members || 0) + delta)
  return store.rooms[code].members
}