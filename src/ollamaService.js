// If CORS error occurs, run: OLLAMA_ORIGINS=* ollama serve
export const chatWithOllama = async (messages) => {
  try {
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'deep-ai',
        messages,
        stream: false,
      }),
    })

    if (!response.ok) throw new Error('Deep.AI engine not running!')

    const data = await response.json()
    return data.message.content
  } catch {
    return "ERROR: Deep.AI engine is not running. Please run 'ollama serve' in terminal."
  }
}