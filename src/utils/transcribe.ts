export const TRANSCRIBE_ENDPOINT = '/api/ai/transcribe';

export async function submitTranscription(file: File, durationSec: number): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('durationSec', String(Math.max(0, Math.round(durationSec))));
  formData.append('response_format', 'text');

  const response = await fetch(TRANSCRIBE_ENDPOINT, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    let message = `Transcription failed (${response.status})`;
    try {
      const parsed = JSON.parse(text) as { error?: string };
      if (parsed.error) message = parsed.error;
    } catch {
      // keep default message
    }
    throw new Error(message);
  }

  return response.text();
}
