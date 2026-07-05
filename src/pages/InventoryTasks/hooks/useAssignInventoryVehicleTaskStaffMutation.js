import { useMutation } from '@tanstack/react-query';

import { queryClient } from '../../../services/queryClient.js';
import { queryKeys } from '../../../services/queryKeys.js';
import { assignInventoryVehicleTaskStaff } from '../../../services/vehicleInventoryService.js';

export function useAssignInventoryVehicleTaskStaffMutation({ onSuccess } = {}) {
  return useMutation({
    mutationFn: assignInventoryVehicleTaskStaff,
    onSuccess: async (response, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.vehicleInventory.all });
      if (variables?.taskId) {
       // await queryClient.invalidateQueries({ queryKey: queryKeys.inventoryTasks.details(variables.taskId) });
        await queryClient.invalidateQueries({ queryKey: queryKeys.vehicleInventory.vehicleLocations(variables.taskId) });
        await queryClient.invalidateQueries({ queryKey: queryKeys.vehicleInventory.assignments(variables.taskId) });
      }
      if (onSuccess) onSuccess(response, variables, context);
    },
  });
}
