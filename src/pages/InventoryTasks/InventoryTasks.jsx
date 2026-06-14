import React from 'react';
import { useQuery } from '@tanstack/react-query';
import ServerTablePage from '../Placeholder/ServerTablePage.jsx';
import { getInventoryTasks } from '../../services/inventoryTaskService.js';

function InventoryTasks() {
  const query = useQuery({ queryKey: ['inventory-tasks'], queryFn: getInventoryTasks });
  return <ServerTablePage title="Inventory Tasks" description="Create, track and review vehicle, asset and spare parts inventory tasks." query={query} />;
}

export default InventoryTasks;
