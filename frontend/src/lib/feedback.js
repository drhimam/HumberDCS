import { getApiBaseUrl } from "./apiConfig";

export async function submitFeedback(payload) {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/feedback`, {
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
