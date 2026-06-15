import React, { useState } from 'react';
import { IconButton, Menu, MenuItem, Tooltip } from '@mui/material';

import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import LockResetRoundedIcon from '@mui/icons-material/LockResetRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

import { isUserActive } from '../utils/userMappers.js';

function UserActionsMenu({ row, auth, onEdit, onResetPassword, onToggleStatus }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);
  const active = isUserActive(row);

  const canUpdate = auth.hasPermission('USER_UPDATE');
  const canDisable = auth.hasPermission('USER_DISABLE');
  const canResetPassword = auth.hasPermission('USER_RESET_PASSWORD');

  if (!canUpdate && !canDisable && !canResetPassword) {
    return null;
  }

  const closeMenu = () => setAnchorEl(null);

  return (
    <>
      <Tooltip title="Actions">
        <IconButton size="small" onClick={(event) => setAnchorEl(event.currentTarget)}>
          <MoreVertRoundedIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={closeMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {canUpdate && (
          <MenuItem
            onClick={() => {
              closeMenu();
              onEdit?.(row);
            }}
          >
            <EditRoundedIcon fontSize="small" sx={{ mr: 1 }} />
            Edit user
          </MenuItem>
        )}

        {canResetPassword && (
          <MenuItem
            onClick={() => {
              closeMenu();
              onResetPassword?.(row);
            }}
          >
            <LockResetRoundedIcon fontSize="small" sx={{ mr: 1 }} />
            Reset password
          </MenuItem>
        )}

        {canDisable && (
          <MenuItem
            onClick={() => {
              closeMenu();
              onToggleStatus?.(row);
            }}
          >
            {active ? (
              <BlockRoundedIcon fontSize="small" sx={{ mr: 1 }} />
            ) : (
              <CheckCircleRoundedIcon fontSize="small" sx={{ mr: 1 }} />
            )}
            {active ? 'Disable user' : 'Enable user'}
          </MenuItem>
        )}
      </Menu>
    </>
  );
}

export default UserActionsMenu;