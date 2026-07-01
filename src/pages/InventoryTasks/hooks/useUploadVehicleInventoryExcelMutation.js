import { useMutation } from '@tanstack/react-query';

import { uploadVehicleInventoryExcel } from '../../../services/vehicleInventoryService.js';
import { queryClient } from '../../../services/queryClient.js';
import { queryKeys } from '../../../services/queryKeys.js';

export function useUploadVehicleInventoryExcelMutation({ onSuccess } = {}) {
  return useMutation({
    mutationFn: uploadVehicleInventoryExcel,
    onSuccess: async (response, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.inventoryTasks.all });
      if (variables?.taskId) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.inventoryTasks.vehicleItemsAll(variables.taskId),
          exact: false,
        });
      }
      if (onSuccess) onSuccess(response, variables, context);
    },
  });
}
