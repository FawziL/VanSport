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
    credentials: 'same-origin',
  });

  const ct = (res.headers.get('content-type') || '').toLowerCase();

  // Leer cuerpo (intentar JSON primero)
  let data;
  try {
    if (ct.includes('application/json')) data = await res.json();
    else if (responseType === 'arraybuffer') data = await res.arrayBuffer();
    else if (responseType === 'blob') data = await res.blob();
    else data = await res.text();
  } catch (e) {
    data = null;
  }

  if (!res.ok) {
    const err = new Error(data?.detail || data?.message || `HTTP ${res.status}`);
    err.response = { status: res.status, data: data ?? (await res.text().catch(() => null)) };
    // Normalizar 401 con mensaje amigable
    if (res.status === 401) {
      err.response.data = err.response.data || {};
      if (!err.response.data.detail)
        err.response.data.detail = 'No autorizado. Por favor inicia sesión.';
    }
    throw err;
  }

  // Responder datos procesados
  return data;
}

export const http = {
  get: (path, opts) => request('GET', path, opts),
  post: (path, body, opts) => request('POST', path, { ...opts, body }),
  put: (path, body, opts) => request('PUT', path, { ...opts, body }),
  patch: (path, body, opts) => request('PATCH', path, { ...opts, body }),
  delete: (path, opts) => request('DELETE', path, opts),
};
