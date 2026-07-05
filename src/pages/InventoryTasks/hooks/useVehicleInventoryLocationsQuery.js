import { useQuery } from '@tanstack/react-query';

import { getVehicleInventoryLocations } from '../../../services/vehicleInventoryService.js';
import { queryKeys } from '../../../services/queryKeys.js';

export function useVehicleInventoryLocationsQuery({ taskId, enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.vehicleInventory.vehicleLocations(taskId),
    queryFn: () => getVehicleInventoryLocations({ taskId }),
    enabled: Boolean(taskId) && enabled,
    staleTime: 60 * 1000,
  });
}
