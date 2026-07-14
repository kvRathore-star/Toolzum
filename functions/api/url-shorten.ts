export async function onRequestGet({ request }: { request: Request }): Promise<Response> {
  const url = new URL(request.url);
  const target = url.searchParams.get('url');
  if (!target) return new Response('Missing url parameter', { status: 400 });

  try {
    new URL(target);
  } catch {
    return new Response('Invalid URL', { status: 400 });
  }

  const tinyRes = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(target)}`);
  const text = await tinyRes.text();

  return new Response(text, {
    headers: {
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': 'https://toolzum.com',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
