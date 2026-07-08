import React, { useEffect, useMemo, useRef, useState } from 'react';

import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';

import { useBackgroundJobQuery } from '../../../../../hooks/useBackgroundJobQuery.js';
import { queryClient } from '../../../../../services/queryClient.js';
import { queryKeys } from '../../../../../services/queryKeys.js';
import {
  isBackgroundJobRunning,
  parseBackgroundJobResult,
} from '../../../../../services/backgroundJobUtils.js';
import { useUploadSparePartInventoryExcelMutation } from '../../useUploadSparePartInventoryExcelMutation.js';
import { IMPORT_COMPLETED_STATUS } from '../../../utils/createInventoryTaskDialogUtils.js';

export function useSparePartUploadExcelStep({ wizard }) {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);

  const uploadMutation = useUploadSparePartInventoryExcelMutation();

  const importJobQuery = useBackgroundJobQuery(wizard.importJobId, {
    enabled: Boolean(wizard.importJobId),
    intervalMs: 2000,
  });

  const importJob = useMemo(() => importJobQuery.data, [importJobQuery.data]);
  const importJobStatus = importJob?.status;
  const importJobRunning = isBackgroundJobRunning(importJobStatus);
  const importJobCompleted = importJobStatus === 'COMPLETED';
  const importJobFailed = importJobStatus === 'FAILED' || importJobStatus === 'CANCELLED';

  const taskImportCompleted = wizard.taskStatus === IMPORT_COMPLETED_STATUS;
  const taskImportRunning = wizard.taskStatus === 'IMPORT_PENDING' || wizard.taskStatus === 'IMPORT_IN_PROGRESS';
  const taskImportFailed = wizard.taskStatus === 'IMPORT_FAILED';

  const importJobWaiting =
    Boolean(wizard.importJobId) &&
    !importJobFailed &&
    !uploadResult &&
    !taskImportCompleted &&
    !importJobQuery.isError;

  const importProcessing = taskImportRunning || importJobRunning || importJobWaiting;

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setUploadResult(null);
    wizard.resetImportWorkflow();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (event) => {
    const nextFile = event.target.files?.[0] || null;
    setSelectedFile(nextFile);
    setUploadResult(null);
    wizard.resetImportWorkflow();
    wizard.clearError();
  };

  const uploadSelectedFile = async () => {
    wizard.clearError();

    if (!selectedFile) {
      wizard.setLocalError('Please select an Excel file first.');
      return false;
    }

    if (!wizard.taskId) {
      wizard.setLocalError('Draft task was not created yet. Please go back and create the draft first.');
      return false;
    }

    try {
      const response = await uploadMutation.mutateAsync({ taskId: wizard.taskId, file: selectedFile });
      const nextJobId = response?.jobId ?? response?.data?.jobId ?? response?.result?.jobId;

      if (!nextJobId) {
        wizard.setLocalError('Excel was uploaded, but the backend did not return a background job ID.');
        return false;
      }

      wizard.setImportJobId(nextJobId);
      setUploadResult(null);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      queryClient.invalidateQueries({ queryKey: queryKeys.inventoryTasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventoryTasks.details(wizard.taskId) });
      return true;
    } catch (error) {
      wizard.setLocalError(error.message || 'Could not upload spare part inventory Excel file.');
      return false;
    }
  };

  const handleNext = async () => {
    wizard.clearError();

    if (selectedFile) {
      await uploadSelectedFile();
      return;
    }

    if (uploadResult || taskImportCompleted) {
      wizard.goNext();
      return;
    }

    if (taskImportRunning || importJobRunning || importJobWaiting) {
      wizard.setLocalError('Please wait until the background import job is completed.');
      return;
    }

    if (taskImportFailed || importJobFailed) {
      wizard.setLocalError('The previous import failed. Select a valid Excel file and upload it again.');
      return;
    }

    wizard.setLocalError('Please select an Excel file first.');
  };

  useEffect(() => {
    if (!importJob || !importJobStatus) return;

    const parsedResult = parseBackgroundJobResult(importJob) || importJob;

    if (importJobCompleted) {
      setUploadResult(parsedResult);
      wizard.setCreatedTask((previousTask) => (previousTask ? { ...previousTask, status: 'IMPORT_COMPLETED' } : previousTask));
      wizard.setLocalError(null);

      queryClient.invalidateQueries({ queryKey: queryKeys.inventoryTasks.all });

      if (wizard.taskId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.sparePartInventory.sparePartItemsAll(wizard.taskId),
          exact: false,
        });
        queryClient.invalidateQueries({ queryKey: queryKeys.sparePartInventory.sparePartBranches(wizard.taskId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.sparePartInventory.sparePartBrands(wizard.taskId) });
      }
    }

    if (importJobFailed) {
      setUploadResult(null);
      wizard.setCreatedTask((previousTask) => (previousTask ? { ...previousTask, status: 'IMPORT_FAILED' } : previousTask));
      wizard.setLocalError(importJob?.errorMessage || 'Spare part import background job failed.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importJob, importJobStatus, importJobCompleted, importJobFailed, wizard.taskId]);

  useEffect(() => {
    let label = 'Upload & Process';

    if (uploadMutation.isPending) label = 'Uploading...';
    else if (importProcessing) label = 'Processing Excel...';
    else if (taskImportFailed || importJobFailed) label = 'Upload Again';
    else if (selectedFile) label = 'Upload & Process';
    else if (uploadResult || taskImportCompleted) label = 'Review Uploaded Spare Parts';

    wizard.setStepConfig({
      subtitle: 'Select the spare part Excel file. The backend validates duplicate ITEM_NO + BRANCH + LOCATION and processes the import in the background.',
      canClose: !uploadMutation.isPending,
      closeBlocked: uploadMutation.isPending,
      closeConfirmMessage: importProcessing
        ? 'The import is still running in the background. You can close this dialog and continue later from the task list.'
        : null,
      nextLabel: label,
      nextDisabled: uploadMutation.isPending || importProcessing || (!selectedFile && !uploadResult && !taskImportCompleted),
      nextLoading: uploadMutation.isPending || importProcessing,
      nextLoadingLabel: uploadMutation.isPending ? 'Uploading...' : 'Processing Excel...',
      onNext: handleNext,
      nextStartIcon: !uploadResult || selectedFile ? React.createElement(CloudUploadRoundedIcon) : null,
    });

    return wizard.resetStepControls;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFile, uploadMutation.isPending, importProcessing, taskImportCompleted, taskImportFailed, importJobFailed, uploadResult]);

  return {
    fileInputRef,
    selectedFile,
    uploadResult,
    uploadMutation,
    importJobQuery,
    taskImportCompleted,
    taskImportRunning,
    taskImportFailed,
    importProcessing,
    clearSelectedFile,
    handleFileChange,
  };
}
