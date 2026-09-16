"use client";

import { toUserError } from "@/utils/network";

export interface AiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export function useAiProvider() {
  const generateCompletion = async (messages: AiMessage[], temperature = 0.7): Promise<string> => {
    let res: Response;
    try {
      res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, temperature }),
      });
    } catch (e) {
      // #45: mid-task disconnect must read as offline, not "Request failed".
      // Never auto-retry: each attempt spends credits.
      throw new Error(toUserError(e, 'Request failed'));
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' })) as { error?: string };
      throw new Error(err.error || `Server error (${res.status})`);
    }

    const data = await res.json() as { content: string };
    return data.content;
  };

  const generateImage = async (prompt: string, aspectRatio = '1:1'): Promise<{ url: string; mimeType: string }> => {
    let res: Response;
    try {
      res = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, aspectRatio }),
      });
    } catch (e) {
      throw new Error(toUserError(e, 'Request failed'));
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' })) as { error?: string };
      throw new Error(err.error || `Server error (${res.status})`);
    }

    const data = await res.json() as { image: string; mimeType: string };
    return { url: `data:${data.mimeType};base64,${data.image}`, mimeType: data.mimeType };
  };

  return { generateCompletion, generateImage };
}
