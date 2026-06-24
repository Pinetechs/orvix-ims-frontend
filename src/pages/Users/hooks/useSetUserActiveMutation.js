import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '../../../services/queryKeys.js';
import { setUserActive } from '../../../services/userService.js';

export function useSetUserActiveMutation({ onSuccess } = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setUserActive,
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      onSuccess?.(...args);
    },
  });
}
