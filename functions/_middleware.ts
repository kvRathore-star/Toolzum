export async function onRequest(context: { request: Request; next: () => Promise<Response> }) {
  // Skip for auth routes — better-auth manages its own cookies/state
  if (context.request.url.includes('/api/auth/')) {
    return context.next();
  }

  const response = await context.next();

  const country = (context.request as any)?.cf?.country;
  if (country && typeof country === 'string' && country.length === 2) {
    const existing = response.headers.get('Set-Cookie') || '';
    if (!existing.includes(`user-country=${country}`)) {
      response.headers.append(
        'Set-Cookie',
        `user-country=${country}; Path=/; Max-Age=86400; SameSite=Lax`
      );
    }
  }

  return response;
}
