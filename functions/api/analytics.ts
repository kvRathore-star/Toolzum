import { jsonResponse, handleOptions } from "../_shared";

export async function onRequest(context: any) {
  const request = context.request;
  const options = handleOptions(request);
  if (options) return options;

  try {
    const body = await request.json();
    console.log("[Analytics]", JSON.stringify(body));
    return jsonResponse({ ok: true }, 200, true, request);
  } catch {
    return jsonResponse({ ok: false }, 400, true, request);
  }
}
