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
import { useVehicleStaffLocationsStep } from '../../../hooks/create-task/vehicle/useVehicleStaffLocationsStep.js';
import {
  getLocationLabel,
  getLocationValue,
  getUserLabel,
  getUserValue,
} from '../../../utils/createInventoryTaskDialogUtils.js';
import { ReviewPanel, StepHeader } from '../../CreateInventoryTaskDialogParts.jsx';

function VehicleStaffLocationsStep({ wizard }) {
  const {
    formik,
    selectedStaff,
    locationAssignments,
    vehicleLocations,
    vehicleLocationsQuery,
    busy,
    totalLocationCount,
    assignedLocationCount,
    unassignedLocationCount,
    setUserLocations,
    clearUserLocations,
    assignAllLocationsToUser,
  } = useVehicleStaffLocationsStep({ wizard });

  return (
    <Stack spacing={2.4}>
      <StepHeader
        icon={<GroupAddRoundedIcon />}
        title="Staff and location assignment"
        description="Assign the inventory team, map every vehicle location to staff, then decide the final task status."
      />

      <Alert severity="info">
        Select inventory staff first. For vehicle tasks, each imported ST_STORE_NO / LOCATION should be assigned before moving the task to Ready to Start or Start Now.
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
        helperText="Only active inventory staff linked to this task company and vehicle domain are shown."
      />

      <ReviewPanel
        title="Vehicle location assignment"
        action={
          <Chip
            size="small"
            color={unassignedLocationCount === 0 && totalLocationCount > 0 ? 'success' : 'warning'}
            label={`${assignedLocationCount}/${totalLocationCount} locations assigned`}
          />
        }
      >
        <Stack spacing={1.6}>
          {vehicleLocationsQuery.isLoading || vehicleLocationsQuery.isFetching ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={18} />
              <Typography color="text.secondary" sx={{ fontSize: '0.86rem' }}>
                Loading imported vehicle locations...
              </Typography>
            </Stack>
          ) : null}

          {vehicleLocationsQuery.isError && (
            <Alert severity="error">
              {vehicleLocationsQuery.error?.message || 'Could not load vehicle locations.'}
            </Alert>
          )}

          {!vehicleLocationsQuery.isLoading && !vehicleLocationsQuery.isError && totalLocationCount === 0 && (
            <Alert severity="warning">
              No vehicle locations were found. Go back and complete the Excel import before assigning locations.
            </Alert>
          )}

          {totalLocationCount > 0 && selectedStaff.length === 0 && (
            <Alert severity="warning">
              Select at least one inventory staff member to start mapping locations.
            </Alert>
          )}

          {selectedStaff.map((user) => {
            const userId = getUserValue(user);
            const assignedLocations = Array.isArray(locationAssignments[String(userId)])
              ? locationAssignments[String(userId)]
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
                          {assignedLocations.length} location(s) assigned to this staff member
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => assignAllLocationsToUser(userId)}
                          disabled={busy || totalLocationCount === 0}
                        >
                          Assign All
                        </Button>
                        <Button
                          size="small"
                          color="inherit"
                          onClick={() => clearUserLocations(userId)}
                          disabled={busy || assignedLocations.length === 0}
                        >
                          Clear
                        </Button>
                      </Stack>
                    </Stack>

                    <Autocomplete
                      multiple
                      disableCloseOnSelect
                      options={vehicleLocations}
                      value={assignedLocations}
                      disabled={busy || vehicleLocationsQuery.isLoading || totalLocationCount === 0}
                      onChange={(_, nextLocations) => setUserLocations(userId, nextLocations)}
                      getOptionLabel={getLocationLabel}
                      isOptionEqualToValue={(option, value) => String(getLocationValue(option)) === String(getLocationValue(value))}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Assigned ST_STORE_NO / LOCATION"
                          helperText="A location may be assigned to one or more staff members if needed."
                        />
                      )}
                    />
                  </Stack>
                </CardContent>
              </Card>
            );
          })}

          {totalLocationCount > 0 && selectedStaff.length > 0 && unassignedLocationCount > 0 && (
            <Alert severity="warning">
              {unassignedLocationCount} imported location(s) are not assigned yet. The backend will not allow Ready to Start until all locations are covered.
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
          Draft is the safe option when Excel import, staff assignment or location assignment is not complete.
        </FormHelperText>
      </FormControl>}

      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
        <Typography color="text.secondary" sx={{ fontSize: '0.84rem' }}>
          Current task status:
        </Typography>
        <EnumChip value={wizard.taskStatus || 'DRAFT'} config={INVENTORY_TASK_STATUS_CHIP_CONFIG} />
        {selectedStaff.length > 0 && <Chip size="small" icon={<GroupAddRoundedIcon />} label={`${selectedStaff.length} assigned`} />}
        {totalLocationCount > 0 && (
          <Chip
            size="small"
            icon={<WarehouseRoundedIcon />}
            color={unassignedLocationCount === 0 ? 'success' : 'warning'}
            label={`${assignedLocationCount}/${totalLocationCount} locations`}
          />
        )}
      </Stack>
    </Stack>
  );
}

export default VehicleStaffLocationsStep;
