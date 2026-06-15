import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { loginRequest, logoutRequest } from '../services/authService.js';
import { clearSessionCache } from '../services/sessionCache.js';
import { setUnauthorizedHandler } from '../services/authEvents.js';
import { storageKeys } from '../util/constant.js';

const AuthContext = createContext(null);

const readStoredUser = () => {
  try {
    const raw = localStorage.getItem(storageKeys.userInfo);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
};

const readStoredToken = () => {
  try {
    return sessionStorage.getItem(storageKeys.authToken) || null;
  } catch (error) {
    return null;
  }
};

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [userInfo, setUserInfo] = useState(readStoredUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const persistUser = (data) => {
    const resolved = data?.data || data?.userInfo || data || {};
    const token = resolved?.token || resolved?.data?.token || resolved?.accessToken || null;

    // Prefer storing token in sessionStorage to reduce persistent exposure.
    try {
      if (token) sessionStorage.setItem(storageKeys.authToken, token);
    } catch (err) {
      // ignore storage failures
    }

    // Persist only non-sensitive user info in localStorage
    const resolvedUser = resolved.user || resolved;
    const safeUser = { ...resolvedUser };
    if (safeUser.token) delete safeUser.token;
    if (safeUser.accessToken) delete safeUser.accessToken;

    setUserInfo(safeUser);
    try {
      localStorage.setItem(storageKeys.userInfo, JSON.stringify(safeUser));
    } catch (err) {
      // ignore storage failures
    }
  };

  const clearAuth = useCallback(async () => {
    setUserInfo(null);
    setError('');
    await clearSessionCache(queryClient);
  }, [queryClient]);

  useEffect(() => {
    // Ensure token is loaded into sessionStorage if present in persisted storage (best-effort)
    const token = readStoredToken();
    if (token) {
      try {
        sessionStorage.setItem(storageKeys.authToken, token);
      } catch (err) {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(clearAuth);
    return () => setUnauthorizedHandler(null);
  }, [clearAuth]);



  
  const login = async ({ username, password }) => {
    console.log("username", username, "password", password)
    setLoading(true);
    setError('');
    try {
      const data = await loginRequest({ "username": username, "password":  password });
      persistUser(data);
      return data;
    } catch (err) {
      const message = err?.message || 'Login failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutRequest();
    } finally {
      await clearAuth();
      setLoading(false);
    }
  };

  const resetAuthError = () => setError('');

  

  const value = useMemo(
    () => ({
      userInfo,
      user: userInfo?.user || userInfo,
      client: userInfo?.client,
      loading,
      error,
      isAuthenticate: Boolean(userInfo),
      login,
      logout,
      resetAuthError,
      permissions: userInfo?.permissions || userInfo?.user?.permissions || [],
      hasPermission: (perm) => {
        const perms = userInfo?.permissions || userInfo?.user?.permissions || [];
        if (!perm) return false;
        if (Array.isArray(perm)) return perm.some((p) => perms.includes(p));
        return perms.includes(perm);
      },
      userType: userInfo?.userType || userInfo?.user?.userType || userInfo?.accountType,
    }),
    [userInfo, loading, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
