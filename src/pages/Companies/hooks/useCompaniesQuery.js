import { useQuery } from '@tanstack/react-query';

import { getCompanies } from '../../../services/companyService.js';
import { queryKeys } from '../../../services/queryKeys.js';

export function useCompaniesQuery(params = {}) {
  return useQuery({
    queryKey: queryKeys.companies.list(params),
    queryFn: () => getCompanies(params),
    placeholderData: (previousData) => previousData,
  });
}
