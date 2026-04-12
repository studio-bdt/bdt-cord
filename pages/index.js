import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import PusherClient from 'pusher-js'
import styles from './index.module.css'

const COLORS = ['#e05c5c','#e07a2f','#b8a800','#3a9e4e','#2d8cbf','#7b5ea7','#c45b8e']

function colorForName(name) {
  let h = 0
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff
  return COLORS[Math.abs(h) % COLORS.length]
}

function Avatar({ name, color }) {
  const c = color || colorForName(name)
  return (
    <div className={styles.avatar} style={{ background: c }}>
      {name[0]?.toUpperCase()}
    </div>
  )
}

function LandingScreen({ onJoin, onBrowse }) {
  const [name, setName]       = useState('')
  const [code, setCode]       = useState('')
  const [rName, setRName]     = useState('')
  const [rTopic, setRTopic]   = useState('')
  const [vis, setVis]         = useState('public')
  const [err, setErr]         = useState('')
  const [loading, setLoading] = useState(false)

  async function handleJoin() {
    if (!name.trim()) { setErr('Enter your display name first.'); return }
    if (!code.trim()) { setErr('Enter a room code.'); return }
    setErr(''); setLoading(true)
    try {
      const res = await fetch(`/api/rooms/${code.trim().toUpperCase()}`)
      if (!res.ok) { setErr('Room not found — check the code.'); return }
      onJoin(await res.json(), name.trim())
    } catch { setErr('Could not connect.') } finally { setLoading(false) }
  }

  async function handleCreate() {
    if (!name.trim()) { setErr('Enter your display name first.'); return }
    if (!rName.trim()) { setErr('Give your room a name.'); return }
    setErr(''); setLoading(true)
    try {
      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: rName.trim(), topic: rTopic.trim(), visibility: vis, createdBy: name.trim() }),
      })
      onJoin(await res.json(), name.trim())
    } catch { setErr('Could not create room.') } finally { setLoading(false) }
  }

  return (
    <div className={styles.landing}>
      <div className={styles.landingInner}>
        <h1 className={styles.landingTitle}>BDT-cord</h1>

        <div className={styles.joinCards}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Your name</h2>
            <input className={styles.input} value={name} onChange={e => setName(e.target.value)}
              placeholder="Display name" maxLength={24} autoFocus />
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Join a room</h2>
            <div className={styles.row}>
              <input className={styles.input} value={code} onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="Room code" maxLength={12}
                onKeyDown={e => e.key === 'Enter' && handleJoin()} />
              <button className={styles.btnPrimary} onClick={handleJoin} disabled={loading}>Join</button>
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Create a room</h2>
            <input className={styles.input} value={rName} onChange={e => setRName(e.target.value)}
              placeholder="Room name" maxLength={32} />
            <input className={styles.input} value={rTopic} onChange={e => setRTopic(e.target.value)}
              placeholder="Description (optional)" maxLength={80} />
            <div className={styles.visRow}>
              <button className={vis === 'public' ? styles.btnPrimary : styles.btn} onClick={() => setVis('public')}>Public</button>
              <button className={vis === 'private' ? styles.btnPrimary : styles.btn} onClick={() => setVis('private')}>Private</button>
            </div>
            <button className={styles.btnPrimary} onClick={handleCreate} disabled={loading}>Create room</button>
          </section>
        </div>

        {err && <p className={styles.error}>{err}</p>}

        <button className={styles.linkBtn} onClick={onBrowse}>Browse public rooms →</button>
        <button className={styles.darkModeToggle} onClick={() => { document.body.classList.toggle('dark'); console.log('Dark mode toggled');}}></button>
      </div>
    </div>
  )
}

function BrowseScreen({ onBack, onJoin, username, onSetUsername }) {
  const [rooms, setRooms]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/rooms').then(r => r.json()).then(data => { setRooms(data); setLoading(false) })
  }, [])

  async function handleJoin(room) {
    let name = username
    if (!name) {
      name = prompt('Enter your display name:')
      if (!name?.trim()) return
      onSetUsername(name.trim())
      name = name.trim()
    }
    const res = await fetch(`/api/rooms/${room.code}`)
    onJoin(await res.json(), name)
  }

  return (
    <div className={styles.browse}>
      <div className={styles.browseHeader}>
        <button className={styles.btn} onClick={onBack}>← Back</button>
        <h2>Public rooms</h2>
      </div>
      <div className={styles.roomList}>
        {loading && <p className={styles.muted}>Loading…</p>}
        {!loading && rooms.length === 0 && <p className={styles.muted}>No public rooms yet.</p>}
        {rooms.map(room => (
          <div key={room.code} className={styles.roomCard} onClick={() => handleJoin(room)}>
            <Avatar name={room.name} />
            <div className={styles.roomInfo}>
              <div className={styles.roomName}>{room.name}</div>
              {room.topic && <div className={styles.roomTopic}>{room.topic}</div>}
            </div>
            <div className={styles.roomMeta}>
              <span className={styles.roomCode}>{room.code}</span>
              <span className={styles.muted}>{room.members} online</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ChatScreen({ room, username, onLeave }) {
  const [messages, setMessages] = useState(room.messages || [])
  const [text, setText]         = useState('')
  const [typingUsers, setTyping] = useState([])
  const [members, setMembers]   = useState(room.members || 1)
  const bottomRef   = useRef(null)
  const typingTimer = useRef(null)
  const myColor     = colorForName(username)

  useEffect(() => {
    const client = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    })
    const channel = client.subscribe(`room-${room.code}`)

    channel.bind('message', msg => setMessages(prev => [...prev, msg]))
    channel.bind('typing', ({ author }) => {
      if (author === username) return
      setTyping(prev => prev.includes(author) ? prev : [...prev, author])
      clearTimeout(typingTimer.current)
      typingTimer.current = setTimeout(() => setTyping([]), 2500)
    })
    channel.bind('presence', ({ members: m }) => setMembers(m))

    fetch('/api/messages/presence', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: room.code, author: username, action: 'join' }),
    })

    return () => {
      fetch('/api/messages/presence', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: room.code, author: username, action: 'leave' }),
      })
      client.disconnect()
    }
  }, [room.code])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typingUsers])

  function emitTyping() {
    fetch('/api/messages/typing', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: room.code, author: username }),
    })
  }

  async function send() {
    const t = text.trim()
    if (!t) return
    setText('')
    await fetch('/api/messages/send', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: room.code, author: username, text: t, color: myColor }),
    })
  }

  const typingText = typingUsers.length === 1
    ? `${typingUsers[0]} is typing…`
    : typingUsers.length > 1 ? `${typingUsers.join(', ')} are typing…` : ''

  return (
    <div className={styles.chat}>
      <div className={styles.chatHeader}>
        <button className={styles.btn} onClick={onLeave}>← Leave</button>
        <div className={styles.chatHeaderInfo}>
          <span className={styles.chatRoomName}>{room.name}</span>
          <span className={styles.badge}>{room.visibility}</span>
        </div>
        <div className={styles.chatHeaderMeta}>
          <span className={styles.roomCode}>{room.code}</span>
          <span className={styles.muted}>{members} online</span>
        </div>
      </div>

      <div className={styles.messages}>
        {room.topic && <div className={styles.topicBanner}>{room.topic}</div>}
        {messages.map(msg => {
          const isMe = msg.author === username
          return (
            <div key={msg.id || msg.ts} className={`${styles.msgRow} ${isMe ? styles.msgRowMe : ''}`}>
              <Avatar name={msg.author} color={msg.color} />
              <div className={styles.msgInner}>
                <span className={styles.msgAuthor}>{msg.author}</span>
                <div className={`${styles.msgBubble} ${isMe ? styles.msgBubbleMe : ''}`}>
                  {msg.text}
                </div>
              </div>
            </div>
          )
        })}
        {typingText && <p className={styles.typing}>{typingText}</p>}
        <div ref={bottomRef} />
      </div>

      <div className={styles.chatInputRow}>
        <input
          className={styles.input}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
            else emitTyping()
          }}
          placeholder={`Message ${room.name}…`}
        />
        <button className={styles.btnPrimary} onClick={send} disabled={!text.trim()}>Send</button>
      </div>
    </div>
  )
}

export default function Home() {
  const [screen, setScreen]     = useState('landing')
  const [room, setRoom]         = useState(null)
  const [username, setUsername] = useState('')

  function handleJoin(roomData, name) {
    setRoom(roomData)
    setUsername(name)
    setScreen('chat')
  }

  return (
    <>
      <Head>
        <title>BDT-cord</title>
        <link rel="icon" type="image/x-icon" href="../images/bdt logo.png"></link>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      {screen === 'landing' && <LandingScreen onJoin={handleJoin} onBrowse={() => setScreen('browse')} />}
      {screen === 'browse' && <BrowseScreen onBack={() => setScreen('landing')} onJoin={handleJoin} username={username} onSetUsername={setUsername} />}
      {screen === 'chat' && room && <ChatScreen room={room} username={username} onLeave={() => { setRoom(null); setScreen('landing') }} />}
    </>
  )
}
