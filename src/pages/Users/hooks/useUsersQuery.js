import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '../../../services/queryKeys.js';
import { getUsers } from '../../../services/userService.js';

export function useUsersQuery({
  page,
  pageSize,
  search,
  userType,
  accessChannel,
  status,
  inventoryDomains,
  sortBy,
  sortOrder,
}) {
  const params = {
    page,
    size: pageSize,
    search,
    userType,
    accessChannel,
    status,
    inventoryDomains,
    sortBy,
    sortOrder,
  };

  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: () => getUsers(params),
    placeholderData: (previousData) => previousData,
  });
}
