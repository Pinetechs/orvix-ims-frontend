import React from 'react';
import { Avatar, Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import EnumChip from '../../../components/common/EnumChip.jsx';
import { BOOLEAN_STATUS_CHIP_CONFIG } from '../../../constants/enumChipConfigs.jsx';
import CompanyActionsMenu from '../components/CompanyActionsMenu.jsx';
import {
  formatDateTime,
  getCompanyCode,
  getCompanyInitials,
  getCompanyName,
  isCompanyActive,
} from './companyMappers.js';

export const createCompanyTableColumns = ({
  auth,
  isMobile,
  onEdit,
  onToggleStatus,
}) => [
  {
    field: 'company',
    headerName: 'Company',
    minWidth: isMobile ? 170 : 220,
    flex: 1.25,
    renderCell: (params) => (
      <Stack direction="row" spacing={isMobile ? 1 : 1.4} alignItems="center" sx={{ minWidth: 0, width: '100%' }}>
        <Avatar
          sx={(theme) => ({
            width: isMobile ? 32 : 38,
            height: isMobile ? 32 : 38,
            fontSize: '0.86rem',
            fontWeight: 900,
            color: theme.palette.primary.main,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
          })}
        >
          {getCompanyInitials(params.row)}
        </Avatar>

        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 850, lineHeight: 1.25 }} noWrap>
            {getCompanyName(params.row)}
          </Typography>
          {!isMobile && (
            <Typography color="text.secondary" sx={{ fontSize: '0.8rem' }} noWrap>
              {getCompanyCode(params.row)}
            </Typography>
          )}
        </Box>
      </Stack>
    ),
  },
  {
    field: 'code',
    headerName: 'Code',
    minWidth: isMobile ? 110 : 140,
    flex: 0.55,
    renderCell: (params) => (
      <Typography sx={{ fontWeight: 800 }} noWrap>
        {getCompanyCode(params.row)}
      </Typography>
    ),
  },
  {
    field: 'status',
    headerName: 'Status',
    minWidth: isMobile ? 96 : 125,
    flex: 0.45,
    renderCell: (params) => (
      <EnumChip value={String(isCompanyActive(params.row))} config={BOOLEAN_STATUS_CHIP_CONFIG} />
    ),
  },
  {
    field: 'createdAt',
    headerName: 'Created At',
    minWidth: 165,
    flex: 0.75,
    renderCell: (params) => (
      <Typography sx={{ fontSize: '0.84rem' }} noWrap>
        {formatDateTime(params.row.createdAt)}
      </Typography>
    ),
  },
  {
    field: 'updatedAt',
    headerName: 'Updated At',
    minWidth: 165,
    flex: 0.75,
    renderCell: (params) => (
      <Typography sx={{ fontSize: '0.84rem' }} noWrap>
        {formatDateTime(params.row.updatedAt)}
      </Typography>
    ),
  },
  {
    field: 'actions',
    headerName: '',
    width: isMobile ? 56 : 70,
    sortable: false,
    filterable: false,
    align: 'center',
    renderCell: (params) => (
      <CompanyActionsMenu
        row={params.row}
        auth={auth}
        onEdit={onEdit}
        onToggleStatus={onToggleStatus}
      />
    ),
  },
];
