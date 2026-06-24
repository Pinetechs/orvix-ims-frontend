import { useMutation } from '@tanstack/react-query';

import { logoutRequest } from '../services/authService.js';

export function useLogoutMutation(options = {}) {
  return useMutation({
    mutationFn: logoutRequest,
    ...options,
  });
}
