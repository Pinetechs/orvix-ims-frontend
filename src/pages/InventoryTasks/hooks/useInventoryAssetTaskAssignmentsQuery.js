import { useQuery } from '@tanstack/react-query';

import { getInventoryAssetTaskAssignments } from '../../../services/assetInventoryService.js';
import { queryKeys } from '../../../services/queryKeys.js';

export const useInventoryAssetTaskAssignmentsQuery = ({ taskId, enabled = true }) => {
  return useQuery({
    queryKey: queryKeys.assetInventory.assignments(taskId),
    queryFn: () => getInventoryAssetTaskAssignments(taskId),
    enabled: Boolean(taskId) && enabled,
    staleTime: 15 * 1000,
  });
};
