import { useQuery } from '@tanstack/react-query';

import { getSparePartInventoryItems } from '../../../services/sparePartInventoryService.js';
import { queryKeys } from '../../../services/queryKeys.js';

export function useSparePartInventoryItemsQuery({ taskId, page = 0, size = 10, enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.sparePartInventory.sparePartItems(taskId, { page, size }),
    queryFn: () => getSparePartInventoryItems({ taskId, page, size }),
    enabled: Boolean(taskId) && enabled,
    placeholderData: (previousData) => previousData,
  });
}
