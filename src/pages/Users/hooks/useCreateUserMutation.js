import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '../../../services/queryKeys.js';
import { createUser } from '../../../services/userService.js';

export function useCreateUserMutation({ onSuccess } = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      onSuccess?.(...args);
    },
  });
}
