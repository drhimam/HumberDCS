const API_URL = process.env.REACT_APP_API_URL || "https://dcsqbank-api.rifa-numis.workers.dev";

/**
 * Fetch PayPal configuration from Cloudflare Worker backend.
 * Falls back to process.env.REACT_APP_PAYPAL_CLIENT_ID if backend config is unavailable.
 */
export async function getDonationConfig() {
  try {
    const res = await fetch(`${API_URL}/api/donations/config`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return {
      configured: Boolean(data.configured || process.env.REACT_APP_PAYPAL_CLIENT_ID),
      clientId: data.clientId || process.env.REACT_APP_PAYPAL_CLIENT_ID || "",
      currency: data.currency || "CAD",
      environment: data.environment || "live",
    };
  } catch (err) {
    console.warn("Could not fetch remote donation config, checking frontend env:", err);
    const envClientId = process.env.REACT_APP_PAYPAL_CLIENT_ID || "";
    return {
      configured: Boolean(envClientId),
      clientId: envClientId,
      currency: "CAD",
      environment: "live",
    };
  }
}

/**
 * Create a PayPal donation order via Worker backend.
 */
export async function createDonationOrder({ amount, currency = "CAD", donorEmail, donorName }) {
  const res = await fetch(`${API_URL}/api/donations/create-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ amount, currency, donorEmail, donorName }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Failed to initiate PayPal donation order.");
  }
  return data;
}

/**
 * Capture an approved PayPal donation order via Worker backend.
 */
export async function captureDonationOrder({ orderId }) {
  const res = await fetch(`${API_URL}/api/donations/capture-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ orderId }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Failed to complete donation payment verification.");
  }
  return data;
}

/**
 * Fetch public community donation stats (total donors & CAD raised).
 */
export async function getDonationStats() {
  try {
    const res = await fetch(`${API_URL}/api/donations/stats`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Fetch authenticated user's donation history.
 */
export async function getMyDonations() {
  try {
    const res = await fetch(`${API_URL}/api/donations/my-donations`, {
      credentials: "include",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.donations || [];
  } catch {
    return [];
  }
}
