import React, { useMemo, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Divider, Stack, Typography, useMediaQuery } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';

import { useAuth } from '../../hooks/useAuth.js';
import { useInventoryTasksQuery } from './hooks/useInventoryTasksQuery.js';
import SearchInventoryTaskCard from './components/SearchInventoryTaskCard.jsx';
import InventoryTaskMetrics from './components/InventoryTaskMetrics.jsx';
import CreateInventoryTaskDialog from './CreateInventoryTaskDialog.jsx';
import { createInventoryTaskTableColumns } from './utils/inventoryTaskTableColumns.jsx';
import { getTotalElements, normalizeRows } from './utils/inventoryTaskMappers.js';

const VIEW_PERMISSIONS = ['VEHICLE_TASK_VIEW', 'ASSET_TASK_VIEW', 'SPARE_PART_TASK_VIEW'];
const CREATE_PERMISSIONS = ['VEHICLE_TASK_CREATE', 'ASSET_TASK_CREATE', 'SPARE_PART_TASK_CREATE'];

const GRID_TO_API_SORT_FIELDS = {
  task: 'taskNumber',
  company: 'company',
};

const API_TO_GRID_SORT_FIELDS = Object.entries(GRID_TO_API_SORT_FIELDS).reduce(
  (fields, [gridField, apiField]) => ({
    ...fields,
    [apiField]: gridField,
  }),
  {},
);

function InventoryTasks() {
  const { t } = useTranslation();
  const auth = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [searchParams, setSearchParams] = useSearchParams();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const page = Number(searchParams.get('page') || 0);
  const pageSize = Number(searchParams.get('size') || 10);
  const search = searchParams.get('search') || '';
  const inventoryDomain = searchParams.get('inventoryDomain') || 'ALL';
  const status = searchParams.get('status') || 'ALL';
  const sortBy = searchParams.get('sortBy') || 'id';
  const sortOrder = searchParams.get('sortOrder') || 'desc';

  const sortModel = useMemo(() => {
    if (sortBy === 'id') {
      return [];
    }

    return [{ field: API_TO_GRID_SORT_FIELDS[sortBy] || sortBy, sort: sortOrder === 'asc' ? 'asc' : 'desc' }];
  }, [sortBy, sortOrder]);

  const inventoryTasksQuery = useInventoryTasksQuery({
    page,
    size: pageSize,
    search,
    inventoryDomain,
    status,
    sortBy,
    sortOrder,
  });

  const rows = useMemo(() => {
    return normalizeRows(inventoryTasksQuery.data).map((row, index) => ({
      id: row.id ?? row.taskId ?? row.taskNumber ?? index + 1,
      ...row,
    }));
  }, [inventoryTasksQuery.data]);

  const columns = useMemo(() => {
    const allColumns = createInventoryTaskTableColumns({ isMobile });

    if (!isMobile) {
      return allColumns;
    }

    return allColumns.filter((column) => ['task', 'status', 'progress'].includes(column.field));
  }, [isMobile]);

  const updatePaginationParams = (model) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(model.page));
    next.set('size', String(model.pageSize));

    setSearchParams(next, { replace: true });
  };

  const updateSortParams = (model) => {
    const next = new URLSearchParams(searchParams);
    const [sort] = model;

    if (!sort?.field || !sort?.sort) {
      next.set('sortBy', 'id');
      next.set('sortOrder', 'desc');
    } else {
      next.set('sortBy', GRID_TO_API_SORT_FIELDS[sort.field] || sort.field);
      next.set('sortOrder', sort.sort);
    }

    next.set('page', '0');
    setSearchParams(next, { replace: true });
  };

  const handleCloseCreateDialog = (shouldRefresh = false) => {
    setCreateDialogOpen(false);
    if (shouldRefresh) {
      inventoryTasksQuery.refetch();
    }
  };

  if (!auth.hasPermission(VIEW_PERMISSIONS)) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {t('permissions.noInventoryTaskViewPermission')}
        </Alert>
        <Typography>{t('permissions.contactAdmin')}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', minWidth: 0, overflow: 'hidden' }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'stretch', md: 'center' }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: { xs: 2, md: 3 }, minWidth: 0 }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 950,
              letterSpacing: 0,
              mb: 0.6,
              fontSize: { xs: '1.85rem', sm: '2.125rem' },
              lineHeight: 1.15,
            }}
          >
            Inventory Tasks
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              maxWidth: 760,
              overflowWrap: 'anywhere',
              lineHeight: 1.55,
            }}
          >
            Create draft inventory tasks, upload Excel files, assign inventory staff and track execution progress.
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={1.2}
          sx={{
            minWidth: 0,
            '& > .MuiButton-root': {
              flex: { xs: 1, sm: '0 0 auto' },
            },
          }}
        >
          <Button
            variant="outlined"
            startIcon={<RefreshRoundedIcon />}
            onClick={() => inventoryTasksQuery.refetch()}
            disabled={inventoryTasksQuery.isFetching}
            sx={{ minWidth: 0 }}
          >
            Refresh
          </Button>

          {auth.hasPermission(CREATE_PERMISSIONS) && (
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={() => setCreateDialogOpen(true)}
              sx={{ minWidth: 0 }}
            >
              Create Task
            </Button>
          )}
        </Stack>
      </Stack>

      <InventoryTaskMetrics rows={rows} />

      {inventoryTasksQuery.isError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {inventoryTasksQuery.error?.message || 'Unknown error'}
        </Alert>
      )}

      <Card
        elevation={0}
        sx={(muiTheme) => ({
          borderRadius: 4,
          border: `1px solid ${alpha(muiTheme.palette.primary.main, 0.1)}`,
          boxShadow: `0 18px 45px ${alpha(muiTheme.palette.common.black, 0.06)}`,
          overflow: 'hidden',
          maxWidth: '100%',
        })}
      >
        <CardContent sx={{ p: 0 }}>
          <SearchInventoryTaskCard />

          <Divider />

          <Box sx={{ width: '100%', maxWidth: '100%', overflowX: 'auto' }}>
            <DataGrid
              autoHeight
              density={isMobile ? 'compact' : 'standard'}
              rows={rows}
              columns={columns}
              loading={inventoryTasksQuery.isLoading || inventoryTasksQuery.isFetching}
              disableRowSelectionOnClick
              paginationMode="server"
              sortingMode="server"
              rowCount={getTotalElements(inventoryTasksQuery.data)}
              pageSizeOptions={[10, 25, 50, 100]}
              paginationModel={{
                page,
                pageSize,
              }}
              onPaginationModelChange={updatePaginationParams}
              sortModel={sortModel}
              onSortModelChange={updateSortParams}
              sx={{
                minHeight: 440,
                width: '100%',
                minWidth: isMobile ? 0 : 900,
                border: 0,
                '& .MuiDataGrid-main': {
                  minWidth: 0,
                },
                '& .MuiDataGrid-virtualScroller': {
                  overflowX: 'auto',
                },
                '& .MuiDataGrid-columnHeaders': {
                  fontWeight: 900,
                },
                '& .MuiDataGrid-cell': {
                  display: 'flex',
                  alignItems: 'center',
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>

      <CreateInventoryTaskDialog
        open={createDialogOpen}
        onClose={handleCloseCreateDialog}
      />
    </Box>
  );
}

export default InventoryTasks;
