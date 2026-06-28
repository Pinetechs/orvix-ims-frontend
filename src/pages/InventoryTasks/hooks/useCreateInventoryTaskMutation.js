import { useMutation } from '@tanstack/react-query';

import { createInventoryTask } from '../../../services/inventoryTaskService.js';
import { queryClient } from '../../../services/queryClient.js';
import { queryKeys } from '../../../services/queryKeys.js';

export function useCreateInventoryTaskMutation({ onSuccess } = {}) {
  return useMutation({
    mutationFn: createInventoryTask,
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.inventoryTasks.all });
      if (onSuccess) onSuccess(...args);
    },
  });
}
