import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateCompany } from '../../../services/companyService.js';
import { queryKeys } from '../../../services/queryKeys.js';

export function useUpdateCompanyMutation({ onSuccess } = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCompany,
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.companies.all });
      onSuccess?.(...args);
    },
  });
}
