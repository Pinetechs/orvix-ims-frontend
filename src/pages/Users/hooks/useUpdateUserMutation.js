import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '../../../services/queryKeys.js';
import { updateUser } from '../../../services/userService.js';

export function useUpdateUserMutation({ onSuccess } = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      onSuccess?.(...args);
    },
  });
}
