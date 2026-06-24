import React, { useMemo, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Divider, Stack, Typography, useMediaQuery } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';

import { useAuth } from '../../hooks/useAuth.js';
import SearchCompanyCard from './components/SearchCompanyCard.jsx';
import CompanyMetrics from './components/CompanyMetrics.jsx';
import CompanyFormDrawer from './CompanyFormDrawer.jsx';
import { useCompaniesQuery } from './hooks/useCompaniesQuery.js';
import { useCreateCompanyMutation } from './hooks/useCreateCompanyMutation.js';
import { useUpdateCompanyMutation } from './hooks/useUpdateCompanyMutation.js';
import { useSetCompanyActiveMutation } from './hooks/useSetCompanyActiveMutation.js';
import { getTotalElements, isCompanyActive, normalizeRows } from './utils/companyMappers.js';
import { createCompanyTableColumns } from './utils/companyTableColumns.jsx';

const GRID_TO_API_SORT_FIELDS = {
  company: 'name',
  status: 'active',
};

const API_TO_GRID_SORT_FIELDS = Object.entries(GRID_TO_API_SORT_FIELDS).reduce(
  (fields, [gridField, apiField]) => ({
    ...fields,
    [apiField]: gridField,
  }),
  {},
);

function Companies() {
  const { t } = useTranslation();
  const auth = useAuth();

  const [searchParams, setSearchParams] = useSearchParams();
  const [companyFormOpen, setCompanyFormOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);

  const page = Number(searchParams.get('page') || 0);
  const pageSize = Number(searchParams.get('size') || 10);
  const search = searchParams.get('search') || '';
  const active = searchParams.get('active') || 'ALL';
  const sortBy = searchParams.get('sortBy') || 'id';
  const sortOrder = searchParams.get('sortOrder') || 'desc';

  const sortModel = useMemo(() => {
    if (sortBy === 'id') {
      return [];
    }

    return [{ field: API_TO_GRID_SORT_FIELDS[sortBy] || sortBy, sort: sortOrder === 'asc' ? 'asc' : 'desc' }];
  }, [sortBy, sortOrder]);

  const companiesQuery = useCompaniesQuery({
    page,
    size: pageSize,
    search,
    active,
    sortBy,
    sortOrder,
  });

  const closeCompanyForm = () => {
    setCompanyFormOpen(false);
    setSelectedCompany(null);
  };

  const createCompanyMutation = useCreateCompanyMutation({
    onSuccess: closeCompanyForm,
  });

  const updateCompanyMutation = useUpdateCompanyMutation({
    onSuccess: closeCompanyForm,
  });

  const setCompanyActiveMutation = useSetCompanyActiveMutation();

  const rows = useMemo(() => {
    return normalizeRows(companiesQuery.data).map((row, index) => ({
      id: row.id ?? row.companyId ?? row.code ?? index + 1,
      ...row,
    }));
  }, [companiesQuery.data]);

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

  const openCreateForm = () => {
    setSelectedCompany(null);
    setCompanyFormOpen(true);
  };

  const openEditForm = (row) => {
    setSelectedCompany(row);
    setCompanyFormOpen(true);
  };

  const handleToggleStatus = async (row) => {
    const nextActive = !isCompanyActive(row);
    const actionLabel = nextActive ? 'enable' : 'disable';

    const confirmed = window.confirm(`Are you sure you want to ${actionLabel} this company?`);
    if (!confirmed) return;

    await setCompanyActiveMutation.mutateAsync({
      id: row.id,
      active: nextActive,
    });
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const columns = useMemo(() => {
    const allColumns = createCompanyTableColumns({
      auth,
      isMobile,
      onEdit: openEditForm,
      onToggleStatus: handleToggleStatus,
    });

    if (!isMobile) {
      return allColumns;
    }

    return allColumns.filter((column) => ['company', 'status', 'actions'].includes(column.field));
  }, [auth, isMobile]);

  if (!auth.hasPermission('COMPANY_VIEW')) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {t('permissions.noCompanyViewPermission')}
        </Alert>
        <Typography>{t('permissions.contactAdmin')}</Typography>
      </Box>
    );
  }

  const formMode = selectedCompany ? 'edit' : 'create';
  const formLoading = createCompanyMutation.isPending || updateCompanyMutation.isPending;
  const formError = createCompanyMutation.error?.message || updateCompanyMutation.error?.message;

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
            Companies
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              maxWidth: 720,
              overflowWrap: 'anywhere',
              lineHeight: 1.55,
            }}
          >
            Manage company records, access scope and activation status across Orvix IMS.
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
            onClick={() => companiesQuery.refetch()}
            disabled={companiesQuery.isFetching}
            sx={{ minWidth: 0 }}
          >
            Refresh
          </Button>

          {auth.hasPermission('COMPANY_CREATE') && (
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={openCreateForm}
              sx={{ minWidth: 0 }}
            >
              Add Company
            </Button>
          )}
        </Stack>
      </Stack>

      <CompanyMetrics data={companiesQuery.data} rows={rows} />

      {(companiesQuery.isError || setCompanyActiveMutation.isError) && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {companiesQuery.error?.message || setCompanyActiveMutation.error?.message || 'Unknown error'}
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
          <SearchCompanyCard />

          <Divider />

          <Box sx={{ width: '100%', maxWidth: '100%', overflowX: 'auto' }}>
            <DataGrid
              autoHeight
              density={isMobile ? 'compact' : 'standard'}
              rows={rows}
              columns={columns}
              loading={companiesQuery.isLoading || companiesQuery.isFetching || setCompanyActiveMutation.isPending}
              disableRowSelectionOnClick
              paginationMode="server"
              sortingMode="server"
              rowCount={getTotalElements(companiesQuery.data)}
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

      <CompanyFormDrawer
        open={companyFormOpen}
        mode={formMode}
        initialData={selectedCompany}
        onClose={closeCompanyForm}
        onSubmit={(payload) => {
          if (selectedCompany) {
            return updateCompanyMutation.mutateAsync({ id: selectedCompany.id, payload });
          }

          return createCompanyMutation.mutateAsync(payload);
        }}
        loading={formLoading}
        error={formError}
      />
    </Box>
  );
}

export default Companies;
