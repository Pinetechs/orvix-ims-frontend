import { useQuery } from '@tanstack/react-query';

import { getAssetInventoryItems } from '../../../services/assetInventoryService.js';
import { queryKeys } from '../../../services/queryKeys.js';

export function useAssetInventoryItemsQuery({ taskId, page = 0, size = 10, enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.assetInventory.assetItems(taskId, { page, size }),
    queryFn: () => getAssetInventoryItems({ taskId, page, size }),
    enabled: Boolean(taskId) && enabled,
    placeholderData: (previousData) => previousData,
  });
}
