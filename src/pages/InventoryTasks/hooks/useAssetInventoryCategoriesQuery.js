import { useQuery } from '@tanstack/react-query';

import { getAssetInventoryCategories } from '../../../services/assetInventoryService.js';
import { queryKeys } from '../../../services/queryKeys.js';

export function useAssetInventoryCategoriesQuery({ taskId, enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.assetInventory.assetCategories(taskId),
    queryFn: () => getAssetInventoryCategories({ taskId }),
    enabled: Boolean(taskId) && enabled,
    staleTime: 60 * 1000,
  });
}
