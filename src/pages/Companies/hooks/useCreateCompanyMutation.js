import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createCompany } from '../../../services/companyService.js';
import { queryKeys } from '../../../services/queryKeys.js';

export function useCreateCompanyMutation({ onSuccess } = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCompany,
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.companies.all });
      onSuccess?.(...args);
    },
  });
}
