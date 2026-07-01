import React, { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  IconButton,
  LinearProgress,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';

import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import GroupAddRoundedIcon from '@mui/icons-material/GroupAddRounded';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import TableRowsRoundedIcon from '@mui/icons-material/TableRowsRounded';
import WarehouseRoundedIcon from '@mui/icons-material/WarehouseRounded';

import EnumChip from '../../../components/common/EnumChip.jsx';
import FormikAsyncAutocomplete from '../../../components/form/FormikAsyncAutocomplete.jsx';
import FormikTextField from '../../../components/form/FormikTextField.jsx';
import BackgroundJobProgress from '../../../components/jobs/BackgroundJobProgress.jsx';
import {
  INVENTORY_DOMAIN_CHIP_CONFIG,
  INVENTORY_TASK_STATUS_CHIP_CONFIG,
} from '../../../constants/enumChipConfigs.jsx';
import { getLookupCompanies } from '../../../services/lookupsServices.js';
import { queryKeys } from '../../../services/queryKeys.js';
import { getUsers } from '../../../services/userService.js';
import { TASK_CLOSE_ACTION_OPTIONS } from '../constants/inventoryTaskOptions.js';
import {
  getImportSummary,
  getTaskNumber,
  getVehicleImportLocations,
  getVehicleImportRows,
  getVehicleImportStoreNos,
  getVehicleImportTotalElements,
} from '../utils/inventoryTaskMappers.js';
import {
  COMPANY_LOOKUP_PARAMS,
  getCompanyLabel,
  getUserLabel,
  getUserValue,
} from '../utils/createInventoryTaskDialogUtils.js';
import {
  ImportMetricCard,
  InventoryDomainCard,
  ReviewPanel,
  StepHeader,
  SummaryItem,
  ValueChipGroup,
  getVehicleImportRowId,
  vehicleImportPreviewColumns,
  inventoryDomainCards,
} from './CreateInventoryTaskDialogParts.jsx';

export function TaskInformationStep({ formik, loading, createdTask }) {
  return (
    <Stack spacing={2.2}>
      <StepHeader
        icon={<ApartmentRoundedIcon />}
        title="Task information"
        description="Add the visible task name, description and company before choosing the inventory type."
      />

      <FormikTextField
        formik={formik}
        name="taskName"
        label="Task Name"
        disabled={loading || Boolean(createdTask)}
        required
        helperText="Example: June vehicle inventory - Main warehouse"
      />

      <FormikTextField
        formik={formik}
        name="description"
        label="Description"
        disabled={loading || Boolean(createdTask)}
        multiline
        minRows={3}
        helperText="Optional notes for supervisors and inventory staff."
      />

      <FormikAsyncAutocomplete
        formik={formik}
        name="company"
        label="Company"
        queryKey={queryKeys.lookups.companies(COMPANY_LOOKUP_PARAMS)}
        queryFn={getLookupCompanies}
        disabled={loading || Boolean(createdTask)}
        extraParams={COMPANY_LOOKUP_PARAMS}
        lookup
        helperText="Select the company that owns this inventory task."
      />

      {createdTask && (
        <Alert severity="info">
          This draft has already been created. Basic information is locked in this wizard.
        </Alert>
      )}
    </Stack>
  );
}

export function InventoryTypeStep({ formik, loading, createdTask, onDomainSelect }) {
  return (
    <Stack spacing={2.2}>
      <StepHeader
        icon={<FactCheckRoundedIcon />}
        title="Choose inventory type"
        description="The selected type controls the next steps. Vehicle inventory supports Excel upload in this wizard."
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
          gap: 1.5,
        }}
      >
        {inventoryDomainCards.map((option) => (
          <InventoryDomainCard
            key={option.value}
            option={option}
            selected={formik.values.inventoryDomain === option.value}
            disabled={loading || Boolean(createdTask)}
            onSelect={onDomainSelect}
          />
        ))}
      </Box>

      {formik.touched.inventoryDomain && formik.errors.inventoryDomain && (
        <FormHelperText error>{formik.errors.inventoryDomain}</FormHelperText>
      )}

      <Alert severity={createdTask ? 'info' : 'warning'}>
        {createdTask
          ? 'Inventory type is locked because the draft task has already been created.'
          : 'Click Next to create the task as Draft. After that, closing the dialog will keep the task visible in the list.'}
      </Alert>
    </Stack>
  );
}

export const UploadExcelStep = forwardRef(function UploadExcelStep({
  createdTask,
  importJobId,
  importJobQuery,
  isVehicleTask,
  loading,
  onFileStateChange,
  onLocalError,
  onUploadJobCreated,
  onUploadReset,
  taskImportCompleted,
  taskImportFailed,
  taskImportRunning,
  taskId,
  taskStatus,
  uploadMutation,
  uploadResult,
}, ref) {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const clearSelectedFile = () => {
    setSelectedFile(null);
    onFileStateChange(false);
    onUploadReset();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (event) => {
    const nextFile = event.target.files?.[0] || null;
    setSelectedFile(nextFile);
    onFileStateChange(Boolean(nextFile));
    onUploadReset();
  };

  // The dialog footer owns the Next button, but this step owns the selected
  // file. Expose only the upload command so the File never leaks upward.
  useImperativeHandle(ref, () => ({
    async uploadSelectedFile() {
      onLocalError(null);

      if (!selectedFile) {
        onLocalError('Please select an Excel file first.');
        return false;
      }

      if (!taskId) {
        onLocalError('Draft task was not created yet. Please go back and create the draft first.');
        return false;
      }

      try {
        const response = await uploadMutation.mutateAsync({ taskId, file: selectedFile });
        const uploaded = onUploadJobCreated(response);

        if (uploaded) {
          setSelectedFile(null);
          onFileStateChange(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }

        return uploaded;
      } catch {
        return false;
      }
    },
  }));

  return (
    <Stack spacing={2.2}>
      <StepHeader
        icon={<CloudUploadRoundedIcon />}
        title="Upload vehicle Excel"
        description="Select the Excel file now. When you click Next, the file is uploaded and processed by the backend background job."
      />

      <Alert severity="success">
        Draft task created successfully. Task number: <strong>{getTaskNumber(createdTask)}</strong>
      </Alert>

      {!isVehicleTask && (
        <Alert severity="warning">
          Excel upload is currently prepared for Vehicle inventory tasks only. You can continue and keep this task as Draft.
        </Alert>
      )}

      {isVehicleTask && (
        <>
          {taskStatus && (
            <Alert severity={taskImportFailed ? 'error' : taskImportCompleted ? 'success' : 'info'}>
              Current import status: <strong>{taskStatus}</strong>
            </Alert>
          )}

          <Alert severity="info" icon={<ErrorOutlineRoundedIcon />}>
            On Next, the backend creates a background job and this screen tracks the processing progress. If duplicate VIN values or invalid rows are found, the job fails and the error appears here.
          </Alert>

          <Card
            variant="outlined"
            sx={(theme) => ({
              borderRadius: 3,
              borderStyle: 'dashed',
              borderColor: alpha(uploadResult ? theme.palette.success.main : theme.palette.primary.main, 0.32),
              bgcolor: alpha(uploadResult ? theme.palette.success.main : theme.palette.primary.main, 0.035),
            })}
          >
            <CardContent>
              <Stack spacing={1.5} alignItems="center" textAlign="center">
                <CloudUploadRoundedIcon color={uploadResult ? 'success' : 'primary'} sx={{ fontSize: 46 }} />
                <Box>
                  <Typography sx={{ fontWeight: 950 }}>Select vehicle Excel file</Typography>
                  <Typography color="text.secondary" sx={{ fontSize: '0.86rem', maxWidth: 650 }}>
                    Expected columns include VIN, make, model, year, color, ST_STORE_NO and LOCATION. The background import starts when you click Next.
                  </Typography>
                </Box>

                <input ref={fileInputRef} hidden type="file" accept=".xlsx,.xls" onChange={handleFileChange} />

                <Button
                  variant="outlined"
                  startIcon={<InsertDriveFileOutlinedIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                >
                  {selectedFile ? 'Change Excel File' : taskImportCompleted ? 'Upload Another Excel File' : 'Select Excel File'}
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {selectedFile && (
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
              <Chip
                icon={<InsertDriveFileOutlinedIcon />}
                label={selectedFile.name}
                variant="outlined"
                sx={{ maxWidth: '100%' }}
              />

              <IconButton size="small" onClick={clearSelectedFile} disabled={loading}>
                <DeleteOutlineRoundedIcon fontSize="small" />
              </IconButton>
            </Stack>
          )}

          {uploadMutation.isPending && (
            <Stack spacing={1}>
              <LinearProgress />
              <Typography color="text.secondary" sx={{ fontSize: '0.84rem' }}>
                Uploading Excel file and creating background job...
              </Typography>
            </Stack>
          )}

          {taskImportRunning && !importJobId && (
            <Alert severity="info">
              Import is queued or running on the backend. This dialog will refresh the task status automatically.
            </Alert>
          )}

          {importJobId && (
            <BackgroundJobProgress
              job={importJobQuery.data}
              loading={importJobQuery.isLoading || (importJobQuery.isFetching && !importJobQuery.data)}
              error={importJobQuery.error}
              title="Vehicle Excel import"
              emptyText="Waiting for the import worker to pick up the job..."
            />
          )}

          {(uploadResult || taskImportCompleted) && (
            <Alert severity={selectedFile ? 'warning' : 'success'}>
              {selectedFile
                ? 'A new Excel file is selected. Click Upload & Process to replace the previous import result.'
                : 'Excel import completed successfully. Click Next to review the pageable uploaded records from the backend.'}
            </Alert>
          )}
        </>
      )}
    </Stack>
  );
});

export function VehicleReviewImportStep({
  createdTask,
  formik,
  importJobId,
  importPaginationModel,
  setImportPaginationModel,
  taskImportCompleted,
  uploadResult,
  vehicleItemsQuery,
}) {
  const importSummary = useMemo(() => getImportSummary(uploadResult), [uploadResult]);
  const importRows = useMemo(() => getVehicleImportRows(vehicleItemsQuery.data), [vehicleItemsQuery.data]);
  const importGridRows = useMemo(
    () => importRows.map((row, index) => ({ ...row, __rowId: getVehicleImportRowId(row, index) })),
    [importRows],
  );
  const importTotalElements = useMemo(() => {
    const pageableTotal = getVehicleImportTotalElements(vehicleItemsQuery.data);
    return pageableTotal || importSummary.savedRecords || importSummary.plannedRecords || 0;
  }, [vehicleItemsQuery.data, importSummary.plannedRecords, importSummary.savedRecords]);
  const importLocations = useMemo(() => getVehicleImportLocations(uploadResult), [uploadResult]);
  const importStoreNos = useMemo(() => getVehicleImportStoreNos(uploadResult), [uploadResult]);

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

      {taskImportCompleted && importJobId && !uploadResult && (
        <Alert severity="info">
          Loading import result summary from the background job...
        </Alert>
      )}

      {uploadResult || taskImportCompleted ? (
        <Stack spacing={2}>
          <ReviewPanel
            title="Task Summary"
            action={<EnumChip value={formik.values.inventoryDomain} config={INVENTORY_DOMAIN_CHIP_CONFIG} />}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: '1.4fr 1fr 1fr' },
                gap: 1.6,
              }}
            >
              <SummaryItem label="Task Name" value={formik.values.taskName} />
              <SummaryItem label="Task Number" value={getTaskNumber(createdTask)} />
              <SummaryItem label="Company" value={getCompanyLabel(formik.values.company)} />
            </Box>

            <Divider sx={{ my: 1.5 }} />

            <SummaryItem label="Description" value={formik.values.description || '-'} />
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
                paginationModel={importPaginationModel}
                onPaginationModelChange={setImportPaginationModel}
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

export function StaffStatusStep({ formik, loading, taskStatus }) {
  return (
    <Stack spacing={2.4}>
      <StepHeader
        icon={<GroupAddRoundedIcon />}
        title="Staff and final status"
        description="Assign the inventory team and decide whether the task stays Draft, becomes Ready to Start, or starts now."
      />

      <Alert severity="info">
        Select inventory staff now if the task should become Ready to Start or Start Now. If you keep it as Draft, staff assignment can be completed later.
      </Alert>

      <FormikAsyncAutocomplete
        formik={formik}
        name="staff"
        label="Inventory Staff"
        queryKey={queryKeys.users.list({ userType: 'INVENTORY_STAFF', status: 'true' })}
        queryFn={getUsers}
        disabled={loading}
        multiple
        extraParams={{ userType: 'INVENTORY_STAFF', status: 'true', size: 20 }}
        optionLabelKeys={['firstName', 'lastName', 'username']}
        getOptionValue={getUserValue}
        getOptionLabel={getUserLabel}
        helperText="Only inventory staff users should be assigned to mobile scanning tasks."
      />

      <FormControl component="fieldset">
        <Typography sx={{ fontWeight: 950, mb: 1 }}>Final action</Typography>
        <RadioGroup
          value={formik.values.closeAction}
          onChange={(event) => formik.setFieldValue('closeAction', event.target.value)}
        >
          {TASK_CLOSE_ACTION_OPTIONS.map((option) => (
            <Card
              key={option.value}
              variant="outlined"
              sx={(theme) => ({
                borderRadius: 2.5,
                mb: 1,
                borderColor:
                  formik.values.closeAction === option.value
                    ? theme.palette.primary.main
                    : alpha(theme.palette.divider, 0.75),
                bgcolor:
                  formik.values.closeAction === option.value
                    ? alpha(theme.palette.primary.main, 0.045)
                    : theme.palette.background.paper,
              })}
            >
              <FormControlLabel
                value={option.value}
                control={<Radio />}
                disabled={loading}
                label={
                  <Box sx={{ py: 1 }}>
                    <Typography sx={{ fontWeight: 900 }}>{option.label}</Typography>
                    <Typography color="text.secondary" sx={{ fontSize: '0.84rem' }}>
                      {option.description}
                    </Typography>
                  </Box>
                }
                sx={{ alignItems: 'flex-start', width: '100%', m: 0, px: 1.5 }}
              />
            </Card>
          ))}
        </RadioGroup>
        <FormHelperText>
          Draft is the safe option when Excel import or staff assignment is not complete.
        </FormHelperText>
      </FormControl>

      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
        <Typography color="text.secondary" sx={{ fontSize: '0.84rem' }}>
          Current task status:
        </Typography>
        <EnumChip value={taskStatus || 'DRAFT'} config={INVENTORY_TASK_STATUS_CHIP_CONFIG} />
        {formik.values.staff.length > 0 && <Chip size="small" icon={<GroupAddRoundedIcon />} label={`${formik.values.staff.length} assigned`} />}
      </Stack>
    </Stack>
  );
}
