interface Env {
  GEMINI_API_KEY: string;
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  try {
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

    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
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
