import React from 'react';
import { Alert, Box, Chip, Divider, Stack } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';

import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import TableRowsRoundedIcon from '@mui/icons-material/TableRowsRounded';
import WarehouseRoundedIcon from '@mui/icons-material/WarehouseRounded';

import EnumChip from '../../../../../components/common/EnumChip.jsx';
import { INVENTORY_DOMAIN_CHIP_CONFIG } from '../../../../../constants/enumChipConfigs.jsx';
import { useVehicleReviewImportStep } from '../../../hooks/create-task/vehicle/useVehicleReviewImportStep.js';
import { getTaskNumber } from '../../../utils/inventoryTaskMappers.js';
import { getCompanyLabel } from '../../../utils/createInventoryTaskDialogUtils.js';
import {
  ImportMetricCard,
  ReviewPanel,
  StepHeader,
  SummaryItem,
  ValueChipGroup,
  vehicleImportPreviewColumns,
} from '../../CreateInventoryTaskDialogParts.jsx';

function VehicleReviewImportStep({ wizard }) {
  const {
    paginationModel,
    setPaginationModel,
    hasCompletedImport,
    backgroundJobQuery,
    vehicleItemsQuery,
    vehicleLocationsQuery,
    importSummary,
    importGridRows,
    importTotalElements,
    importLocations,
    importStoreNos,
  } = useVehicleReviewImportStep({ wizard });

  return (
    <Stack spacing={2.2}>
      <StepHeader
        icon={<AssignmentRoundedIcon />}
        title="Review vehicle import"
        description="Review the import summary from the completed background job and the pageable uploaded records from the backend. You can go Back to upload another file."
      />

      {vehicleItemsQuery.error && (
        <Alert severity="error">
          {vehicleItemsQuery.error?.message || 'Could not load pageable uploaded vehicle records.'}
        </Alert>
      )}

      {backgroundJobQuery.isFetching && hasCompletedImport && wizard.importJobId && (
        <Alert severity="info">
          Loading import result summary from the background job API...
        </Alert>
      )}

      {backgroundJobQuery.error && (
        <Alert severity="warning">
          {backgroundJobQuery.error?.message || 'Could not load background job import result. Showing task/API data where available.'}
        </Alert>
      )}

      {vehicleLocationsQuery.error && (
        <Alert severity="warning">
          {vehicleLocationsQuery.error?.message || 'Could not load imported vehicle locations.'}
        </Alert>
      )}

      {hasCompletedImport ? (
        <Stack spacing={2}>
          <ReviewPanel
            title="Task Summary"
            action={<EnumChip value={wizard.inventoryDomain} config={INVENTORY_DOMAIN_CHIP_CONFIG} />}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: '1.4fr 1fr 1fr' },
                gap: 1.6,
              }}
            >
              <SummaryItem label="Task Name" value={wizard.taskInformation.taskName} />
              <SummaryItem label="Task Number" value={getTaskNumber(wizard.createdTask)} />
              <SummaryItem label="Company" value={getCompanyLabel(wizard.taskInformation.company)} />
            </Box>

            <Divider sx={{ my: 1.5 }} />

            <SummaryItem label="Description" value={wizard.taskInformation.description || '-'} />
          </ReviewPanel>

          <ReviewPanel title="Import Summary">
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(5, minmax(0, 1fr))' },
                gap: 1,
              }}
            >
              <ImportMetricCard icon={<TableRowsRoundedIcon />} label="Uploaded Records" value={importTotalElements} helper="From pageable API" />
              <ImportMetricCard icon={<CheckCircleRoundedIcon />} label="Saved" value={importSummary.savedRecords} helper="Stored in task" />
              <ImportMetricCard icon={<AssignmentRoundedIcon />} label="Planned" value={importSummary.plannedRecords} helper="Expected scan count" />
              <ImportMetricCard icon={<StorefrontRoundedIcon />} label="ST_STORE_NO" value={importStoreNos.length || importSummary.storeNoCount || 0} helper="Unique stores" />
              <ImportMetricCard icon={<WarehouseRoundedIcon />} label="LOCATION" value={importLocations.length || importSummary.locationCount || 0} helper="Unique locations" />
            </Box>
          </ReviewPanel>

          <ReviewPanel title="Detected Values">
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                gap: 2,
              }}
            >
              <ValueChipGroup title="Detected ST_STORE_NO" values={importStoreNos} emptyText="No store numbers returned in the import response." />
              <ValueChipGroup title="Detected LOCATION" values={importLocations} emptyText="No locations returned in the import response." />
            </Box>
          </ReviewPanel>

          <ReviewPanel title="Uploaded Vehicle Records" action={<Chip size="small" label={`${importTotalElements} total`} />}>
            <Box sx={{ width: '100%', minHeight: 360 }}>
              <DataGrid
                autoHeight
                rows={importGridRows}
                columns={vehicleImportPreviewColumns}
                getRowId={(row) => row.__rowId}
                disableRowSelectionOnClick
                loading={vehicleItemsQuery.isFetching}
                paginationMode="server"
                rowCount={importTotalElements}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[5, 10, 25, 50]}
                sx={(theme) => ({
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  borderRadius: 3,
                  overflow: 'hidden',
                  '& .MuiDataGrid-columnHeaders': {
                    bgcolor: alpha(theme.palette.primary.main, 0.065),
                    fontWeight: 900,
                  },
                  '& .MuiDataGrid-cell': {
                    borderColor: alpha(theme.palette.divider, 0.65),
                  },
                })}
              />
            </Box>
          </ReviewPanel>
        </Stack>
      ) : (
        <Alert severity="warning">
          No valid Excel import result is available yet. Go back, select the vehicle Excel file, then click Next to upload and validate it.
        </Alert>
      )}
    </Stack>
  );
}

export default VehicleReviewImportStep;
