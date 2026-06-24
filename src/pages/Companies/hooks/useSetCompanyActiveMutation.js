import { useMutation, useQueryClient } from '@tanstack/react-query';

import { setCompanyActive } from '../../../services/companyService.js';
import { queryKeys } from '../../../services/queryKeys.js';

export function useSetCompanyActiveMutation({ onSuccess } = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setCompanyActive,
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.companies.all });
      onSuccess?.(...args);
    },
  });
}
