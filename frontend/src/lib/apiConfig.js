/**
 * Resolves the API base URL dynamically based on the current environment.
 * 
 * In production on dcs.qbanks.org (or any *.qbanks.org domain):
 * Returns an empty string ("") so API calls (/auth/*, /api/*) use same-origin relative URLs.
 * Cloudflare Worker routes directly map these same-origin paths to the dcsqbank-api Worker.
 * This completely prevents:
 * 1. Corporate / hospital firewall blocks on *.workers.dev domains.
 * 2. Third-party cookie blocking across different origins.
 * 3. Cross-origin preflight latency and CORS issues.
 * 
 * When running in local development or preview environments:
 * Falls back to process.env.REACT_APP_API_URL or the custom domain https://dcs-api.qbanks.org.
 */
export const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  if (typeof window !== "undefined" && window.location?.hostname) {
    const hostname = window.location.hostname.toLowerCase();
    // Use relative path for same-origin routing on custom domain
    if (hostname === "dcs.qbanks.org" || hostname.endsWith(".qbanks.org")) {
      return "";
    }
  }

  // Fallback for previews (e.g. pages.dev) or local dev without custom env
  return "https://dcs-api.qbanks.org";
};

export const API_BASE_URL = getApiBaseUrl();
