import "server-only";

// Which LLM provider to use. Swap to "anthropic" later — nothing else changes.
const PROVIDER = "groq";

const GROQ_MODEL = "llama-3.3-70b-versatile";

// One function the rest of the app uses. It doesn't know which provider is behind it.
export async function callLLM({ system, user, maxTokens = 500 }) {
  if (PROVIDER === "groq") {
    return callGroq({ system, user, maxTokens });
  }
  // if (PROVIDER === "anthropic") return callAnthropic({ system, user, maxTokens });
  throw new Error(`Unknown LLM provider: ${PROVIDER}`);
}

async function callGroq({ system, user, maxTokens }) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}