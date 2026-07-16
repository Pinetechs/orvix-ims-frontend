import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Divider, Stack, Typography, useMediaQuery } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';

import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { useInventoryTasksQuery } from './hooks/useInventoryTasksQuery.js';
import SearchInventoryTaskCard from './components/SearchInventoryTaskCard.jsx';
import InventoryTaskMetrics from './components/InventoryTaskMetrics.jsx';
import CreateInventoryTaskDialog from './CreateInventoryTaskDialog.jsx';
import InventoryTaskScanSettingsDialog from './components/InventoryTaskScanSettingsDialog.jsx';
import InventoryTaskReasonDialog from './components/InventoryTaskReasonDialog.jsx';
import InventoryTaskDeleteDialog from './components/InventoryTaskDeleteDialog.jsx';
import {
  useCancelInventoryTaskMutation,
  useDeleteInventoryTaskMutation,
  usePauseInventoryTaskMutation,
  useResumeInventoryTaskMutation,
  useUpdateInventoryTaskScanSettingsMutation,
} from './hooks/useInventoryTaskManagementMutations.js';
import { createInventoryTaskTableColumns, isInventoryTaskResumable } from './utils/inventoryTaskTableColumns.jsx';
import { getTaskId, getTotalElements, normalizeRows } from './utils/inventoryTaskMappers.js';
import { canAssignInventoryTask, canUpdateInventoryTask } from './utils/inventoryTaskPermissions.js';

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
  const toast = useToast();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [searchParams, setSearchParams] = useSearchParams();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [resumeTaskId, setResumeTaskId] = useState(null);
  const [scanSettingsTask, setScanSettingsTask] = useState(null);
  const [reasonDialog, setReasonDialog] = useState(null);
  const [deleteDialogTask, setDeleteDialogTask] = useState(null);

  const scanSettingsMutation = useUpdateInventoryTaskScanSettingsMutation();
  const pauseMutation = usePauseInventoryTaskMutation();
  const resumeMutation = useResumeInventoryTaskMutation();
  const cancelMutation = useCancelInventoryTaskMutation();
  const deleteMutation = useDeleteInventoryTaskMutation();

  const page = Number(searchParams.get('page') || 0);
  const pageSize = Number(searchParams.get('size') || 10);
  const search = searchParams.get('search') || '';
  const companyId = searchParams.get('companyId') || '';
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
    companyId,
    inventoryDomain,
    status,
    sortBy,
    sortOrder,
  });

  const rows = useMemo(() => {
    return normalizeRows(inventoryTasksQuery.data).map((row) => ({
      id: row.id ,
      ...row,
    }));
  }, [inventoryTasksQuery.data]);

  const openAssignmentManager = useCallback((row) => {
    setResumeTaskId(getTaskId(row));
    setCreateDialogOpen(true);
  }, []);

  const handleResumeLifecycle = useCallback(async (row) => {
    try {
      await resumeMutation.mutateAsync({ taskId: getTaskId(row) });
      toast.showSuccessToast('Inventory task resumed successfully.');
    } catch (error) {
      toast.showErrorToast(error.message || 'Could not resume inventory task.');
    }
  }, [resumeMutation, toast]);

  const columns = useMemo(() => {
    const allColumns = createInventoryTaskTableColumns({
      auth,
      isMobile,
      onResumeTask: (taskId) => {
        setResumeTaskId(taskId);
        setCreateDialogOpen(true);
      },
      onEditScanSettings: (row) => {
        scanSettingsMutation.reset();
        setScanSettingsTask(row);
      },
      onManageAssignments: openAssignmentManager,
      onPause: (row) => {
        pauseMutation.reset();
        cancelMutation.reset();
        setReasonDialog({ action: 'pause', task: row });
      },
      onResume: handleResumeLifecycle,
      onDelete: (row) => {
        deleteMutation.reset();
        setDeleteDialogTask(row);
      },
      onCancel: (row) => {
        pauseMutation.reset();
        cancelMutation.reset();
        setReasonDialog({ action: 'cancel', task: row });
      },
    });

    if (!isMobile) {
      return allColumns;
    }

    return allColumns.filter((column) => ['task', 'status', 'progress', 'actions'].includes(column.field));
  }, [
    auth,
    cancelMutation,
    deleteMutation,
    handleResumeLifecycle,
    isMobile,
    openAssignmentManager,
    pauseMutation,
    scanSettingsMutation,
  ]);

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
    setResumeTaskId(null);
    if (shouldRefresh) {
      inventoryTasksQuery.refetch();
    }
  };

  const handleCreateTask = () => {
    setResumeTaskId(null);
    setCreateDialogOpen(true);
  };

  const handleResumeTask = (row) => {
    if (!isInventoryTaskResumable(row)) return;
    const assignmentOnly = row.status === 'IN_PROGRESS' || row.status === 'PAUSED';
    if (assignmentOnly && !canAssignInventoryTask(auth, row)) return;
    if (!assignmentOnly && !canUpdateInventoryTask(auth, row) && !canAssignInventoryTask(auth, row)) return;

    openAssignmentManager(row);
  };

  const handleSaveScanSettings = async (payload) => {
    try {
      await scanSettingsMutation.mutateAsync({
        taskId: getTaskId(scanSettingsTask),
        payload,
      });
      setScanSettingsTask(null);
      toast.showSuccessToast('Scan settings updated successfully.');
    } catch {
      // The dialog displays the mutation error and remains open.
    }
  };

  const handleReasonConfirm = async (reason) => {
    const taskId = getTaskId(reasonDialog?.task);
    const action = reasonDialog?.action;
    try {
      if (action === 'pause') {
        await pauseMutation.mutateAsync({ taskId, reason });
        toast.showSuccessToast('Inventory task paused successfully.');
      } else {
        await cancelMutation.mutateAsync({ taskId, reason });
        toast.showSuccessToast('Inventory task cancelled and retained for audit.');
      }
      setReasonDialog(null);
    } catch {
      // The dialog displays the mutation error and remains open.
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteMutation.mutateAsync({ taskId: getTaskId(deleteDialogTask) });
      setDeleteDialogTask(null);
      toast.showSuccessToast('Test or incorrect task deleted permanently.');
    } catch {
      // The dialog displays the mutation error and remains open.
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
              onClick={handleCreateTask}
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
          borderRadius: 2,
          border: `1px solid ${alpha(muiTheme.palette.primary.main, 0.12)}`,
          boxShadow: `0 12px 34px ${alpha(muiTheme.palette.common.black, 0.055)}`,
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
              density="standard"
              rowHeight={isMobile ? 66 : 72}
              columnHeaderHeight={52}
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
              onRowDoubleClick={(params) => handleResumeTask(params.row)}
              sx={{
                minHeight: 440,
                width: '100%',
                minWidth: isMobile ? 0 : 900,
                border: 0,
                bgcolor: 'background.paper',
                '& .MuiDataGrid-main': {
                  minWidth: 0,
                },
                '& .MuiDataGrid-virtualScroller': {
                  overflowX: 'auto',
                },
                '& .MuiDataGrid-columnHeaders': {
                  bgcolor: 'rgba(248, 250, 252, 0.95)',
                  borderBottom: '1px solid rgba(148, 163, 184, 0.28)',
                  fontWeight: 900,
                },
                '& .MuiDataGrid-columnHeaderTitle': {
                  fontWeight: 900,
                  color: 'text.primary',
                },
                '& .MuiDataGrid-row': {
                  transition: 'background-color 140ms ease',
                },
                '& .MuiDataGrid-row:hover': {
                  bgcolor: 'rgba(25, 118, 210, 0.035)',
                },
                '& .MuiDataGrid-cell': {
                  display: 'flex',
                  alignItems: 'center',
                  borderColor: 'rgba(148, 163, 184, 0.22)',
                  py: 1,
                },
                '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
                  outline: 'none',
                },
                '& .MuiTablePagination-root': {
                  borderTop: '1px solid rgba(148, 163, 184, 0.22)',
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>

      <CreateInventoryTaskDialog
        open={createDialogOpen}
        taskId={resumeTaskId}
        onClose={handleCloseCreateDialog}
      />

      <InventoryTaskScanSettingsDialog
        open={Boolean(scanSettingsTask)}
        task={scanSettingsTask}
        loading={scanSettingsMutation.isPending}
        error={scanSettingsMutation.error?.message}
        onClose={() => setScanSettingsTask(null)}
        onSubmit={handleSaveScanSettings}
      />

      <InventoryTaskReasonDialog
        open={Boolean(reasonDialog)}
        task={reasonDialog?.task}
        action={reasonDialog?.action}
        loading={pauseMutation.isPending || cancelMutation.isPending}
        error={pauseMutation.error?.message || cancelMutation.error?.message}
        onClose={() => setReasonDialog(null)}
        onConfirm={handleReasonConfirm}
      />

      <InventoryTaskDeleteDialog
        open={Boolean(deleteDialogTask)}
        task={deleteDialogTask}
        loading={deleteMutation.isPending}
        error={deleteMutation.error?.message}
        onClose={() => setDeleteDialogTask(null)}
        onConfirm={handleDeleteConfirm}
      />
    </Box>
  );
}

export default InventoryTasks;
