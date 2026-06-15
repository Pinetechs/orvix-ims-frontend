import React from 'react';
import { Alert, Box, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth.js';
import ServerTablePage from '../Placeholder/ServerTablePage.jsx';
import { getInventoryTasks } from '../../services/inventoryTaskService.js';

function InventoryTasks() {
  const { t } = useTranslation();
  const auth = useAuth();
  const query = useQuery({ queryKey: ['inventory-tasks'], queryFn: getInventoryTasks });

  if (!auth.hasPermission(['VEHICLE_TASK_VIEW', 'ASSET_TASK_VIEW', 'SPARE_PART_TASK_VIEW'])) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {t('permissions.noInventoryTaskViewPermission')}
        </Alert>
        <Typography>{t('permissions.contactAdmin')}</Typography>
      </Box>
    );
  }

  return <ServerTablePage title="Inventory Tasks" description="Create, track and review vehicle, asset and spare parts inventory tasks." query={query} />;
}

export default InventoryTasks;
