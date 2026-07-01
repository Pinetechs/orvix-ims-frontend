import { useQuery } from '@tanstack/react-query';

import { getBackgroundJob } from '../services/backgroundJobService.js';
import { queryKeys } from '../services/queryKeys.js';
import { unwrapBackgroundJobResponse, getBackgroundJobStatus } from '../services/backgroundJobUtils.js';

const TERMINAL_STATUSES = ['COMPLETED', 'FAILED', 'CANCELLED'];

export function useBackgroundJobQuery(jobId, { enabled = true, intervalMs = 2000 } = {}) {
  return useQuery({
    queryKey: queryKeys.backgroundJobs.details(jobId),
    queryFn: () => getBackgroundJob(jobId),
    enabled: Boolean(jobId) && enabled,
    refetchInterval: (query) => {
      const job = unwrapBackgroundJobResponse(query.state.data);
      const status = getBackgroundJobStatus(job);

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
