import React from 'react';
import { Alert, Box, Chip, Divider, Stack } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';

import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import BrandingWatermarkRoundedIcon from '@mui/icons-material/BrandingWatermarkRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import TableRowsRoundedIcon from '@mui/icons-material/TableRowsRounded';
import WarehouseRoundedIcon from '@mui/icons-material/WarehouseRounded';

import EnumChip from '../../../../../components/common/EnumChip.jsx';
import { INVENTORY_DOMAIN_CHIP_CONFIG } from '../../../../../constants/enumChipConfigs.jsx';
import { useSparePartReviewImportStep } from '../../../hooks/create-task/sparepart/useSparePartReviewImportStep.js';
import { getTaskNumber } from '../../../utils/inventoryTaskMappers.js';
import { getCompanyLabel } from '../../../utils/createInventoryTaskDialogUtils.js';
import {
  ImportMetricCard,
  ReviewPanel,
  StepHeader,
  SummaryItem,
  ValueChipGroup,
  sparePartImportPreviewColumns,
} from '../../CreateInventoryTaskDialogParts.jsx';

function SparePartReviewImportStep({ wizard }) {
  const {
    paginationModel,
    setPaginationModel,
    hasCompletedImport,
    backgroundJobQuery,
    sparePartItemsQuery,
    sparePartBranchesQuery,
    sparePartBrandsQuery,
    importSummary,
    importGridRows,
    importTotalElements,
    importBranches,
    importLocations,
    importBrands,
  } = useSparePartReviewImportStep({ wizard });

  return (
    <Stack spacing={2.2}>
      <StepHeader
        icon={<AssignmentRoundedIcon />}
        title="Review spare part import"
        description="Review the import summary, generated branches/locations/brands, and pageable uploaded spare part records."
      />

      {sparePartItemsQuery.error && (
        <Alert severity="error">
          {sparePartItemsQuery.error?.message || 'Could not load pageable uploaded spare part records.'}
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

      {sparePartBranchesQuery.error && (
        <Alert severity="warning">
          {sparePartBranchesQuery.error?.message || 'Could not load imported spare part branches.'}
        </Alert>
      )}

      {sparePartBrandsQuery.error && (
        <Alert severity="warning">
          {sparePartBrandsQuery.error?.message || 'Could not load imported spare part brands.'}
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
              <ImportMetricCard icon={<WarehouseRoundedIcon />} label="Branches" value={importBranches.length || importSummary.branchCount || 0} helper="Assignment level" />
              <ImportMetricCard icon={<Inventory2RoundedIcon />} label="Locations" value={importLocations.length || importSummary.locationCount || 0} helper="Cabinet / rack" />
              <ImportMetricCard icon={<BrandingWatermarkRoundedIcon />} label="Brands" value={importBrands.length || importSummary.brandCount || 0} helper="Part brands" />
            </Box>
          </ReviewPanel>

          <ReviewPanel title="Detected Values">
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
                gap: 2,
              }}
            >
              <ValueChipGroup title="Detected Branches" values={importBranches} emptyText="No branches returned in the import response." />
              <ValueChipGroup title="Detected Locations" values={importLocations} emptyText="No cabinet/rack locations returned in the import response." />
              <ValueChipGroup title="Detected Brands" values={importBrands} emptyText="No brands returned in the import response." />
            </Box>
          </ReviewPanel>

          <ReviewPanel title="Uploaded Spare Part Records" action={<Chip size="small" label={`${importTotalElements} total`} />}>
            <Box sx={{ width: '100%', minHeight: 360 }}>
              <DataGrid
                autoHeight
                rows={importGridRows}
                columns={sparePartImportPreviewColumns}
                getRowId={(row) => row.__rowId}
                disableRowSelectionOnClick
                loading={sparePartItemsQuery.isFetching}
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

          <Alert severity="info" icon={<Inventory2RoundedIcon />}>
            Variance during scanning is calculated from STKQTY: Counted Qty - STKQTY. QTY and FZQTY remain available as reference fields.
          </Alert>
        </Stack>
      ) : (
        <Alert severity="warning">
          No valid Excel import result is available yet. Go back, select the spare part Excel file, then click Next to upload and validate it.
        </Alert>
      )}
    </Stack>
  );
}

export default SparePartReviewImportStep;
