import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useFormik } from 'formik';
import { useQuery } from '@tanstack/react-query';

import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import KeyboardArrowLeftRoundedIcon from '@mui/icons-material/KeyboardArrowLeftRounded';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';

import { getInventoryTask } from '../../services/inventoryTaskService.js';
import { queryClient } from '../../services/queryClient.js';
import { queryKeys } from '../../services/queryKeys.js';
import { getTaskId, unwrapResponseData } from './utils/inventoryTaskMappers.js';
import { useBackgroundJobQuery } from '../../hooks/useBackgroundJobQuery.js';
import {
  getBackgroundJobErrorMessage,
  getBackgroundJobId,
  getBackgroundJobStatus,
  isBackgroundJobRunning,
  parseBackgroundJobResult,
  unwrapBackgroundJobResponse,
} from '../../services/backgroundJobUtils.js';
import { useCreateInventoryTaskMutation } from './hooks/useCreateInventoryTaskMutation.js';
import { useUploadVehicleInventoryExcelMutation } from './hooks/useUploadVehicleInventoryExcelMutation.js';
import { useVehicleInventoryItemsQuery } from './hooks/useVehicleInventoryItemsQuery.js';
import { useAssignInventoryTaskStaffMutation } from './hooks/useAssignInventoryTaskStaffMutation.js';
import {
  useMarkInventoryTaskReadyMutation,
  useStartInventoryTaskMutation,
} from './hooks/useInventoryTaskStatusMutation.js';
import {
  IMPORT_COMPLETED_STATUS,
  IMPORT_UPLOAD_STATUSES,
  buildCreatePayload,
  buildInitialValuesFromTask,
  getResumeStep,
  getTaskImportJobId,
  getTaskStatus,
  initialValues,
  steps,
  validationSchema,
} from './utils/createInventoryTaskDialogUtils.js';
import { DialogLoadingState } from './components/CreateInventoryTaskDialogParts.jsx';
import {
  InventoryTypeStep,
  StaffStatusStep,
  TaskInformationStep,
  UploadExcelStep,
  VehicleReviewImportStep,
} from './components/CreateInventoryTaskDialogSteps.jsx';

function CreateInventoryTaskDialog({ open, taskId: resumeTaskId = null, onClose }) {
  const uploadStepRef = useRef(null);
  const isResumeMode = Boolean(resumeTaskId);
  const [activeStep, setActiveStep] = useState(0);
  const [createdTask, setCreatedTask] = useState(null);
  const [hasSelectedUploadFile, setHasSelectedUploadFile] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [importJobId, setImportJobId] = useState(null);
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
      const source = unwrapBackgroundJobResponse(response) || {};
      const nextJobId = getBackgroundJobId(source);

      setUploadResult(null);
      setImportJobId(nextJobId);
      setImportPaginationModel((model) => ({ ...model, page: 0 }));
    },
  });

  const assignMutation = useAssignInventoryTaskStaffMutation();
  const readyMutation = useMarkInventoryTaskReadyMutation();
  const startMutation = useStartInventoryTaskMutation();

  const taskDetailsQuery = useQuery({
    queryKey: queryKeys.inventoryTasks.details(resumeTaskId),
    queryFn: () => getInventoryTask(resumeTaskId),
    enabled: open && isResumeMode,
    refetchInterval: (query) => {
      const status = getTaskStatus(unwrapResponseData(query.state.data));
      return IMPORT_UPLOAD_STATUSES.has(status) ? 3000 : false;
    },
    staleTime: 15 * 1000,
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: false,
    onSubmit: async () => {},
  });

  const taskDetails = useMemo(() => unwrapResponseData(taskDetailsQuery.data), [taskDetailsQuery.data]);
  const currentTask = taskDetails || createdTask;
  const taskId = getTaskId(currentTask);
  const taskStatus = getTaskStatus(currentTask);
  const isVehicleTask = formik.values.inventoryDomain === 'VEHICLE';
  const taskImportCompleted = taskStatus === IMPORT_COMPLETED_STATUS;
  const taskImportPending = taskStatus === 'IMPORT_PENDING';
  const taskImportInProgress = taskStatus === 'IMPORT_IN_PROGRESS';
  const taskImportFailed = taskStatus === 'IMPORT_FAILED';
  const taskImportRunning = taskImportPending || taskImportInProgress;

  const importJobQuery = useBackgroundJobQuery(importJobId, {
    enabled: open && isVehicleTask && Boolean(importJobId),
    intervalMs: 2000,
  });

  const importJob = useMemo(() => unwrapBackgroundJobResponse(importJobQuery.data), [importJobQuery.data]);
  const importJobStatus = getBackgroundJobStatus(importJob);
  const importJobRunning = isBackgroundJobRunning(importJobStatus);
  const importJobCompleted = importJobStatus === 'COMPLETED';
  const importJobFailed = importJobStatus === 'FAILED' || importJobStatus === 'CANCELLED';
  const importJobWaiting =
    Boolean(importJobId) &&
    !uploadResult &&
    !importJobFailed &&
    !taskImportCompleted &&
    !importJobQuery.isError;

  const importProcessing = taskImportRunning || importJobRunning || importJobWaiting;
  const closeBlocked =
    taskDetailsQuery.isLoading ||
    createMutation.isPending ||
    uploadMutation.isPending ||
    assignMutation.isPending ||
    readyMutation.isPending ||
    startMutation.isPending;
  const loading = closeBlocked || importProcessing;

  const mutationError =
    taskDetailsQuery.error?.message ||
    createMutation.error?.message ||
    uploadMutation.error?.message ||
    importJobQuery.error?.message ||
    assignMutation.error?.message ||
    readyMutation.error?.message ||
    startMutation.error?.message;

  const vehicleItemsQuery = useVehicleInventoryItemsQuery({
    taskId,
    page: importPaginationModel.page,
    size: importPaginationModel.pageSize,
    enabled: open && activeStep >= 3 && isVehicleTask && (Boolean(uploadResult) || taskImportCompleted),
  });

  const resetDialog = () => {
    setActiveStep(0);
    setCreatedTask(null);
    setHasSelectedUploadFile(false);
    setUploadResult(null);
    setImportJobId(null);
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
  }, [open, resumeTaskId]);

  useEffect(() => {
    if (!open || !taskDetails) {
      return;
    }

    const nextStatus = getTaskStatus(taskDetails);
    const nextImportJobId = getTaskImportJobId(taskDetails);

    setCreatedTask(taskDetails);
    setActiveStep(getResumeStep(nextStatus));
    setImportJobId(nextImportJobId);
    setLocalError(null);
    formik.resetForm({ values: buildInitialValuesFromTask(taskDetails) });

    if (nextStatus === IMPORT_COMPLETED_STATUS && !nextImportJobId) {
      setUploadResult(taskDetails);
    } else {
      setUploadResult(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, taskDetails]);

  useEffect(() => {
    if (!importJob || !importJobStatus) {
      return;
    }

    if (importJobCompleted) {
      const parsedResult = parseBackgroundJobResult(importJob) || importJob;
      setUploadResult(parsedResult);
      setLocalError(null);

      queryClient.invalidateQueries({ queryKey: queryKeys.inventoryTasks.all });

      if (taskId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.inventoryTasks.vehicleItemsAll(taskId),
          exact: false,
        });
      }
    }

    if (importJobFailed) {
      setUploadResult(null);
      setLocalError(getBackgroundJobErrorMessage(importJob) || 'Vehicle import background job failed.');
    }
  }, [importJob, importJobStatus, importJobCompleted, importJobFailed, taskId]);

  const handleClose = () => {
    if (closeBlocked) return;

    if (importProcessing) {
      const confirmed = window.confirm(
        'The import is still running in the background. You can close this dialog and continue later from the task list.',
      );

      if (!confirmed) return;

      onClose(true);
      return;
    }

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

  const handleUploadFile = async () => uploadStepRef.current?.uploadSelectedFile() ?? false;

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
      if (hasSelectedUploadFile) {
        const uploaded = await handleUploadFile();
        if (!uploaded) return;
        return;
      }

      if (taskImportCompleted) {
        setActiveStep(3);
        return;
      }

      if (uploadResult) {
        setActiveStep(3);
        return;
      }

      if (taskImportRunning || importJobRunning) {
        setLocalError('Please wait until the background import job is completed.');
        return;
      }

      if (taskImportFailed || importJobFailed) {
        const uploaded = await handleUploadFile();
        if (!uploaded) return;
        return;
      }

      if (importJobQuery.isError) {
        setLocalError(importJobQuery.error?.message || 'Could not track the background import job.');
        return;
      }

      if (!importJobId) {
        const uploaded = await handleUploadFile();
        if (!uploaded) return;
        return;
      }

      setLocalError('Waiting for the background import job result.');
      return;
    }

    if (activeStep === 3 && isVehicleTask && !uploadResult && !taskImportCompleted) {
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

  const resetImportSelection = () => {
    setUploadResult(null);
    setImportJobId(null);
    setImportPaginationModel((model) => ({ ...model, page: 0 }));
  };

  // UploadExcelStep owns the File object. The dialog only keeps workflow state
  // needed by later steps: job id, import result and pageable review reset.
  const handleUploadJobCreated = (response) => {
    const source = unwrapBackgroundJobResponse(response) || {};
    const nextJobId = getBackgroundJobId(source);

    if (!nextJobId) {
      setLocalError('Excel was uploaded, but the backend did not return a background job ID.');
      return false;
    }

    setImportJobId(nextJobId);
    setUploadResult(null);
    setHasSelectedUploadFile(false);

    if (taskId) {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventoryTasks.details(taskId) });
    }

    return true;
  };

  const renderStepContent = () => {
    if (activeStep === 0) {
      return <TaskInformationStep formik={formik} loading={loading} createdTask={createdTask} />;
    }

    if (activeStep === 1) {
      return (
        <InventoryTypeStep
          formik={formik}
          loading={loading}
          createdTask={createdTask}
          onDomainSelect={handleDomainSelect}
        />
      );
    }

    if (activeStep === 2) {
      return (
        <UploadExcelStep
          ref={uploadStepRef}
          createdTask={createdTask}
          importJobId={importJobId}
          importJobQuery={importJobQuery}
          isVehicleTask={isVehicleTask}
          loading={loading}
          // Keeps the footer button label/disabled state in sync without
          // moving the selected file out of the upload step.
          onFileStateChange={setHasSelectedUploadFile}
          onLocalError={setLocalError}
          onUploadJobCreated={handleUploadJobCreated}
          onUploadReset={resetImportSelection}
          taskImportCompleted={taskImportCompleted}
          taskImportFailed={taskImportFailed}
          taskImportRunning={taskImportRunning}
          taskId={taskId}
          taskStatus={taskStatus}
          uploadMutation={uploadMutation}
          uploadResult={uploadResult}
        />
      );
    }

    if (activeStep === 3) {
      return (
        <VehicleReviewImportStep
          createdTask={createdTask}
          formik={formik}
          importJobId={importJobId}
          importPaginationModel={importPaginationModel}
          setImportPaginationModel={setImportPaginationModel}
          taskImportCompleted={taskImportCompleted}
          uploadResult={uploadResult}
          vehicleItemsQuery={vehicleItemsQuery}
        />
      );
    }

    return <StaffStatusStep formik={formik} loading={loading} taskStatus={taskStatus} />;
  };

  const primaryButtonLabel = () => {
    if (activeStep === 1) return createdTask ? 'Continue' : 'Create Draft & Next';
    if (activeStep === 2 && isVehicleTask) {
      if (uploadMutation.isPending) return 'Uploading...';
      if (taskImportRunning || importJobRunning || importJobWaiting) return 'Processing Excel...';
      if (taskImportFailed || importJobFailed) return 'Upload Again';
      if (hasSelectedUploadFile) return 'Upload & Process';
      return uploadResult || taskImportCompleted ? 'Review Uploaded Records' : 'Upload & Process';
    }
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
    if (activeStep === 2 && isVehicleTask && (!uploadResult || hasSelectedUploadFile) && !taskImportRunning) return <CloudUploadRoundedIcon />;
    return <KeyboardArrowRightRoundedIcon />;
  };

  const primaryButtonDisabled =
    loading ||
    (activeStep === 2 &&
      isVehicleTask &&
      ((taskImportRunning && !taskImportCompleted) || (!hasSelectedUploadFile && !uploadResult && !taskImportCompleted)));
  const waitingForResumeDetails = isResumeMode && taskDetailsQuery.isLoading && !taskDetails;

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
                {isResumeMode ? 'Continue Inventory Task' : 'Create Inventory Task'}
              </Typography>
              <Typography color="text.secondary" sx={{ fontSize: '0.88rem' }}>
                {isResumeMode
                  ? 'Resume the saved task from its current workflow status.'
                  : 'Define the task, choose its domain, import planned records, then assign the team.'}
              </Typography>
            </Box>
          </Stack>

          <IconButton onClick={handleClose} disabled={closeBlocked}>
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: { xs: 2, sm: 3 }, bgcolor: (theme) => alpha(theme.palette.primary.main, 0.012) }}>
        {waitingForResumeDetails ? (
          <DialogLoadingState />
        ) : (
          <>
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
          </>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2.4, justifyContent: 'space-between', bgcolor: 'background.paper' }}>
        <Button onClick={handleClose} disabled={closeBlocked}>
          Close
        </Button>

        {!waitingForResumeDetails && (
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
        )}
      </DialogActions>
    </Dialog>
  );
}

export default CreateInventoryTaskDialog;
