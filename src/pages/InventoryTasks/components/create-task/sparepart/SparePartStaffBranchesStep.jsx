import React from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import GroupAddRoundedIcon from '@mui/icons-material/GroupAddRounded';
import WarehouseRoundedIcon from '@mui/icons-material/WarehouseRounded';

import EnumChip from '../../../../../components/common/EnumChip.jsx';
import FormikAsyncAutocomplete from '../../../../../components/form/FormikAsyncAutocomplete.jsx';
import { INVENTORY_TASK_STATUS_CHIP_CONFIG } from '../../../../../constants/enumChipConfigs.jsx';
import { getEligibleInventoryStaff } from '../../../../../services/inventoryTaskService.js';
import { queryKeys } from '../../../../../services/queryKeys.js';
import { TASK_CLOSE_ACTION_OPTIONS } from '../../../constants/inventoryTaskOptions.js';
import { useSparePartStaffBranchesStep } from '../../../hooks/create-task/sparepart/useSparePartStaffBranchesStep.js';
import {
  getBranchLabel,
  getBranchValue,
  getUserLabel,
  getUserValue,
} from '../../../utils/createInventoryTaskDialogUtils.js';
import { ReviewPanel, StepHeader } from '../../CreateInventoryTaskDialogParts.jsx';

function SparePartStaffBranchesStep({ wizard }) {
  const {
    formik,
    selectedStaff,
    branchAssignments,
    sparePartBranches,
    sparePartBranchesQuery,
    busy,
    totalBranchCount,
    assignedBranchCount,
    unassignedBranchCount,
    setUserBranches,
    clearUserBranches,
    assignAllBranchesToUser,
  } = useSparePartStaffBranchesStep({ wizard });

  return (
    <Stack spacing={2.4}>
      <StepHeader
        icon={<GroupAddRoundedIcon />}
        title="Staff and spare part branch assignment"
        description="Assign staff to imported spare part branches only. The Android app will let staff choose cabinet/rack location during the actual count."
      />

      <Alert severity="info">
        Spare part assignment is intentionally by BRANCH only. Staff can be assigned to Bayader, Irbid or any imported branch, then choose the LOCATION cabinet/rack inside the app workflow.
      </Alert>

      {wizard.assignmentOnlyMode && (
        <Alert severity={wizard.taskStatus === 'PAUSED' ? 'warning' : 'info'}>
          Saving here updates the active team distribution only. The task will remain {wizard.taskStatus}.
        </Alert>
      )}

      <FormikAsyncAutocomplete
        formik={formik}
        name="staff"
        label="Inventory Staff"
        queryKey={queryKeys.inventoryTasks.eligibleStaff(wizard.taskId)}
        queryFn={(params) => getEligibleInventoryStaff({ taskId: wizard.taskId, ...params })}
        disabled={busy}
        multiple
        extraParams={{ size: 20 }}
        optionLabelKeys={['firstName', 'lastName', 'username']}
        getOptionValue={getUserValue}
        getOptionLabel={getUserLabel}
        helperText="Only active inventory staff linked to this task company and spare-part domain are shown."
      />

      <ReviewPanel
        title="Spare part branch assignment"
        action={
          <Chip
            size="small"
            color={unassignedBranchCount === 0 && totalBranchCount > 0 ? 'success' : 'warning'}
            label={`${assignedBranchCount}/${totalBranchCount} branches assigned`}
          />
        }
      >
        <Stack spacing={1.6}>
          {sparePartBranchesQuery.isLoading || sparePartBranchesQuery.isFetching ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={18} />
              <Typography color="text.secondary" sx={{ fontSize: '0.86rem' }}>
                Loading imported spare part branches...
              </Typography>
            </Stack>
          ) : null}

          {sparePartBranchesQuery.isError && (
            <Alert severity="error">
              {sparePartBranchesQuery.error?.message || 'Could not load spare part branches.'}
            </Alert>
          )}

          {!sparePartBranchesQuery.isLoading && !sparePartBranchesQuery.isError && totalBranchCount === 0 && (
            <Alert severity="warning">
              No spare part branches were found. Go back and complete the Excel import before assigning branches.
            </Alert>
          )}

          {totalBranchCount > 0 && selectedStaff.length === 0 && (
            <Alert severity="warning">
              Select at least one inventory staff member to start mapping branches.
            </Alert>
          )}

          {selectedStaff.map((user) => {
            const userId = getUserValue(user);
            const assignedBranches = Array.isArray(branchAssignments[String(userId)])
              ? branchAssignments[String(userId)]
              : [];

            return (
              <Card
                key={userId}
                variant="outlined"
                sx={(theme) => ({
                  borderRadius: 2.5,
                  borderColor: alpha(theme.palette.primary.main, 0.14),
                  bgcolor: alpha(theme.palette.primary.main, 0.025),
                })}
              >
                <CardContent>
                  <Stack spacing={1.4}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
                      <Box>
                        <Typography sx={{ fontWeight: 950 }}>{getUserLabel(user)}</Typography>
                        <Typography color="text.secondary" sx={{ fontSize: '0.82rem' }}>
                          {assignedBranches.length} branch(es) assigned to this staff member
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => assignAllBranchesToUser(userId)}
                          disabled={busy || totalBranchCount === 0}
                        >
                          Assign All
                        </Button>
                        <Button
                          size="small"
                          color="inherit"
                          onClick={() => clearUserBranches(userId)}
                          disabled={busy || assignedBranches.length === 0}
                        >
                          Clear
                        </Button>
                      </Stack>
                    </Stack>

                    <Autocomplete
                      multiple
                      disableCloseOnSelect
                      options={sparePartBranches}
                      value={assignedBranches}
                      disabled={busy || sparePartBranchesQuery.isLoading || totalBranchCount === 0}
                      onChange={(_, nextBranches) => setUserBranches(userId, nextBranches)}
                      getOptionLabel={getBranchLabel}
                      isOptionEqualToValue={(option, value) => String(getBranchValue(option)) === String(getBranchValue(value))}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Assigned Branch"
                          helperText="A branch may be assigned to one or more staff members if needed. Cabinet/rack locations are selected later in the Android app."
                        />
                      )}
                    />
                  </Stack>
                </CardContent>
              </Card>
            );
          })}

          {totalBranchCount > 0 && selectedStaff.length > 0 && unassignedBranchCount > 0 && (
            <Alert severity="warning">
              {unassignedBranchCount} imported branch(es) are not assigned yet. The backend will not allow Ready to Start until all branches are covered.
            </Alert>
          )}
        </Stack>
      </ReviewPanel>

      {!wizard.assignmentOnlyMode && <FormControl component="fieldset">
        <Typography sx={{ fontWeight: 950, mb: 1 }}>Final action</Typography>
        <RadioGroup
          value={formik.values.closeAction}
          onChange={(event) => formik.setFieldValue('closeAction', event.target.value)}
        >
          {TASK_CLOSE_ACTION_OPTIONS.map((option) => (
            <Card
              key={option.value}
              variant="outlined"
              sx={(theme) => ({
                borderRadius: 2.5,
                mb: 1,
                borderColor:
                  formik.values.closeAction === option.value
                    ? theme.palette.primary.main
                    : alpha(theme.palette.divider, 0.75),
                bgcolor:
                  formik.values.closeAction === option.value
                    ? alpha(theme.palette.primary.main, 0.045)
                    : theme.palette.background.paper,
              })}
            >
              <FormControlLabel
                value={option.value}
                control={<Radio />}
                disabled={busy}
                label={
                  <Box sx={{ py: 1 }}>
                    <Typography sx={{ fontWeight: 900 }}>{option.label}</Typography>
                    <Typography color="text.secondary" sx={{ fontSize: '0.84rem' }}>
                      {option.description}
                    </Typography>
                  </Box>
                }
                sx={{ alignItems: 'flex-start', width: '100%', m: 0, px: 1.5 }}
              />
            </Card>
          ))}
        </RadioGroup>
        <FormHelperText>
          Draft is the safe option when Excel import, staff assignment or branch assignment is not complete.
        </FormHelperText>
      </FormControl>}

      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
        <Typography color="text.secondary" sx={{ fontSize: '0.84rem' }}>
          Current task status:
        </Typography>
        <EnumChip value={wizard.taskStatus || 'DRAFT'} config={INVENTORY_TASK_STATUS_CHIP_CONFIG} />
        {selectedStaff.length > 0 && <Chip size="small" icon={<GroupAddRoundedIcon />} label={`${selectedStaff.length} assigned`} />}
        {totalBranchCount > 0 && (
          <Chip
            size="small"
            icon={<WarehouseRoundedIcon />}
            color={unassignedBranchCount === 0 ? 'success' : 'warning'}
            label={`${assignedBranchCount}/${totalBranchCount} branches`}
          />
        )}
      </Stack>
    </Stack>
  );
}

export default SparePartStaffBranchesStep;
