export function resolveBackendUrl(value, isDevelopment = false) {
  const configured = value?.trim();
  if (!configured) {
    if (isDevelopment) return 'http://localhost:5000';
    throw new Error('Backend URL is missing. Set VITE_BACKEND_URL in Netlify and redeploy the site.');
  }

  let url;
  try {
    url = new URL(configured);
  } catch {
    throw new Error('VITE_BACKEND_URL must be a complete backend URL. Update it and redeploy the site.');
  }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
    throw new Error('VITE_BACKEND_URL must be an HTTP or HTTPS backend URL without credentials, query parameters, or a fragment.');
  }
  if (!isDevelopment && (url.protocol !== 'https:' || ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))) {
    throw new Error('The deployed site requires a public HTTPS backend URL. Update VITE_BACKEND_URL and redeploy.');
  }
  return url.href.replace(/\/+$/, '').replace(/\/api$/, '');
}

export async function requestApi(path, options = {}) {
  const base = resolveBackendUrl(import.meta.env.VITE_BACKEND_URL, import.meta.env.DEV);
  let response;
  try {
    response = await fetch(`${base}/api/${path}`, {
      ...options,
      signal: AbortSignal.timeout(60000),
    });
  } catch {
    throw new Error('Cannot reach the backend. It may be starting up or unavailable. Please try again shortly.');
  }
  if (!response.ok) {
    throw new Error(`The backend returned an error (HTTP ${response.status}). Please try again shortly.`);
  }
  try {
    return await response.json();
  } catch {
    throw new Error('The backend returned an invalid response. Check that VITE_BACKEND_URL points to the Python backend and redeploy.');
  }
}
