import { useMutation } from '@tanstack/react-query';

import {
  markInventoryTaskReadyToStart,
  startInventoryTask,
} from '../../../services/inventoryTaskService.js';
import { queryClient } from '../../../services/queryClient.js';
import { queryKeys } from '../../../services/queryKeys.js';

export function useMarkInventoryTaskReadyMutation({ onSuccess } = {}) {
  return useMutation({
    mutationFn: markInventoryTaskReadyToStart,
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.inventoryTasks.all });
      if (onSuccess) onSuccess(...args);
    },
  });
}

export function useStartInventoryTaskMutation({ onSuccess } = {}) {
  return useMutation({
    mutationFn: startInventoryTask,
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.inventoryTasks.all });
      if (onSuccess) onSuccess(...args);
    },
  });
}
