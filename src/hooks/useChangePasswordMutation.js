import { useMutation } from '@tanstack/react-query';

import { changePasswordRequest } from '../services/authService.js';

export function useChangePasswordMutation(options = {}) {
  return useMutation({
    mutationFn: changePasswordRequest,
    ...options,
  });
}
