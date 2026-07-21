import React from 'react';
import { Box, Button, LinearProgress, Stack, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';

import EnumChip from '../../../components/common/EnumChip.jsx';
import InventoryTaskActionsMenu from '../components/InventoryTaskActionsMenu.jsx';
import { canAssignInventoryTask, canUpdateInventoryTask } from './inventoryTaskPermissions.js';
import {
  INVENTORY_DOMAIN_CHIP_CONFIG,
  INVENTORY_TASK_STATUS_CHIP_CONFIG,
} from '../../../constants/enumChipConfigs.jsx';
import {
  formatDateTime,
  getCompanyCode,
  getCompanyName,
  getCreatedByName,
  getProgressPercent,
  getTaskId,
  getTaskName,
  getTaskNumber,
} from './inventoryTaskMappers.js';

const RESUMABLE_STATUSES = new Set([
  'CREATED',
  'IMPORT_PENDING',
  'IMPORT_IN_PROGRESS',
  'IMPORT_FAILED',
  'IMPORT_COMPLETED',
  'READY_FOR_ASSIGNMENT',
  'READY_TO_START',
  'DRAFT',
  'IN_PROGRESS',
  'PAUSED',
]);

export const isInventoryTaskResumable = (row = {}) => RESUMABLE_STATUSES.has(row.status);

const getContinueLabel = (row = {}) =>
  row.status === 'IN_PROGRESS' || row.status === 'PAUSED' ? 'Manage assignments' : 'Continue';

const canContinueTask = (auth, row = {}) => {
  if (row.status === 'IN_PROGRESS' || row.status === 'PAUSED') {
    return canAssignInventoryTask(auth, row);
  }
  return canUpdateInventoryTask(auth, row) || canAssignInventoryTask(auth, row);
};

export const createInventoryTaskTableColumns = ({
  auth,
  isMobile,
  onResumeTask,
  onEditScanSettings,
  onManageAssignments,
  onPause,
  onResume,
  onDelete,
  onCancel,
  onTrack,
} = {}) => [
  {
    field: 'task',
    headerName: 'Task',
    minWidth: isMobile ? 190 : 260,
    flex: 1.25,
    renderCell: (params) => (
      <Stack spacing={0.45} alignItems="flex-start" justifyContent="center" sx={{ minWidth: 0, width: '100%', py: 0.5 }}>
        <Typography sx={{ fontWeight: 900, lineHeight: 1.25 }} noWrap>
          {getTaskName(params.row)}
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: '0.8rem' }} noWrap>
          {getTaskNumber(params.row)}
        </Typography>
        {isInventoryTaskResumable(params.row) && canContinueTask(auth, params.row) && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<PlayArrowRoundedIcon />}
            onClick={(event) => {
              event.stopPropagation();
              onResumeTask?.(getTaskId(params.row));
            }}
            sx={(theme) => ({
              minHeight: 24,
              px: 0.8,
              py: 0,
              borderRadius: 99,
              fontSize: '0.72rem',
              fontWeight: 850,
              lineHeight: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.035),
              '& .MuiButton-startIcon': {
                mr: 0.35,
                '& svg': { fontSize: 15 },
              },
            })}
          >
            {getContinueLabel(params.row)}
          </Button>
        )}
      </Stack>
    ),
  },
  {
    field: 'company',
    headerName: 'Company',
    minWidth: isMobile ? 140 : 190,
    flex: 0.9,
    sortable: false,
    renderCell: (params) => (


      <Stack spacing={0.45} alignItems="flex-start" justifyContent="center" sx={{ minWidth: 0, width: '100%', py: 0.5 }}>

      
      <Typography sx={{ fontWeight: 900, lineHeight: 1.25 }} noWrap>
          {getCompanyName(params.row)}
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: '0.8rem' }} noWrap>
          {getCompanyCode(params.row)}
        </Typography>
      
      </Stack>


    ),
  },
  {
    field: 'inventoryDomain',
    headerName: 'Domain',
    minWidth: 150,
    flex: 0.65,
    renderCell: (params) => (
      <EnumChip value={params.row.inventoryDomain} config={INVENTORY_DOMAIN_CHIP_CONFIG} />
    ),
  },
  {
    field: 'status',
    headerName: 'Status',
    minWidth: 190,
    flex: 0.85,
    renderCell: (params) => (
      <EnumChip value={params.row.status} config={INVENTORY_TASK_STATUS_CHIP_CONFIG} />
    ),
  },
  {
    field: 'progress',
    headerName: 'Progress',
    minWidth: isMobile ? 145 : 190,
    flex: 0.85,
    sortable: false,
    renderCell: (params) => {
      const percent = getProgressPercent(params.row);
      const scanned = params.row.processedRecords ?? 0;
      const planned = params.row.totalRecords ?? 0;

      return (
        <Box sx={{ width: '100%', pr: 1 }}>
          <Stack direction="row" justifyContent="space-between" spacing={1} sx={{ mb: 0.5 }}>
            <Typography sx={{ fontSize: '0.76rem', fontWeight: 900 }}>{percent}%</Typography>
            <Typography color="text.secondary" sx={{ fontSize: '0.78rem' }}>
              {scanned}/{planned}
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={percent}
            sx={(theme) => ({
              height: 7,
              borderRadius: 99,
              bgcolor: alpha(theme.palette.primary.main, 0.13),
              '& .MuiLinearProgress-bar': {
                borderRadius: 99,
              },
            })}
          />
        </Box>
      );
    },
  },
  {
    field: 'mismatchRecords',
    headerName: 'Mismatch',
    minWidth: 105,
    flex: 0.42,
    renderCell: (params) => (
      <Typography sx={{ fontWeight: 900 }} color={Number(params.row.mismatchRecords || 0) > 0 ? 'error.main' : 'text.primary'}>
        {params.row.mismatchRecords ?? 0}
      </Typography>
    ),
  },
  {
    field: 'scanCount',
    headerName: 'Scan Events',
    minWidth: 120,
    flex: 0.48,
    sortable: false,
    renderCell: (params) => (
      <Tooltip title="Includes first scans, duplicates, conflicts and corrections">
        <Typography sx={{ fontWeight: 900 }}>{Number(params.row.scanCount || 0)}</Typography>
      </Tooltip>
    ),
  },
  {
    field: 'createdBy',
    headerName: 'Created By',
    minWidth: 150,
    flex: 0.7,
    sortable: false,
    renderCell: (params) => (
      <Typography sx={{ fontSize: '0.84rem' }} noWrap>
        {getCreatedByName(params.row)}
      </Typography>
    ),
  },
  {
    field: 'createdAt',
    headerName: 'Created At',
    minWidth: 165,
    flex: 0.75,
    renderCell: (params) => (
      <Tooltip title={formatDateTime(params.row.createdAt)}>
        <Typography sx={{ fontSize: '0.84rem' }} noWrap>
          {formatDateTime(params.row.createdAt)}
        </Typography>
      </Tooltip>
    ),
  },



  {
    field: 'closedAt',
    headerName: 'Closed At',
    minWidth: 165,
    flex: 0.75,
    renderCell: (params) => (
      <Tooltip title={formatDateTime(params.row.closedAt)}>
        <Typography sx={{ fontSize: '0.84rem' }} noWrap>
          {formatDateTime(params.row.closedAt)}
        </Typography>
      </Tooltip>
    ),
  },

  {
    field: 'actions',
    headerName: '',
    width: 64,
    sortable: false,
    filterable: false,
    disableColumnMenu: true,
    align: 'center',
    renderCell: (params) => (
      <InventoryTaskActionsMenu
        row={params.row}
        auth={auth}
        onEditScanSettings={onEditScanSettings}
        onManageAssignments={onManageAssignments}
        onPause={onPause}
        onResume={onResume}
        onDelete={onDelete}
        onCancel={onCancel}
        onTrack={onTrack}
      />
    ),
  },
];
