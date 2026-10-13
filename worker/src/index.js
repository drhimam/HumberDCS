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

const allowedOrigin = (request, env) => {
  const origin = request.headers.get("Origin");
  if (!origin) return env.ALLOWED_ORIGIN || "*";
  const validOrigins = [
    env.ALLOWED_ORIGIN,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ].filter(Boolean);
  return validOrigins.includes(origin) ? origin : (env.ALLOWED_ORIGIN || origin);
};

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
  const appOrigin = env.APP_ORIGIN || "https://dcsqbank.pages.dev";
  const link = `${appOrigin}/verify-email?token=${encodeURIComponent(token)}`;
  const apiUrl = env.ZEPTOMAIL_API_URL || "https://api.zeptomail.ca/v1.1/email";
  const fromAddress = env.EMAIL_FROM_ADDRESS || "noreply@qbanks.org";
  const fromName = env.EMAIL_FROM_NAME || "DCS QBank";

  const emailHtml = `<!DOCTYPE html><html><body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 24px;">
<div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
  <div style="margin-bottom: 24px;">
    <span style="font-size: 22px; font-weight: 800; color: #0284c7; letter-spacing: -0.5px;">DCSQbank</span>
  </div>
  <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 16px;">Verify your email address</h2>
  <p style="margin-bottom: 16px;">Hello <strong>${displayName}</strong>,</p>
  <p style="margin-bottom: 24px;">Thank you for registering for DCSQbank. Please confirm your email address to activate your account and sync your study progress:</p>
  <p style="text-align: center; margin: 32px 0;">
    <a href="${link}" style="display: inline-block; background: linear-gradient(135deg, #0284c7, #14b8a6); color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(2,132,199,0.25);">Verify Email Address</a>
  </p>
  <p style="font-size: 13px; color: #64748b; margin-top: 24px;">If the button above does not work, copy and paste this link into your browser:</p>
  <p style="font-size: 12px; color: #0284c7; word-break: break-all;"><a href="${link}" style="color: #0284c7;">${link}</a></p>
  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
  <p style="font-size: 12px; color: #94a3b8; margin: 0;">This verification link is valid for 24 hours. If you did not create this account, you can safely ignore this email.</p>
</div>
</body></html>`;

  const rawKey = (env.ZEPTOMAIL_API_KEY || "").trim();
  const cleanKey = rawKey.replace(/^Zoho-enczapikey\s+/i, "");
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Zoho-enczapikey ${cleanKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: { address: fromAddress, name: fromName },
      to: [{ email_address: { address: email, name: displayName } }],
      subject: "Verify your DCSQbank account",
      htmlbody: emailHtml,
    }),
  });

  if (!response.ok) {
    const responseText = await response.text();
    let detail = responseText.trim();
    try {
      const provider = JSON.parse(responseText);
      if (provider.error && typeof provider.error === "object") {
        const subMessage = provider.error.details?.[0]?.message;
        const subCode = provider.error.details?.[0]?.code;
        const mainMessage = provider.error.message;
        const code = provider.error.code;
        detail = [code, subCode, subMessage || mainMessage].filter(Boolean).join(" - ");
      } else {
        detail = (typeof provider.message === "string" ? provider.message : "") ||
          (typeof provider.error === "string" ? provider.error : "") ||
          (typeof provider.code === "string" ? provider.code : "") ||
          detail;
      }
    } catch {
      // Some provider errors are returned as plain text or an empty response.
    }
    const requestId = response.headers.get("x-request-id") || response.headers.get("x-ratelimit-request-id") || "";
    const responseHeaders = Object.fromEntries(response.headers.entries());
    console.error("ZeptoMail rejected verification email", {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      detail,
      requestId,
      responseText,
    });
    const hint = detail || (response.status === 500 ? "Please check ZeptoMail/CPaaS email credits, Mail Agent status, and sender domain verification (qbanks.org)." : "");
    throw new Error(`Email service rejected the verification email (${response.status}).${hint ? ` ${hint}` : ""}`);
  }
}

async function sendPasswordResetEmail(env, email, displayName, token) {
  if (!env.ZEPTOMAIL_API_KEY) throw new Error("Email service is not configured.");
  const appOrigin = env.APP_ORIGIN || "https://dcsqbank.pages.dev";
  const link = `${appOrigin}/reset-password?token=${encodeURIComponent(token)}`;
  const apiUrl = env.ZEPTOMAIL_API_URL || "https://api.zeptomail.ca/v1.1/email";
  const fromAddress = env.EMAIL_FROM_ADDRESS || "noreply@qbanks.org";
  const fromName = env.EMAIL_FROM_NAME || "DCS QBank";

  const emailHtml = `<!DOCTYPE html><html><body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 24px;">
<div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
  <div style="margin-bottom: 24px;">
    <span style="font-size: 22px; font-weight: 800; color: #0284c7; letter-spacing: -0.5px;">DCSQbank</span>
  </div>
  <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 16px;">Reset your password</h2>
  <p style="margin-bottom: 16px;">Hello <strong>${displayName}</strong>,</p>
  <p style="margin-bottom: 24px;">We received a request to reset your password for your DCSQbank account. Click the button below to choose a new password:</p>
  <p style="text-align: center; margin: 32px 0;">
    <a href="${link}" style="display: inline-block; background: linear-gradient(135deg, #0284c7, #14b8a6); color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(2,132,199,0.25);">Reset Password</a>
  </p>
  <p style="font-size: 13px; color: #64748b; margin-top: 24px;">If the button above does not work, copy and paste this link into your browser:</p>
  <p style="font-size: 12px; color: #0284c7; word-break: break-all;"><a href="${link}" style="color: #0284c7;">${link}</a></p>
  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
  <p style="font-size: 12px; color: #94a3b8; margin: 0;">This reset link is valid for 2 hours. If you did not request a password reset, you can safely ignore this email.</p>
</div>
</body></html>`;

  const rawKey = (env.ZEPTOMAIL_API_KEY || "").trim();
  const cleanKey = rawKey.replace(/^Zoho-enczapikey\s+/i, "");
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Zoho-enczapikey ${cleanKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: { address: fromAddress, name: fromName },
      to: [{ email_address: { address: email, name: displayName } }],
      subject: "Reset your DCSQbank password",
      htmlbody: emailHtml,
    }),
  });

  if (!response.ok) {
    const responseText = await response.text();
    console.error("ZeptoMail rejected password reset email", { status: response.status, responseText });
    throw new Error(`Email service rejected password reset email (${response.status})`);
  }
}

async function sendFeedbackEmail(env, { name, email, category, subjectId, message }) {
  if (!env.ZEPTOMAIL_API_KEY) throw new Error("Email service is not configured.");
  const apiUrl = env.ZEPTOMAIL_API_URL || "https://api.zeptomail.ca/v1.1/email";
  const fromAddress = env.EMAIL_FROM_ADDRESS || "noreply@qbanks.org";
  const fromName = env.EMAIL_FROM_NAME || "DCS QBank";
  const rawKey = (env.ZEPTOMAIL_API_KEY || "").trim();
  const cleanKey = rawKey.replace(/^Zoho-enczapikey\s+/i, "");

  const safeName = (name || "Anonymous DCS Learner").trim();
  const safeEmail = (email || "Not provided").trim();
  const safeCategory = (category || "General Feedback").trim();
  const safeSubject = subjectId ? ` (Course: ${subjectId})` : "";
  const timeStr = new Date().toUTCString();

  const adminHtml = `<!DOCTYPE html><html><body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 24px;">
<div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
  <div style="margin-bottom: 20px; border-bottom: 2px solid #0284c7; padding-bottom: 12px;">
    <span style="font-size: 22px; font-weight: 800; color: #0284c7;">DCSQbank</span>
    <span style="font-size: 14px; font-weight: 600; color: #64748b; margin-left: 8px;">· Learner Feedback Received</span>
  </div>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
    <tr><td style="padding: 6px 0; color: #64748b; width: 130px; font-weight: 600;">Category:</td><td style="font-weight: 700; color: #0f172a;">${safeCategory}${safeSubject}</td></tr>
    <tr><td style="padding: 6px 0; color: #64748b; font-weight: 600;">Submitted By:</td><td style="font-weight: 600; color: #0f172a;">${safeName}</td></tr>
    <tr><td style="padding: 6px 0; color: #64748b; font-weight: 600;">Contact Email:</td><td style="color: #0284c7;">${safeEmail}</td></tr>
    <tr><td style="padding: 6px 0; color: #64748b; font-weight: 600;">Timestamp:</td><td style="color: #64748b;">${timeStr}</td></tr>
  </table>
  <div style="background: #f1f5f9; border-left: 4px solid #0284c7; border-radius: 8px; padding: 18px; margin: 20px 0; font-size: 14px; line-height: 1.7; color: #0f172a; white-space: pre-wrap;">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
  <p style="font-size: 12px; color: #94a3b8; margin: 0;">Automated notification sent to dcsqbank@qbanks.org from DCSQbank feedback service.</p>
</div>
</body></html>`;

  const adminBody = {
    from: { address: fromAddress, name: fromName },
    to: [{ email_address: { address: "dcsqbank@qbanks.org", name: "DCSQbank Feedback Team" } }],
    subject: `[DCSQbank Feedback] ${safeCategory}: ${safeName}${safeSubject}`,
    htmlbody: adminHtml,
  };
  if (validEmail(email)) {
    adminBody.reply_to = [{ address: email.trim().toLowerCase(), name: safeName }];
  }

  const adminResponse = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Zoho-enczapikey ${cleanKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(adminBody),
  });

  if (!adminResponse.ok) {
    const txt = await adminResponse.text();
    console.error("ZeptoMail feedback send failed:", adminResponse.status, txt);
    throw new Error(`Email service rejected feedback delivery (${adminResponse.status})`);
  }

  // 2. Auto-send confirmation to user if email is valid
  if (validEmail(email)) {
    const userReceiptHtml = `<!DOCTYPE html><html><body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 24px;">
<div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
  <div style="margin-bottom: 20px;">
    <span style="font-size: 22px; font-weight: 800; color: #0284c7; letter-spacing: -0.5px;">DCSQbank</span>
  </div>
  <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 0;">Feedback received — Thank you!</h2>
  <p style="margin-bottom: 16px;">Hello <strong>${safeName}</strong>,</p>
  <p style="margin-bottom: 16px;">Thank you for sharing your feedback with DCSQbank. We have received your submission regarding <strong>${safeCategory}</strong>.</p>
  <p style="margin-bottom: 16px;">Our team regularly reviews learner input to continually refine question quality, clinical rationale, and platform usability for Humber College Diagnostic Cardiac Sonography students.</p>
  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin: 20px 0; font-size: 13px; color: #334155;">
    <strong style="color: #64748b; font-size: 11px; text-transform: uppercase;">Your Submission:</strong>
    <p style="margin: 8px 0 0 0; white-space: pre-wrap;">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
  </div>
  <p style="font-size: 13px; color: #64748b;">If you need to follow up, you can reply directly to this email or reach us at <a href="mailto:dcsqbank@qbanks.org" style="color: #0284c7;">dcsqbank@qbanks.org</a>.</p>
  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
  <p style="font-size: 12px; color: #94a3b8; margin: 0;">Dedicated to Humber College DCS Faculty & Students · Supporting Sonography Canada & ARDMS success.</p>
</div>
</body></html>`;

    try {
      await fetch(apiUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Zoho-enczapikey ${cleanKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: { address: fromAddress, name: fromName },
          to: [{ email_address: { address: email.trim().toLowerCase(), name: safeName } }],
          subject: "Feedback received — Thank you from DCSQbank",
          htmlbody: userReceiptHtml,
        }),
      });
    } catch (e) {
      console.warn("Auto-reply confirmation email to learner could not be sent:", e);
    }
  }
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
        const email = input.email.trim().toLowerCase();
        const existing = await env.DB.prepare("SELECT id, email_verified_at FROM users WHERE email = ?").bind(email).first();
        if (existing) {
          if (existing.email_verified_at) {
            return json({ error: "An account with this email already exists. Please sign in." }, 409, headers);
          } else {
            return json({
              error: "An account with this email exists but is not yet verified. Please check your inbox or request a new verification email.",
              emailVerificationRequired: true,
              email,
            }, 409, headers);
          }
        }

        const userId = id();
        const timestamp = now();
        await env.DB.prepare("INSERT INTO users (id, email, password_hash, display_name, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)")
          .bind(userId, email, await hashPassword(input.password), input.name.trim(), timestamp, timestamp).run();
        
        const verificationToken = base64url(bytes(32));
        await env.DB.prepare("INSERT INTO email_verification_tokens (id, user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)")
          .bind(id(), userId, await digest(verificationToken), new Date(Date.now() + VERIFICATION_HOURS * 3600000).toISOString(), timestamp).run();

        let emailSent = false;
        let emailError = null;
        try {
          await sendVerificationEmail(env, email, input.name.trim(), verificationToken);
          emailSent = true;
        } catch (error) {
          emailError = error.message;
          console.error("Failed to send verification email on register:", error);
        }

        const user = await env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(userId).first();
        return json({
          user: userShape(user),
          emailVerificationRequired: true,
          emailSent,
          message: emailSent
            ? "Your account was created! Check your email to verify your address before signing in."
            : `Your account was created, but the verification email could not be delivered yet (${emailError || "Email delivery pending"}). You can resend the verification email anytime.`,
        }, 201, headers);
      }

      if (url.pathname === "/auth/resend-verification" && request.method === "POST") {
        const input = await body(request);
        if (!validEmail(input.email)) return json({ error: "A valid email is required." }, 400, headers);
        const email = input.email.trim().toLowerCase();
        const user = await env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).first();
        if (!user) {
          return json({ ok: true, message: "If an account with that email exists and requires verification, a link has been sent." }, 200, headers);
        }
        if (user.email_verified_at) {
          return json({ ok: true, alreadyVerified: true, message: "This email address is already verified. You can sign in directly." }, 200, headers);
        }

        const timestamp = now();
        const verificationToken = base64url(bytes(32));
        await env.DB.batch([
          env.DB.prepare("DELETE FROM email_verification_tokens WHERE user_id = ?").bind(user.id),
          env.DB.prepare("INSERT INTO email_verification_tokens (id, user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)")
            .bind(id(), user.id, await digest(verificationToken), new Date(Date.now() + VERIFICATION_HOURS * 3600000).toISOString(), timestamp),
        ]);

        try {
          await sendVerificationEmail(env, email, user.display_name, verificationToken);
          return json({ ok: true, emailSent: true, message: "A new verification email has been sent. Please check your inbox." }, 200, headers);
        } catch (error) {
          console.error("Failed to resend verification email:", error);
          return json({
            ok: false,
            emailSent: false,
            error: `Could not send verification email (${error.message}). Please verify ZeptoMail domain settings and credits.`,
          }, 500, headers);
        }
      }

      if (url.pathname === "/auth/verify-email" && request.method === "GET") {
        const token = url.searchParams.get("token");
        if (!token) return json({ error: "Verification token is required." }, 400, headers);
        const verification = await env.DB.prepare("SELECT t.id, t.user_id FROM email_verification_tokens t WHERE t.token_hash = ? AND t.used_at IS NULL AND t.expires_at > ?")
          .bind(await digest(token), now()).first();
        if (!verification) return json({ error: "This verification link is invalid or has expired." }, 400, headers);
        const timestamp = now();
        await env.DB.batch([
          env.DB.prepare("UPDATE users SET email_verified_at = ?, updated_at = ? WHERE id = ?").bind(timestamp, timestamp, verification.user_id),
          env.DB.prepare("UPDATE email_verification_tokens SET used_at = ? WHERE id = ?").bind(timestamp, verification.id),
        ]);
        return json({ ok: true, message: "Email verified successfully! You can now sign in." }, 200, headers);
      }

      if (url.pathname === "/auth/login" && request.method === "POST") {
        const input = await body(request);
        if (!validEmail(input.email) || typeof input.password !== "string") return json({ error: "Email and password are required." }, 400, headers);
        const email = input.email.trim().toLowerCase();
        const user = await env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).first();
        if (!user || !(await verifyPassword(input.password, user.password_hash)) || user.status !== "active") {
          return json({ error: "Invalid email or password." }, 401, headers);
        }
        if (!user.email_verified_at) {
          return json({
            error: "Please verify your email before signing in.",
            emailVerificationRequired: true,
            email: user.email,
          }, 403, headers);
        }
        const session = await createSession(env.DB, user.id);
        return json({ user: userShape(user) }, 200, { ...headers, "Set-Cookie": cookie(session, SESSION_DAYS * 86400) });
      }

      if (url.pathname === "/auth/forgot-password" && request.method === "POST") {
        const input = await body(request);
        if (!validEmail(input.email)) return json({ error: "A valid email is required." }, 400, headers);
        const email = input.email.trim().toLowerCase();
        const user = await env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).first();
        if (!user) {
          return json({ ok: true, message: "If an account with that email exists, password reset instructions have been sent." }, 200, headers);
        }

        const resetToken = base64url(bytes(32));
        const timestamp = now();
        const RESET_HOURS = 2;
        await env.DB.batch([
          env.DB.prepare("DELETE FROM password_reset_tokens WHERE user_id = ?").bind(user.id),
          env.DB.prepare("INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)")
            .bind(id(), user.id, await digest(resetToken), new Date(Date.now() + RESET_HOURS * 3600000).toISOString(), timestamp),
        ]);

        try {
          await sendPasswordResetEmail(env, email, user.display_name, resetToken);
        } catch (error) {
          console.error("Failed to send password reset email:", error);
          return json({ error: "Failed to send reset email. Please try again later." }, 500, headers);
        }

        return json({ ok: true, message: "If an account with that email exists, password reset instructions have been sent." }, 200, headers);
      }

      if (url.pathname === "/auth/reset-password" && request.method === "POST") {
        const input = await body(request);
        if (typeof input.token !== "string" || !input.token.trim()) {
          return json({ error: "Reset token is required." }, 400, headers);
        }
        if (typeof input.password !== "string" || input.password.length < 8) {
          return json({ error: "Password must be at least 8 characters." }, 400, headers);
        }

        const token = input.token.trim();
        const tokenHash = await digest(token);
        const resetRecord = await env.DB.prepare("SELECT t.id, t.user_id FROM password_reset_tokens t WHERE t.token_hash = ? AND t.used_at IS NULL AND t.expires_at > ?")
          .bind(tokenHash, now()).first();

        if (!resetRecord) {
          return json({ error: "This password reset link is invalid or has expired." }, 400, headers);
        }

        const timestamp = now();
        const newPasswordHash = await hashPassword(input.password);
        await env.DB.batch([
          env.DB.prepare("UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?")
            .bind(newPasswordHash, timestamp, resetRecord.user_id),
          env.DB.prepare("UPDATE password_reset_tokens SET used_at = ? WHERE id = ?")
            .bind(timestamp, resetRecord.id),
          env.DB.prepare("UPDATE sessions SET revoked_at = ? WHERE user_id = ? AND revoked_at IS NULL")
            .bind(timestamp, resetRecord.user_id),
        ]);

        return json({ ok: true, message: "Your password has been reset successfully. You can now sign in." }, 200, headers);
      }

      if (url.pathname === "/auth/profile" && request.method === "POST") {
        const user = await currentUser(request, env);
        if (!user) return json({ error: "Not authenticated." }, 401, headers);
        const input = await body(request);
        if (typeof input.name !== "string" || input.name.trim().length < 2) {
          return json({ error: "Name must be at least 2 characters." }, 400, headers);
        }
        const timestamp = now();
        const newName = input.name.trim();
        await env.DB.prepare("UPDATE users SET display_name = ?, updated_at = ? WHERE id = ?")
          .bind(newName, timestamp, user.id).run();
        const updated = await env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(user.id).first();
        return json({ ok: true, user: userShape(updated) }, 200, headers);
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

      if ((url.pathname === "/api/feedback" || url.pathname === "/feedback") && request.method === "POST") {
        const input = await body(request);
        if (typeof input.message !== "string" || input.message.trim().length < 5) {
          return json({ error: "Please provide a detailed feedback message (at least 5 characters)." }, 400, headers);
        }
        if (input.email && !validEmail(input.email)) {
          return json({ error: "Please provide a valid email address so we can follow up, or leave it blank." }, 400, headers);
        }
        await sendFeedbackEmail(env, {
          name: typeof input.name === "string" ? input.name : "",
          email: typeof input.email === "string" ? input.email : "",
          category: typeof input.category === "string" ? input.category : "General Feedback",
          subjectId: typeof input.subjectId === "string" ? input.subjectId : "",
          message: input.message.trim(),
        });
        return json({
          ok: true,
          message: "Thank you! Your feedback has been received and our sonography team has been notified at dcsqbank@qbanks.org.",
        }, 200, headers);
      }

      return json({ error: "Not found" }, 404, headers);
    } catch (error) {
      console.error("Worker request failed", error);
      return json({ error: error.message || "Request failed." }, 500, headers);
    }
  },
};
