import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '../../../services/queryKeys.js';
import { resetUserPassword } from '../../../services/userService.js';

export function useResetUserPasswordMutation({ onSuccess } = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resetUserPassword,
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      onSuccess?.(...args);
    },
  });
}
