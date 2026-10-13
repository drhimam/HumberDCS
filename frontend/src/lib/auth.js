const API_URL = process.env.REACT_APP_API_URL || "https://dcsqbank-api.rifa-numis.workers.dev";

export const authRequest = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: { "content-type": "application/json", ...(options.headers || {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || "Authentication request failed.");
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
};

export const saveAuthSession = (user) => {
  sessionStorage.setItem("dcsqbank_auth_session", JSON.stringify(user));
  window.dispatchEvent(new Event("dcsqbank-auth-change"));
};

export const clearAuthSession = () => {
  sessionStorage.removeItem("dcsqbank_auth_session");
  window.dispatchEvent(new Event("dcsqbank-auth-change"));
};
