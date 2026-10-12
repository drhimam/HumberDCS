const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...headers },
  });

const allowedOrigin = (request, env) => {
  const origin = request.headers.get("Origin");
  return origin && origin === env.ALLOWED_ORIGIN ? origin : env.ALLOWED_ORIGIN;
};

const corsHeaders = (request, env) => ({
  "access-control-allow-origin": allowedOrigin(request, env),
  "access-control-allow-credentials": "true",
  "access-control-allow-headers": "Content-Type, X-Request-Id",
  "access-control-allow-methods": "GET, OPTIONS",
  "access-control-max-age": "86400",
  vary: "Origin",
});

export default {
  async fetch(request, env) {
    const headers = corsHeaders(request, env);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
    if (request.method !== "GET") return json({ error: "Method not allowed" }, 405, headers);

    const url = new URL(request.url);
    if (url.pathname !== "/health" && url.pathname !== "/api/health") {
      return json({ error: "Not found" }, 404, headers);
    }

    try {
      await env.DB.prepare("SELECT 1 AS ok").first();
      return json({ service: "dcsqbank-api", database: "ok", status: "ok" }, 200, headers);
    } catch (error) {
      console.error("Health check database failure", error);
      return json({ service: "dcsqbank-api", database: "unavailable", status: "degraded" }, 503, headers);
    }
  },
};
