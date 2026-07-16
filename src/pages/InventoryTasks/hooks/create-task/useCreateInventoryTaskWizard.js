import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getInventoryTask } from '../../../../services/inventoryTaskService.js';
import { queryKeys } from '../../../../services/queryKeys.js';
import { buildCreateTaskSteps } from '../../utils/createInventoryTaskSteps.js';
import {
  IMPORT_UPLOAD_STATUSES,
  getResumeStep,
  getTaskImportJobId,
  getTaskStatus,
} from '../../utils/createInventoryTaskDialogUtils.js';
import { getTaskId, unwrapResponseData } from '../../utils/inventoryTaskMappers.js';
import {
  buildTaskInformationValuesFromTask,
  initialTaskInformationValues,
} from '../../forms/create-task/taskInformationForm.js';

const DEFAULT_INVENTORY_DOMAIN = 'VEHICLE';
const DEFAULT_SUBTITLE = 'Define the task, choose its domain, import planned records, then assign the team.';

const buildDefaultNextButton = ({ isFinalStep = false } = {}) => ({
  label: isFinalStep ? 'Submit' : 'Next',
  disabled: false,
  loading: false,
  loadingLabel: 'Processing...',
  onClick: null,
  startIcon: null,
  endIcon: null,
});

export function useCreateInventoryTaskWizard({ open, taskId: resumeTaskId = null, onClose }) {
  const isResumeMode = Boolean(resumeTaskId);

  const [activeStep, setActiveStep] = useState(0);
  const [taskInformation, setTaskInformation] = useState(initialTaskInformationValues);
  const [inventoryDomain, setInventoryDomain] = useState(DEFAULT_INVENTORY_DOMAIN);
  const [createdTask, setCreatedTask] = useState(null);
  const [importJobId, setImportJobId] = useState(null);
  const [localError, setLocalError] = useState(null);
  const [finished, setFinished] = useState(false);
  const [subtitle, setSubtitle] = useState(DEFAULT_SUBTITLE);
  const [canClose, setCanClose] = useState(true);
  const [closeBlocked, setCloseBlocked] = useState(false);
  const [closeConfirmMessage, setCloseConfirmMessage] = useState(null);
  const [nextButton, setNextButtonState] = useState(() => buildDefaultNextButton());

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

  const taskDetails = useMemo(() => unwrapResponseData(taskDetailsQuery.data), [taskDetailsQuery.data]);
  // Prefer the locally refreshed response after a mutation. The details query may
  // still contain the previous server snapshot until its invalidation completes.
  const currentTask = createdTask || taskDetails;
  const taskId = getTaskId(currentTask);
  const taskStatus = getTaskStatus(currentTask);
  const assignmentOnlyMode = taskStatus === 'IN_PROGRESS' || taskStatus === 'PAUSED';
  const steps = useMemo(() => buildCreateTaskSteps({ inventoryDomain }), [inventoryDomain]);
  const currentStep = steps[activeStep] || steps[steps.length - 1] || steps[0];
  const isFinalStep = Boolean(currentStep?.final || activeStep === steps.length - 1);

  const resetStepControls = useCallback(() => {
    setSubtitle(currentStep?.subtitle || '');
    setCanClose(true);
    setCloseBlocked(false);
    setCloseConfirmMessage(null);
    setNextButtonState(buildDefaultNextButton({ isFinalStep }));
  }, [currentStep?.subtitle, isFinalStep]);

  const setStepConfig = useCallback(
    (config = {}) => {
      const {
        subtitle: nextSubtitle,
        canClose: nextCanClose,
        closeBlocked: nextCloseBlocked,
        closeConfirmMessage: nextCloseConfirmMessage,
        nextLabel,
        nextDisabled,
        nextLoading,
        nextLoadingLabel,
        onNext,
        nextStartIcon,
        nextEndIcon,
        label,
        disabled,
        loading,
        loadingLabel,
        onClick,
        startIcon,
        endIcon,
      } = config;

      if (nextSubtitle !== undefined) setSubtitle(nextSubtitle);
      if (nextCanClose !== undefined) setCanClose(nextCanClose);
      if (nextCloseBlocked !== undefined) setCloseBlocked(nextCloseBlocked);
      if (nextCloseConfirmMessage !== undefined) setCloseConfirmMessage(nextCloseConfirmMessage);

      setNextButtonState({
        ...buildDefaultNextButton({ isFinalStep }),
        label: nextLabel ?? label ?? buildDefaultNextButton({ isFinalStep }).label,
        disabled: nextDisabled ?? disabled ?? false,
        loading: nextLoading ?? loading ?? false,
        loadingLabel: nextLoadingLabel ?? loadingLabel ?? 'Processing...',
        onClick: onNext ?? onClick ?? null,
        startIcon: nextStartIcon ?? startIcon ?? null,
        endIcon: nextEndIcon ?? endIcon ?? null,
      });
    },
    [isFinalStep],
  );


  const clearError = useCallback(() => setLocalError(null), []);

  const goNext = useCallback(() => {
    setLocalError(null);
    setActiveStep((step) => Math.min(step + 1, Math.max(steps.length - 1, 0)));
  }, [steps.length]);

  const goBack = useCallback(() => {
    setLocalError(null);
    setActiveStep((step) => Math.max(0, step - 1));
  }, []);

  const resetImportWorkflow = useCallback(() => {
    setImportJobId(null);
  }, []);

  const markFinished = useCallback(() => setFinished(true), []);

  const close = useCallback(
    (shouldRefresh = Boolean(createdTask)) => {
      onClose?.(shouldRefresh);
    },
    [createdTask, onClose],
  );

  const handleClose = useCallback(() => {
    if (!canClose || closeBlocked || taskDetailsQuery.isLoading) return;

    if (closeConfirmMessage) {
      const confirmed = window.confirm(closeConfirmMessage);
      if (!confirmed) return;
      close(Boolean(createdTask));
      return;
    }

    if (createdTask && !finished) {
      const confirmed = window.confirm(
        'The task has already been saved as Draft. Close the dialog and continue it later from the task list?',
      );

      if (!confirmed) return;
    }

    close(Boolean(createdTask));
  }, [canClose, close, closeBlocked, closeConfirmMessage, createdTask, finished, taskDetailsQuery.isLoading]);

  const handleNext = useCallback(async () => {
    if (nextButton.disabled || nextButton.loading) return;

    setLocalError(null);

    if (nextButton.onClick) {
      await nextButton.onClick();
      return;
    }

    goNext();
  }, [goNext, nextButton]);

  const resetDialog = useCallback(() => {
    setActiveStep(0);
    setTaskInformation(initialTaskInformationValues);
    setInventoryDomain(DEFAULT_INVENTORY_DOMAIN);
    setCreatedTask(null);
    setImportJobId(null);
    setLocalError(null);
    setFinished(false);
    setSubtitle(DEFAULT_SUBTITLE);
    setCanClose(true);
    setCloseBlocked(false);
    setCloseConfirmMessage(null);
    setNextButtonState(buildDefaultNextButton());
  }, []);

  useEffect(() => {
    if (open) {
      resetDialog();
    }
  }, [open, resetDialog, resumeTaskId]);

  useEffect(() => {
    if (!open || !taskDetails) return;

    const nextStatus = getTaskStatus(taskDetails);
    const nextInventoryDomain = taskDetails.inventoryDomain || DEFAULT_INVENTORY_DOMAIN;
    const nextImportJobId = getTaskImportJobId(taskDetails);

    setCreatedTask(taskDetails);
    setTaskInformation(buildTaskInformationValuesFromTask(taskDetails));
    setInventoryDomain(nextInventoryDomain);
    setActiveStep(getResumeStep(nextStatus));
    setImportJobId(nextImportJobId);
    setLocalError(null);
  }, [open, taskDetails]);

  useEffect(() => {
    if (steps.length > 0 && activeStep > steps.length - 1) {
      setActiveStep(steps.length - 1);
    }
  }, [activeStep, steps.length]);

  useEffect(() => {
    resetStepControls();
  }, [activeStep, resetStepControls]);

  const error = localError || taskDetailsQuery.error?.message || null;
  const waitingForResumeDetails = isResumeMode && taskDetailsQuery.isLoading && !taskDetails;

  return {
    title: assignmentOnlyMode
      ? 'Manage Task Assignments'
      : isResumeMode
        ? 'Continue Inventory Task'
        : 'Create Inventory Task',
    subtitle,
    setSubtitle,

    activeStep,
    steps,
    currentStep,
    isFinalStep,
    canBack: activeStep > 0 && !assignmentOnlyMode,
    goBack,
    goNext,

    taskInformation,
    setTaskInformation,
    inventoryDomain,
    setInventoryDomain,
    createdTask,
    setCreatedTask,
    currentTask,
    taskId,
    taskStatus,
    assignmentOnlyMode,

    importJobId,
    setImportJobId,
    resetImportWorkflow,

    error,
    localError,
    setLocalError,
    clearError,

    canClose,
    setCanClose,
    closeBlocked,
    setCloseBlocked,
    closeConfirmMessage,
    setCloseConfirmMessage,
    handleClose,
    close,
    markFinished,
    finished,

    nextLabel: nextButton.label,
    nextDisabled: nextButton.disabled,
    nextLoading: nextButton.loading,
    nextLoadingLabel: nextButton.loadingLabel,
    nextStartIcon: nextButton.startIcon,
    nextEndIcon: nextButton.endIcon,
    stepConfig: {
      subtitle,
      canClose,
      closeBlocked,
      closeConfirmMessage,
      nextLabel: nextButton.label,
      nextDisabled: nextButton.disabled,
      nextLoading: nextButton.loading,
      nextLoadingLabel: nextButton.loadingLabel,
      nextStartIcon: nextButton.startIcon,
      nextEndIcon: nextButton.endIcon,
      onNext: nextButton.onClick,
    },
    setStepConfig,
    resetStepControls,
    handleNext,

    taskDetailsQuery,
    waitingForResumeDetails,
  };
}
