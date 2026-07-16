import { useMutation } from '@tanstack/react-query';

import {
  cancelInventoryTask,
  deleteInventoryTask,
  pauseInventoryTask,
  resumeInventoryTask,
  updateInventoryTaskScanSettings,
} from '../../../services/inventoryTaskService.js';
import { queryClient } from '../../../services/queryClient.js';
import { queryKeys } from '../../../services/queryKeys.js';

const withTaskInvalidation = (mutationFn, onSuccess) => ({
  mutationFn,
  onSuccess: async (data, variables, context) => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.inventoryTasks.all });
    if (variables?.taskId) {
      await queryClient.invalidateQueries({ queryKey: queryKeys.inventoryTasks.details(variables.taskId) });
    }
    onSuccess?.(data, variables, context);
  },
});

export const useUpdateInventoryTaskScanSettingsMutation = (options = {}) =>
  useMutation(withTaskInvalidation(updateInventoryTaskScanSettings, options.onSuccess));

export const usePauseInventoryTaskMutation = (options = {}) =>
  useMutation(withTaskInvalidation(pauseInventoryTask, options.onSuccess));

export const useResumeInventoryTaskMutation = (options = {}) =>
  useMutation(withTaskInvalidation(resumeInventoryTask, options.onSuccess));

export const useCancelInventoryTaskMutation = (options = {}) =>
  useMutation(withTaskInvalidation(cancelInventoryTask, options.onSuccess));

export const useDeleteInventoryTaskMutation = (options = {}) =>
  useMutation(withTaskInvalidation(deleteInventoryTask, options.onSuccess));
