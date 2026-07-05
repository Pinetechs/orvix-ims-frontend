import { useQuery } from '@tanstack/react-query';

import { getAssetInventoryLocations } from '../../../services/assetInventoryService.js';
import { queryKeys } from '../../../services/queryKeys.js';

export function useAssetInventoryLocationsQuery({ taskId, enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.assetInventory.assetLocations(taskId),
    queryFn: () => getAssetInventoryLocations({ taskId }),
    enabled: Boolean(taskId) && enabled,
    staleTime: 60 * 1000,
  });
}
