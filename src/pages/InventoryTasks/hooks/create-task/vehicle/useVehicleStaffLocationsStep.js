import React, { useEffect, useMemo } from 'react';
import { useFormik } from 'formik';

import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';

import { useAssignInventoryVehicleTaskStaffMutation } from '../../useAssignInventoryVehicleTaskStaffMutation.js';
import { useInventoryVehicleTaskAssignmentsQuery } from '../../useInventoryVehicleTaskAssignmentsQuery.js';
import {
  useMarkInventoryTaskReadyMutation,
  useStartInventoryTaskMutation,
} from '../../useInventoryTaskStatusMutation.js';
import { useVehicleInventoryLocationsQuery } from '../../useVehicleInventoryLocationsQuery.js';
import {
  buildLocationAssignmentPayload,
  getLocationValue,
  getUserValue,
} from '../../../utils/createInventoryTaskDialogUtils.js';
import {
  buildAssignmentFormValues,
  getInventoryTaskAssignments,
  getVehicleInventoryLocations,
  getVehicleLocationId,
} from '../../../utils/inventoryTaskMappers.js';
import {
  initialVehicleStaffLocationsValues,
  vehicleStaffLocationsSchema,
} from '../../../forms/create-task/vehicleStaffLocationsForm.js';

export function useVehicleStaffLocationsStep({ wizard }) {
  const vehicleLocationsQuery = useVehicleInventoryLocationsQuery({
    taskId: wizard.taskId,
    enabled: Boolean(wizard.taskId),
  });

  const vehicleAssignmentsQuery = useInventoryVehicleTaskAssignmentsQuery({
    taskId: wizard.taskId,
    enabled: Boolean(wizard.taskId),
  });

  const assignVehicleMutation = useAssignInventoryVehicleTaskStaffMutation();
  const readyMutation = useMarkInventoryTaskReadyMutation();
  const startMutation = useStartInventoryTaskMutation();

  const formik = useFormik({
    initialValues: initialVehicleStaffLocationsValues,
    validationSchema: vehicleStaffLocationsSchema,
    enableReinitialize: false,
    validateOnMount: true,
    
    onSubmit: async (values) => {

      wizard.clearError();

      if (!wizard.taskId) {
        wizard.setLocalError('Draft task was not created yet.');
        return;
      }

      const userIds = values.staff
        .map((user) => user?.id ?? user?.userId)
        .filter(Boolean);

      const locationAssignments = buildLocationAssignmentPayload(values);
      const existingAssignmentCount = getInventoryTaskAssignments(vehicleAssignmentsQuery.data).length;
      const vehicleLocations = getVehicleInventoryLocations(vehicleLocationsQuery.data);
      const vehicleLocationIds = vehicleLocations
        .map(getVehicleLocationId)
        .filter((locationId) => locationId !== undefined && locationId !== null && locationId !== '');

      if (values.closeAction !== 'DRAFT' && userIds.length === 0 && existingAssignmentCount === 0) {
        formik.setFieldTouched('staff', true);
        wizard.setLocalError('Please assign at least one inventory staff member before moving the task forward.');
        return;
      }

      if (values.closeAction !== 'DRAFT' && userIds.length > 0) {
        if (vehicleLocationsQuery.isLoading || vehicleLocationsQuery.isFetching) {
          wizard.setLocalError('Vehicle locations are still loading. Please wait a moment and try again.');
          return;
        }

        if (vehicleLocationsQuery.isError) {
          wizard.setLocalError(vehicleLocationsQuery.error?.message || 'Could not load vehicle locations for assignment.');
          return;
        }

        if (vehicleLocationIds.length === 0) {
          wizard.setLocalError('No vehicle locations were found. Please import the vehicle Excel file first.');
          return;
        }

        const staffWithoutLocations = locationAssignments.filter((assignment) => assignment.locationIds.length === 0);
        if (staffWithoutLocations.length > 0) {
          wizard.setLocalError('Assign at least one location to every selected inventory staff member.');
          return;
        }

        const assignedLocationIds = new Set(locationAssignments.flatMap((assignment) => assignment.locationIds));
        const allLocationsAssigned = vehicleLocationIds.every((locationId) => assignedLocationIds.has(Number(locationId)));

        if (!allLocationsAssigned) {
          wizard.setLocalError('All imported vehicle locations must be assigned before moving the task forward.');
          return;
        }
      }

      try {
        if (userIds.length > 0) {
          await assignVehicleMutation.mutateAsync({ taskId: wizard.taskId, userIds, locationAssignments, taskStatus: values.closeAction });
        }

        if (values.closeAction === 'READY_TO_START') {
     //     await readyMutation.mutateAsync({ taskId: wizard.taskId });
        }

        if (values.closeAction === 'START_NOW') {
    //      await startMutation.mutateAsync({ taskId: wizard.taskId });
        }

        wizard.markFinished();
        wizard.close(true);
      } catch (error) {
        wizard.setLocalError(error.message || 'Could not save staff and location assignment.');
      }
    },
    
  });

  const selectedStaff = Array.isArray(formik.values.staff) ? formik.values.staff : [];
  const locationAssignments = formik.values.locationAssignments || {};
  const vehicleLocations = useMemo(
    () => getVehicleInventoryLocations(vehicleLocationsQuery.data),
    [vehicleLocationsQuery.data],
  );

  const selectedStaffIds = useMemo(
    () => new Set(selectedStaff.map((user) => String(getUserValue(user))).filter(Boolean)),
    [selectedStaff],
  );

  const assignedLocationIds = useMemo(() => {
    const ids = new Set();

    Object.entries(locationAssignments).forEach(([userId, locations]) => {
      if (!selectedStaffIds.has(String(userId))) return;

      (Array.isArray(locations) ? locations : []).forEach((location) => {
        const locationId = getLocationValue(location);
        if (locationId !== undefined && locationId !== null && locationId !== '') {
          ids.add(String(locationId));
        }
      });
    });

    return ids;
  }, [locationAssignments, selectedStaffIds]);

  const totalLocationCount = vehicleLocations.length;
  const assignedLocationCount = vehicleLocations.filter((location) => assignedLocationIds.has(String(getLocationValue(location)))).length;
  const unassignedLocationCount = Math.max(totalLocationCount - assignedLocationCount, 0);

  const busy =
    formik.isSubmitting ||
    assignVehicleMutation.isPending ||
    readyMutation.isPending ||
    startMutation.isPending ||
    vehicleAssignmentsQuery.isLoading;

  const setUserLocations = (userId, nextLocations) => {
    formik.setFieldValue('locationAssignments', {
      ...(formik.values.locationAssignments || {}),
      [String(userId)]: nextLocations || [],
    });
  };

  const clearUserLocations = (userId) => setUserLocations(userId, []);
  const assignAllLocationsToUser = (userId) => setUserLocations(userId, vehicleLocations);

  useEffect(() => {
    if (vehicleAssignmentsQuery.isLoading || vehicleAssignmentsQuery.isError) return;

    const existingAssignments = getInventoryTaskAssignments(vehicleAssignmentsQuery.data);

    if (existingAssignments.length === 0 || selectedStaff.length > 0) return;

    const assignmentValues = buildAssignmentFormValues(existingAssignments);

    formik.setValues({
      ...formik.values,
      staff: assignmentValues.staff,
      locationAssignments: assignmentValues.locationAssignments,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleAssignmentsQuery.data, vehicleAssignmentsQuery.isLoading, vehicleAssignmentsQuery.isError]);

  useEffect(() => {
    let label = 'Save Draft';
    let startIcon = React.createElement(SaveRoundedIcon);

    if (formik.values.closeAction === 'READY_TO_START') {
      label = 'Mark Ready';
      startIcon = React.createElement(AssignmentRoundedIcon);
    }

    if (formik.values.closeAction === 'START_NOW') {
      label = 'Start Task';
      startIcon = React.createElement(PlayArrowRoundedIcon);
    }

    wizard.setStepConfig({
      subtitle: 'Assign inventory staff, cover imported vehicle locations, then choose the final task status.',
      canClose: !busy,
      closeBlocked: busy,
      closeConfirmMessage: null,
      nextLabel: label,
      nextDisabled: busy,
      nextLoading: busy,
      nextLoadingLabel: 'Saving...',
      onNext: formik.submitForm,
      nextStartIcon: startIcon,
    });

    return wizard.resetStepControls;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busy, formik.values.closeAction, formik.values.staff, formik.values.locationAssignments]);

  return {
    formik,
    selectedStaff,
    locationAssignments,
    vehicleLocations,
    vehicleLocationsQuery,
    vehicleAssignmentsQuery,
    busy,
    totalLocationCount,
    assignedLocationCount,
    unassignedLocationCount,
    setUserLocations,
    clearUserLocations,
    assignAllLocationsToUser,
  };
}
