import { useMutation } from '@tanstack/react-query';

import {
  cancelRecheckRequest,
  createRecheckRequest,
  decideRecheckItem,
  decideReviewIssue,
  synchronizeReviewIssues,
} from '../../../../services/reviewCenterService.js';
import { queryClient } from '../../../../services/queryClient.js';
import { queryKeys } from '../../../../services/queryKeys.js';

const invalidateReviewTask = async (taskId) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.reviewCenter.task(taskId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.taskTracking.task(taskId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.inventoryTasks.details(taskId) }),
  ]);
};

const useReviewMutation = (mutationFn) =>
  useMutation({
    mutationFn,
    onSuccess: (_data, variables) => invalidateReviewTask(variables.taskId),
  });

export const useSynchronizeReviewMutation = () =>
  useReviewMutation(synchronizeReviewIssues);

export const useCreateRecheckMutation = () =>
  useReviewMutation(createRecheckRequest);

export const useDecideReviewIssueMutation = () =>
  useReviewMutation(decideReviewIssue);

export const useCancelRecheckMutation = () =>
  useReviewMutation(cancelRecheckRequest);

export const useDecideRecheckItemMutation = () =>
  useReviewMutation(decideRecheckItem);
