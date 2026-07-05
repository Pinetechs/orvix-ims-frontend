import React from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';

import BackgroundJobProgress from '../../../../../components/jobs/BackgroundJobProgress.jsx';
import { useAssetUploadExcelStep } from '../../../hooks/create-task/asset/useAssetUploadExcelStep.js';
import { getTaskNumber } from '../../../utils/inventoryTaskMappers.js';
import { StepHeader } from '../../CreateInventoryTaskDialogParts.jsx';

function AssetUploadExcelStep({ wizard }) {
  const {
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
  } = useAssetUploadExcelStep({ wizard });

  return (
    <Stack spacing={2.2}>
      <StepHeader
        icon={<CloudUploadRoundedIcon />}
        title="Upload asset Excel"
        description="Select the fixed asset Excel file. When you click Next, the backend validates duplicate barcodes and processes it as a background job."
      />

      <Alert severity="success">
        Draft task created successfully. Task number: <strong>{getTaskNumber(wizard.createdTask)}</strong>
      </Alert>

      {wizard.taskStatus && (
        <Alert severity={taskImportFailed ? 'error' : taskImportCompleted ? 'success' : 'info'}>
          Current import status: <strong>{wizard.taskStatus}</strong>
        </Alert>
      )}

      <Alert severity="info" icon={<ErrorOutlineRoundedIcon />}>
        Duplicate Barcode values stop the import completely. Existing task data is kept until the uploaded file passes validation.
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
              <Typography sx={{ fontWeight: 950 }}>Select asset Excel file</Typography>
              <Typography color="text.secondary" sx={{ fontSize: '0.86rem', maxWidth: 720 }}>
                Expected columns include Barcode, Description, AssetCategory, AssetType, Location, Floor, Place and asset value fields.
              </Typography>
            </Box>

            <input ref={fileInputRef} hidden type="file" accept=".xlsx,.xls" onChange={handleFileChange} />

            <Button
              variant="outlined"
              startIcon={<InsertDriveFileOutlinedIcon />}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMutation.isPending || importProcessing}
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

          <IconButton size="small" onClick={clearSelectedFile} disabled={uploadMutation.isPending || importProcessing}>
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

      {taskImportRunning && !wizard.importJobId && (
        <Alert severity="info">
          Import is queued or running on the backend. This dialog will refresh the task status automatically.
        </Alert>
      )}

      {wizard.importJobId && (
        <BackgroundJobProgress
          job={importJobQuery.data}
          loading={importJobQuery.isLoading || (importJobQuery.isFetching && !importJobQuery.data)}
          error={importJobQuery.error}
          title="Asset Excel import"
          emptyText="Waiting for the import worker to pick up the job..."
        />
      )}

      {(uploadResult || taskImportCompleted) && (
        <Alert severity={selectedFile ? 'warning' : 'success'}>
          {selectedFile
            ? 'A new Excel file is selected. Click Upload & Process to replace the previous import result.'
            : 'Excel import completed successfully. Click Next to review the pageable uploaded asset records from the backend.'}
        </Alert>
      )}
    </Stack>
  );
}

export default AssetUploadExcelStep;
