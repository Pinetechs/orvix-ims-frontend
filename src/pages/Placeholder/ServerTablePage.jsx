import React from 'react';
import { Alert, Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { DataGrid } from '@mui/x-data-grid';

const normalizeRows = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.content)) return data.data.content;
  if (Array.isArray(data?.result)) return data.result;
  if (Array.isArray(data?.result?.content)) return data.result.content;
  return [];
};

function ServerTablePage({ title, description, query }) {
  const rows = normalizeRows(query.data).map((row, index) => ({ id: row.id ?? index + 1, ...row }));
  const sample = rows[0] || {};
  const columns = Object.keys(sample).length
    ? Object.keys(sample).slice(0, 8).map((field) => ({ field, headerName: field, minWidth: 140, flex: 1 }))
    : [{ field: 'message', headerName: 'Message', flex: 1 }];

  const visibleRows = rows.length ? rows : [{ id: 1, message: 'No data loaded yet. Connect backend endpoint or create first records.' }];

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={900}>{title}</Typography>
          <Typography color="text.secondary">{description}</Typography>
        </Box>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => query.refetch()} disabled={query.isFetching}>
          Refresh
        </Button>
      </Stack>

      {query.isError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Backend endpoint is not ready or returned an error: {query.error?.message || 'Unknown error'}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Box sx={{ width: '100%' }}>
            <DataGrid
              autoHeight
              rows={visibleRows}
              columns={columns}
              loading={query.isLoading || query.isFetching}
              disableRowSelectionOnClick
              pageSizeOptions={[10, 25, 50]}
              autoPageSize={false}
              initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
              sx={{ minHeight: 420 }}
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default ServerTablePage;
