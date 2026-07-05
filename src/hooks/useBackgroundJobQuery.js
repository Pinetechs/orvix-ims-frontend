import { useQuery } from '@tanstack/react-query';

import { getBackgroundJob } from '../services/backgroundJobService.js';
import { queryKeys } from '../services/queryKeys.js';

const TERMINAL_STATUSES = ['COMPLETED', 'FAILED', 'CANCELLED', 'IMPORT_FAILED', 'IMPORT_COMPLETED'];

export function useBackgroundJobQuery(jobId, { enabled = true, intervalMs = 2000 , polling = true } = {}) {
  return useQuery({
    queryKey: queryKeys.backgroundJobs.details(jobId),
    queryFn: () => getBackgroundJob(jobId),
    enabled: Boolean(jobId) && enabled,
    refetchInterval: (query) => {
      const status = query.state?.data?.status

      if (!polling) {
        return false;
      }
    if (!status) {
        return intervalMs;
      }

      if (TERMINAL_STATUSES.includes(status)) {
        return false;
      }
  
      
      return intervalMs;
    },
    placeholderData: (previousData) => previousData,
  });
}
