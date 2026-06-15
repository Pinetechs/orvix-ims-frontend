import React, { useMemo, useState } from 'react';
import { Alert,Box,  Button,Card,CardContent,Divider, Stack,Typography,} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';

import { useAuth } from '../../hooks/useAuth.js';
import UserFormDrawer from './UserFormDrawer.jsx';

import { QuerySearchField,QuerySelectField} from '../../components/search/index.js';

import UserMetrics from './components/UserMetrics.jsx';

import {ACCESS_CHANNEL_OPTIONS,STATUS_OPTIONS, USER_TYPE_OPTIONS} from './constants/userOptions.js';

import { getTotalElements,  normalizeRows,} from './utils/userMappers.js';

import { createUserTableColumns } from './utils/userTableColumns.jsx';
import { useUsersQuery } from './hooks/useUsersQuery.js';
import { useCreateUserMutation } from './hooks/useCreateUserMutation.js';

function Users() {
  const { t } = useTranslation();
  const auth = useAuth();

  const [searchParams, setSearchParams] = useSearchParams();
  const [userFormOpen, setUserFormOpen] = useState(false);

  const page = Number(searchParams.get('page') || 0);
  const pageSize = Number(searchParams.get('size') || 10);
  const search = searchParams.get('search') || '';
  const userType = searchParams.get('userType') || 'ALL';
  const accessChannel = searchParams.get('accessChannel') || 'ALL';
  const status = searchParams.get('status') || 'ALL';

  const usersQuery = useUsersQuery({
    page,
    pageSize,
    search,
    userType,
    accessChannel,
    status,
  });

  const createUserMutation = useCreateUserMutation({
    onSuccess: () => setUserFormOpen(false),
  });

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

  const columns = useMemo(() => {
    return createUserTableColumns({
      auth,
      onEdit: (row) => {
        console.log('Edit user:', row);
      },
      onResetPassword: (row) => {
        console.log('Reset password:', row);
      },
      onToggleStatus: (row) => {
        console.log('Toggle status:', row);
      },
    });
  }, [auth]);

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
    <Box>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'stretch', md: 'center' }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 950,
              letterSpacing: -0.7,
              mb: 0.6,
            }}
          >
            Users
          </Typography>

          <Typography color="text.secondary">
            Manage system admins, company admins, supervisors and inventory staff.
          </Typography>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
          <Button
            variant="outlined"
            startIcon={<RefreshRoundedIcon />}
            onClick={() => usersQuery.refetch()}
            disabled={usersQuery.isFetching}
          >
            Refresh
          </Button>

          {auth.hasPermission('USER_CREATE') && (
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={() => setUserFormOpen(true)}
            >
              Add User
            </Button>
          )}
        </Stack>
      </Stack>

      <UserMetrics data={usersQuery.data} rows={rows} />

      {usersQuery.isError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {usersQuery.error?.message || 'Unknown error'}
        </Alert>
      )}

      <Card
        elevation={0}
        sx={(theme) => ({
          borderRadius: 4,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          boxShadow: `0 18px 45px ${alpha(theme.palette.common.black, 0.06)}`,
          overflow: 'hidden',
        })}
      >
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 2.4 }}>
            <Stack
              direction={{ xs: 'column', lg: 'row' }}
              spacing={1.5}
              alignItems={{ xs: 'stretch', lg: 'center' }}
            >
              <QuerySearchField
                paramName="search"
                placeholder="Search by name, username, email, phone or company..."
                updateOnEnterOnly
                sx={{ flex: 1 }}
              />

              <QuerySelectField
                paramName="userType"
                label="User Type"
                allLabel="All Types"
                minWidth={210}
                options={USER_TYPE_OPTIONS}
              />

              <QuerySelectField
                paramName="accessChannel"
                label="Channel"
                allLabel="All"
                minWidth={150}
                options={ACCESS_CHANNEL_OPTIONS}
              />

              <QuerySelectField
                paramName="status"
                label="Status"
                allLabel="All"
                minWidth={150}
                options={STATUS_OPTIONS}
              />
            </Stack>
          </Box>

          <Divider />

          <Box sx={{ height: 590, width: '100%' }}>
            <DataGrid
              rows={rows}
              columns={columns}
              loading={usersQuery.isLoading || usersQuery.isFetching}
              disableRowSelectionOnClick
              paginationMode="server"
              rowCount={getTotalElements(usersQuery.data)}
              pageSizeOptions={[10, 25, 50, 100]}
              paginationModel={{
                page,
                pageSize,
              }}
              onPaginationModelChange={updatePaginationParams}
              sx={{
                border: 0,
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
        onClose={() => setUserFormOpen(false)}
        onSubmit={(payload) => createUserMutation.mutateAsync(payload)}
        loading={createUserMutation.isPending}
        error={createUserMutation.error?.message}
      />
    </Box>
  );
}

export default Users;