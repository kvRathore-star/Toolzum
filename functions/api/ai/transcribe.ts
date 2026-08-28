interface Env {
  DB: D1Database;
  GEMINI_API_KEY: string;
}

const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

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

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
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

    // Rate limit: 3 requests per minute per user
    const recent = await DB.prepare(
      "SELECT COUNT(*) as c FROM analytics_event WHERE fingerprint = ? AND createdAt > datetime('now', '-1 minute')"
    ).bind(`ai-trans:${userId}`).first<{ c: number }>();
    if (recent && recent.c >= 3) {
      return new Response(JSON.stringify({ error: 'Rate limited. Try again in a minute.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }

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

    const geminiKey = context.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const formData = await context.request.formData();
    const file = formData.get('file');
    const language = formData.get('language') as string | null;
    const responseFormat = formData.get('response_format') as string | null;

    if (!file || !(file instanceof File)) {
      return new Response(JSON.stringify({ error: 'Missing audio file' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return new Response(
        JSON.stringify({ error: `File too large: ${file.size} bytes (max ${MAX_UPLOAD_BYTES})` }),
        { status: 413, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Log rate limit entry
    await DB.prepare(
      "INSERT INTO analytics_event (id, path, fingerprint, createdAt) VALUES (?, ?, ?, datetime('now'))"
    ).bind(crypto.randomUUID(), '/ai/transcribe', `ai-trans:${userId}`).run();

    const arrayBuffer = await file.arrayBuffer();
    const base64 = toBase64(new Uint8Array(arrayBuffer));
    const mimeType = file.type || 'audio/mpeg';

    const langInstruction = language && language !== 'en'
      ? `Transcribe the audio into ${language}. `
      : '';

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [
              { inlineData: { mimeType, data: base64 } },
              { text: `${langInstruction}Transcribe the audio from this file. Return only the transcribed text, no commentary.` }
            ]
          }],
          generationConfig: { temperature: 0.1 },
        }),
      }
    );

    if (!res.ok) {
      const errBody = await res.text();
      console.error('Gemini transcription error:', res.status, errBody);
      return new Response(JSON.stringify({ error: 'Transcription failed' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data: { candidates: { content: { parts: { text: string }[] }[] }[] } = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return new Response(JSON.stringify({ error: 'Empty transcription' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Deduct 1 credit
    await DB.prepare("UPDATE user SET credits = credits - 1 WHERE id = ? AND credits > 0").bind(userId).run();

    const contentType = responseFormat === 'srt' ? 'text/plain' : 'text/plain';

    return new Response(text, {
      headers: { 'Content-Type': contentType },
    });
  } catch (err) {
    console.error('AI transcribe error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
