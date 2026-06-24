import { useQuery } from '@tanstack/react-query';

import { getInventoryTasks } from '../../../services/inventoryTaskService.js';
import { queryKeys } from '../../../services/queryKeys.js';

export function useInventoryTasksQuery(params = {}) {
  return useQuery({
    queryKey: queryKeys.inventoryTasks.list(params),
    queryFn: () => getInventoryTasks(params),
    placeholderData: (previousData) => previousData,
  });
}
