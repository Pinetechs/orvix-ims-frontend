import { useQuery } from '@tanstack/react-query';

import {
  getTrackingAreas,
  getTrackingAttention,
  getTrackingOverview,
  getTrackingResults,
  getTrackingScanEvents,
  getTrackingTeam,
  getTrackingTimeline,
} from '../../../services/taskTrackingService.js';
import { queryKeys } from '../../../services/queryKeys.js';

const ACTIVE_REFRESH_MS = 15 * 1000;
const TERMINAL_STATUSES = new Set(['COMPLETED', 'CANCELLED']);

const isPageVisible = () => typeof document === 'undefined' || document.visibilityState === 'visible';

export const trackingRefreshInterval = (query) => {
  const overview = query?.state?.data || query;
  if (!isPageVisible() || TERMINAL_STATUSES.has(overview?.status)) return false;
  return ACTIVE_REFRESH_MS;
};

const detailQueryOptions = (enabled, shouldPoll = true) => ({
  enabled: Boolean(enabled),
  staleTime: 10 * 1000,
  refetchInterval: enabled && shouldPoll && isPageVisible() ? ACTIVE_REFRESH_MS : false,
  refetchIntervalInBackground: false,
  refetchOnWindowFocus: true,
  retry: 1,
});

export function useTrackingOverviewQuery(taskId) {
  return useQuery({
    queryKey: queryKeys.taskTracking.overview(taskId),
    queryFn: () => getTrackingOverview(taskId),
    enabled: Boolean(taskId),
    staleTime: 8 * 1000,
    refetchInterval: trackingRefreshInterval,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    retry: 1,
  });
}

export function useTrackingAreasQuery(taskId, enabled, shouldPoll = true) {
  return useQuery({
    queryKey: queryKeys.taskTracking.areas(taskId),
    queryFn: () => getTrackingAreas(taskId),
    ...detailQueryOptions(enabled && taskId, shouldPoll),
  });
}

export function useTrackingTeamQuery(taskId, enabled, shouldPoll = true) {
  return useQuery({
    queryKey: queryKeys.taskTracking.team(taskId),
    queryFn: () => getTrackingTeam(taskId),
    ...detailQueryOptions(enabled && taskId, shouldPoll),
  });
}

export function useTrackingAttentionQuery(taskId, enabled, shouldPoll = true) {
  return useQuery({
    queryKey: queryKeys.taskTracking.attention(taskId),
    queryFn: () => getTrackingAttention(taskId),
    ...detailQueryOptions(enabled && taskId, shouldPoll),
  });
}

export function useTrackingResultsQuery(taskId, params, enabled, shouldPoll = true) {
  return useQuery({
    queryKey: queryKeys.taskTracking.results(taskId, params),
    queryFn: () => getTrackingResults({ taskId, ...params }),
    placeholderData: (previousData) => previousData,
    ...detailQueryOptions(enabled && taskId, shouldPoll),
  });
}

export function useTrackingScanEventsQuery(taskId, params, enabled, shouldPoll = true) {
  return useQuery({
    queryKey: queryKeys.taskTracking.scanEvents(taskId, params),
    queryFn: () => getTrackingScanEvents({ taskId, ...params }),
    placeholderData: (previousData) => previousData,
    ...detailQueryOptions(enabled && taskId, shouldPoll),
  });
}

export function useTrackingTimelineQuery(taskId, params, enabled, shouldPoll = true) {
  return useQuery({
    queryKey: queryKeys.taskTracking.timeline(taskId, params),
    queryFn: () => getTrackingTimeline({ taskId, ...params }),
    placeholderData: (previousData) => previousData,
    ...detailQueryOptions(enabled && taskId, shouldPoll),
  });
}
