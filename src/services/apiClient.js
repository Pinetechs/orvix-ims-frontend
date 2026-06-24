import axios from 'axios';
import { baseUrl } from '../util/constant.js';
import { clearServerSession, clearSessionCache } from './sessionCache.js';
import { queryClient } from './queryClient.js';
import { notifyUnauthorized } from './authEvents.js';

let isClearingSession = false;

export const apiClient = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401 && !isClearingSession) {
      isClearingSession = true;
      try {
        await clearServerSession();
        await clearSessionCache(queryClient);
        await notifyUnauthorized();
      } finally {
        isClearingSession = false;
      }
    }
    return Promise.reject(error);
  },
);

export const getErrorMessage = (error, fallback = 'Something went wrong') => {




  if (error?.response?.data?.detail && error?.response?.data?.detail?.length > 0){


    return error?.response?.data?.detail
  }

  if (error?.response?.data?.message && error?.response?.data?.errors){

    var errorMessages = error?.response?.data?.message + '\n';
    error?.response?.data?.errors.forEach((err) => {
      errorMessages += `\n${err}`;
    });
    return errorMessages;

  }

  return error?.response?.data?.message || error?.response?.data?.error || error?.message || fallback;
};

export const cleanRequestParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '' && value !== 'ALL'),
  );
