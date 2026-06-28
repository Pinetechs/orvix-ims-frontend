import { useQuery } from '@tanstack/react-query';

import { getVehicleInventoryItems } from '../../../services/inventoryTaskService.js';
import { queryKeys } from '../../../services/queryKeys.js';

export function useVehicleInventoryItemsQuery({ taskId, page = 0, size = 10, enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.inventoryTasks.vehicleItems(taskId, { page, size }),
    queryFn: () => getVehicleInventoryItems({ taskId, page, size }),
    enabled: Boolean(taskId) && enabled,
    placeholderData: (previousData) => previousData,
  });
}
