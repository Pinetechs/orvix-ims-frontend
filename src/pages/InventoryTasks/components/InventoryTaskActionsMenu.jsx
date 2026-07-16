import React, { useState } from 'react';
import { Divider, IconButton, Menu, MenuItem, Tooltip } from '@mui/material';

import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import PauseCircleOutlineRoundedIcon from '@mui/icons-material/PauseCircleOutlineRounded';
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

import {
  canAssignInventoryTask,
  canUpdateInventoryTask,
  resolveAllowedActions,
} from '../utils/inventoryTaskPermissions.js';

function InventoryTaskActionsMenu({
  row,
  auth,
  onEditScanSettings,
  onManageAssignments,
  onPause,
  onResume,
  onDelete,
  onCancel,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const actions = resolveAllowedActions(row);
  const canUpdate = canUpdateInventoryTask(auth, row);
  const canAssign = canAssignInventoryTask(auth, row);

  const hasAction =
    (canUpdate && (actions.editScanSettings || actions.pause || actions.resume || actions.delete || actions.deleteRequiresPause || actions.cancel))
    || (canAssign && actions.editAssignments);

  if (!hasAction) return null;

  const closeAndRun = (callback) => {
    setAnchorEl(null);
    callback?.(row);
  };

  return (
    <>
      <Tooltip title="Task actions">
        <IconButton
          size="small"
          onClick={(event) => {
            event.stopPropagation();
            setAnchorEl(event.currentTarget);
          }}
        >
          <MoreVertRoundedIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {canUpdate && actions.editScanSettings && (
          <MenuItem onClick={() => closeAndRun(onEditScanSettings)}>
            <TuneRoundedIcon fontSize="small" sx={{ mr: 1 }} />
            Scan settings
          </MenuItem>
        )}

        {canAssign && actions.editAssignments && (
          <MenuItem onClick={() => closeAndRun(onManageAssignments)}>
            <GroupRoundedIcon fontSize="small" sx={{ mr: 1 }} />
            Manage assignments
          </MenuItem>
        )}

        {(canUpdate && (actions.pause || actions.resume)) && <Divider />}

        {canUpdate && actions.pause && (
          <MenuItem onClick={() => closeAndRun(onPause)}>
            <PauseCircleOutlineRoundedIcon fontSize="small" sx={{ mr: 1 }} />
            Pause task
          </MenuItem>
        )}

        {canUpdate && actions.resume && (
          <MenuItem onClick={() => closeAndRun(onResume)}>
            <PlayCircleOutlineRoundedIcon fontSize="small" sx={{ mr: 1 }} />
            Resume task
          </MenuItem>
        )}

        {canUpdate && (actions.delete || actions.deleteRequiresPause || actions.cancel) && <Divider />}

        {canUpdate && actions.delete && (
          <MenuItem onClick={() => closeAndRun(onDelete)} sx={{ color: 'error.main' }}>
            <DeleteOutlineRoundedIcon fontSize="small" sx={{ mr: 1 }} />
            Delete task ({Number(row.scanCount || 0)}/10 scans)
          </MenuItem>
        )}

        {canUpdate && actions.deleteRequiresPause && (
          <Tooltip title="Pause the task first, then deletion becomes available" placement="left">
            <span>
              <MenuItem disabled>
                <DeleteOutlineRoundedIcon fontSize="small" sx={{ mr: 1 }} />
                Pause before deleting
              </MenuItem>
            </span>
          </Tooltip>
        )}

        {canUpdate && actions.cancel && !actions.delete && !actions.deleteRequiresPause && (
          <MenuItem onClick={() => closeAndRun(onCancel)} sx={{ color: 'warning.dark' }}>
            <CancelOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
            Cancel and archive
          </MenuItem>
        )}
      </Menu>
    </>
  );
}

export default InventoryTaskActionsMenu;
