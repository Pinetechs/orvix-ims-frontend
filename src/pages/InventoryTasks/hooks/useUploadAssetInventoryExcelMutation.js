import { useMutation } from '@tanstack/react-query';

import { uploadAssetInventoryExcel } from '../../../services/assetInventoryService.js';
import { queryClient } from '../../../services/queryClient.js';
import { queryKeys } from '../../../services/queryKeys.js';

export function useUploadAssetInventoryExcelMutation({ onSuccess } = {}) {
  return useMutation({
    mutationFn: uploadAssetInventoryExcel,
    onSuccess: async (response, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.inventoryTasks.all });
      if (variables?.taskId) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.assetInventory.assetItemsAll(variables.taskId),
          exact: false,
        });
        await queryClient.invalidateQueries({
          queryKey: queryKeys.assetInventory.assetLocations(variables.taskId),
        });
        await queryClient.invalidateQueries({
          queryKey: queryKeys.assetInventory.assetCategories(variables.taskId),
        });
      }
      if (onSuccess) onSuccess(response, variables, context);
    },
  });
}
