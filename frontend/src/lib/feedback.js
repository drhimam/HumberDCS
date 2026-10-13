const API_URL = process.env.REACT_APP_API_URL || "https://dcsqbank-api.rifa-numis.workers.dev";

export async function submitFeedback(payload) {
  const response = await fetch(`${API_URL}/api/feedback`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Failed to submit feedback. Please try again later.");
  }

  return data;
}
