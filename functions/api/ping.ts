export const onRequest: PagesFunction = async () => {
  return new Response(JSON.stringify({ test: true, timestamp: Date.now() }), {
    headers: { "Content-Type": "application/json" },
  });
};
