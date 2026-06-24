import React from 'react';
import { Avatar, Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';


import UserActionsMenu from '../components/UserActionsMenu.jsx';

import { getCompanyName,getFullName, getInitials,  isUserActive,} from './userMappers.js';
import EnumChip from '../../../components/common/EnumChip.jsx';
import { ACCESS_CHANNEL_CHIP_CONFIG, BOOLEAN_STATUS_CHIP_CONFIG, INVENTORY_DOMAIN_CHIP_CONFIG, USER_TYPE_CHIP_CONFIG } from '../../../constants/enumChipConfigs.jsx';

const normalizeInventoryDomains = (row) => {
  if (Array.isArray(row.inventoryDomains)) return row.inventoryDomains;
  if (Array.isArray(row.domains)) return row.domains;
  if (row.inventoryDomain) return [row.inventoryDomain];
  return [];
};

export const createUserTableColumns = ({
  auth,
  isMobile,
  onEdit,
  onResetPassword,
  onToggleStatus,
}) => [
  {
    field: 'user',
    headerName: 'User',
    minWidth: isMobile ? 150 : 180,
    flex: 1.3,
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
          {getInitials(params.row)}
        </Avatar>

        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 850, lineHeight: 1.25 }} noWrap>
            {getFullName(params.row)}
          </Typography>
          {!isMobile && (
            <Typography color="text.secondary" sx={{ fontSize: '0.8rem' }} noWrap>
              @{params.row.username || '-'}
            </Typography>
          )}
        </Box>
      </Stack>
    ),
  },
  {
    field: 'email',
    headerName: 'Email',
    minWidth: isMobile ? 140 : 220,
    flex: isMobile ? 1.1 : 1,
    renderCell: (params) => (
      <Typography sx={{ fontSize: '0.88rem' }} noWrap>
        {params.row.email || '-'}
      </Typography>
    ),
  },
  {
    field: 'phone',
    headerName: 'Phone',
    minWidth: isMobile ? 120 : 145,
    flex: isMobile ? 0.8 : 0.7,
    renderCell: (params) => params.row.mobile || params.row.phone || '-',
  },
  {
    field: 'company',
    headerName: 'Company',
    minWidth: isMobile ? 140 : 180,
    flex: isMobile ? 0.8 : 0.9,
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
    field: 'inventoryDomains',
    headerName: 'Domains',
    minWidth: isMobile ? 150 : 230,
    flex: isMobile ? 1 : 1.05,
    sortable: false,
    renderCell: (params) => {
      const domains = normalizeInventoryDomains(params.row);

      if (domains.length === 0) {
        return <Typography color="text.secondary">-</Typography>;
      }

      return (
        <Stack direction="row" spacing={0.7} sx={{ minWidth: 0, overflow: 'hidden', flexWrap: 'wrap', py: 0.5 }}>
          {domains.map((domain) => (
            <EnumChip
              key={domain}
              value={domain}
              config={INVENTORY_DOMAIN_CHIP_CONFIG}
              sx={{ maxWidth: '100%' }}
            />
          ))}
        </Stack>
      );
    },
  },
  {
    field: 'status',
    headerName: 'Status',
    minWidth: isMobile ? 96 : 120,
    flex: 0.55,
    renderCell: (params) => <EnumChip value={String(isUserActive(params.row))}config={BOOLEAN_STATUS_CHIP_CONFIG}/>,
  },
  {
    field: 'actions',
    headerName: '',
    width: isMobile ? 56 : 70,
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
