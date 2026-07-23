import { useMutation } from '@tanstack/react-query';

import {
  cancelInventoryTask,
  completeInventoryTask,
  markInventoryTaskReady,
  pauseInventoryTask,
  resumeInventoryTask,
  returnInventoryTaskToProgress,
  startInventoryTask,
  submitInventoryTaskForReview,
} from '../../../services/inventoryTaskService.js';
import { queryClient } from '../../../services/queryClient.js';
import { queryKeys } from '../../../services/queryKeys.js';

const actionFunctions = {
  markReady: markInventoryTaskReady,
  start: startInventoryTask,
  pause: pauseInventoryTask,
  resume: resumeInventoryTask,
  submitForReview: submitInventoryTaskForReview,
  returnToProgress: returnInventoryTaskToProgress,
  complete: completeInventoryTask,
  cancel: cancelInventoryTask,
};

export function useTaskTrackingActionMutation() {
  return useMutation({
    mutationFn: ({ action, ...variables }) => {
      const mutation = actionFunctions[action];
      if (!mutation) throw new Error(`Unsupported task action: ${action}`);
      return mutation(variables);
    },
    onSuccess: async (_data, variables) => {
      const taskId = variables?.taskId;
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.taskTracking.task(taskId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.reviewCenter.task(taskId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.inventoryTasks.all }),
      ]);
    },
  });
}
