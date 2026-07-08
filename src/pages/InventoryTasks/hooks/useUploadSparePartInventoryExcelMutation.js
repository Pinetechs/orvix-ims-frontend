import { useMutation } from '@tanstack/react-query';

import { uploadSparePartInventoryExcel } from '../../../services/sparePartInventoryService.js';
import { queryClient } from '../../../services/queryClient.js';
import { queryKeys } from '../../../services/queryKeys.js';

export function useUploadSparePartInventoryExcelMutation({ onSuccess } = {}) {
  return useMutation({
    mutationFn: uploadSparePartInventoryExcel,
    onSuccess: async (response, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.inventoryTasks.all });
      if (variables?.taskId) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.sparePartInventory.sparePartItemsAll(variables.taskId),
          exact: false,
        });
        await queryClient.invalidateQueries({
          queryKey: queryKeys.sparePartInventory.sparePartBranches(variables.taskId),
        });
        await queryClient.invalidateQueries({
          queryKey: queryKeys.sparePartInventory.sparePartBrands(variables.taskId),
        });
      }
      if (onSuccess) onSuccess(response, variables, context);
    },
  });
}
