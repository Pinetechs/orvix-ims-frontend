import { useMutation } from '@tanstack/react-query';

import { queryClient } from '../../../services/queryClient.js';
import { queryKeys } from '../../../services/queryKeys.js';
import { assignInventoryAssetTaskStaff } from '../../../services/assetInventoryService.js';

export function useAssignInventoryAssetTaskStaffMutation({ onSuccess } = {}) {
  return useMutation({
    mutationFn: assignInventoryAssetTaskStaff,
    onSuccess: async (response, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.assetInventory.all });
      if (variables?.taskId) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.assetInventory.assetLocations(variables.taskId) });
        await queryClient.invalidateQueries({ queryKey: queryKeys.assetInventory.assignments(variables.taskId) });
      }
      if (onSuccess) onSuccess(response, variables, context);
    },
  });
}
