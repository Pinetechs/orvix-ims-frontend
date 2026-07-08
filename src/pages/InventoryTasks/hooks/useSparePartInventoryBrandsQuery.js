import { useQuery } from '@tanstack/react-query';

import { getSparePartInventoryBrands } from '../../../services/sparePartInventoryService.js';
import { queryKeys } from '../../../services/queryKeys.js';

export function useSparePartInventoryBrandsQuery({ taskId, enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.sparePartInventory.sparePartBrands(taskId),
    queryFn: () => getSparePartInventoryBrands({ taskId }),
    enabled: Boolean(taskId) && enabled,
    staleTime: 60 * 1000,
  });
}
