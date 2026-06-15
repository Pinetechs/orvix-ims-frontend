import { useQuery } from '@tanstack/react-query';

import { getUsers } from '../../../services/userService.js';

export function useUsersQuery({page, pageSize,search,userType,accessChannel, status,}) {
  return useQuery({
    queryKey: ['users', 'list', {
      page,
      pageSize,
      search,
      userType,
      accessChannel,
      status,
    }],
    queryFn: () =>
      getUsers({
        page,
        size: pageSize,
        search,
        userType,
        accessChannel,
        status,
        sort: 'createdAt,desc',
      }),
    placeholderData: (previousData) => previousData,
  });
}