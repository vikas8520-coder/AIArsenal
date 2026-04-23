// Curated high-intent comparison pages for SEO.
// Each entry becomes /compare/<slug>. Slug is a-vs-b with both names slugified.
// Add new pairs at the bottom — they auto-generate SSG pages.

export const COMPARISONS = [
  // ── Coding Assistants ──
  { a: "Cursor", b: "GitHub Copilot Free" },
  { a: "Cursor", b: "Windsurf" },
  { a: "Cursor", b: "Claude Code" },
  { a: "GitHub Copilot Free", b: "Windsurf" },
  { a: "Cline", b: "Cursor" },
  { a: "Continue.dev", b: "Cursor" },
  { a: "Supermaven", b: "GitHub Copilot Free" },
  { a: "Aider", b: "Claude Code" },

  // ── Chatbots ──
  { a: "ChatGPT", b: "Claude" },
  { a: "ChatGPT", b: "Google Gemini" },
  { a: "Claude", b: "Google Gemini" },
  { a: "Perplexity AI", b: "ChatGPT" },
  { a: "Le Chat", b: "ChatGPT" },
  { a: "DuckDuckGo AI Chat", b: "ChatGPT" },

  // ── LLM APIs ──
  { a: "Google Gemini API", b: "Groq" },
  { a: "OpenRouter", b: "Together AI" },
  { a: "DeepSeek API", b: "Google Gemini API" },
  { a: "Groq", b: "Cerebras" },
  { a: "xAI Grok API", b: "Google Gemini API" },

  // ── Image Gen ──
  { a: "Leonardo.Ai", b: "Ideogram" },
  { a: "Adobe Firefly", b: "Leonardo.Ai" },
  { a: "Krea", b: "Leonardo.Ai" },
  { a: "Stable Diffusion", b: "Leonardo.Ai" },

  // ── Video Gen ──
  { a: "Kling AI", b: "Pika" },
  { a: "Runway", b: "Pika" },
  { a: "Luma Dream Machine", b: "Runway" },
  { a: "Kling AI", b: "Luma Dream Machine" },
  { a: "HeyGen", b: "Runway" },

  // ── Music ──
  { a: "Suno", b: "Udio" },
  { a: "Udio", b: "Meta MusicGen" },

  // ── Voice & TTS ──
  { a: "ElevenLabs", b: "Murf AI" },

  // ── Productivity ──
  { a: "Notion AI", b: "Google NotebookLM" },
  { a: "tl;dv", b: "Fathom" },
  { a: "Granola", b: "Fathom" },
  { a: "Obsidian", b: "Notion AI" },

  // ── Automation ──
  { a: "n8n", b: "Zapier" },
  { a: "n8n", b: "Activepieces" },
  { a: "Dify", b: "Flowise" },

  // ── Agents ──
  { a: "LangGraph", b: "CrewAI" },
  { a: "CrewAI", b: "AutoGen" },
  { a: "Agno", b: "CrewAI" },

  // ── Open-Source Models ──
  { a: "Llama 3.x", b: "DeepSeek-V3 / R1" },
  { a: "Qwen 2.5 / Qwen 3", b: "Llama 3.x" },
  { a: "Mistral / Mixtral", b: "Llama 3.x" },

  // ── Local LLM runtimes ──
  { a: "Ollama", b: "Hugging Face" },

  // ── Compute ──
  { a: "Google Colab", b: "Kaggle Notebooks" },
  { a: "Modal", b: "Lightning AI" },
];
