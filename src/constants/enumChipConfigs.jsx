import React from 'react';

import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import PhoneAndroidOutlinedIcon from '@mui/icons-material/PhoneAndroidOutlined';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import DirectionsCarFilledOutlinedIcon from '@mui/icons-material/DirectionsCarFilledOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import BuildCircleOutlinedIcon from '@mui/icons-material/BuildCircleOutlined';

export const USER_TYPE_CHIP_CONFIG = {
  SYSTEM_ADMIN: {
    label: 'System Admin',
    color: 'error',
  },
  PINETECHS_SUPPORT_STAFF: {
    label: 'Pinetechs Support',
    color: 'primary',
  },
  COMPANY_ADMIN: {
    label: 'Company Admin',
    color: 'secondary',
  },
  SUPERVISOR: {
    label: 'Supervisor',
    color: 'info',
  },
  INVENTORY_STAFF: {
    label: 'Inventory Staff',
    color: 'success',
  },
};

export const ACCESS_CHANNEL_CHIP_CONFIG = {
  WEB: {
    label: 'WEB',
    icon: <PublicOutlinedIcon />,
    variant: 'filled',
  },
  APP: {
    label: 'APP',
    icon: <PhoneAndroidOutlinedIcon />,
    variant: 'filled',
  },
  BOTH: {
    label: 'BOTH',
    icon: <AdminPanelSettingsOutlinedIcon />,
    variant: 'filled',
  },
};

export const BOOLEAN_STATUS_CHIP_CONFIG = {
  true: {
    label: 'Active',
    color: 'success',
    icon: <CheckCircleRoundedIcon />,
    variant: 'filled',
  },
  false: {
    label: 'Disabled',
    color: 'default',
    icon: <BlockRoundedIcon />,
    variant: 'outlined',
  },
};

export const INVENTORY_DOMAIN_CHIP_CONFIG = {
  VEHICLE: {
    label: 'Vehicle',
    color: 'primary',
    icon: <DirectionsCarFilledOutlinedIcon />,
    variant: 'outlined',
  },
  ASSET: {
    label: 'Asset',
    color: 'secondary',
    icon: <Inventory2OutlinedIcon />,
    variant: 'outlined',
  },
  SPARE_PART: {
    label: 'Spare Part',
    color: 'warning',
    icon: <BuildCircleOutlinedIcon />,
    variant: 'outlined',
  },
};

export const INVENTORY_TASK_STATUS_CHIP_CONFIG = {
  CREATED: {
    label: 'Created',
    color: 'info',
  },
  DRAFT: {
    label: 'Draft',
    color: 'default',
  },
  IMPORT_PENDING: {
    label: 'Import Pending',
    color: 'info',
  },
  IMPORT_IN_PROGRESS: {
    label: 'Import In Progress',
    color: 'warning',
  },
  IMPORT_FAILED: {
    label: 'Import Failed',
    color: 'error',
  },
  IMPORT_COMPLETED: {
    label: 'Import Completed',
    color: 'success',
  },
  READY_FOR_ASSIGNMENT: {
    label: 'Ready For Assignment',
    color: 'info',
  },
  READY_TO_START: {
    label: 'Ready To Start',
    color: 'primary',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    color: 'warning',
  },
  PAUSED: {
    label: 'Paused',
    color: 'default',
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    color: 'secondary',
  },
  COMPLETED: {
    label: 'Completed',
    color: 'success',
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'error',
  },
};
