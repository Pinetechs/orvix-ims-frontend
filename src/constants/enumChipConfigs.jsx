import React from 'react';

import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import PhoneAndroidOutlinedIcon from '@mui/icons-material/PhoneAndroidOutlined';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';

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
  MOBILE: {
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

export const INVENTORY_TASK_STATUS_CHIP_CONFIG = {
  DRAFT: {
    label: 'Draft',
    color: 'default',
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