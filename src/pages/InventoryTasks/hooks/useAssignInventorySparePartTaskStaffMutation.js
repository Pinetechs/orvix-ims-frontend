import { useMutation } from '@tanstack/react-query';

import { queryClient } from '../../../services/queryClient.js';
import { queryKeys } from '../../../services/queryKeys.js';
import { assignInventorySparePartTaskStaff } from '../../../services/sparePartInventoryService.js';

export function useAssignInventorySparePartTaskStaffMutation({ onSuccess } = {}) {
  return useMutation({
    mutationFn: assignInventorySparePartTaskStaff,
    onSuccess: async (response, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.sparePartInventory.all });
      if (variables?.taskId) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.sparePartInventory.sparePartBranches(variables.taskId) });
        await queryClient.invalidateQueries({ queryKey: queryKeys.sparePartInventory.assignments(variables.taskId) });
      }
      if (onSuccess) onSuccess(response, variables, context);
    },
  });
}
