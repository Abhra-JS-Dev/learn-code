import { useEffect, useRef, useState } from 'react'
import './App.css'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'

export type Role = 'user' | 'assistant' | 'system'

export type ChatMessage = {
  id: string
  role: Role
  content: string
}

async function streamMarkdown(body: unknown, onChunk: (text: string) => void) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok || !res.body) {
    throw new Error(`Request failed: ${res.status}`)
  }
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    onChunk(decoder.decode(value, { stream: true }))
  }
}

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const chatRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight })
  }, [messages.length, isStreaming])

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return
    const user: ChatMessage = {
      id: Math.random().toString(36).slice(2),
      role: 'user',
      content: input,
    }
    setMessages((prev) => [...prev, user])
    setInput('')

    const assistantId = Math.random().toString(36).slice(2)
    setMessages((prev) => [...prev, { id: assistantId, role: 'assistant', content: '' }])

    setIsStreaming(true)
    try {
      await streamMarkdown(
        { prompt: user.content, messages: messages.concat(user).map(({ role, content }) => ({ role, content })) },
        (chunk) => {
          setMessages((prev) => {
            return prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + chunk } : m))
          })
        },
      )
    } catch (e) {
      setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + '\n\n[Error streaming response]' } : m)))
    } finally {
      setIsStreaming(false)
    }
  }

  const renderMessage = (m: ChatMessage) => {
    return (
      <div key={m.id} className="message">
        <div className="role">{m.role}</div>
        <div className="content markdown code-block">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
            {m.content}
          </ReactMarkdown>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="header">
        <div>Streaming Chat</div>
        <button onClick={() => setMessages([])} disabled={isStreaming}>Clear</button>
      </div>

      <div className="chat" ref={chatRef}>
        {messages.map(renderMessage)}
        {isStreaming && (
          <div className="message">
            <div className="role">assistant</div>
            <div className="content">…</div>
          </div>
        )}
      </div>

      <div className="footer">
        <div className="row">
          <input
            type="text"
            placeholder="Ask anything…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
          />
          <button className="send" onClick={handleSend} disabled={isStreaming || !input.trim()}>
            {isStreaming ? 'Streaming…' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
