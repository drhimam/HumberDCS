const SESSION_DAYS = 30;
const VERIFICATION_HOURS = 24;
const PASSWORD_ITERATIONS = 100000;

const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...headers },
  });

const now = () => new Date().toISOString();
const id = () => crypto.randomUUID();
const bytes = (length = 32) => crypto.getRandomValues(new Uint8Array(length));
const hex = (value) => [...new Uint8Array(value)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
const base64url = (value) => btoa(String.fromCharCode(...value)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

async function digest(value) {
  return hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
}

async function hashPassword(password) {
  const salt = bytes(16);
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: PASSWORD_ITERATIONS, hash: "SHA-256" }, key, 256);
  return `pbkdf2$${PASSWORD_ITERATIONS}$${hex(salt)}$${hex(bits)}`;
}

async function verifyPassword(password, stored) {
  const [, iterations, saltHex, expected] = stored.split("$");
  if (!iterations || !saltHex || !expected) return false;
  const salt = new Uint8Array(saltHex.match(/.{2}/g).map((part) => parseInt(part, 16)));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: Number(iterations), hash: "SHA-256" }, key, 256);
  return (await digest(hex(bits))) === (await digest(expected));
}

const cookie = (token, maxAge) => `dcsqbank_session=${token}; Max-Age=${maxAge}; Path=/; HttpOnly; Secure; SameSite=Lax`;
const clearCookie = "dcsqbank_session=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax";
const userShape = (user) => ({ id: user.id, email: user.email, displayName: user.display_name, role: user.role, emailVerified: Boolean(user.email_verified_at) });

const allowedOrigin = (request, env) => request.headers.get("Origin") === env.ALLOWED_ORIGIN ? env.ALLOWED_ORIGIN : env.ALLOWED_ORIGIN;
const corsHeaders = (request, env) => ({
  "access-control-allow-origin": allowedOrigin(request, env),
  "access-control-allow-credentials": "true",
  "access-control-allow-headers": "Content-Type, X-Request-Id",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-max-age": "86400",
  vary: "Origin",
});
const body = async (request) => {
  try { return await request.json(); } catch { throw new Error("Invalid JSON body."); }
};
const validEmail = (email) => typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 320;

async function sendVerificationEmail(env, email, displayName, token) {
  if (!env.ZEPTOMAIL_API_KEY) throw new Error("Email service is not configured.");
  const link = `${env.APP_ORIGIN}/verify-email?token=${encodeURIComponent(token)}`;
  const response = await fetch(env.ZEPTOMAIL_API_URL, {
    method: "POST",
    headers: { Authorization: `Zoho-enczapikey ${env.ZEPTOMAIL_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: { address: env.EMAIL_FROM_ADDRESS, name: env.EMAIL_FROM_NAME },
      to: [{ email_address: { address: email, name: displayName } }],
      subject: "Verify your DCSQbank account",
      htmlbody: `<p>Hello ${displayName},</p><p>Verify your DCSQbank account:</p><p><a href="${link}">Verify email address</a></p>`,
    }),
  });
  if (!response.ok) throw new Error("Email service rejected the verification email.");
}

async function createSession(db, userId) {
  const raw = base64url(bytes(32));
  const timestamp = now();
  await db.prepare("INSERT INTO sessions (id, user_id, session_hash, expires_at, created_at, last_seen_at) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(id(), userId, await digest(raw), new Date(Date.now() + SESSION_DAYS * 86400000).toISOString(), timestamp, timestamp).run();
  return raw;
}

async function currentUser(request, env) {
  const match = request.headers.get("Cookie")?.match(/(?:^|;\s*)dcsqbank_session=([^;]+)/);
  if (!match) return null;
  return env.DB.prepare("SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.session_hash = ? AND s.revoked_at IS NULL AND s.expires_at > ? AND u.status = 'active'")
    .bind(await digest(match[1]), now()).first();
}

export default {
  async fetch(request, env) {
    const headers = corsHeaders(request, env);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
    const url = new URL(request.url);
    try {
      if (url.pathname === "/health" || url.pathname === "/api/health") {
        await env.DB.prepare("SELECT 1 AS ok").first();
        return json({ service: "dcsqbank-api", database: "ok", status: "ok" }, 200, headers);
      }
      if (url.pathname === "/auth/register" && request.method === "POST") {
        const input = await body(request);
        if (typeof input.name !== "string" || input.name.trim().length < 2 || !validEmail(input.email) || typeof input.password !== "string" || input.password.length < 8) {
          return json({ error: "Name, valid email, and a password of at least 8 characters are required." }, 400, headers);
        }
        if (!env.ZEPTOMAIL_API_KEY) return json({ error: "Email service is not configured. Please try again later." }, 503, headers);
        const email = input.email.trim().toLowerCase();
        const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
        if (existing) return json({ error: "An account with this email already exists." }, 409, headers);
        const userId = id();
        const timestamp = now();
        await env.DB.prepare("INSERT INTO users (id, email, password_hash, display_name, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)")
          .bind(userId, email, await hashPassword(input.password), input.name.trim(), timestamp, timestamp).run();
        const verificationToken = base64url(bytes(32));
        await env.DB.prepare("INSERT INTO email_verification_tokens (id, user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)")
          .bind(id(), userId, await digest(verificationToken), new Date(Date.now() + VERIFICATION_HOURS * 3600000).toISOString(), timestamp).run();
        try {
          await sendVerificationEmail(env, email, input.name.trim(), verificationToken);
        } catch (error) {
          await env.DB.batch([
            env.DB.prepare("DELETE FROM email_verification_tokens WHERE user_id = ?").bind(userId),
            env.DB.prepare("DELETE FROM users WHERE id = ?").bind(userId),
          ]);
          throw error;
        }
        const user = await env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(userId).first();
        return json({ user: userShape(user), emailVerificationRequired: true }, 201, headers);
      }
      if (url.pathname === "/auth/verify-email" && request.method === "GET") {
        const token = url.searchParams.get("token");
        if (!token) return json({ error: "Verification token is required." }, 400, headers);
        const verification = await env.DB.prepare("SELECT t.id, t.user_id FROM email_verification_tokens t WHERE t.token_hash = ? AND t.used_at IS NULL AND t.expires_at > ?")
          .bind(await digest(token), now()).first();
        if (!verification) return json({ error: "This verification link is invalid or expired." }, 400, headers);
        const timestamp = now();
        await env.DB.batch([
          env.DB.prepare("UPDATE users SET email_verified_at = ?, updated_at = ? WHERE id = ?").bind(timestamp, timestamp, verification.user_id),
          env.DB.prepare("UPDATE email_verification_tokens SET used_at = ? WHERE id = ?").bind(timestamp, verification.id),
        ]);
        return json({ ok: true, message: "Email verified. You can now sign in." }, 200, headers);
      }
      if (url.pathname === "/auth/login" && request.method === "POST") {
        const input = await body(request);
        if (!validEmail(input.email) || typeof input.password !== "string") return json({ error: "Email and password are required." }, 400, headers);
        const user = await env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(input.email.trim().toLowerCase()).first();
        if (!user || !(await verifyPassword(input.password, user.password_hash)) || user.status !== "active") return json({ error: "Invalid email or password." }, 401, headers);
        if (!user.email_verified_at) return json({ error: "Please verify your email before signing in." }, 403, headers);
        const session = await createSession(env.DB, user.id);
        return json({ user: userShape(user) }, 200, { ...headers, "Set-Cookie": cookie(session, SESSION_DAYS * 86400) });
      }
      if (url.pathname === "/auth/me" && request.method === "GET") {
        const user = await currentUser(request, env);
        return user ? json({ user: userShape(user) }, 200, headers) : json({ error: "Not authenticated." }, 401, headers);
      }
      if (url.pathname === "/auth/logout" && request.method === "POST") {
        const match = request.headers.get("Cookie")?.match(/(?:^|;\s*)dcsqbank_session=([^;]+)/);
        if (match) await env.DB.prepare("UPDATE sessions SET revoked_at = ? WHERE session_hash = ?").bind(now(), await digest(match[1])).run();
        return json({ ok: true }, 200, { ...headers, "Set-Cookie": clearCookie });
      }
      return json({ error: "Not found" }, 404, headers);
    } catch (error) {
      console.error("Worker request failed", error);
      return json({ error: error.message || "Request failed." }, 500, headers);
    }
  },
};
