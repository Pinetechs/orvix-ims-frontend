import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '../../../services/queryKeys.js';
import { getInventoryVehicleTaskAssignments } from '../../../services/vehicleInventoryService.js';

export const useInventoryVehicleTaskAssignmentsQuery = ({ taskId, enabled = true }) => {
  return useQuery({
    queryKey: queryKeys.vehicleInventory.assignments(taskId),
    queryFn: () => getInventoryVehicleTaskAssignments(taskId),
    enabled: Boolean(taskId) && enabled,
    staleTime: 15 * 1000,
  });
};
