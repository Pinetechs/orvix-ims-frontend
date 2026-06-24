import { useMutation } from '@tanstack/react-query';

import { loginRequest } from '../services/authService.js';

export function useLoginMutation(options = {}) {
  return useMutation({
    mutationFn: loginRequest,
    ...options,
  });
}
