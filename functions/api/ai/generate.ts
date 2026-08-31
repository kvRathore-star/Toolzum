interface AiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface Env {
  DB: D1Database;
  GEMINI_API_KEY: string;
}

import { checkRateLimit, recordRateLimit } from '../rate-limit';

async function getUserId(request: Request, DB: D1Database): Promise<string | null> {
  const cookies = request.headers.get('cookie') || '';
  const tokenMatch = cookies.match(/(?:authjs\.session-token|better-auth\.session_token|auth_session)=([^;]+)/);
  const token = tokenMatch?.[1];
  if (!token) return null;
  const row = await DB.prepare(
    "SELECT s.userId FROM session s WHERE s.token = ? AND s.expiresAt > unixepoch()"
  ).bind(token).first<{ userId: string }>();
  return row?.userId || null;
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  try {
    const { DB } = context.env;

    // Require signed-in user
    const userId = await getUserId(context.request, DB);
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Sign in required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Rate limit: 5 requests per minute per user
    const rl = await checkRateLimit(DB, 'ai-gen', userId, 5);
    if (rl.limited) return rl.response;

    // Check credits
    const user = await DB.prepare(
      "SELECT credits FROM user WHERE id = ?"
    ).bind(userId).first<{ credits: number }>();
    if (!user || user.credits <= 0) {
      return new Response(JSON.stringify({ error: 'No credits remaining' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { messages, temperature = 0.7 } = await context.request.json() as {
      messages: AiMessage[];
      temperature?: number;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Missing messages' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const geminiKey = context.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Log rate limit entry
    recordRateLimit(DB, 'ai-gen', userId, '/ai/generate');

    const geminiContents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : m.role === 'system' ? 'user' : 'user',
      parts: [{ text: m.content }]
    }));

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: geminiContents,
          generationConfig: { temperature },
        }),
      }
    );

    if (!res.ok) {
      const errBody = await res.text();
      console.error('Gemini API error:', res.status, errBody);
      return new Response(JSON.stringify({ error: 'AI provider error' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data: { candidates: { content: { parts: { text: string }[] } }[] } = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return new Response(JSON.stringify({ error: 'Empty response from AI' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Deduct 1 credit
    await DB.prepare("UPDATE user SET credits = credits - 1 WHERE id = ? AND credits > 0").bind(userId).run();

    return new Response(JSON.stringify({ content: text }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('AI generate error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
