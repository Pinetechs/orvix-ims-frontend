import { useQuery } from '@tanstack/react-query';

import { getDashboardOverview } from '../../../services/dashboardService.js';
import { queryKeys } from '../../../services/queryKeys.js';

export function useDashboardOverviewQuery() {
  return useQuery({
    queryKey: queryKeys.dashboard.overview,
    queryFn: getDashboardOverview,
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    retry: 1,
  });
}
