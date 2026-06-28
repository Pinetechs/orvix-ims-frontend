import React from 'react';
import { Box, LinearProgress, Stack, Tooltip, Typography } from '@mui/material';

import EnumChip from '../../../components/common/EnumChip.jsx';
import {
  INVENTORY_DOMAIN_CHIP_CONFIG,
  INVENTORY_TASK_STATUS_CHIP_CONFIG,
} from '../../../constants/enumChipConfigs.jsx';
import {
  formatDateTime,
  getCompanyName,
  getCreatedByName,
  getProgressPercent,
  getTaskName,
  getTaskNumber,
} from './inventoryTaskMappers.js';

export const createInventoryTaskTableColumns = ({ isMobile }) => [
  {
    field: 'task',
    headerName: 'Task',
    minWidth: isMobile ? 190 : 260,
    flex: 1.25,
    renderCell: (params) => (
      <Box sx={{ minWidth: 0, width: '100%' }}>
        <Typography sx={{ fontWeight: 900, lineHeight: 1.25 }} noWrap>
          {getTaskName(params.row)}
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: '0.8rem' }} noWrap>
          {getTaskNumber(params.row)}
        </Typography>
      </Box>
    ),
  },
  {
    field: 'company',
    headerName: 'Company',
    minWidth: isMobile ? 140 : 190,
    flex: 0.9,
    sortable: false,
    renderCell: (params) => (
      <Typography sx={{ fontWeight: 760 }} noWrap>
        {getCompanyName(params.row)}
      </Typography>
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
      const scanned = params.row.scannedRecords ?? 0;
      const planned = params.row.plannedRecords ?? 0;

      return (
        <Box sx={{ width: '100%', pr: 1 }}>
          <Stack direction="row" justifyContent="space-between" spacing={1} sx={{ mb: 0.5 }}>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 850 }}>{percent}%</Typography>
            <Typography color="text.secondary" sx={{ fontSize: '0.78rem' }}>
              {scanned}/{planned}
            </Typography>
          </Stack>
          <LinearProgress variant="determinate" value={percent} sx={{ height: 7, borderRadius: 99 }} />
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
];
