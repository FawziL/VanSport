export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'; // en dev usa proxy ⇒ vacío

// Si guardas el token en localStorage, este helper lo añade automáticamente
function getAuthHeader() {
  const token = localStorage.getItem('access') || localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function buildUrl(base, path, params) {
  const url = `${(base || '').replace(/\/+$/, '')}${path.startsWith('/') ? '' : '/'}${path}`;
  if (!params) return url;
  const qs = new URLSearchParams(params).toString();
  return qs ? `${url}${url.includes('?') ? '&' : '?'}${qs}` : url;
}

async function request(method, path, { body, headers = {}, params, signal, responseType } = {}) {
  const url = buildUrl(API_URL, path, params);
  const isFormData = body instanceof FormData;
  const finalHeaders = {
    ...(!isFormData && !responseType ? { 'Content-Type': 'application/json' } : {}),
    ...getAuthHeader(),
    ...headers,
  };

  const res = await fetch(url, {
    method,
    headers: finalHeaders,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    signal,
  });

  if (!res.ok) {
    let errText = '';
    try { errText = await res.text(); } catch {}
    const error = new Error(errText || `HTTP ${res.status}`);
    error.response = { status: res.status, data: errText };
    throw error;
  }

  if (responseType === 'arraybuffer') return await res.arrayBuffer();
  if (responseType === 'blob')        return await res.blob();

  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? await res.json() : await res.text();
}

export const http = {
  get: (path, opts) => request('GET', path, opts),
  post: (path, body, opts) => request('POST', path, { ...opts, body }),
  put: (path, body, opts) => request('PUT', path, { ...opts, body }),
  patch: (path, body, opts) => request('PATCH', path, { ...opts, body }),
  delete: (path, opts) => request('DELETE', path, opts),
};
