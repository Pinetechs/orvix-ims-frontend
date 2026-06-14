import axios from 'axios';
import { apiRoute, baseUrl, storageKeys } from '../util/constant.js';

export const clearServerSession = async () => {
  try {
    await axios.get(`${baseUrl}${apiRoute.logout}`, { withCredentials: true });
  } catch (error) {
    // Expired or missing server session should not block local cleanup.
  }
};

export const clearSessionCache = async (queryClient) => {
  try {
    queryClient?.clear?.();
  } catch (error) {
    // Keep logout resilient if query cache is not available.
  }

  try {
    localStorage.removeItem(storageKeys.userInfo);
    localStorage.removeItem(storageKeys.accountType);
    Object.keys(localStorage)
      .filter((key) => key.startsWith('orvix.'))
      .forEach((key) => localStorage.removeItem(key));
    sessionStorage.clear();
  } catch (error) {
    // Storage can be unavailable in strict browser privacy modes.
  }

  try {
    if ('caches' in window) {
      const cacheNames = await window.caches.keys();
      await Promise.all(cacheNames.map((cacheName) => window.caches.delete(cacheName)));
    }
  } catch (error) {
    // Browser cache API cleanup is best-effort only.
  }
};
