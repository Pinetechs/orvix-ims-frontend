import { useQuery } from '@tanstack/react-query';

import { getEligibleInventoryStaff } from '../../../../services/inventoryTaskService.js';
import {
  getRecheckEvidence,
  getRecheckRequest,
  getRecheckRequests,
  getReviewIssue,
  getReviewIssues,
  getReviewSummary,
} from '../../../../services/reviewCenterService.js';
import { queryKeys } from '../../../../services/queryKeys.js';

const reviewQueryOptions = (enabled) => ({
  enabled: Boolean(enabled),
  staleTime: 10 * 1000,
  retry: 1,
  refetchOnWindowFocus: true,
});

export function useReviewSummaryQuery(taskId, enabled) {
  return useQuery({
    queryKey: queryKeys.reviewCenter.summary(taskId),
    queryFn: () => getReviewSummary(taskId),
    ...reviewQueryOptions(enabled && taskId),
  });
}

export function useReviewIssuesQuery(taskId, params, enabled) {
  return useQuery({
    queryKey: queryKeys.reviewCenter.issues(taskId, params),
    queryFn: () => getReviewIssues({ taskId, ...params }),
    placeholderData: (previousData) => previousData,
    ...reviewQueryOptions(enabled && taskId),
  });
}

export function useReviewIssueQuery(taskId, issueId, enabled) {
  return useQuery({
    queryKey: queryKeys.reviewCenter.issue(taskId, issueId),
    queryFn: () => getReviewIssue({ taskId, issueId }),
    ...reviewQueryOptions(enabled && taskId && issueId),
  });
}

export function useRecheckRequestsQuery(taskId, params, enabled) {
  return useQuery({
    queryKey: queryKeys.reviewCenter.rechecks(taskId, params),
    queryFn: () => getRecheckRequests({ taskId, ...params }),
    placeholderData: (previousData) => previousData,
    ...reviewQueryOptions(enabled && taskId),
  });
}

export function useRecheckRequestQuery(taskId, requestId, enabled) {
  return useQuery({
    queryKey: queryKeys.reviewCenter.recheck(taskId, requestId),
    queryFn: () => getRecheckRequest({ taskId, requestId }),
    ...reviewQueryOptions(enabled && taskId && requestId),
  });
}

export function useEligibleRecheckStaffQuery(taskId, search, enabled) {
  const params = { search, page: 0, size: 30 };
  return useQuery({
    queryKey: queryKeys.inventoryTasks.eligibleStaff(taskId, params),
    queryFn: () => getEligibleInventoryStaff({ taskId, ...params }),
    ...reviewQueryOptions(enabled && taskId),
    staleTime: 60 * 1000,
  });
}

export function useRecheckEvidenceQuery(taskId, requestId, itemId, enabled) {
  return useQuery({
    queryKey: queryKeys.reviewCenter.evidence(taskId, requestId, itemId),
    queryFn: () => getRecheckEvidence({ taskId, requestId, itemId }),
    ...reviewQueryOptions(enabled && taskId && requestId && itemId),
    staleTime: 5 * 60 * 1000,
  });
}
