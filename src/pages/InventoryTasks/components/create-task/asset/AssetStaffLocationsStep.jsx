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
import { getUsers } from '../../../../../services/userService.js';
import { queryKeys } from '../../../../../services/queryKeys.js';
import { TASK_CLOSE_ACTION_OPTIONS } from '../../../constants/inventoryTaskOptions.js';
import { useAssetStaffLocationsStep } from '../../../hooks/create-task/asset/useAssetStaffLocationsStep.js';
import {
  getLocationLabel,
  getLocationValue,
  getUserLabel,
  getUserValue,
} from '../../../utils/createInventoryTaskDialogUtils.js';
import { ReviewPanel, StepHeader } from '../../CreateInventoryTaskDialogParts.jsx';

function AssetStaffLocationsStep({ wizard }) {
  const {
    formik,
    selectedStaff,
    locationAssignments,
    assetLocations,
    assetLocationsQuery,
    busy,
    totalLocationCount,
    assignedLocationCount,
    unassignedLocationCount,
    setUserLocations,
    clearUserLocations,
    assignAllLocationsToUser,
  } = useAssetStaffLocationsStep({ wizard });

  return (
    <Stack spacing={2.4}>
      <StepHeader
        icon={<GroupAddRoundedIcon />}
        title="Staff and asset location assignment"
        description="Assign staff to imported asset locations only. The Android app will let staff choose floor and place during the actual count."
      />

      <Alert severity="info">
        Asset assignment is intentionally by Location only. Staff can be assigned to Amman, Irbid or any imported location, then choose Floor and Place inside the mobile workflow.
      </Alert>

      <FormikAsyncAutocomplete
        formik={formik}
        name="staff"
        label="Inventory Staff"
        queryKey={queryKeys.users.list({ userType: 'INVENTORY_STAFF', status: 'true' })}
        queryFn={getUsers}
        disabled={busy}
        multiple
        extraParams={{ userType: 'INVENTORY_STAFF', status: 'true', size: 20 }}
        optionLabelKeys={['firstName', 'lastName', 'username']}
        getOptionValue={getUserValue}
        getOptionLabel={getUserLabel}
        helperText="Only inventory staff users should be assigned to mobile scanning tasks."
      />

      <ReviewPanel
        title="Asset location assignment"
        action={
          <Chip
            size="small"
            color={unassignedLocationCount === 0 && totalLocationCount > 0 ? 'success' : 'warning'}
            label={`${assignedLocationCount}/${totalLocationCount} locations assigned`}
          />
        }
      >
        <Stack spacing={1.6}>
          {assetLocationsQuery.isLoading || assetLocationsQuery.isFetching ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={18} />
              <Typography color="text.secondary" sx={{ fontSize: '0.86rem' }}>
                Loading imported asset locations...
              </Typography>
            </Stack>
          ) : null}

          {assetLocationsQuery.isError && (
            <Alert severity="error">
              {assetLocationsQuery.error?.message || 'Could not load asset locations.'}
            </Alert>
          )}

          {!assetLocationsQuery.isLoading && !assetLocationsQuery.isError && totalLocationCount === 0 && (
            <Alert severity="warning">
              No asset locations were found. Go back and complete the Excel import before assigning locations.
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
                      options={assetLocations}
                      value={assignedLocations}
                      disabled={busy || assetLocationsQuery.isLoading || totalLocationCount === 0}
                      onChange={(_, nextLocations) => setUserLocations(userId, nextLocations)}
                      getOptionLabel={getLocationLabel}
                      isOptionEqualToValue={(option, value) => String(getLocationValue(option)) === String(getLocationValue(value))}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Assigned Location"
                          helperText="A location may be assigned to one or more staff members if needed. Floors and places are selected later in the Android app."
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

      <FormControl component="fieldset">
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
      </FormControl>

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

export default AssetStaffLocationsStep;
