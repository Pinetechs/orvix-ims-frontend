import React, { useEffect, useMemo } from 'react';
import { useFormik } from 'formik';

import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';

import { useAssignInventoryAssetTaskStaffMutation } from '../../useAssignInventoryAssetTaskStaffMutation.js';
import { useInventoryAssetTaskAssignmentsQuery } from '../../useInventoryAssetTaskAssignmentsQuery.js';
import {
  useMarkInventoryTaskReadyMutation,
  useStartInventoryTaskMutation,
} from '../../useInventoryTaskStatusMutation.js';
import { useAssetInventoryLocationsQuery } from '../../useAssetInventoryLocationsQuery.js';
import {
  buildLocationAssignmentPayload,
  getLocationValue,
  getUserValue,
} from '../../../utils/createInventoryTaskDialogUtils.js';
import {
  buildAssignmentFormValues,
  getAssetInventoryLocations,
  getAssetLocationId,
  getInventoryTaskAssignments,
} from '../../../utils/inventoryTaskMappers.js';
import {
  initialAssetStaffLocationsValues,
  assetStaffLocationsSchema,
} from '../../../forms/create-task/assetStaffLocationsForm.js';

export function useAssetStaffLocationsStep({ wizard }) {
  const assetLocationsQuery = useAssetInventoryLocationsQuery({
    taskId: wizard.taskId,
    enabled: Boolean(wizard.taskId),
  });

  const assetAssignmentsQuery = useInventoryAssetTaskAssignmentsQuery({
    taskId: wizard.taskId,
    enabled: Boolean(wizard.taskId),
  });

  const assignAssetMutation = useAssignInventoryAssetTaskStaffMutation();
  const readyMutation = useMarkInventoryTaskReadyMutation();
  const startMutation = useStartInventoryTaskMutation();

  const formik = useFormik({
    initialValues: initialAssetStaffLocationsValues,
    validationSchema: assetStaffLocationsSchema,
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
      const existingAssignmentCount = getInventoryTaskAssignments(assetAssignmentsQuery.data).length;
      const assetLocations = getAssetInventoryLocations(assetLocationsQuery.data);
      const assetLocationIds = assetLocations
        .map(getAssetLocationId)
        .filter((locationId) => locationId !== undefined && locationId !== null && locationId !== '');

      if (values.closeAction !== 'DRAFT' && userIds.length === 0 && existingAssignmentCount === 0) {
        formik.setFieldTouched('staff', true);
        wizard.setLocalError('Please assign at least one inventory staff member before moving the task forward.');
        return;
      }

      if (values.closeAction !== 'DRAFT' && userIds.length > 0) {
        if (assetLocationsQuery.isLoading || assetLocationsQuery.isFetching) {
          wizard.setLocalError('Asset locations are still loading. Please wait a moment and try again.');
          return;
        }

        if (assetLocationsQuery.isError) {
          wizard.setLocalError(assetLocationsQuery.error?.message || 'Could not load asset locations for assignment.');
          return;
        }

        if (assetLocationIds.length === 0) {
          wizard.setLocalError('No asset locations were found. Please import the asset Excel file first.');
          return;
        }

        const staffWithoutLocations = locationAssignments.filter((assignment) => assignment.locationIds.length === 0);
        if (staffWithoutLocations.length > 0) {
          wizard.setLocalError('Assign at least one location to every selected inventory staff member.');
          return;
        }

        const assignedLocationIds = new Set(locationAssignments.flatMap((assignment) => assignment.locationIds));
        const allLocationsAssigned = assetLocationIds.every((locationId) => assignedLocationIds.has(Number(locationId)));

        if (!allLocationsAssigned) {
          wizard.setLocalError('All imported asset locations must be assigned before moving the task forward.');
          return;
        }
      }

      try {
        if (userIds.length > 0) {
          await assignAssetMutation.mutateAsync({ taskId: wizard.taskId, userIds, locationAssignments, taskStatus: values.closeAction });
        }

        if (values.closeAction === 'READY_TO_START') {
          // Backend assignment endpoint already receives taskStatus. Keep this hook ready if the status endpoint is re-enabled later.
        }

        if (values.closeAction === 'START_NOW') {
          // startMutation is kept for parity with the vehicle flow.
        }

        wizard.markFinished();
        wizard.close(true);
      } catch (error) {
        wizard.setLocalError(error.message || 'Could not save asset staff and location assignment.');
      }
    },
  });

  const selectedStaff = Array.isArray(formik.values.staff) ? formik.values.staff : [];
  const locationAssignments = formik.values.locationAssignments || {};
  const assetLocations = useMemo(
    () => getAssetInventoryLocations(assetLocationsQuery.data),
    [assetLocationsQuery.data],
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

  const totalLocationCount = assetLocations.length;
  const assignedLocationCount = assetLocations.filter((location) => assignedLocationIds.has(String(getLocationValue(location)))).length;
  const unassignedLocationCount = Math.max(totalLocationCount - assignedLocationCount, 0);

  const busy =
    formik.isSubmitting ||
    assignAssetMutation.isPending ||
    readyMutation.isPending ||
    startMutation.isPending ||
    assetAssignmentsQuery.isLoading;

  const setUserLocations = (userId, nextLocations) => {
    formik.setFieldValue('locationAssignments', {
      ...(formik.values.locationAssignments || {}),
      [String(userId)]: nextLocations || [],
    });
  };

  const clearUserLocations = (userId) => setUserLocations(userId, []);
  const assignAllLocationsToUser = (userId) => setUserLocations(userId, assetLocations);

  useEffect(() => {
    if (assetAssignmentsQuery.isLoading || assetAssignmentsQuery.isError) return;

    const existingAssignments = getInventoryTaskAssignments(assetAssignmentsQuery.data);

    if (existingAssignments.length === 0 || selectedStaff.length > 0) return;

    const assignmentValues = buildAssignmentFormValues(existingAssignments);

    formik.setValues({
      ...formik.values,
      staff: assignmentValues.staff,
      locationAssignments: assignmentValues.locationAssignments,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetAssignmentsQuery.data, assetAssignmentsQuery.isLoading, assetAssignmentsQuery.isError]);

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
      subtitle: 'Assign inventory staff by asset locations. Staff will choose floor and place inside the Android app during scanning.',
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
    assetLocations,
    assetLocationsQuery,
    assetAssignmentsQuery,
    busy,
    totalLocationCount,
    assignedLocationCount,
    unassignedLocationCount,
    setUserLocations,
    clearUserLocations,
    assignAllLocationsToUser,
  };
}
