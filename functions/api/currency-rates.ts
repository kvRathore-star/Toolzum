interface CacheEntry {
  data: unknown;
  expiry: number;
}

let cache: CacheEntry | null = null;

export async function onRequestGet({ request }: { request: Request }): Promise<Response> {
  if (cache && Date.now() < cache.expiry) {
    return new Response(JSON.stringify(cache.data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://toolzum.com',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }

  const res = await fetch('https://open.er-api.com/v6/latest/USD');
  if (!res.ok) {
    return new Response(JSON.stringify({ error: 'Failed to fetch rates' }), {
      status: 502,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://toolzum.com',
      },
    });
  }

  const data = await res.json();
  cache = { data, expiry: Date.now() + 3600_000 };

  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'https://toolzum.com',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
