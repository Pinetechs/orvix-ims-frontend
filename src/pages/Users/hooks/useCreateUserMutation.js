import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createUser } from '../../../services/userService.js';

export function useCreateUserMutation({ onSuccess } = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      onSuccess?.(...args);
    },
  });
}