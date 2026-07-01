export const API_URL = import.meta.env.VITE_API_URL || '';

function buildUrl(base, path, params) {
  const url = `${(base || '').replace(/\/+$/, '')}/${path.replace(/^\//, '')}`;
  if (!params) return url;
  const qs = new URLSearchParams(params).toString();
  return qs ? `${url}${url.includes('?') ? '&' : '?'}${qs}` : url;
}

export function getErrorMessage(err) {
  const data = err?.response?.data;
  if (!data) return err?.message || 'Error desconocido';
  if (typeof data === 'string') return data;
  if (data.message) return data.message;
  if (data.detail) return data.detail;
  if (data.error) return data.error;
  return JSON.stringify(data);
}

async function request(method, path, { body, headers = {}, params, signal, responseType } = {}) {
  const url = buildUrl(API_URL, path, params);
  const isFormData = body instanceof FormData;
  const finalHeaders = {
    ...(!isFormData && !responseType ? { 'Content-Type': 'application/json' } : {}),
    ...headers,
  };

  const res = await fetch(url, {
    method,
    headers: finalHeaders,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    signal,
    credentials: 'include',
  });

  const ct = (res.headers.get('content-type') || '').toLowerCase();

  let data;
  try {
    if (ct.includes('application/json')) data = await res.json();
    else if (responseType === 'arraybuffer') data = await res.arrayBuffer();
    else if (responseType === 'blob') data = await res.blob();
    else data = await res.text();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const err = new Error(getErrorMessage({ response: { data } }) || `HTTP ${res.status}`);
    err.response = { status: res.status, data };
    throw err;
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
