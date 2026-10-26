// Who is signed in. OWNER: PM (login/register screens belong to Melike).
// `useAuth()` gives any component: user, loading, login(), register(), logout(), setUser().
// The token lives in localStorage so a page refresh keeps the session; the server still checks it
// on every request, so tampering with localStorage cannot grant access.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, clearToken, getToken, setToken } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(getToken())); // only wait when a token exists

  // Restore the session after a page refresh.
  useEffect(() => {
    if (!getToken()) return;
    let active = true;
    api
      .get('/auth/me')
      .then((data) => active && setUser(data.user))
      .catch(() => clearToken())
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  // api.js fires this event when the server rejects the token (expired or tampered).
  useEffect(() => {
    window.addEventListener('voltflow:unauthorized', logout);
    return () => window.removeEventListener('voltflow:unauthorized', logout);
  }, [logout]);

  const startSession = useCallback((data) => {
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const login = useCallback(async (email, password) => startSession(await api.post('/auth/login', { email, password })), [startSession]);
  const register = useCallback(async (payload) => startSession(await api.post('/auth/register', payload)), [startSession]);

  const value = useMemo(() => ({ user, loading, login, register, logout, setUser }), [user, loading, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>.');
  return context;
}
