import React from 'react';
import { useQuery } from '@tanstack/react-query';
import ServerTablePage from '../Placeholder/ServerTablePage.jsx';
import { getUsers } from '../../services/userService.js';

function Users() {
  const query = useQuery({ queryKey: ['users'], queryFn: getUsers });
  return <ServerTablePage title="Users" description="Manage system admins, company admins, supervisors and inventory staff." query={query} />;
}

export default Users;
