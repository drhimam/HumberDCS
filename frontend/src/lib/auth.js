import { useEffect, useState } from "react";
import { getApiBaseUrl } from "./apiConfig";

export const authRequest = async (path, options = {}) => {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}${path}`, {
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

export const getAuthUser = () => {
  try {
    const raw = sessionStorage.getItem("dcsqbank_auth_session");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveAuthSession = (user) => {
  sessionStorage.setItem("dcsqbank_auth_session", JSON.stringify(user));
  window.dispatchEvent(new Event("dcsqbank-auth-change"));
};

export const updateAuthUser = (updates) => {
  const current = getAuthUser() || {};
  const merged = { ...current, ...updates };
  saveAuthSession(merged);
  return merged;
};

export const clearAuthSession = () => {
  sessionStorage.removeItem("dcsqbank_auth_session");
  window.dispatchEvent(new Event("dcsqbank-auth-change"));
};

export const useAuthUser = () => {
  const [user, setUser] = useState(getAuthUser);

  useEffect(() => {
    const handler = () => setUser(getAuthUser());
    window.addEventListener("dcsqbank-auth-change", handler);
    return () => window.removeEventListener("dcsqbank-auth-change", handler);
  }, []);

  return user;
};

export const logout = async () => {
  try {
    await authRequest("/auth/logout", { method: "POST" });
  } catch (error) {
    console.warn("Logout request failed:", error);
  } finally {
    clearAuthSession();
  }
};
