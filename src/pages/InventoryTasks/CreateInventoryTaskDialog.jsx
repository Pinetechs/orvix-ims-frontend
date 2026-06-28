import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  IconButton,
  LinearProgress,
  Radio,
  RadioGroup,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import DirectionsCarFilledRoundedIcon from '@mui/icons-material/DirectionsCarFilledRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import GroupAddRoundedIcon from '@mui/icons-material/GroupAddRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import KeyboardArrowLeftRoundedIcon from '@mui/icons-material/KeyboardArrowLeftRounded';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import TableRowsRoundedIcon from '@mui/icons-material/TableRowsRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import WarehouseRoundedIcon from '@mui/icons-material/WarehouseRounded';

import FormikAsyncAutocomplete from '../../components/form/FormikAsyncAutocomplete.jsx';
import FormikTextField from '../../components/form/FormikTextField.jsx';
import EnumChip from '../../components/common/EnumChip.jsx';
import {
  INVENTORY_DOMAIN_CHIP_CONFIG,
  INVENTORY_TASK_STATUS_CHIP_CONFIG,
} from '../../constants/enumChipConfigs.jsx';
import { getCompanies } from '../../services/companyService.js';
import { getUsers } from '../../services/userService.js';
import { queryKeys } from '../../services/queryKeys.js';
import { TASK_CLOSE_ACTION_OPTIONS } from './constants/inventoryTaskOptions.js';
import {
  getImportSummary,
  getTaskId,
  getTaskNumber,
  getVehicleImportLocations,
  getVehicleImportRows,
  getVehicleImportStoreNos,
  getVehicleImportTotalElements,
  unwrapResponseData,
} from './utils/inventoryTaskMappers.js';
import { useCreateInventoryTaskMutation } from './hooks/useCreateInventoryTaskMutation.js';
import { useUploadVehicleInventoryExcelMutation } from './hooks/useUploadVehicleInventoryExcelMutation.js';
import { useVehicleInventoryItemsQuery } from './hooks/useVehicleInventoryItemsQuery.js';
import { useAssignInventoryTaskStaffMutation } from './hooks/useAssignInventoryTaskStaffMutation.js';
import {
  useMarkInventoryTaskReadyMutation,
  useStartInventoryTaskMutation,
} from './hooks/useInventoryTaskStatusMutation.js';

const steps = ['Task information', 'Inventory type', 'Upload Excel', 'Review', 'Staff & status'];

const inventoryDomainCards = [
  {
    value: 'VEHICLE',
    title: 'Vehicle Inventory',
    subtitle: 'VIN based inventory count for vehicle stock and store locations.',
    icon: DirectionsCarFilledRoundedIcon,
    accent: 'primary',
    note: 'Excel import enabled',
  },
  {
    value: 'SPARE_PART',
    title: 'Spare Parts',
    subtitle: 'Warehouse and rack based inventory for parts stock counts.',
    icon: Inventory2RoundedIcon,
    accent: 'warning',
    note: 'Can be saved as Draft',
  },
  {
    value: 'ASSET',
    title: 'Assets',
    subtitle: 'Fixed asset inventory by branch, department or physical location.',
    icon: WarehouseRoundedIcon,
    accent: 'success',
    note: 'Can be saved as Draft',
  },
];

const initialValues = {
  taskName: '',
  description: '',
  company: null,
  inventoryDomain: 'VEHICLE',
  staff: [],
  closeAction: 'DRAFT',
};

const validationSchema = Yup.object({
  taskName: Yup.string()
    .trim()
    .required('Task name is required.')
    .max(150, 'Task name must be 150 characters or less.'),
  description: Yup.string().trim().max(500, 'Description must be 500 characters or less.'),
  company: Yup.object().nullable().required('Company is required.'),
  inventoryDomain: Yup.string().required('Inventory domain is required.'),
  staff: Yup.array(),
  closeAction: Yup.string().required('Final action is required.'),
});

const getCompanyLabel = (company = {}) => {
  if (!company) return '';
  return company.name || company.companyName || company.nameEn || company.code || '';
};

const getUserLabel = (user = {}) => {
  if (!user) return '';
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
  return fullName || user.name || user.username || user.email || '';
};

const buildCreatePayload = (values) => ({
  taskName: values.taskName.trim(),
  name: values.taskName.trim(),
  description: values.description.trim(),
  companyId: values.company?.id ?? values.company?.companyId,
  inventoryDomain: values.inventoryDomain,
});

function SummaryItem({ label, value }) {
  return (
    <Box>
      <Typography color="text.secondary" sx={{ fontSize: '0.78rem', fontWeight: 750, mb: 0.35 }}>
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 900, overflowWrap: 'anywhere' }}>{value || '-'}</Typography>
    </Box>
  );
}



function ImportMetricCard({ icon, label, value, helper }) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
      <CardContent sx={{ p: 1.8, '&:last-child': { pb: 1.8 } }}>
        <Stack direction="row" spacing={1.2} alignItems="center">
          <Box
            sx={(theme) => ({
              width: 38,
              height: 38,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              color: theme.palette.primary.main,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              flex: '0 0 auto',
            })}
          >
            {icon}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography color="text.secondary" sx={{ fontSize: '0.74rem', fontWeight: 800 }}>
              {label}
            </Typography>
            <Typography sx={{ fontSize: '1.2rem', fontWeight: 950, lineHeight: 1.25 }}>{value ?? 0}</Typography>
            {helper && (
              <Typography color="text.secondary" sx={{ fontSize: '0.72rem' }} noWrap>
                {helper}
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function ValueChipGroup({ title, values = [], emptyText }) {
  const visibleValues = values.slice(0, 8);
  const hiddenCount = Math.max(values.length - visibleValues.length, 0);

  return (
    <Box>
      <Typography sx={{ fontWeight: 900, mb: 1 }}>{title}</Typography>
      {values.length > 0 ? (
        <Stack direction="row" spacing={0.8} useFlexGap flexWrap="wrap">
          {visibleValues.map((value) => (
            <Chip key={value} label={value} size="small" variant="outlined" sx={{ fontWeight: 750 }} />
          ))}
          {hiddenCount > 0 && <Chip label={`+${hiddenCount} more`} size="small" />}
        </Stack>
      ) : (
        <Typography color="text.secondary" sx={{ fontSize: '0.84rem' }}>
          {emptyText}
        </Typography>
      )}
    </Box>
  );
}

const getImportRowId = (row, index) => row.id ?? row.vehicleInventoryItemId ?? row.vin ?? row.VIN ?? `row-${index}`;

const importPreviewColumns = [
  {
    field: 'vin',
    headerName: 'VIN',
    minWidth: 190,
    flex: 1.3,
    valueGetter: ({ row }) => row.vin || row.VIN || row.chassisNo || '-',
  },
  {
    field: 'make',
    headerName: 'Make',
    minWidth: 120,
    flex: 0.8,
    valueGetter: ({ row }) => row.make || row.MAKE || '-',
  },
  {
    field: 'model',
    headerName: 'Model',
    minWidth: 120,
    flex: 0.8,
    valueGetter: ({ row }) => row.model || row.MODEL || '-',
  },
  {
    field: 'year',
    headerName: 'Year',
    minWidth: 90,
    flex: 0.5,
    valueGetter: ({ row }) => row.year || row.YEAR || '-',
  },
  {
    field: 'color',
    headerName: 'Color',
    minWidth: 110,
    flex: 0.7,
    valueGetter: ({ row }) => row.color || row.COLOR || '-',
  },
  {
    field: 'storeNo',
    headerName: 'ST_STORE_NO',
    minWidth: 130,
    flex: 0.8,
    valueGetter: ({ row }) => row.storeNo || row.stStoreNo || row.ST_STORE_NO || row.storeNumber || '-',
  },
  {
    field: 'locationName',
    headerName: 'LOCATION',
    minWidth: 160,
    flex: 1,
    valueGetter: ({ row }) => row.locationName || row.location || row.LOCATION || row.storeLocation || '-',
  },
];

function StepHeader({ icon, title, description }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.2 }}>
      <Box
        sx={(theme) => ({
          width: 44,
          height: 44,
          borderRadius: 2.5,
          display: 'grid',
          placeItems: 'center',
          color: theme.palette.primary.main,
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          flex: '0 0 auto',
        })}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: '1.05rem', fontWeight: 950 }}>{title}</Typography>
        <Typography color="text.secondary" sx={{ fontSize: '0.88rem' }}>
          {description}
        </Typography>
      </Box>
    </Stack>
  );
}

function InventoryDomainCard({ option, selected, disabled, onSelect }) {
  const Icon = option.icon;

  return (
    <Card
      variant="outlined"
      sx={(theme) => ({
        height: '100%',
        borderRadius: 3,
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? theme.palette[option.accent].main : alpha(theme.palette.divider, 0.85),
        bgcolor: selected ? alpha(theme.palette[option.accent].main, 0.055) : theme.palette.background.paper,
        boxShadow: selected ? `0 18px 35px ${alpha(theme.palette[option.accent].main, 0.14)}` : 'none',
        transition: 'all 160ms ease',
        opacity: disabled ? 0.72 : 1,
      })}
    >
      <CardActionArea disabled={disabled} onClick={() => onSelect(option.value)} sx={{ height: '100%', p: 2.1 }}>
        <Stack spacing={1.5} sx={{ height: '100%' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5}>
            <Box
              sx={(theme) => ({
                width: 52,
                height: 52,
                borderRadius: 3,
                display: 'grid',
                placeItems: 'center',
                color: theme.palette[option.accent].main,
                bgcolor: alpha(theme.palette[option.accent].main, 0.12),
              })}
            >
              <Icon />
            </Box>

            {selected && (
              <CheckCircleRoundedIcon
                sx={(theme) => ({
                  color: theme.palette[option.accent].main,
                })}
              />
            )}
          </Stack>

          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 950, mb: 0.5 }}>{option.title}</Typography>
            <Typography color="text.secondary" sx={{ fontSize: '0.86rem', lineHeight: 1.5 }}>
              {option.subtitle}
            </Typography>
          </Box>

          <Chip
            size="small"
            label={option.note}
            sx={(theme) => ({
              alignSelf: 'flex-start',
              fontWeight: 800,
              color: theme.palette[option.accent].dark,
              bgcolor: alpha(theme.palette[option.accent].main, 0.11),
            })}
          />
        </Stack>
      </CardActionArea>
    </Card>
  );
}

function CreateInventoryTaskDialog({ open, onClose }) {
  const fileInputRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);
  const [createdTask, setCreatedTask] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [importPaginationModel, setImportPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [localError, setLocalError] = useState(null);
  const [finished, setFinished] = useState(false);

  const createMutation = useCreateInventoryTaskMutation({
    onSuccess: (response) => {
      setCreatedTask(unwrapResponseData(response));
    },
  });

  const uploadMutation = useUploadVehicleInventoryExcelMutation({
    onSuccess: (response) => {
      setUploadResult(response);
      setImportPaginationModel((model) => ({ ...model, page: 0 }));
    },
  });

  const assignMutation = useAssignInventoryTaskStaffMutation();
  const readyMutation = useMarkInventoryTaskReadyMutation();
  const startMutation = useStartInventoryTaskMutation();

  const loading =
    createMutation.isPending ||
    uploadMutation.isPending ||
    assignMutation.isPending ||
    readyMutation.isPending ||
    startMutation.isPending;

  const mutationError =
    createMutation.error?.message ||
    uploadMutation.error?.message ||
    assignMutation.error?.message ||
    readyMutation.error?.message ||
    startMutation.error?.message;

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: false,
    onSubmit: async () => {},
  });

  const taskId = getTaskId(createdTask);
  const isVehicleTask = formik.values.inventoryDomain === 'VEHICLE';
  const importSummary = useMemo(() => getImportSummary(uploadResult), [uploadResult]);

  const vehicleItemsQuery = useVehicleInventoryItemsQuery({
    taskId,
    page: importPaginationModel.page,
    size: importPaginationModel.pageSize,
    enabled: open && activeStep >= 3 && isVehicleTask && Boolean(uploadResult),
  });

  const importRows = useMemo(() => getVehicleImportRows(vehicleItemsQuery.data), [vehicleItemsQuery.data]);
  const importGridRows = useMemo(
    () => importRows.map((row, index) => ({ ...row, __rowId: getImportRowId(row, index) })),
    [importRows],
  );
  const importTotalElements = useMemo(() => {
    const pageableTotal = getVehicleImportTotalElements(vehicleItemsQuery.data);
    return pageableTotal || importSummary.savedRecords || importSummary.plannedRecords || 0;
  }, [vehicleItemsQuery.data, importSummary.plannedRecords, importSummary.savedRecords]);
  const importLocations = useMemo(() => getVehicleImportLocations(uploadResult), [uploadResult]);
  const importStoreNos = useMemo(() => getVehicleImportStoreNos(uploadResult), [uploadResult]);

  const resetDialog = () => {
    setActiveStep(0);
    setCreatedTask(null);
    setSelectedFile(null);
    setUploadResult(null);
    setImportPaginationModel({ page: 0, pageSize: 10 });
    setLocalError(null);
    setFinished(false);
    formik.resetForm({ values: initialValues });
  };

  useEffect(() => {
    if (open) {
      resetDialog();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleClose = () => {
    if (loading) return;

    if (createdTask && !finished) {
      const confirmed = window.confirm(
        'The task has already been saved as Draft. Close the dialog and continue it later from the task list?',
      );

      if (!confirmed) return;
    }

    onClose(Boolean(createdTask));
  };

  const validateTaskInformationStep = async () => {
    const errors = await formik.validateForm();
    formik.setTouched({
      taskName: true,
      company: true,
      description: Boolean(errors.description),
    });

    return !errors.taskName && !errors.company && !errors.description;
  };

  const validateInventoryTypeStep = async () => {
    const errors = await formik.validateForm();
    formik.setTouched({
      ...formik.touched,
      inventoryDomain: true,
    });

    return !errors.inventoryDomain;
  };

  const createDraftIfNeeded = async () => {
    if (!createdTask) {
      await createMutation.mutateAsync(buildCreatePayload(formik.values));
    }
  };

  const handleUploadFile = async () => {
    setLocalError(null);

    if (!selectedFile) {
      setLocalError('Please select an Excel file first.');
      return false;
    }

    if (!taskId) {
      setLocalError('Draft task was not created yet. Please go back and create the draft first.');
      return false;
    }

    try {
      await uploadMutation.mutateAsync({ taskId, file: selectedFile });
      return true;
    } catch {
      return false;
    }
  };

  const handleFinalSubmit = async () => {
    setLocalError(null);

    if (!taskId) {
      setLocalError('Draft task was not created yet.');
      return;
    }

    const userIds = formik.values.staff
      .map((user) => user?.id ?? user?.userId)
      .filter(Boolean);

    if (formik.values.closeAction !== 'DRAFT' && userIds.length === 0) {
      formik.setFieldTouched('staff', true);
      setLocalError('Please assign at least one inventory staff member before moving the task forward.');
      return;
    }

    if (userIds.length > 0) {
      await assignMutation.mutateAsync({ taskId, userIds });
    }

    if (formik.values.closeAction === 'READY_TO_START') {
      await readyMutation.mutateAsync({ taskId });
    }

    if (formik.values.closeAction === 'START_NOW') {
      await startMutation.mutateAsync({ taskId });
    }

    setFinished(true);
    onClose(true);
  };

  const handleNext = async () => {
    setLocalError(null);

    if (activeStep === 0) {
      const valid = await validateTaskInformationStep();
      if (!valid) return;
      setActiveStep(1);
      return;
    }

    if (activeStep === 1) {
      const valid = await validateInventoryTypeStep();
      if (!valid) return;
      await createDraftIfNeeded();
      setActiveStep(2);
      return;
    }

    if (activeStep === 2 && isVehicleTask) {
      if (!uploadResult) {
        const uploaded = await handleUploadFile();
        if (!uploaded) return;
      }
      setActiveStep(3);
      return;
    }

    if (activeStep === 3 && isVehicleTask && !uploadResult) {
      setLocalError('Please upload and validate the vehicle Excel file before continuing.');
      return;
    }

    if (activeStep < steps.length - 1) {
      setActiveStep((step) => step + 1);
    }
  };

  const handleBack = () => {
    setLocalError(null);
    setActiveStep((step) => Math.max(0, step - 1));
  };

  const handleDomainSelect = (value) => {
    if (loading || createdTask) return;
    formik.setFieldValue('inventoryDomain', value);
    formik.setFieldTouched('inventoryDomain', true, false);
  };

  const renderTaskInformationStep = () => (
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
        queryKey={queryKeys.companies.autocomplete({ active: true })}
        queryFn={getCompanies}
        disabled={loading || Boolean(createdTask)}
        extraParams={{ active: true, size: 20 }}
        optionLabelKeys={['name', 'code']}
        getOptionLabel={getCompanyLabel}
        helperText="Select the company that owns this inventory task."
      />

      {createdTask && (
        <Alert severity="info">
          This draft has already been created. Basic information is locked in this wizard.
        </Alert>
      )}
    </Stack>
  );

  const renderInventoryTypeStep = () => (
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
            onSelect={handleDomainSelect}
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

  const renderUploadStep = () => (
    <Stack spacing={2.2}>
      <StepHeader
        icon={<CloudUploadRoundedIcon />}
        title="Upload vehicle Excel"
        description="Select the Excel file now. When you click Next, the file will be uploaded to the backend for VIN duplicate and format validation."
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
          <Alert severity="info" icon={<ErrorOutlineRoundedIcon />}>
            On Next, the backend validates the Excel file. If duplicate VIN values or invalid rows are found, the wizard stays here and shows the backend error. If the file is valid, the next step shows LOCATION, ST_STORE_NO and the imported records preview.
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
                    Expected columns include VIN, make, model, year, color, ST_STORE_NO and LOCATION. The actual import will happen when you click Next.
                  </Typography>
                </Box>

                <input
                  ref={fileInputRef}
                  hidden
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(event) => {
                    setUploadResult(null);
                    setImportPaginationModel((model) => ({ ...model, page: 0 }));
                    setSelectedFile(event.target.files?.[0] || null);
                  }}
                />

                <Button
                  variant="outlined"
                  startIcon={<InsertDriveFileOutlinedIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                >
                  {selectedFile ? 'Change Excel File' : 'Select Excel File'}
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

              <IconButton
                size="small"
                onClick={() => {
                  setSelectedFile(null);
                  setUploadResult(null);
                  setImportPaginationModel((model) => ({ ...model, page: 0 }));
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                disabled={loading}
              >
                <DeleteOutlineRoundedIcon fontSize="small" />
              </IconButton>
            </Stack>
          )}

          {uploadMutation.isPending && (
            <Stack spacing={1}>
              <LinearProgress />
              <Typography color="text.secondary" sx={{ fontSize: '0.84rem' }}>
                Uploading and validating Excel file...
              </Typography>
            </Stack>
          )}

          {uploadResult && (
            <Alert severity="success">
              Excel validated successfully. Click Next to load the pageable uploaded records from the backend.
            </Alert>
          )}
        </>
      )}
    </Stack>
  );

  const renderReviewStep = () => (
    <Stack spacing={2.2}>
      <StepHeader
        icon={<AssignmentRoundedIcon />}
        title="Review vehicle import"
        description="Review the import summary from the upload API and the pageable uploaded records from the second API. You can go Back to upload another file."
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
          gap: 1.6,
        }}
      >
        <SummaryItem label="Task Name" value={formik.values.taskName} />
        <SummaryItem label="Task Number" value={getTaskNumber(createdTask)} />
        <SummaryItem label="Company" value={getCompanyLabel(formik.values.company)} />
        <Box>
          <Typography color="text.secondary" sx={{ fontSize: '0.78rem', fontWeight: 750, mb: 0.35 }}>
            Inventory Type
          </Typography>
          <EnumChip value={formik.values.inventoryDomain} config={INVENTORY_DOMAIN_CHIP_CONFIG} />
        </Box>
      </Box>

      <SummaryItem label="Description" value={formik.values.description || '-'} />

      <Divider />

      {vehicleItemsQuery.error && (
        <Alert severity="error">
          {vehicleItemsQuery.error?.message || 'Could not load pageable uploaded vehicle records.'}
        </Alert>
      )}

      {uploadResult ? (
        <Stack spacing={2}>
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

          <Box>
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography sx={{ fontWeight: 950 }}>Uploaded vehicle records</Typography>
              <Chip size="small" label={`${importTotalElements} total`} />
            </Stack>

            <Box sx={{ width: '100%', minHeight: 360 }}>
              <DataGrid
                autoHeight
                rows={importGridRows}
                columns={importPreviewColumns}
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
          </Box>
        </Stack>
      ) : (
        <Alert severity="warning">
          No valid Excel import result is available yet. Go back, select the vehicle Excel file, then click Next to upload and validate it.
        </Alert>
      )}
    </Stack>
  );

  const renderStaffStep = () => (
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
        <EnumChip value="DRAFT" config={INVENTORY_TASK_STATUS_CHIP_CONFIG} />
        {formik.values.staff.length > 0 && <Chip size="small" icon={<GroupAddRoundedIcon />} label={`${formik.values.staff.length} assigned`} />}
      </Stack>
    </Stack>
  );

  const renderStepContent = () => {
    if (activeStep === 0) return renderTaskInformationStep();
    if (activeStep === 1) return renderInventoryTypeStep();
    if (activeStep === 2) return renderUploadStep();
    if (activeStep === 3) return renderReviewStep();
    return renderStaffStep();
  };

  const primaryButtonLabel = () => {
    if (activeStep === 1) return createdTask ? 'Continue' : 'Create Draft & Next';
    if (activeStep === 2 && isVehicleTask) return uploadResult ? 'Review Uploaded Records' : 'Upload & Review';
    if (activeStep === 3) return 'Continue to Staff';
    if (activeStep === steps.length - 1) {
      if (formik.values.closeAction === 'START_NOW') return 'Start Task';
      if (formik.values.closeAction === 'READY_TO_START') return 'Mark Ready';
      return 'Save Draft';
    }
    return 'Next';
  };

  const primaryButtonIcon = () => {
    if (activeStep === steps.length - 1) {
      if (formik.values.closeAction === 'START_NOW') return <PlayArrowRoundedIcon />;
      if (formik.values.closeAction === 'READY_TO_START') return <AssignmentRoundedIcon />;
      return <SaveRoundedIcon />;
    }

    if (activeStep === 1 && !createdTask) return <SaveRoundedIcon />;
    if (activeStep === 2 && isVehicleTask && !uploadResult) return <CloudUploadRoundedIcon />;
    return <KeyboardArrowRightRoundedIcon />;
  };

  const primaryButtonDisabled = loading || (activeStep === 2 && isVehicleTask && !selectedFile && !uploadResult);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 4 },
          minHeight: { xs: '100%', sm: 700 },
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle
        sx={(theme) => ({
          p: 0,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.14)}, ${alpha(
            theme.palette.secondary.main,
            0.08,
          )})`,
        })}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ p: 3 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
            <Box
              sx={(theme) => ({
                width: 50,
                height: 50,
                borderRadius: 3,
                display: 'grid',
                placeItems: 'center',
                color: theme.palette.primary.main,
                bgcolor: alpha(theme.palette.primary.main, 0.12),
              })}
            >
              <AssignmentRoundedIcon />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: '1.35rem', fontWeight: 950, lineHeight: 1.2 }} noWrap>
                Create Inventory Task
              </Typography>
              <Typography color="text.secondary" sx={{ fontSize: '0.88rem' }}>
                Define the task, choose its domain, import planned records, then assign the team.
              </Typography>
            </Box>
          </Stack>

          <IconButton onClick={handleClose} disabled={loading}>
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: { xs: 2, sm: 3 }, bgcolor: (theme) => alpha(theme.palette.primary.main, 0.012) }}>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {(localError || mutationError) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {localError || mutationError}
          </Alert>
        )}

        <Card
          elevation={0}
          sx={(theme) => ({
            borderRadius: 3.5,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            boxShadow: `0 18px 45px ${alpha(theme.palette.common.black, 0.045)}`,
          })}
        >
          <CardContent sx={{ p: { xs: 2, sm: 2.6 } }}>{renderStepContent()}</CardContent>
        </Card>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2.4, justifyContent: 'space-between', bgcolor: 'background.paper' }}>
        <Button onClick={handleClose} disabled={loading}>
          Close
        </Button>

        <Stack direction="row" spacing={1.2}>
          <Button
            variant="outlined"
            startIcon={<KeyboardArrowLeftRoundedIcon />}
            onClick={handleBack}
            disabled={loading || activeStep === 0}
          >
            Back
          </Button>

          <Button
            variant="contained"
            endIcon={activeStep < steps.length - 1 ? primaryButtonIcon() : null}
            startIcon={activeStep === steps.length - 1 ? primaryButtonIcon() : null}
            onClick={activeStep === steps.length - 1 ? handleFinalSubmit : handleNext}
            disabled={primaryButtonDisabled}
          >
            {loading ? 'Processing...' : primaryButtonLabel()}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}

export default CreateInventoryTaskDialog;
