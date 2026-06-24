import React, { useState } from 'react';
import { IconButton, Menu, MenuItem, Tooltip } from '@mui/material';

import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

import { isCompanyActive } from '../utils/companyMappers.js';

function CompanyActionsMenu({ row, auth, onEdit, onToggleStatus }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);
  const active = isCompanyActive(row);

  const canUpdate = auth.hasPermission('COMPANY_UPDATE');
  const canDisable = auth.hasPermission('COMPANY_DISABLE');

  if (!canUpdate && !canDisable) {
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
            Edit company
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
            {active ? 'Disable company' : 'Enable company'}
          </MenuItem>
        )}
      </Menu>
    </>
  );
}

export default CompanyActionsMenu;
