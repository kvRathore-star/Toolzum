"use client";

export interface AiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export function useAiProvider() {
  const generateCompletion = async (messages: AiMessage[], temperature = 0.7): Promise<string> => {
    const res = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, temperature }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' })) as { error?: string };
      throw new Error(err.error || `Server error (${res.status})`);
    }

    const data = await res.json() as { content: string };
    return data.content;
  };

  return { generateCompletion };
}
