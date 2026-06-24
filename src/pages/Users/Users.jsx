import React, { useMemo, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Divider, Stack, Typography, useMediaQuery } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';

import { useAuth } from '../../hooks/useAuth.js';
import UserFormDrawer from './UserFormDrawer.jsx';

import { QuerySearchField,QuerySelectField} from '../../components/search/index.js';

import UserMetrics from './components/UserMetrics.jsx';


import { getTotalElements, isUserActive, normalizeRows,} from './utils/userMappers.js';

import { createUserTableColumns } from './utils/userTableColumns.jsx';
import { useUsersQuery } from './hooks/useUsersQuery.js';
import { useCreateUserMutation } from './hooks/useCreateUserMutation.js';
import { useUpdateUserMutation } from './hooks/useUpdateUserMutation.js';
import { useResetUserPasswordMutation } from './hooks/useResetUserPasswordMutation.js';
import { useSetUserActiveMutation } from './hooks/useSetUserActiveMutation.js';
import SearchUserCard from './components/SearchUserCard.jsx';
import ResetUserPasswordDialog from './ResetUserPasswordDialog.jsx';

const GRID_TO_API_SORT_FIELDS = {
  user: 'username',
  phone: 'mobile',
  status: 'enabled',
};

const API_TO_GRID_SORT_FIELDS = Object.entries(GRID_TO_API_SORT_FIELDS).reduce(
  (fields, [gridField, apiField]) => ({
    ...fields,
    [apiField]: gridField,
  }),
  {},
);

function Users() {
  const { t } = useTranslation();
  const auth = useAuth();

  const [searchParams, setSearchParams] = useSearchParams();
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [resetPasswordUser, setResetPasswordUser] = useState(null);

  const page = Number(searchParams.get('page') || 0);
  const pageSize = Number(searchParams.get('size') || 10);
  const search = searchParams.get('search') || '';
  const userType = searchParams.get('userType') || 'ALL';
  const accessChannel = searchParams.get('accessChannel') || 'ALL';
  const status = searchParams.get('status') || 'ALL';
  const inventoryDomains = searchParams.get('inventoryDomains') || '';
  const sortBy = searchParams.get('sortBy') || 'id';
  const sortOrder = searchParams.get('sortOrder') || 'desc';

  const sortModel = useMemo(() => {
    if (sortBy === 'id') {
      return [];
    }

    return [{ field: API_TO_GRID_SORT_FIELDS[sortBy] || sortBy, sort: sortOrder === 'asc' ? 'asc' : 'desc' }];
  }, [sortBy, sortOrder]);



  const usersQuery = useUsersQuery({page,pageSize,search, userType, accessChannel, status, inventoryDomains, sortBy, sortOrder, });

  const createUserMutation = useCreateUserMutation({
    onSuccess: () => closeUserForm(),
  });

  const updateUserMutation = useUpdateUserMutation({
    onSuccess: () => closeUserForm(),
  });

  const resetUserPasswordMutation = useResetUserPasswordMutation({
    onSuccess: () => setResetPasswordUser(null),
  });

  const setUserActiveMutation = useSetUserActiveMutation();

  const rows = useMemo(() => {
    return normalizeRows(usersQuery.data).map((row, index) => ({
      id: row.id ?? row.userId ?? row.username ?? index + 1,
      ...row,
    }));
  }, [usersQuery.data]);

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

  const closeUserForm = () => {
    setUserFormOpen(false);
    setSelectedUser(null);
  };

  const openCreateForm = () => {
    setSelectedUser(null);
    setUserFormOpen(true);
  };

  const openEditForm = (row) => {
    setSelectedUser(row);
    setUserFormOpen(true);
  };

  const handleToggleStatus = async (row) => {
    const nextActive = !isUserActive(row);
    const actionLabel = nextActive ? 'enable' : 'disable';

    const confirmed = window.confirm(`Are you sure you want to ${actionLabel} this user?`);
    if (!confirmed) return;

    await setUserActiveMutation.mutateAsync({
      id: row.id,
      active: nextActive,
    });
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const columns = useMemo(() => {
    const allColumns = createUserTableColumns({
      auth,
      isMobile,
      onEdit: (row) => {
        openEditForm(row);
      },
      onResetPassword: (row) => {
        setResetPasswordUser(row);
      },
      onToggleStatus: (row) => {
        handleToggleStatus(row);
      },
    });

    if (!isMobile) {
      return allColumns;
    }

    return allColumns.filter((column) => ['user', 'status', 'actions'].includes(column.field));
  }, [auth, isMobile]);

  if (!auth.hasPermission('USER_VIEW')) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {t('permissions.noUserViewPermission')}
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
            Users
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              maxWidth: 720,
              overflowWrap: 'anywhere',
              lineHeight: 1.55,
            }}
          >
            Manage system admins, company admins, supervisors and inventory staff.
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
            onClick={() => usersQuery.refetch()}
            disabled={usersQuery.isFetching}
            sx={{ minWidth: 0 }}
          >
            Refresh
          </Button>

          {auth.hasPermission('USER_CREATE') && (
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={openCreateForm}
              sx={{ minWidth: 0 }}
            >
              Add User
            </Button>
          )}
        </Stack>
      </Stack>

      <UserMetrics data={usersQuery.data} rows={rows} />

      {(usersQuery.isError || setUserActiveMutation.isError) && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {usersQuery.error?.message || setUserActiveMutation.error?.message || 'Unknown error'}
        </Alert>
      )}

      <Card
        elevation={0}
        sx={(theme) => ({
          borderRadius: 4,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          boxShadow: `0 18px 45px ${alpha(theme.palette.common.black, 0.06)}`,
          overflow: 'hidden',
          maxWidth: '100%',
        })}
      >
        <CardContent sx={{ p: 0 }}>
       
       <SearchUserCard />

          <Divider />

          <Box sx={{ width: '100%', maxWidth: '100%', overflowX: 'auto' }}>
            <DataGrid
              autoHeight
              density={isMobile ? 'compact' : 'standard'}
              rows={rows}
              columns={columns}
              loading={usersQuery.isLoading || usersQuery.isFetching || setUserActiveMutation.isPending}
              disableRowSelectionOnClick
              paginationMode="server"
              sortingMode="server"
              rowCount={getTotalElements(usersQuery.data)}
              pageSizeOptions={[10, 25, 50, 100]}
              paginationModel={{
                page,
                pageSize,
              }}
              onPaginationModelChange={updatePaginationParams}
              sortModel={sortModel}
              onSortModelChange={updateSortParams}
              sx={{
                minHeight: 420,
                width: '100%',
                minWidth: isMobile ? 0 : 720,
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

      <UserFormDrawer
        open={userFormOpen}
        mode={selectedUser ? 'edit' : 'create'}
        initialData={selectedUser}
        onClose={closeUserForm}
        onSubmit={(payload) => {
          if (selectedUser) {
            return updateUserMutation.mutateAsync({ id: selectedUser.id, payload });
          }

          return createUserMutation.mutateAsync(payload);
        }}
        loading={createUserMutation.isPending || updateUserMutation.isPending}
        error={createUserMutation.error?.message || updateUserMutation.error?.message}
      />

      <ResetUserPasswordDialog
        open={Boolean(resetPasswordUser)}
        user={resetPasswordUser}
        onClose={() => setResetPasswordUser(null)}
        onSubmit={(payload) => resetUserPasswordMutation.mutateAsync({ id: resetPasswordUser.id, ...payload })}
        loading={resetUserPasswordMutation.isPending}
        error={resetUserPasswordMutation.error?.message}
      />
    </Box>
  );
}

export default Users;
