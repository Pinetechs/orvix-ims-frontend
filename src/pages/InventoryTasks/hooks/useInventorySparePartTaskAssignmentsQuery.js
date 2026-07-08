import { useQuery } from '@tanstack/react-query';

import { getInventorySparePartTaskAssignments } from '../../../services/sparePartInventoryService.js';
import { queryKeys } from '../../../services/queryKeys.js';

export const useInventorySparePartTaskAssignmentsQuery = ({ taskId, enabled = true }) => {
  return useQuery({
    queryKey: queryKeys.sparePartInventory.assignments(taskId),
    queryFn: () => getInventorySparePartTaskAssignments(taskId),
    enabled: Boolean(taskId) && enabled,
    staleTime: 15 * 1000,
  });
};
