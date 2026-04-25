export const chatWithDeepSeek = async (messages) => {
  try {
    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "deep-ai",
        messages: messages,
        stream: false
      })
    });
    if (!response.ok) throw new Error("Deep.AI engine not running!");
    const data = await response.json();
    return data.message.content;
  } catch (error) {
    return "ERROR: Deep.AI engine chal nahi raha. Terminal mein 'ollama serve' run karo.";
  }
};
