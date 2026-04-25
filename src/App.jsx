import { useEffect, useRef, useState } from 'react'
import { chatWithOllama } from './ollamaService.js'
import { chatWithDeepSeek } from './deepseekService.js'

const BREAKPOINTS = {
  mobile: 768,
  desktop: 1024,
}

const initialSessions = [
  {
    id: 'core-thread',
    provider: 'local',
    darkName: 'core_thread',
    lightName: 'Core Thread',
    statusDark: 'locked',
    statusLight: 'Ready',
    previewDark: 'deep.ai ready',
    previewLight: 'deep.ai ready',
    messages: [
      {
        id: 101,
        role: 'assistant',
        parts: [
          {
            kind: 'text',
            text: 'Local model online. The signal stack is clear and the neural mesh is accepting requests.',
          },
          {
            kind: 'code',
            language: 'ts',
            code: `const response = await deepAI.chat({
  model: 'deep_ai_coder',
  stream: false,
  messages: [prompt],
})`,
          },
        ],
      },
      {
        id: 102,
        role: 'user',
        parts: [{ kind: 'text', text: 'Show me the current session topology.' }],
      },
      {
        id: 103,
        role: 'assistant',
        parts: [
          {
            kind: 'text',
            text: 'Topology snapshot confirmed. The active relay is synchronized and ready for the next command burst.',
          },
        ],
      },
    ],
  },
  {
    id: 'vector-shard',
    provider: 'local',
    darkName: 'vector_shard',
    lightName: 'Vector Shard',
    statusDark: 'watching',
    statusLight: 'Monitoring',
    previewDark: 'anomaly scan live',
    previewLight: 'Anomaly scan live',
    messages: [
      {
        id: 201,
        role: 'assistant',
        parts: [
          {
            kind: 'text',
            text: 'Anomaly scan is live. I am tracking changes in the token stream and overlaying the most recent drift.',
          },
          {
            kind: 'code',
            language: 'js',
            code: `const drift = signals.filter((item) => item.delta > 0.12)
console.table(drift)`,
          },
        ],
      },
    ],
  },
  {
    id: 'ghost-cache',
    provider: 'local',
    darkName: 'ghost_cache',
    lightName: 'Ghost Cache',
    statusDark: 'queued',
    statusLight: 'Queued',
    previewDark: 'payloads waiting',
    previewLight: 'Payloads waiting',
    messages: [
      {
        id: 301,
        role: 'user',
        parts: [{ kind: 'text', text: 'Summarize the last build health check.' }],
      },
      {
        id: 302,
        role: 'assistant',
        parts: [
          {
            kind: 'text',
            text: 'Build health is steady. No blockers in the code path and the terminal relay is responsive.',
          },
        ],
      },
    ],
  },
  {
    id: 'hyper-signal',
    provider: 'local',
    darkName: 'hyper_signal',
    lightName: 'Hyper Signal',
    statusDark: 'standby',
    statusLight: 'Idle',
    previewDark: 'channel idle',
    previewLight: 'Channel idle',
    messages: [
      {
        id: 401,
        role: 'assistant',
        parts: [
          {
            kind: 'text',
            text: 'The Deep.AI layer is in standby. Issue a query to wake the local inference loop.',
          },
        ],
      },
      {
        id: 402,
        role: 'user',
        parts: [{ kind: 'text', text: 'Can you switch to the refined layout profile?' }],
      },
    ],
  },
  {
    id: 'empty-node',
    provider: 'local',
    darkName: 'empty_node',
    lightName: 'Empty Node',
    statusDark: 'idle',
    statusLight: 'Idle',
    previewDark: 'no messages yet',
    previewLight: 'No messages yet',
    messages: [],
  },
]

const DEEP_LARRY_ID = 'deep-larry'

const deepLarrySessionBase = {
  id: DEEP_LARRY_ID,
  provider: 'cloud',
  darkName: 'LARRY',
  lightName: 'Larry',
  statusDark: 'Larry Online',
  statusLight: 'Larry Online',
  previewDark: 'Larry Online',
  previewLight: 'Larry Online',
  messages: [],
}

const darkTheme = {
  shellBg:
    'radial-gradient(circle at top, rgba(0, 255, 159, 0.1), transparent 34%), radial-gradient(circle at 80% 15%, rgba(255, 0, 102, 0.16), transparent 22%), linear-gradient(180deg, #04070c 0%, #020408 45%, #010203 100%)',
  headerBg: '#00000088',
  sidebarBg: '#00000066',
  sidebarBorder: 'rgba(0, 255, 159, 0.16)',
  chatBg: 'rgba(0, 0, 0, 0.18)',
  accent: '#00ff9f',
  accentSoft: 'rgba(0, 255, 159, 0.08)',
  accentBorder: 'rgba(0, 255, 159, 0.14)',
  secondary: '#ff0066',
  text: '#e6fff1',
  muted: 'rgba(230, 255, 241, 0.58)',
  userBubbleBg: '#ff006608',
  userBubbleBorder: '#ff006622',
  userBubbleText: '#ffb3cc',
  aiBubbleBg: '#00ff9f08',
  aiBubbleBorder: '#00ff9f1a',
  aiBubbleText: '#b8ffd9',
  inputBg: '#00ff9f08',
  inputBorder: '#00ff9f22',
  prompt: '$>',
  newChatLabel: '+ NEW_CHAT',
  sessionsLabel: '// SESSIONS',
  historyLabel: '// HISTORY',
  footer: 'DEEP_AI_CODER // POWERED BY DEEP TIWARI // DEEP.AI ENGINE',
  headerInfo: 'MEM:87% CPU:34% | DEEP.AI::LOCAL | ONLINE',
  logoLeft: '/> DEEP_',
  logoAccent: 'AI',
  logoRight: '_CODER',
  toggleLabel: '☀ LIGHT MODE',
  toggleClass: 'border-[#ff7d35] bg-[#120b08] text-[#ffd8c5] hover:bg-[#24110d]',
  emptyIcon: '⬡',
  emptyCopy: 'No signal yet. Start a transmission.',
  emptyTitle: 'Waiting for input',
  aiResponseText:
    'Access granted. The Deep.AI engine has received your command and is compiling a response stream.',
  aiResponseCode: `const result = await deepAI.chat({
  model: 'deep_ai_coder',
  messages: [{ role: 'user', content: prompt }],
  stream: false,
})`,
  logoStyle: {
    fontFamily: 'Orbitron, sans-serif',
    textShadow: '0 0 8px rgba(0,255,159,0.92), 0 0 24px rgba(0,255,159,0.55), 0 0 44px rgba(255,0,102,0.24)',
  },
  sessionTitleFont: 'Orbitron, sans-serif',
  buttonBorder: 'border-[#00ff9f] text-[#00ff9f] hover:bg-[#00ff9f14]',
  bodyFont: 'Share Tech Mono, monospace',
}

const providerBadgeStyle = {
  fontSize: '9px',
  padding: '1px 5px',
  borderRadius: '3px',
  border: '1px solid currentColor',
  marginLeft: '6px',
  opacity: 0.8,
}

const lightTheme = {
  shellBg:
    'radial-gradient(circle at top left, rgba(194, 105, 26, 0.12), transparent 30%), linear-gradient(180deg, #faf8f5 0%, #f5f0ea 100%)',
  headerBg: '#fffefcee',
  sidebarBg: '#fffefcaa',
  sidebarBorder: 'rgba(44, 32, 16, 0.12)',
  chatBg: 'rgba(255, 255, 255, 0.7)',
  accent: '#c2691a',
  accentSoft: 'rgba(194, 105, 26, 0.08)',
  accentBorder: 'rgba(194, 105, 26, 0.18)',
  secondary: '#7d4d17',
  text: '#2c2010',
  muted: 'rgba(44, 32, 16, 0.68)',
  userBubbleBg: '#c2691a',
  userBubbleBorder: '#c2691a',
  userBubbleText: '#ffffff',
  aiBubbleBg: '#ffffff',
  aiBubbleBorder: '#ece7de',
  aiBubbleText: '#2c2010',
  inputBg: '#ffffff',
  inputBorder: '#e0d9ce',
  prompt: '→',
  newChatLabel: '+ New chat',
  sessionsLabel: 'Sessions',
  historyLabel: 'History',
  footer: 'Deep.AI Coder · Powered by Deep Tiwari · Deep.AI Engine',
  headerInfo: 'Deep.AI local connected · Deep.AI engine is running locally',
  logoLeft: 'Deep.',
  logoAccent: 'AI',
  logoRight: ' Coder',
  toggleLabel: '◑ DARK MODE',
  toggleClass: 'border-[#1f1912] bg-[#1f1912] text-[#fff8f0] hover:bg-[#32271d]',
  emptyIcon: '✦',
  emptyCopy: 'Nothing here yet. Send the first message.',
  emptyTitle: 'Ready to begin',
  aiResponseText:
    'Certainly. The Deep.AI engine is ready, and I have prepared a concise response for your next step.',
  aiResponseCode: `const result = await deepAI.chat({
  model: 'deep_ai_coder',
  messages: [{ role: 'user', content: prompt }],
  stream: false,
})`,
  logoStyle: {
    fontFamily: 'Playfair Display, serif',
    textShadow: '0 1px 0 rgba(255,255,255,0.65)',
  },
  sessionTitleFont: 'Playfair Display, serif',
  buttonBorder: 'border-[#c2691a] text-[#c2691a] hover:bg-[#c2691a12]',
  bodyFont: 'DM Sans, sans-serif',
}

const keywordSet = new Set([
  'const',
  'let',
  'function',
  'return',
  'await',
  'async',
  'if',
  'else',
  'for',
  'while',
  'class',
  'new',
  'true',
  'false',
  'null',
  'undefined',
])

function useWindowSize() {
  const [size, setSize] = useState(() => ({
    width: typeof window === 'undefined' ? 1200 : window.innerWidth,
    height: typeof window === 'undefined' ? 800 : window.innerHeight,
  }))

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight })
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return size
}

function flattenMessageParts(parts) {
  return parts
    .map((part) => {
      if (part.kind === 'code') {
        return `\`\`\`${part.language || ''}\n${part.code}\n\`\`\``
      }

      return part.text
    })
    .join('\n\n')
}

function toOllamaMessages(chatMessages) {
  return chatMessages.map((message) => ({
    role: message.role,
    content: flattenMessageParts(message.parts),
  }))
}

function contentToParts(content) {
  const trimmedContent = content.trim()
  const codeFenceRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g
  const parts = []
  let lastIndex = 0
  let match

  while ((match = codeFenceRegex.exec(trimmedContent)) !== null) {
    const precedingText = trimmedContent.slice(lastIndex, match.index).trim()

    if (precedingText) {
      parts.push({ kind: 'text', text: precedingText })
    }

    parts.push({
      kind: 'code',
      language: match[1] || 'text',
      code: match[2].trimEnd(),
    })

    lastIndex = codeFenceRegex.lastIndex
  }

  const trailingText = trimmedContent.slice(lastIndex).trim()
  if (trailingText) {
    parts.push({ kind: 'text', text: trailingText })
  }

  if (parts.length === 0) {
    return [{ kind: 'text', text: trimmedContent }]
  }

  return parts
}

async function getAIResponse(messages, provider) {
  if (provider === 'cloud') {
    return chatWithDeepSeek(messages)
  }

  return chatWithOllama(messages)
}

function SyntaxHighlighter({ code, themeMode }) {
  const tokenRegex = /(`[^`]*`|'[^'\\]*(?:\\.[^'\\]*)*'|"[^"\\]*(?:\\.[^"\\]*)*"|\b(?:const|let|function|return|await|async|if|else|for|while|class|new|true|false|null|undefined)\b|\b\d+(?:\.\d+)?\b|\/\/.*$)/gm
  const segments = code.split(tokenRegex).filter(Boolean)

  return (
    <>
      {segments.map((segment, index) => {
        if (segment.startsWith('//')) {
          return (
            <span key={index} className="text-[#7aa6ff]">
              {segment}
            </span>
          )
        }

        if (segment.startsWith('"') || segment.startsWith("'") || segment.startsWith('`')) {
          return (
            <span key={index} className={themeMode === 'dark' ? 'text-[#ff7aa8]' : 'text-[#a0602b]'}>
              {segment}
            </span>
          )
        }

        if (keywordSet.has(segment)) {
          return (
            <span key={index} className={themeMode === 'dark' ? 'text-[#5ef2c1]' : 'text-[#7f4d17]'}>
              {segment}
            </span>
          )
        }

        if (/^\d+(?:\.\d+)?$/.test(segment)) {
          return (
            <span key={index} className={themeMode === 'dark' ? 'text-[#ffcc66]' : 'text-[#b06217]'}>
              {segment}
            </span>
          )
        }

        return <span key={index}>{segment}</span>
      })}
    </>
  )
}

function NeuralNetworkCanvas({ enabled, isMobile }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!enabled) return undefined

    const canvas = canvasRef.current
    if (!canvas) return undefined

    const context = canvas.getContext('2d')
    if (!context) return undefined

    const nodeCount = isMobile ? 10 : 18
    const particleCount = isMobile ? 30 : 70

    const nodes = Array.from({ length: nodeCount }, (_, index) => {
      const spread = 0.68 + (index % 8) * 0.02

      return {
        x: (Math.random() - 0.5) * spread,
        y: (Math.random() - 0.5) * spread,
        z: (Math.random() - 0.5) * spread,
        vx: (Math.random() - 0.5) * 0.0016,
        vy: (Math.random() - 0.5) * 0.0016,
        vz: (Math.random() - 0.5) * 0.0016,
        pulse: Math.random() * Math.PI * 2,
      }
    })

    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: Math.random() * 0.9 + 0.1,
      vx: (Math.random() - 0.5) * 0.0008,
      vy: (Math.random() - 0.5) * 0.0008,
      phase: Math.random() * Math.PI * 2,
    }))

    const state = {
      width: 0,
      height: 0,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
      rotation: 0,
    }

    let frameId = 0

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect()
      state.width = Math.max(width, 1)
      state.height = Math.max(height, 1)
      canvas.width = Math.floor(state.width * state.dpr)
      canvas.height = Math.floor(state.height * state.dpr)
      context.setTransform(state.dpr, 0, 0, state.dpr, 0, 0)
    }

    const project = (x, y, z) => {
      const depth = 2.2
      const safeDepth = Math.max(0.55, depth - z)
      const perspective = depth / safeDepth

      return {
        x: state.width * 0.5 + x * perspective * state.width * 0.48,
        y: state.height * 0.48 + y * perspective * state.width * 0.28,
      }
    }

    const draw = () => {
      state.rotation += 0.0045
      context.clearRect(0, 0, state.width, state.height)

      const bg = context.createRadialGradient(
        state.width * 0.45,
        state.height * 0.42,
        20,
        state.width * 0.5,
        state.height * 0.5,
        Math.max(state.width, state.height) * 0.76,
      )
      bg.addColorStop(0, 'rgba(0, 255, 159, 0.10)')
      bg.addColorStop(0.45, 'rgba(10, 18, 24, 0.16)')
      bg.addColorStop(1, 'rgba(2, 4, 8, 0.95)')
      context.fillStyle = bg
      context.fillRect(0, 0, state.width, state.height)

      const projectedNodes = nodes.map((node) => {
        node.x += node.vx
        node.y += node.vy
        node.z += node.vz
        node.pulse += 0.015

        if (node.x > 0.95 || node.x < -0.95) node.vx *= -1
        if (node.y > 0.95 || node.y < -0.95) node.vy *= -1
        if (node.z > 0.95 || node.z < -0.95) node.vz *= -1

        const cos = Math.cos(state.rotation)
        const sin = Math.sin(state.rotation)
        const rotatedX = node.x * cos - node.z * sin
        const rotatedZ = node.x * sin + node.z * cos
        const rotatedY = node.y * Math.cos(state.rotation * 0.75) - rotatedZ * Math.sin(state.rotation * 0.42)
        const depthZ = rotatedZ * Math.cos(state.rotation * 0.42) + node.y * Math.sin(state.rotation * 0.75)
        const projected = project(rotatedX, rotatedY, depthZ)

        return {
          ...projected,
          glow: 0.35 + Math.sin(node.pulse) * 0.2,
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

          if (distance > 128) continue

          const alpha = (1 - distance / 128) * 0.28
          context.beginPath()
          context.strokeStyle = `rgba(0, 255, 159, ${alpha})`
          context.lineWidth = 1 + (1 - distance / 128) * 1.2
          context.moveTo(firstNode.x, firstNode.y)
          context.lineTo(secondNode.x, secondNode.y)
          context.stroke()
        }
      }

      projectedNodes.forEach((node) => {
        const radius = 1.8 + node.glow * 2.7

        context.beginPath()
        context.fillStyle = `rgba(255, 0, 102, ${0.12 + node.glow * 0.18})`
        context.arc(node.x, node.y, radius + 5, 0, Math.PI * 2)
        context.fill()

        context.beginPath()
        context.fillStyle = `rgba(0, 255, 159, ${0.5 + node.glow * 0.32})`
        context.arc(node.x, node.y, radius, 0, Math.PI * 2)
        context.fill()
      })

      particles.forEach((particle) => {
        particle.x += particle.vx
        particle.y += particle.vy
        particle.phase += 0.02

        if (particle.x > 1.1) particle.x = -0.1
        if (particle.x < -0.1) particle.x = 1.1
        if (particle.y > 1.1) particle.y = -0.1
        if (particle.y < -0.1) particle.y = 1.1

        const x = state.width * particle.x
        const y = state.height * particle.y
        const size = 0.8 + Math.sin(particle.phase) * 0.5

        context.beginPath()
        context.fillStyle = `rgba(0, 255, 159, ${0.12 + size * 0.08})`
        context.arc(x, y, size, 0, Math.PI * 2)
        context.fill()
      })

      context.restore()
      frameId = window.requestAnimationFrame(draw)
    }

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    window.addEventListener('resize', resize)
    resize()
    draw()

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', resize)
      window.cancelAnimationFrame(frameId)
    }
  }, [enabled, isMobile])

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />
}

function App() {
  const [isDark, setIsDark] = useState(true)
  const [sessions, setSessions] = useState(initialSessions)
  const [deepLarryMessages, setDeepLarryMessages] = useState(deepLarrySessionBase.messages)
  const [activeSessionId, setActiveSessionId] = useState(initialSessions[0].id)
  const [messages, setMessages] = useState(initialSessions[0].messages)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false)
  const messagesEndRef = useRef(null)
  const typingTimerRef = useRef(null)
  const activeSessionIdRef = useRef(activeSessionId)
  const { width } = useWindowSize()

  const isMobile = width < BREAKPOINTS.mobile
  const isTablet = width >= BREAKPOINTS.mobile && width < BREAKPOINTS.desktop
  const isDesktop = width >= BREAKPOINTS.desktop
  const theme = isDark ? darkTheme : lightTheme
  const deepLarrySession = {
    ...deepLarrySessionBase,
    messages: deepLarryMessages,
  }
  const activeSession =
    activeSessionId === DEEP_LARRY_ID
      ? deepLarrySession
      : sessions.find((session) => session.id === activeSessionId) || sessions[0]
  const activeProvider = activeSession?.provider || 'local'
  const showSidebar = !isMobile || isSidebarOpen
  const showHamburger = isMobile
  const showModelPill = !isMobile
  const showDesktopHeaderInfo = isDesktop
  const messagePadding = isDesktop ? 16 : isTablet ? 12 : 10
  const messageGap = isDesktop ? 12 : 10
  const bubbleMaxWidth = isMobile ? '85%' : isTablet ? '78%' : '70%'
  const avatarSize = isMobile ? 24 : 28
  const showAvatar = width >= 360
  const codeFontSize = isMobile ? 10 : 12
  const inputFontSize = isMobile ? 16 : isDark ? 12 : 13
  const inputPadding = isMobile ? '10px 12px' : '11px 15px'
  const inputMinHeight = isMobile ? 44 : 0
  const sendButtonSize = isMobile ? 40 : 30
  const sidebarWidth = isMobile ? '100%' : '260px'
  const footerVisible = !isMobile
  const emptyTitleSize = isMobile ? 12 : 14
  const emptyIconSize = isMobile ? 28 : 36
  const emptySubtitleVisible = !isMobile
  const sidebarLabelSize = isMobile ? 10 : 9
  const chatTextSize = isMobile ? 14 : 12

  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    const previousHtmlOverflow = html.style.overflow
    const previousBodyOverflow = body.style.overflow

    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'

    return () => {
      html.style.overflow = previousHtmlOverflow
      body.style.overflow = previousBodyOverflow
    }
  }, [])

  useEffect(() => {
    activeSessionIdRef.current = activeSessionId
  }, [activeSessionId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, isTyping, activeSessionId])

  useEffect(() => {
    const currentSession = sessions.find((session) => session.id === activeSessionId)
    if (activeSessionId === DEEP_LARRY_ID) {
      setMessages(deepLarryMessages)
      return
    }

    setMessages(currentSession?.messages ?? [])
  }, [activeSessionId, sessions, deepLarryMessages])

  useEffect(() => {
    if (!isTablet) {
      setIsSidebarOpen(false)
    }
  }, [isTablet])

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        window.clearTimeout(typingTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (activeSessionId === DEEP_LARRY_ID) {
      setMessages(deepLarryMessages)
    }
  }, [deepLarryMessages, activeSessionId])

  const syncSessionMessages = (sessionId, nextMessages) => {
    if (sessionId === DEEP_LARRY_ID) {
      setDeepLarryMessages(nextMessages)
      return
    }

    setSessions((currentSessions) =>
      currentSessions.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              messages: nextMessages,
              previewDark: nextMessages[nextMessages.length - 1]?.parts?.[0]?.text ?? session.previewDark,
              previewLight: nextMessages[nextMessages.length - 1]?.parts?.[0]?.text ?? session.previewLight,
            }
          : session,
      ),
    )
  }

  const sendMessage = () => {
    const trimmed = inputValue.trim()

    if (!trimmed || isTyping) {
      return
    }

    if (typingTimerRef.current) {
      window.clearTimeout(typingTimerRef.current)
    }

    const sessionId = activeSessionId
    const sessionProvider = activeSession?.provider || 'local'
    const userMessage = {
      id: Date.now(),
      role: 'user',
      parts: [{ kind: 'text', text: trimmed }],
    }

    const nextMessages = [...messages, userMessage]
    syncSessionMessages(sessionId, nextMessages)
    setMessages(nextMessages)
    setInputValue('')
    setIsTyping(true)

    const aiMessages = toOllamaMessages(nextMessages)

    typingTimerRef.current = window.setTimeout(async () => {
      try {
        const assistantContent = await getAIResponse(aiMessages, sessionProvider)
        const assistantMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          parts: contentToParts(assistantContent || ''),
        }

        const updatedMessages = [...nextMessages, assistantMessage]
        syncSessionMessages(sessionId, updatedMessages)

        if (activeSessionIdRef.current === sessionId) {
          setMessages(updatedMessages)
        }
      } finally {
        if (activeSessionIdRef.current === sessionId) {
          setIsTyping(false)
        } else {
          setIsTyping(false)
        }
      }
    }, 120)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  const handleNewChat = () => {
    setIsProviderModalOpen(true)
  }

  const createSession = (provider) => {
    const newSession = {
      id: `new-${Date.now()}`,
      provider,
      darkName: 'new_chat',
      lightName: 'New Chat',
      statusDark: 'open',
      statusLight: 'Open',
      previewDark: 'fresh terminal ready',
      previewLight: 'Fresh terminal ready',
      messages: [],
    }

    setSessions((currentSessions) => [newSession, ...currentSessions])
    setActiveSessionId(newSession.id)
    setMessages([])
    setInputValue('')
    setIsTyping(false)
    setIsSidebarOpen(false)
    setIsProviderModalOpen(false)
  }

  const handleSelectSession = (sessionId) => {
    setActiveSessionId(sessionId)
    if (isTablet) {
      setIsSidebarOpen(false)
    }
  }

  const handleSelectDeepLarry = () => {
    setActiveSessionId(DEEP_LARRY_ID)
    if (isTablet) {
      setIsSidebarOpen(false)
    }
  }

  const providerIndicatorLabel = activeSessionId === DEEP_LARRY_ID || activeProvider === 'cloud' ? '⬡ LARRY::CLOUD' : '⬡ DEEP.AI::LOCAL'
  const providerIndicatorColor = activeSessionId === DEEP_LARRY_ID || activeProvider === 'cloud' ? '#00aaff' : theme.accent
  const headerSessionLabel = activeSessionId === DEEP_LARRY_ID ? 'LARRY' : isDark ? activeSession.darkName : activeSession.lightName

  return (
    <div
      className={`relative h-[100dvh] w-full overflow-hidden ${isDark ? 'theme-dark' : 'theme-light'}`}
      style={{
        background: theme.shellBg,
        color: theme.text,
        fontFamily: theme.bodyFont,
        transition: 'all 0.6s cubic-bezier(.77,0,.18,1)',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@900&family=Share+Tech+Mono&family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500&display=swap');

        * {
          box-sizing: border-box;
        }

        button,
        input,
        textarea,
        a {
          -webkit-tap-highlight-color: transparent;
        }

        .theme-dark .logo-flicker {
          animation: logoFlicker 3.5s infinite steps(1, end);
        }

        .theme-light .logo-flicker {
          animation: logoSoftShift 5s ease-in-out infinite;
        }

        .theme-dark .scanline {
          position: absolute;
          inset-inline: 0;
          top: -20%;
          height: 14rem;
          background: linear-gradient(180deg, rgba(0,255,159,0) 0%, rgba(0,255,159,0.08) 22%, rgba(255,0,102,0.22) 50%, rgba(0,255,159,0.08) 78%, rgba(0,255,159,0) 100%);
          animation: scanlineDark 4s linear infinite;
          mix-blend-mode: screen;
          pointer-events: none;
        }

        .theme-dark .vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, transparent 42%, rgba(0,0,0,0.26) 100%);
          pointer-events: none;
        }

        .theme-light .vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, transparent 42%, rgba(194,105,26,0.08) 100%);
          pointer-events: none;
        }

        .theme-dark .sidebar-item.active {
          box-shadow: inset 2px 0 0 #00ff9f;
          background: rgba(0, 255, 159, 0.07);
        }

        .theme-light .sidebar-item.active {
          box-shadow: inset 3px 0 0 #c2691a;
          background: #f5f0e8;
        }

        .theme-dark .typing-dot {
          background: #00ff9f;
          box-shadow: 0 0 14px rgba(0,255,159,0.6);
        }

        .theme-light .typing-dot {
          background: #c2691a;
          box-shadow: 0 0 10px rgba(194,105,26,0.35);
        }

        .theme-dark .scrollbar::-webkit-scrollbar,
        .theme-light .scrollbar::-webkit-scrollbar {
          width: 10px;
        }

        .theme-dark .scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(0,255,159,0.65), rgba(255,0,102,0.75));
          border-radius: 999px;
        }

        .theme-light .scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(194,105,26,0.75), rgba(125,77,23,0.5));
          border-radius: 999px;
        }

        .theme-dark .scrollbar::-webkit-scrollbar-track,
        .theme-light .scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.04);
        }

        @keyframes scanlineDark {
          0% { transform: translateY(-110%); opacity: 0; }
          8% { opacity: 0.85; }
          55% { opacity: 1; }
          100% { transform: translateY(220%); opacity: 0; }
        }

        @keyframes logoFlicker {
          0%, 100% { opacity: 1; transform: translateY(0); }
          12% { opacity: 0.72; }
          14% { opacity: 1; }
          33% { opacity: 0.88; transform: translateY(-1px); }
          35% { opacity: 1; transform: translateY(0); }
          69% { opacity: 0.8; }
          72% { opacity: 1; }
        }

        @keyframes logoSoftShift {
          0%, 100% { transform: translateY(0); letter-spacing: 0; }
          50% { transform: translateY(-1px); letter-spacing: 0.01em; }
        }

        @keyframes floatIcon {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        @keyframes bounceDot {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-7px); opacity: 1; }
        }

        .typing-dot {
          animation: bounceDot 1.05s infinite ease-in-out;
        }

        .typing-dot:nth-child(2) { animation-delay: 0.15s; }
        .typing-dot:nth-child(3) { animation-delay: 0.3s; }

        .float-icon {
          display: inline-flex;
          animation: floatIcon 2.8s ease-in-out infinite;
        }

        .theme-dark .bubble-user {
          background: ${darkTheme.userBubbleBg};
          border: 1px solid ${darkTheme.userBubbleBorder};
          color: ${darkTheme.userBubbleText};
        }

        .theme-dark .bubble-ai {
          background: ${darkTheme.aiBubbleBg};
          border: 1px solid ${darkTheme.aiBubbleBorder};
          color: ${darkTheme.aiBubbleText};
        }

        .theme-light .bubble-user {
          background: ${lightTheme.userBubbleBg};
          border: 1px solid ${lightTheme.userBubbleBorder};
          color: ${lightTheme.userBubbleText};
        }

        .theme-light .bubble-ai {
          background: ${lightTheme.aiBubbleBg};
          border: 1px solid ${lightTheme.aiBubbleBorder};
          color: ${lightTheme.aiBubbleText};
        }

        .theme-dark .code-block {
          background: rgba(0,0,0,0.46);
          border: 1px solid rgba(0,255,159,0.18);
          color: #c6ffe7;
        }

        .theme-light .code-block {
          background: #fffdf8;
          border: 1px solid #e8e2d7;
          color: #3a2a18;
        }

        .theme-dark .input-shell {
          background: ${darkTheme.inputBg};
          border: 1px solid ${darkTheme.inputBorder};
        }

        .theme-light .input-shell {
          background: ${lightTheme.inputBg};
          border: 1px solid ${lightTheme.inputBorder};
        }

        .theme-dark .footer-bar {
          background: rgba(0,0,0,0.42);
          border-top: 1px solid rgba(0,255,159,0.08);
        }

        .theme-light .footer-bar {
          background: rgba(255,255,255,0.72);
          border-top: 1px solid rgba(44,32,16,0.08);
        }

        .theme-dark .send-button {
          border: 1px solid #00ff9f;
          color: #00ff9f;
          background: transparent;
        }

        .theme-light .send-button {
          border: 1px solid #c2691a;
          color: #fff;
          background: #c2691a;
        }

        .theme-dark .send-button:hover {
          background: rgba(0,255,159,0.1);
        }

        .theme-light .send-button:hover {
          background: #b75d11;
        }

        .theme-dark .sidebar-shell,
        .theme-light .sidebar-shell {
          -webkit-overflow-scrolling: touch;
        }
      `}</style>

      {isDark ? <NeuralNetworkCanvas enabled={isDark} isMobile={isMobile} /> : null}
      {isDark ? <div className="scanline" aria-hidden="true" /> : null}
      <div className="vignette" aria-hidden="true" />

      <div className="relative z-10 flex h-full flex-col">
        <header
          className="relative flex min-h-[60px] items-center border-b px-3 py-3 sm:px-4"
          style={{
            backgroundColor: theme.headerBg,
            borderColor: theme.accentBorder,
            transition: 'all 0.6s cubic-bezier(.77,0,.18,1)',
          }}
        >
          <div className="flex flex-1 items-center gap-3 pr-0 md:pr-24">
            {showHamburger ? (
              <button
                type="button"
                onClick={() => setIsSidebarOpen((current) => !current)}
                className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-[20px] font-bold transition"
                style={{ color: theme.accent, border: `1px solid ${theme.accentBorder}` }}
                aria-label="Toggle sidebar"
              >
                ☰
              </button>
            ) : null}

            <div className="logo-flicker text-[17px] leading-none tracking-[0.06em] sm:text-[18px] md:text-[18px]" style={theme.logoStyle}>
              {isDark ? (
                <span>
                  {theme.logoLeft}
                  <span style={{ color: theme.secondary }}>{theme.logoAccent}</span>
                  {theme.logoRight}
                </span>
              ) : (
                <span>
                  {theme.logoLeft}
                  <em style={{ color: theme.secondary, fontStyle: 'normal' }}>{theme.logoAccent}</em>
                  {theme.logoRight}
                </span>
              )}
            </div>

            {isDesktop ? (
              <div className="mobile-hide flex items-center gap-3 text-[10px] uppercase tracking-[0.28em]" style={{ color: theme.muted }}>
                <span>{'◈ ◈ ◈'}</span>
                <span style={{ color: theme.accent }}>DEEP-STRIP</span>
              </div>
            ) : null}

            {showModelPill ? (
              <div
                className="ml-auto rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.24em] mobile-hide"
                style={{
                  backgroundColor: activeProvider === 'cloud' ? 'rgba(0,170,255,0.08)' : isDark ? 'rgba(0,255,159,0.08)' : 'rgba(194,105,26,0.08)',
                  color: providerIndicatorColor,
                  border: `1px solid ${theme.accentBorder}`,
                }}
              >
                {providerIndicatorLabel}
              </div>
            ) : null}

            {showDesktopHeaderInfo ? (
              <div className="mobile-hide ml-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.24em]" style={{ color: theme.muted }}>
                <span className="h-2.5 w-2.5 rounded-full bg-[#00ff9f] shadow-[0_0_10px_rgba(0,255,159,0.9)]" />
                <span>{theme.headerInfo}</span>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => setIsDark((current) => !current)}
            className={`ml-2 min-h-11 rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] transition-all duration-300 ${theme.toggleClass}`}
            style={{ fontFamily: theme.bodyFont, WebkitTapHighlightColor: 'transparent' }}
          >
            {theme.toggleLabel}
          </button>
        </header>

        <div className="relative flex flex-1 overflow-hidden">
          {showSidebar ? (
            <>
              {isMobile && isSidebarOpen ? (
                <button
                  type="button"
                  aria-label="Close sidebar backdrop"
                  onClick={() => setIsSidebarOpen(false)}
                  className="absolute inset-0 z-40"
                  style={{
                    backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.2)',
                    border: 'none',
                  }}
                />
              ) : null}

              <aside
                className="sidebar-shell flex h-full flex-col border-r px-3 py-3"
                style={{
                  position: isMobile ? 'fixed' : 'relative',
                  left: 0,
                  top: 0,
                  height: '100%',
                  width: sidebarWidth,
                  zIndex: isMobile ? 50 : 20,
                  transform: isMobile ? (isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
                  transition: 'transform 0.3s ease, background-color 0.6s cubic-bezier(.77,0,.18,1), border-color 0.6s cubic-bezier(.77,0,.18,1)',
                  backgroundColor: theme.sidebarBg,
                  borderColor: theme.sidebarBorder,
                  backdropFilter: 'blur(18px)',
                }}
              >
                {isMobile ? (
                  <button
                    type="button"
                    onClick={() => setIsSidebarOpen(false)}
                    className="mb-3 ml-auto flex min-h-11 min-w-11 items-center justify-center rounded-lg text-[18px] font-bold transition-colors"
                    style={{
                      color: theme.accent,
                      border: `1px solid ${theme.accentBorder}`,
                      backgroundColor: isDark ? 'rgba(0,0,0,0.52)' : '#ffffff',
                    }}
                    aria-label="Close sidebar"
                  >
                    X
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={handleNewChat}
                  className="mb-3 min-h-11 rounded-lg px-2 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.22em] transition-colors"
                  style={{
                    backgroundColor: isDark ? 'rgba(0,0,0,0.52)' : '#ffffff',
                    color: theme.accent,
                    border: isDark ? '1px solid rgba(0,255,159,0.18)' : '1px solid rgba(194,105,26,0.22)',
                  }}
                >
                  {theme.newChatLabel}
                </button>

                <div className="mb-3 text-[10px] uppercase tracking-[0.3em]" style={{ color: theme.muted, fontSize: sidebarLabelSize }}>
                  {theme.sessionsLabel}
                </div>

                <div className="flex-1 space-y-2 overflow-y-auto pr-1 scrollbar">
                  {sessions.map((session, index) => {
                    const isActive = session.id === activeSessionId
                    const sessionTitle = isDark ? session.darkName : session.lightName
                    const sessionStatus = isDark ? session.statusDark : session.statusLight
                    const sessionPreview = isDark ? session.previewDark : session.previewLight
                    const providerLabel = session.provider === 'cloud' ? 'CLOUD' : 'LOCAL'
                    const providerColor = session.provider === 'cloud' ? '#00aaff' : '#00ff88'

                    return (
                      <button
                        key={session.id}
                        type="button"
                        onClick={() => handleSelectSession(session.id)}
                        className={`sidebar-item w-full rounded-xl px-3 py-3 text-left transition-all duration-300 min-h-11 ${
                          isActive ? 'active' : ''
                        }`}
                        style={{
                          backgroundColor: isActive ? undefined : 'transparent',
                          color: isActive ? theme.text : theme.muted,
                          border: isActive ? undefined : '1px solid transparent',
                          padding: isMobile ? '10px 14px' : '12px',
                        }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex min-w-0 items-center">
                            <span
                              className="session-title block text-[10px] font-semibold uppercase tracking-[0.12em]"
                              style={{ fontFamily: theme.sessionTitleFont, fontSize: isMobile ? 10 : 9 }}
                            >
                              {sessionTitle}
                            </span>
                            <span style={{ ...providerBadgeStyle, color: providerColor }}>
                              {providerLabel}
                            </span>
                          </div>
                          <span className="session-status text-[9px] uppercase tracking-[0.2em]" style={{ color: theme.accent }}>
                            {sessionStatus}
                          </span>
                        </div>
                        <div className="session-preview mt-1 text-[10px] leading-4" style={{ color: isActive ? theme.muted : 'inherit' }}>
                          {sessionPreview}
                        </div>
                        {index === 0 ? <div className="mt-2 h-px w-full opacity-40" style={{ backgroundColor: theme.accent }} /> : null}
                      </button>
                    )
                  })}
                </div>

                <div className="mt-4">
                  <div className="mb-3 text-[10px] uppercase tracking-[0.3em]" style={{ color: theme.muted, fontSize: sidebarLabelSize }}>
                    LARRY
                  </div>

                  <button
                    type="button"
                    onClick={handleSelectDeepLarry}
                    className={`sidebar-item w-full rounded-xl px-3 py-3 text-left transition-all duration-300 min-h-11 ${
                      activeSessionId === DEEP_LARRY_ID ? 'active' : ''
                    }`}
                    style={{
                      backgroundColor: activeSessionId === DEEP_LARRY_ID ? undefined : 'transparent',
                      color: activeSessionId === DEEP_LARRY_ID ? theme.text : theme.muted,
                      border: activeSessionId === DEEP_LARRY_ID ? undefined : '1px solid transparent',
                      padding: isMobile ? '10px 14px' : '12px',
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center">
                        <span
                          className="session-title block text-[10px] font-semibold uppercase tracking-[0.12em]"
                          style={{ fontFamily: theme.sessionTitleFont, fontSize: isMobile ? 10 : 9 }}
                        >
                          Larry
                        </span>
                        <span style={{ ...providerBadgeStyle, color: '#00aaff' }}>CLOUD</span>
                      </div>
                    </div>
                    <div className="session-preview mt-1 text-[10px] leading-4" style={{ color: activeSessionId === DEEP_LARRY_ID ? theme.muted : 'inherit' }}>
                      Larry Online
                    </div>
                  </button>
                </div>

                <div className="mt-3 rounded-xl px-2 py-3 text-[10px] leading-4" style={{ backgroundColor: theme.accentSoft, color: theme.muted }}>
                  <div className="history-label mb-1 uppercase tracking-[0.32em]" style={{ color: theme.accent, fontSize: sidebarLabelSize }}>
                    {theme.historyLabel}
                  </div>
                  {isDark ? 'Underscore-driven names and local relay metadata.' : 'Sentence-case names and a calm editorial reading flow.'}
                </div>
              </aside>
            </>
          ) : null}

          <section
            className="flex min-w-0 flex-1 flex-col overflow-hidden"
            style={{ backgroundColor: theme.chatBg, transition: 'all 0.6s cubic-bezier(.77,0,.18,1)' }}
          >
            <div
              className="flex items-center justify-between gap-3 border-b px-3 py-3 sm:px-4"
              style={{
                backgroundColor: theme.headerBg,
                borderColor: theme.accentBorder,
                transition: 'all 0.6s cubic-bezier(.77,0,.18,1)',
              }}
            >
              <div>
                <div className="chat-label text-[10px] uppercase tracking-[0.32em]" style={{ color: theme.accent }}>
                  {isDark ? 'DEEP_TERMINAL' : 'Deep conversation'}
                </div>
                {!isMobile ? (
                  <div className="mt-1 text-[15px] font-semibold" style={{ fontFamily: theme.sessionTitleFont }}>
                    {headerSessionLabel}
                  </div>
                ) : null}
              </div>

              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em]" style={{ color: theme.muted }}>
                {isDesktop && isDark ? <span className="h-2.5 w-2.5 rounded-full bg-[#00ff9f] shadow-[0_0_10px_rgba(0,255,159,0.9)]" /> : null}
                {isDesktop ? <span>{isDark ? activeSession.statusDark : activeSession.statusLight}</span> : null}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 px-3 pt-2 sm:px-4">
              <div className="text-[10px] uppercase tracking-[0.28em]" style={{ color: providerIndicatorColor }}>
                {providerIndicatorLabel}
              </div>
            </div>

            <div
              className="scrollbar flex-1 overflow-y-auto px-3 py-3 sm:px-4"
              style={{
                padding: `${messagePadding}px`,
                WebkitOverflowScrolling: 'touch',
                backgroundColor: 'transparent',
              }}
            >
              <div className="flex h-full flex-col" style={{ gap: `${messageGap}px` }}>
                {messages.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center text-center" style={{ color: theme.muted, padding: isMobile ? '12px 0' : '18px 0' }}>
                    <div className="float-icon" style={{ color: theme.accent, fontSize: emptyIconSize, lineHeight: 1 }}>
                      {theme.emptyIcon}
                    </div>
                    <div className="empty-copy mt-3 text-sm" style={{ fontSize: emptyTitleSize }}>
                      {theme.emptyTitle}
                    </div>
                    {emptySubtitleVisible ? <div className="mt-2 max-w-xs text-[12px] leading-6">{theme.emptyCopy}</div> : null}
                  </div>
                ) : (
                  messages.map((message) => {
                    const isUser = message.role === 'user'

                    return (
                      <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                        <div className="flex items-start gap-2" style={{ maxWidth: bubbleMaxWidth, width: '100%' }}>
                          {showAvatar ? (
                            <div
                              className="avatar flex shrink-0 items-center justify-center rounded-full text-sm font-bold"
                              style={{
                                width: avatarSize,
                                height: avatarSize,
                                minWidth: avatarSize,
                                minHeight: avatarSize,
                                backgroundColor: isUser ? (isDark ? 'rgba(255,0,102,0.14)' : '#c2691a') : (isDark ? 'rgba(0,255,159,0.12)' : '#ece7de'),
                                color: isUser ? (isDark ? '#ffb3cc' : '#ffffff') : (isDark ? '#b8ffd9' : '#2c2010'),
                                border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(44,32,16,0.08)',
                              }}
                            >
                              {isUser ? 'U' : 'D'}
                            </div>
                          ) : null}

                          <div
                            className={`rounded-[24px] px-4 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.06)] ${isUser ? 'bubble-user' : 'bubble-ai'}`}
                            style={{
                              transition: 'all 0.6s cubic-bezier(.77,0,.18,1)',
                              fontSize: chatTextSize,
                              maxWidth: bubbleMaxWidth,
                              width: 'fit-content',
                            }}
                          >
                            <div className="message-meta mb-2 text-[10px] uppercase tracking-[0.28em]" style={{ color: isUser ? theme.userBubbleText : theme.accent }}>
                              {isUser ? 'User' : 'Deep.AI'}
                            </div>

                            <div className="space-y-3 leading-7" style={{ fontSize: chatTextSize + 1 }}>
                              {message.parts.map((part, partIndex) =>
                                part.kind === 'text' ? (
                                  <p key={`${message.id}-${partIndex}`}>{part.text}</p>
                                ) : (
                                  <pre
                                    key={`${message.id}-${partIndex}`}
                                    className="code-block scrollbar overflow-x-auto rounded-2xl px-4 py-3 leading-6"
                                    style={{ fontSize: codeFontSize }}
                                  >
                                    <code>
                                      <span className="mb-2 block text-[10px] uppercase tracking-[0.28em]" style={{ color: isDark ? theme.secondary : theme.accent }}>
                                        {part.language} block
                                      </span>
                                      <SyntaxHighlighter code={part.code} themeMode={isDark ? 'dark' : 'light'} />
                                    </code>
                                  </pre>
                                ),
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}

                {isTyping ? (
                  <div className="flex justify-start">
                    <div className="flex items-start gap-2">
                      {showAvatar ? (
                        <div
                          className="avatar flex items-center justify-center rounded-full text-sm font-bold"
                          style={{
                            width: avatarSize,
                            height: avatarSize,
                            backgroundColor: isDark ? 'rgba(0,255,159,0.12)' : '#ece7de',
                            color: isDark ? '#b8ffd9' : '#2c2010',
                            border: isDark ? '1px solid rgba(0,255,159,0.14)' : '1px solid rgba(44,32,16,0.08)',
                          }}
                        >
                          D
                        </div>
                      ) : null}
                      <div className="bubble-ai rounded-[24px] px-4 py-4">
                        <div className="message-meta mb-2 text-[10px] uppercase tracking-[0.28em]" style={{ color: theme.accent }}>
                          Deep.AI
                        </div>
                        <div className="flex items-center gap-2 py-1">
                          <span className="typing-dot inline-block h-2.5 w-2.5 rounded-full" />
                          <span className="typing-dot inline-block h-2.5 w-2.5 rounded-full" />
                          <span className="typing-dot inline-block h-2.5 w-2.5 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="border-t px-3 py-3 sm:px-4" style={{ borderColor: theme.accentBorder }}>
              <div
                className="input-shell flex items-center gap-2 rounded-[22px] transition-all duration-300"
                style={{
                  padding: inputPadding,
                  minHeight: inputMinHeight || undefined,
                  transition: 'all 0.6s cubic-bezier(.77,0,.18,1)',
                }}
              >
                <span className="prompt-symbol text-[13px] font-semibold tracking-[0.18em]" style={{ color: theme.accent }}>
                  {theme.prompt}
                </span>
                <input
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isDark ? 'ask deep.ai anything...' : 'Ask Deep.AI anything...'}
                  className="flex-1 bg-transparent outline-none placeholder:opacity-60"
                  style={{
                    color: theme.text,
                    fontFamily: theme.bodyFont,
                    fontSize: inputFontSize,
                    minHeight: isMobile ? 44 : undefined,
                  }}
                />
                <button
                  type="button"
                  onClick={sendMessage}
                  className={`send-button flex items-center justify-center rounded-full transition-all duration-300 ${theme.buttonBorder}`}
                  style={{
                    fontFamily: theme.bodyFont,
                    width: sendButtonSize,
                    minWidth: sendButtonSize,
                    height: sendButtonSize,
                    minHeight: sendButtonSize,
                    WebkitTapHighlightColor: 'transparent',
                  }}
                  aria-label="Send message"
                >
                  <span className="send-label text-[11px] font-semibold uppercase tracking-[0.16em]">↵</span>
                </button>
              </div>

              {footerVisible ? (
                <div className="footer-bar mt-3 rounded-[18px] px-4 py-3 text-center text-[10px] uppercase tracking-[0.28em]" style={{ color: theme.muted }}>
                  <div className="footer-copy">{theme.footer}</div>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </div>

      {isProviderModalOpen ? (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/65 px-4" onClick={() => setIsProviderModalOpen(false)}>
          <div
            className="w-full max-w-sm rounded-[22px] border p-4 shadow-[0_0_40px_rgba(0,255,159,0.18)]"
            style={{
              backgroundColor: isDark ? '#04110e' : '#fffdf8',
              borderColor: isDark ? 'rgba(0,255,159,0.22)' : 'rgba(194,105,26,0.18)',
              color: theme.text,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 text-center text-[13px] uppercase tracking-[0.24em]" style={{ color: theme.accent }}>
              SELECT DEEP.AI MODEL:
            </div>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => createSession('local')}
                className="w-full rounded-xl border px-4 py-3 text-left text-sm transition"
                style={{
                  borderColor: 'rgba(0,255,159,0.35)',
                  color: isDark ? '#b8ffd9' : '#2c2010',
                  backgroundColor: isDark ? 'rgba(0,255,159,0.06)' : '#f8f5ef',
                }}
              >
                LOCAL — Deep.AI Coder (Free)
              </button>
              <button
                type="button"
                onClick={() => createSession('cloud')}
                className="w-full rounded-xl border px-4 py-3 text-left text-sm transition"
                style={{
                  borderColor: 'rgba(0,170,255,0.35)',
                  color: isDark ? '#cdeeff' : '#1f3550',
                  backgroundColor: isDark ? 'rgba(0,170,255,0.08)' : '#ffffff',
                }}
              >
                CLOUD — Larry (Deep Model)
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default App
