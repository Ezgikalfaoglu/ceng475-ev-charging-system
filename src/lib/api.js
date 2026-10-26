// Thin wrapper around fetch for the Express API. OWNER: PM.
//   const { stations } = await api.get('/stations');
//   await api.post('/reservations', { chargerId, startTime, endTime });
// Errors are thrown as ApiError with the server's standard fields (status, code, message, details),
// so pages can show `err.message` in a toast and `err.details.email` under a form field.
const TOKEN_KEY = 'voltflow.token';

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null; // storage can be blocked in private windows
  }
};
export const setToken = (token) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* ignore */
  }
};
export const clearToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
};

export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details ?? {};
  }
}

async function request(method, path, body) {
  const token = getToken();
  let response;
  try {
    response = await fetch(`/api${path}`, {
      method,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', 'Cannot reach the server. Check that it is running and try again.');
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    /* empty or non-JSON body */
  }

  if (!response.ok) {
    const error = data?.error ?? {};
    // A rejected token means the session ended: tell the AuthContext to sign the user out.
    if (response.status === 401 && token && ['TOKEN_INVALID', 'UNAUTHENTICATED'].includes(error.code)) {
      clearToken();
      window.dispatchEvent(new Event('voltflow:unauthorized'));
    }
    throw new ApiError(response.status, error.code ?? 'UNKNOWN_ERROR', error.message ?? 'Something went wrong. Please try again.', error.details);
  }
  return data;
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body = {}) => request('POST', path, body),
  put: (path, body = {}) => request('PUT', path, body),
  patch: (path, body = {}) => request('PATCH', path, body),
  delete: (path) => request('DELETE', path),
};

/** Build a query string, skipping empty values: qs({ q: 'hub', city: '' }) -> '?q=hub' */
export function qs(params) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') search.set(key, value);
  }
  const text = search.toString();
  return text ? `?${text}` : '';
}
