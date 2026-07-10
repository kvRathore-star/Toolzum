export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const dest = `https://toolzum.com${url.pathname}${url.search}`;
    return Response.redirect(dest, 301);
  },
};
