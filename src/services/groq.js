const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant';

function getApiKey() {
  const key = import.meta.env.VITE_GROQ_API_KEY;
  if (!key) {
    throw new Error(
      'VITE_GROQ_API_KEY is not set. Add it to your .env file to enable AI features.'
    );
  }
  return key;
}

export async function chatCompletion(messages, options = {}) {
  const apiKey = getApiKey();

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1024,
      top_p: options.topP ?? 1,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Groq API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

export async function polishReferral(rawInput) {
  const messages = [
    {
      role: 'system',
      content: `You are a professional career coach at a top-tier university. Transform raw referral request inputs into polished, corporate-grade, high-impact referral messages. The output should be formal, concise, and compelling. Include: a strong opening, quantified achievements where possible, specific role/company targeting, and a clear call to action. Format with proper paragraphs. Do not use markdown. Do not add any preamble or explanation — output only the polished referral request text.`,
    },
    {
      role: 'user',
      content: `Transform this into a polished referral request:\n\n${rawInput}`,
    },
  ];

  return chatCompletion(messages, { temperature: 0.6, maxTokens: 800 });
}

export async function summarizeNotes(notesContent) {
  const messages = [
    {
      role: 'system',
      content: `You are an expert academic summarizer. Given raw study notes or document content, produce a clear, structured summary with bulleted key takeaways. Each bullet should be concise (1-2 sentences max). Group related points under short section headers. Focus on the most important concepts, definitions, formulas, and actionable insights. Output in plain text with bullet points using "•" characters. Do not include any preamble — start directly with the summary.`,
    },
    {
      role: 'user',
      content: `Summarize these notes into key takeaways:\n\n${notesContent}`,
    },
  ];

  return chatCompletion(messages, { temperature: 0.4, maxTokens: 1200 });
}
