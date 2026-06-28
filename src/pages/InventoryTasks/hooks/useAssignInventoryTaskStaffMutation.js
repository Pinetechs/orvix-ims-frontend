import { useMutation } from '@tanstack/react-query';

import { assignInventoryTaskStaff } from '../../../services/inventoryTaskService.js';
import { queryClient } from '../../../services/queryClient.js';
import { queryKeys } from '../../../services/queryKeys.js';

export function useAssignInventoryTaskStaffMutation({ onSuccess } = {}) {
  return useMutation({
    mutationFn: assignInventoryTaskStaff,
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.inventoryTasks.all });
      if (onSuccess) onSuccess(...args);
    },
  });
}
