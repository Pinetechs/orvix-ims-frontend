import React from 'react';
import { Avatar, Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';


import UserActionsMenu from '../components/UserActionsMenu.jsx';

import {
  getCompanyName,
  getFullName,
  getInitials,
  isUserActive,
} from './userMappers.js';
import EnumChip from '../../../components/common/EnumChip.jsx';
import { ACCESS_CHANNEL_CHIP_CONFIG, BOOLEAN_STATUS_CHIP_CONFIG, USER_TYPE_CHIP_CONFIG } from '../../../constants/enumChipConfigs.jsx';

export const createUserTableColumns = ({
  auth,
  onEdit,
  onResetPassword,
  onToggleStatus,
}) => [
  {
    field: 'user',
    headerName: 'User',
    minWidth: 260,
    flex: 1.3,
    sortable: false,
    renderCell: (params) => (
      <Stack direction="row" spacing={1.4} alignItems="center" sx={{ minWidth: 0 }}>
        <Avatar
          sx={(theme) => ({
            width: 38,
            height: 38,
            fontSize: '0.86rem',
            fontWeight: 900,
            color: theme.palette.primary.main,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
          })}
        >
          {getInitials(params.row)}
        </Avatar>

        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 850, lineHeight: 1.25 }} noWrap>
            {getFullName(params.row)}
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: '0.8rem' }} noWrap>
            @{params.row.username || '-'}
          </Typography>
        </Box>
      </Stack>
    ),
  },
  {
    field: 'email',
    headerName: 'Email',
    minWidth: 220,
    flex: 1,
    renderCell: (params) => (
      <Typography sx={{ fontSize: '0.88rem' }} noWrap>
        {params.row.email || '-'}
      </Typography>
    ),
  },
  {
    field: 'phone',
    headerName: 'Phone',
    minWidth: 145,
    flex: 0.7,
    renderCell: (params) => params.row.phone || '-',
  },
  {
    field: 'company',
    headerName: 'Company',
    minWidth: 180,
    flex: 0.9,
    sortable: false,
    renderCell: (params) => (
      <Typography sx={{ fontWeight: 700 }} noWrap>
        {getCompanyName(params.row)}
      </Typography>
    ),
  },
  {
    field: 'userType',
    headerName: 'User Type',
    minWidth: 210,
    flex: 0.9,
    renderCell: (params) =>  <EnumChip value ={params.row.userType}config={USER_TYPE_CHIP_CONFIG}/>,
  },
  {
    field: 'accessChannel',
    headerName: 'Access',
    minWidth: 135,
    flex: 0.65,
    renderCell: (params) => <EnumChip value={params.row.accessChannel} config={ACCESS_CHANNEL_CHIP_CONFIG} />,
  },
  {
    field: 'status',
    headerName: 'Status',
    minWidth: 120,
    flex: 0.55,
    sortable: false,
    renderCell: (params) => <EnumChip value={String(isUserActive(params.row))}config={BOOLEAN_STATUS_CHIP_CONFIG}/>,
  },
  {
    field: 'actions',
    headerName: '',
    width: 70,
    sortable: false,
    filterable: false,
    align: 'center',
    renderCell: (params) => (
      <UserActionsMenu
        row={params.row}
        auth={auth}
        onEdit={onEdit}
        onResetPassword={onResetPassword}
        onToggleStatus={onToggleStatus}
      />
    ),
  },
];