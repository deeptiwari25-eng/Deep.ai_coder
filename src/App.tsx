import { useEffect, useRef, useState, type FormEvent } from 'react'
import './App.css'

type MessagePart =
  | {
      kind: 'text'
      text: string
    }
  | {
      kind: 'code'
      language: string
      code: string
    }

type ChatMessage = {
  id: number
  role: 'user' | 'assistant'
  parts: MessagePart[]
}

type ChatThread = {
  id: number
  title: string
  label: string
  status: string
  messages: ChatMessage[]
}

const initialThreads: ChatThread[] = [
  {
    id: 1,
    title: 'Neural Pulse',
    label: 'active',
    status: 'running / 98%',
    messages: [
      {
        id: 11,
        role: 'assistant',
        parts: [
          {
            kind: 'text',
            text: 'Signal acquired. The network is stable and the relay is locked on the target channel.',
          },
          {
            kind: 'code',
            language: 'ts',
            code: `const handshake = await establishLink({
  cipher: 'neon-7',
  fallback: 'quantum-shadow',
})`,
          },
        ],
      },
      {
        id: 12,
        role: 'user',
        parts: [
          {
            kind: 'text',
            text: 'Keep the scanline alive and surface the latest anomaly markers.',
          },
        ],
      },
      {
        id: 13,
        role: 'assistant',
        parts: [
          {
            kind: 'text',
            text: 'Confirmed. Anomaly markers are being tracked in real time across the active cluster.',
          },
        ],
      },
    ],
  },
  {
    id: 2,
    title: 'Cipher Stack',
    label: 'idle',
    status: 'standby / 61%',
    messages: [
      {
        id: 21,
        role: 'assistant',
        parts: [
          {
            kind: 'text',
            text: 'Secondary channel is ready. The composition layer can be rewritten without dropping packets.',
          },
        ],
      },
    ],
  },
]

function NeuralCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current

    if (!canvas) {
      return undefined
    }

    const context = canvas.getContext('2d')

    if (!context) {
      return undefined
    }

    const nodes = Array.from({ length: 58 }, (_, index) => {
      const spread = 0.7 + (index % 8) * 0.03

      return {
        x: (Math.random() - 0.5) * spread,
        y: (Math.random() - 0.5) * spread,
        z: (Math.random() - 0.5) * spread,
        vx: (Math.random() - 0.5) * 0.0014,
        vy: (Math.random() - 0.5) * 0.0014,
        vz: (Math.random() - 0.5) * 0.0014,
        pulse: Math.random() * Math.PI * 2,
      }
    })

    const state = {
      width: 0,
      height: 0,
      devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
      rotation: 0,
    }

    let animationFrameId = 0

    const resizeCanvas = () => {
      const { width, height } = canvas.getBoundingClientRect()
      state.width = Math.max(width, 1)
      state.height = Math.max(height, 1)
      canvas.width = Math.floor(state.width * state.devicePixelRatio)
      canvas.height = Math.floor(state.height * state.devicePixelRatio)
      context.setTransform(state.devicePixelRatio, 0, 0, state.devicePixelRatio, 0, 0)
    }

    const projectPoint = (x: number, y: number, z: number) => {
      const depth = 2.4
      const safeDepth = Math.max(0.6, depth - z)
      const perspective = depth / safeDepth

      return {
        x: state.width * 0.5 + x * perspective * state.width * 0.48,
        y: state.height * 0.5 + y * perspective * state.width * 0.28,
        scale: perspective,
      }
    }

    const drawFrame = () => {
      state.rotation += 0.004

      context.clearRect(0, 0, state.width, state.height)

      const backgroundGradient = context.createRadialGradient(
        state.width * 0.46,
        state.height * 0.42,
        20,
        state.width * 0.5,
        state.height * 0.5,
        Math.max(state.width, state.height) * 0.75,
      )

      backgroundGradient.addColorStop(0, 'rgba(0, 255, 159, 0.09)')
      backgroundGradient.addColorStop(0.45, 'rgba(10, 18, 24, 0.22)')
      backgroundGradient.addColorStop(1, 'rgba(2, 4, 8, 0.95)')
      context.fillStyle = backgroundGradient
      context.fillRect(0, 0, state.width, state.height)

      const projectedNodes = nodes.map((node) => {
        node.x += node.vx
        node.y += node.vy
        node.z += node.vz
        node.pulse += 0.015

        if (node.x > 0.95 || node.x < -0.95) node.vx *= -1
        if (node.y > 0.9 || node.y < -0.9) node.vy *= -1
        if (node.z > 0.95 || node.z < -0.95) node.vz *= -1

        const cosRotation = Math.cos(state.rotation)
        const sinRotation = Math.sin(state.rotation)
        const rotatedX = node.x * cosRotation - node.z * sinRotation
        const rotatedZ = node.x * sinRotation + node.z * cosRotation
        const rotatedY = node.y * Math.cos(state.rotation * 0.72) - rotatedZ * Math.sin(state.rotation * 0.4)
        const depthZ = rotatedZ * Math.cos(state.rotation * 0.4) + node.y * Math.sin(state.rotation * 0.72)
        const projected = projectPoint(rotatedX, rotatedY, depthZ)

        return {
          ...projected,
          depth: depthZ,
          glow: 0.4 + Math.sin(node.pulse) * 0.2,
        }
      })

      context.save()
      context.globalCompositeOperation = 'lighter'

      for (let firstIndex = 0; firstIndex < projectedNodes.length; firstIndex += 1) {
        const firstNode = projectedNodes[firstIndex]

        for (let secondIndex = firstIndex + 1; secondIndex < projectedNodes.length; secondIndex += 1) {
          const secondNode = projectedNodes[secondIndex]
          const deltaX = firstNode.x - secondNode.x
          const deltaY = firstNode.y - secondNode.y
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

          if (distance > 132) {
            continue
          }

          const alpha = (1 - distance / 132) * 0.35
          context.beginPath()
          context.strokeStyle = `rgba(0, 255, 159, ${alpha})`
          context.lineWidth = 1 + (1 - distance / 132) * 1.2
          context.moveTo(firstNode.x, firstNode.y)
          context.lineTo(secondNode.x, secondNode.y)
          context.stroke()
        }
      }

      projectedNodes.forEach((node) => {
        const nodeRadius = 1.8 + node.glow * 2.5

        context.beginPath()
        context.fillStyle = `rgba(255, 0, 102, ${0.15 + node.glow * 0.2})`
        context.arc(node.x, node.y, nodeRadius + 5, 0, Math.PI * 2)
        context.fill()

        context.beginPath()
        context.fillStyle = `rgba(0, 255, 159, ${0.48 + node.glow * 0.35})`
        context.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2)
        context.fill()
      })

      context.restore()
      animationFrameId = window.requestAnimationFrame(drawFrame)
    }

    const observer = new ResizeObserver(() => {
      resizeCanvas()
    })

    observer.observe(canvas)
    resizeCanvas()
    drawFrame()

    return () => {
      observer.disconnect()
      window.cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return <canvas ref={canvasRef} className="neural-canvas" aria-hidden="true" />
}

function App() {
  const [threads, setThreads] = useState<ChatThread[]>(initialThreads)
  const [activeThreadId, setActiveThreadId] = useState<number>(initialThreads[0].id)
  const [draftMessage, setDraftMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const activeThread = threads.find((thread) => thread.id === activeThreadId) ?? threads[0]

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [activeThreadId, activeThread.messages.length, isTyping])

  const handleSendMessage = () => {
    const trimmedDraft = draftMessage.trim()

    if (!trimmedDraft || isTyping) {
      return
    }

    const threadId = activeThreadId
    const userMessageId = Date.now()
    const assistantReplyId = userMessageId + 1

    const userMessage: ChatMessage = {
      id: userMessageId,
      role: 'user',
      parts: [{ kind: 'text', text: trimmedDraft }],
    }

    setThreads((currentThreads) =>
      currentThreads.map((thread) =>
        thread.id === threadId
          ? {
              ...thread,
              status: 'live / synced',
              messages: [...thread.messages, userMessage],
            }
          : thread,
      ),
    )
    setDraftMessage('')
    setIsTyping(true)

    window.setTimeout(() => {
      setThreads((currentThreads) =>
        currentThreads.map((thread) =>
          thread.id === threadId
            ? {
                ...thread,
                messages: [
                  ...thread.messages,
                  {
                    id: assistantReplyId,
                    role: 'assistant',
                    parts: [
                      {
                        kind: 'text',
                        text: 'Reply registered. The Deep.AI matrix is responsive and the next scan cycle is already queued.',
                      },
                      {
                        kind: 'code',
                        language: 'tsx',
                        code: `const status = {
  link: 'stable',
  latency: '12ms',
  scan: 'armed',
}`,
                      },
                    ],
                  },
                ],
              }
            : thread,
        ),
      )
      setIsTyping(false)
    }, 1500)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    handleSendMessage()
  }

  return (
    <div className="app-shell">
      <NeuralCanvas />
      <div className="scanline" />

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1600px] flex-col gap-4 p-3 sm:p-4 xl:flex-row xl:p-6">
        <aside className="float-panel flex w-full flex-col overflow-hidden rounded-[28px] border border-[#1a4d3c] bg-[#050a0f]/90 shadow-[0_0_0_1px_rgba(0,255,159,0.1),0_0_70px_rgba(0,255,159,0.08)] backdrop-blur-xl xl:w-[330px]">
          <div className="border-b border-white/8 p-5">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.45em] text-[#00ff9f]/70">Deep.AI</p>
                <h1 className="glitch mt-2 text-2xl font-black text-[#f0fff8]" data-text="Deep.AI Node">
                  Deep.AI Node
                </h1>
              </div>
              <div className="rounded-full border border-[#00ff9f]/30 bg-[#00ff9f]/10 px-3 py-1 text-[10px] uppercase tracking-[0.35em] text-[#00ff9f]">
                online
              </div>
            </div>

            <div className="rounded-3xl border border-[#00ff9f]/20 bg-white/[0.03] p-4">
              <p className="text-[11px] uppercase tracking-[0.35em] text-[#ff0066]/80">Deep.AI status</p>
              <div className="mt-3 flex items-end justify-between gap-4">
                <div>
                  <p className="font-['Orbitron',sans-serif] text-xl tracking-[0.2em] text-[#00ff9f]">DEEP//LINK</p>
                  <p className="mt-2 text-sm text-white/55">Deep.AI chat relay active.</p>
                </div>
                <div className="text-right text-xs uppercase tracking-[0.3em] text-white/35">
                  <p>latency</p>
                  <p className="mt-1 text-[#00ff9f]">12ms</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 border-b border-white/8 p-4">
            <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-[0.32em] text-white/35">
              <span>deep.ai history</span>
              <span>{threads.length} threads</span>
            </div>

            <div className="space-y-3">
              {threads.map((thread) => {
                const isActive = thread.id === activeThreadId
                const threadPreview =
                  thread.messages[thread.messages.length - 1]?.parts.find((part) => part.kind === 'text')?.text ??
                  'Deep.AI payload detected.'

                return (
                  <button
                    key={thread.id}
                    type="button"
                    onClick={() => setActiveThreadId(thread.id)}
                    className={`w-full rounded-3xl border p-4 text-left transition duration-200 ${
                      isActive
                        ? 'border-[#00ff9f]/45 bg-[#00ff9f]/10 shadow-[0_0_30px_rgba(0,255,159,0.1)]'
                        : 'border-white/8 bg-white/[0.02] hover:border-[#00ff9f]/25 hover:bg-white/[0.035]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-['Orbitron',sans-serif] text-[15px] tracking-[0.16em] text-[#f0fff7]">
                          {thread.title}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.26em] text-[#00ff9f]/60">
                          {thread.label}
                        </p>
                      </div>
                      <span className="rounded-full border border-[#ff0066]/20 px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] text-[#ff0066]">
                        {thread.status}
                      </span>
                    </div>
                    <p className="mt-3 max-h-12 overflow-hidden text-sm leading-6 text-white/55">{threadPreview}</p>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="p-4">
            <div className="rounded-3xl border border-[#ff0066]/20 bg-[#ff0066]/8 p-4">
              <p className="text-[11px] uppercase tracking-[0.35em] text-[#ff0066]/75">Deep.AI brief</p>
              <p className="mt-3 text-sm leading-6 text-white/64">
                The network is rendering live 3D node motion, threaded history, and Deep.AI input.
              </p>
            </div>
          </div>
        </aside>

        <section className="float-panel relative flex min-h-[78vh] flex-1 flex-col overflow-hidden rounded-[28px] border border-[#1a4d3c] bg-[#050a0f]/88 shadow-[0_0_0_1px_rgba(0,255,159,0.12),0_0_90px_rgba(0,255,159,0.08)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4 border-b border-white/8 px-5 py-4 sm:px-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.4em] text-white/40">DEEP CONVERSATION</p>
              <h2 className="mt-2 font-['Orbitron',sans-serif] text-lg tracking-[0.28em] text-[#f2fff8] sm:text-xl">
                {activeThread.title}
              </h2>
            </div>

            <div className="flex items-center gap-3 rounded-full border border-[#00ff9f]/20 bg-[#00ff9f]/6 px-4 py-2 text-xs uppercase tracking-[0.28em] text-[#00ff9f]">
              <span className="h-2 w-2 rounded-full bg-[#00ff9f] shadow-[0_0_18px_rgba(0,255,159,0.8)]" />
              scanning
            </div>
          </div>

          <div className="chat-scrollbar flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-6">
            {activeThread.messages.map((message) => {
              const isUserMessage = message.role === 'user'

              return (
                <article key={message.id} className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[92%] rounded-[26px] border px-4 py-4 sm:max-w-[82%] sm:px-5 ${
                      isUserMessage
                        ? 'border-[#ff0066]/30 bg-[#ff0066]/10 text-[#ffeef5] shadow-[0_0_40px_rgba(255,0,102,0.08)]'
                        : 'border-[#00ff9f]/20 bg-white/[0.03] text-[#dfffee] shadow-[0_0_40px_rgba(0,255,159,0.06)]'
                    }`}
                  >
                    <div className="mb-3 flex items-center justify-between gap-4 text-[10px] uppercase tracking-[0.34em] text-white/35">
                      <span>{isUserMessage ? 'user' : 'deep.ai'}</span>
                      <span>{isUserMessage ? 'outbound' : 'inbound'}</span>
                    </div>

                    <div className="space-y-4 text-sm leading-7 sm:text-[15px]">
                      {message.parts.map((part, partIndex) =>
                        part.kind === 'text' ? (
                          <p key={`${message.id}-${partIndex}`} className="text-white/85">
                            {part.text}
                          </p>
                        ) : (
                          <pre
                            key={`${message.id}-${partIndex}`}
                            className="code-block overflow-x-auto rounded-2xl border border-[#00ff9f]/20 bg-[#03110b] p-4 text-[13px] leading-6 text-[#83ffd0]"
                          >
                            <code>
                              <span className="mb-2 block text-[10px] uppercase tracking-[0.3em] text-[#ff0066]/75">
                                {part.language} payload
                              </span>
                              {part.code}
                            </code>
                          </pre>
                        ),
                      )}
                    </div>
                  </div>
                </article>
              )
            })}

            {isTyping ? (
              <article className="flex justify-start">
                <div className="rounded-[26px] border border-[#00ff9f]/20 bg-white/[0.03] px-5 py-4">
                  <div className="mb-3 text-[10px] uppercase tracking-[0.34em] text-white/35">deep.ai</div>
                  <div className="flex items-center gap-2">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                </div>
              </article>
            ) : null}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="border-t border-white/8 p-4 sm:p-5">
            <div className="composer-focus flex items-center gap-3 rounded-[24px] border border-[#00ff9f]/20 bg-[#02110d] px-4 py-3 transition duration-200">
              <span className="font-['Orbitron',sans-serif] text-[13px] tracking-[0.28em] text-[#00ff9f]">
                $ &gt;
              </span>
              <input
                value={draftMessage}
                onChange={(event) => setDraftMessage(event.target.value)}
                placeholder="ask deep.ai anything..."
                className="flex-1 bg-transparent text-sm text-[#ecfff6] outline-none placeholder:text-white/30"
              />
              <button
                type="submit"
                className="rounded-full border border-[#ff0066]/35 bg-[#ff0066]/12 px-4 py-2 font-['Orbitron',sans-serif] text-[11px] uppercase tracking-[0.32em] text-[#ff9dbb] transition hover:bg-[#ff0066]/18 hover:text-[#ffeef5]"
              >
                Send
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  )
}

export default App
