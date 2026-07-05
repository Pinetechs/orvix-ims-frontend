import React from 'react';
import { Alert, Box, Chip, Divider, Stack } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';

import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import TableRowsRoundedIcon from '@mui/icons-material/TableRowsRounded';
import WarehouseRoundedIcon from '@mui/icons-material/WarehouseRounded';

import EnumChip from '../../../../../components/common/EnumChip.jsx';
import { INVENTORY_DOMAIN_CHIP_CONFIG } from '../../../../../constants/enumChipConfigs.jsx';
import { useAssetReviewImportStep } from '../../../hooks/create-task/asset/useAssetReviewImportStep.js';
import { getTaskNumber } from '../../../utils/inventoryTaskMappers.js';
import { getCompanyLabel } from '../../../utils/createInventoryTaskDialogUtils.js';
import {
  ImportMetricCard,
  ReviewPanel,
  StepHeader,
  SummaryItem,
  ValueChipGroup,
  assetImportPreviewColumns,
} from '../../CreateInventoryTaskDialogParts.jsx';

function AssetReviewImportStep({ wizard }) {
  const {
    paginationModel,
    setPaginationModel,
    hasCompletedImport,
    backgroundJobQuery,
    assetItemsQuery,
    assetLocationsQuery,
    assetCategoriesQuery,
    importSummary,
    importGridRows,
    importTotalElements,
    importLocations,
    importFloors,
    importPlaces,
    importCategories,
  } = useAssetReviewImportStep({ wizard });

  return (
    <Stack spacing={2.2}>
      <StepHeader
        icon={<AssignmentRoundedIcon />}
        title="Review asset import"
        description="Review the import summary, generated locations/floors/places/categories, and pageable uploaded asset records."
      />

      {assetItemsQuery.error && (
        <Alert severity="error">
          {assetItemsQuery.error?.message || 'Could not load pageable uploaded asset records.'}
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

      {assetLocationsQuery.error && (
        <Alert severity="warning">
          {assetLocationsQuery.error?.message || 'Could not load imported asset locations.'}
        </Alert>
      )}

      {assetCategoriesQuery.error && (
        <Alert severity="warning">
          {assetCategoriesQuery.error?.message || 'Could not load imported asset categories.'}
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
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(6, minmax(0, 1fr))' },
                gap: 1,
              }}
            >
              <ImportMetricCard icon={<TableRowsRoundedIcon />} label="Uploaded Records" value={importTotalElements} helper="From pageable API" />
              <ImportMetricCard icon={<CheckCircleRoundedIcon />} label="Saved" value={importSummary.savedRecords} helper="Stored in task" />
              <ImportMetricCard icon={<WarehouseRoundedIcon />} label="Locations" value={importLocations.length || importSummary.locationCount || 0} helper="Assignment level" />
              <ImportMetricCard icon={<LayersRoundedIcon />} label="Floors" value={importFloors.length || importSummary.floorCount || 0} helper="Inside locations" />
              <ImportMetricCard icon={<PlaceRoundedIcon />} label="Places" value={importPlaces.length || importSummary.placeCount || 0} helper="Inside floors" />
              <ImportMetricCard icon={<CategoryRoundedIcon />} label="Categories" value={importCategories.length || importSummary.categoryCount || 0} helper="Asset categories" />
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
              <ValueChipGroup title="Detected Locations" values={importLocations} emptyText="No locations returned in the import response." />
              <ValueChipGroup title="Detected Categories" values={importCategories} emptyText="No asset categories returned in the import response." />
            </Box>
          </ReviewPanel>

          <ReviewPanel title="Uploaded Asset Records" action={<Chip size="small" label={`${importTotalElements} total`} />}>
            <Box sx={{ width: '100%', minHeight: 360 }}>
              <DataGrid
                autoHeight
                rows={importGridRows}
                columns={assetImportPreviewColumns}
                getRowId={(row) => row.__rowId}
                disableRowSelectionOnClick
                loading={assetItemsQuery.isFetching}
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
          No valid Excel import result is available yet. Go back, select the asset Excel file, then click Next to upload and validate it.
        </Alert>
      )}
    </Stack>
  );
}

export default AssetReviewImportStep;
