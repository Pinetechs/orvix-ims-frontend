import { useQuery } from '@tanstack/react-query';

import { getSparePartInventoryBranches } from '../../../services/sparePartInventoryService.js';
import { queryKeys } from '../../../services/queryKeys.js';

export function useSparePartInventoryBranchesQuery({ taskId, enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.sparePartInventory.sparePartBranches(taskId),
    queryFn: () => getSparePartInventoryBranches({ taskId }),
    enabled: Boolean(taskId) && enabled,
    staleTime: 60 * 1000,
  });
}
