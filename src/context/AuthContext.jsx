import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { clearSessionCache } from '../services/sessionCache.js';
import { setUnauthorizedHandler } from '../services/authEvents.js';
import { storageKeys } from '../util/constant.js';
import { useLoginMutation } from '../hooks/useLoginMutation.js';
import { useLogoutMutation } from '../hooks/useLogoutMutation.js';

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
  const [error, setError] = useState('');

  const persistUser = useCallback((data) => {
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
  }, []);

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

  const loginMutation = useLoginMutation({
    onMutate: () => {
      setError('');
    },
    onSuccess: (data) => {
      persistUser(data);
    },
    onError: (err) => {
      setError(err?.message || 'Login failed');
    },
  });

  const logoutMutation = useLogoutMutation({
    onSettled: async () => {
      await clearAuth();
    },
  });

  const login = useCallback(async ({ username, password }) => {
    setError('');
    return loginMutation.mutateAsync({ username, password });
  }, [loginMutation]);

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (err) {
      await clearAuth();
    }
  }, [clearAuth, logoutMutation]);

  const resetAuthError = useCallback(() => setError(''), []);
  const loading = loginMutation.isPending || logoutMutation.isPending;

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
    [error, loading, login, logout, resetAuthError, userInfo],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
