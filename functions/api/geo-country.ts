export async function onRequestGet(context: { request: Request }): Promise<Response> {
  const country = (context.request as any)?.cf?.country || "US";
  return new Response(JSON.stringify({ country }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
