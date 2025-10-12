export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// Si guardas el token en localStorage, este helper lo añade automáticamente
function getAuthHeader() {
  const token = localStorage.getItem('token'); // ajusta si guardas en otro lugar
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(method, path, { body, headers = {}, signal } = {}) {
  const url = `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;

  const isFormData = body instanceof FormData;
  const finalHeaders = {
    ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...getAuthHeader(),
    ...headers,
  };

  const res = await fetch(url, {
    method,
    headers: finalHeaders,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    signal,
  });

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const message = isJson ? data?.error || data?.detail || 'Error en la petición' : data;
    throw new Error(message);
  }

  return data;
}

export const http = {
  get: (path, opts) => request('GET', path, opts),
  post: (path, body, opts) => request('POST', path, { ...opts, body }),
  put: (path, body, opts) => request('PUT', path, { ...opts, body }),
  patch: (path, body, opts) => request('PATCH', path, { ...opts, body }),
  delete: (path, opts) => request('DELETE', path, opts),
};
