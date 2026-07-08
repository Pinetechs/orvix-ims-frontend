import React, { useEffect, useMemo } from 'react';
import { useFormik } from 'formik';

import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';

import { useAssignInventorySparePartTaskStaffMutation } from '../../useAssignInventorySparePartTaskStaffMutation.js';
import { useInventorySparePartTaskAssignmentsQuery } from '../../useInventorySparePartTaskAssignmentsQuery.js';
import {
  useMarkInventoryTaskReadyMutation,
  useStartInventoryTaskMutation,
} from '../../useInventoryTaskStatusMutation.js';
import { useSparePartInventoryBranchesQuery } from '../../useSparePartInventoryBranchesQuery.js';
import {
  buildBranchAssignmentPayload,
  getBranchValue,
  getUserValue,
} from '../../../utils/createInventoryTaskDialogUtils.js';
import {
  getInventoryTaskAssignments,
  getSparePartBranchId,
  getSparePartInventoryBranches,
} from '../../../utils/inventoryTaskMappers.js';
import {
  initialSparePartStaffBranchesValues,
  sparePartStaffBranchesSchema,
} from '../../../forms/create-task/sparePartStaffBranchesForm.js';

const normalizeAssignmentBranches = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.content)) return value.content;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.result)) return value.result;
  return [];
};

const buildBranchAssignmentFormValues = (assignments = []) => {
  const staff = [];
  const branchAssignments = {};

  assignments.forEach((assignment) => {
    const userId = assignment.userId ?? assignment.user?.id ?? assignment.id;

    if (!userId) return;

    staff.push({
      id: userId,
      userId,
      username: assignment.username,
      fullName: assignment.fullName,
      firstName: assignment.firstName,
      lastName: assignment.lastName,
      email: assignment.email,
    });

    branchAssignments[String(userId)] = normalizeAssignmentBranches(
      assignment.branches || assignment.branchAssignments || assignment.locations || assignment.locationAssignments,
    );
  });

  return { staff, branchAssignments };
};

export function useSparePartStaffBranchesStep({ wizard }) {
  const sparePartBranchesQuery = useSparePartInventoryBranchesQuery({
    taskId: wizard.taskId,
    enabled: Boolean(wizard.taskId),
  });

  const sparePartAssignmentsQuery = useInventorySparePartTaskAssignmentsQuery({
    taskId: wizard.taskId,
    enabled: Boolean(wizard.taskId),
  });

  const assignSparePartMutation = useAssignInventorySparePartTaskStaffMutation();
  const readyMutation = useMarkInventoryTaskReadyMutation();
  const startMutation = useStartInventoryTaskMutation();

  const formik = useFormik({
    initialValues: initialSparePartStaffBranchesValues,
    validationSchema: sparePartStaffBranchesSchema,
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

      const branchAssignments = buildBranchAssignmentPayload(values);
      const existingAssignmentCount = getInventoryTaskAssignments(sparePartAssignmentsQuery.data).length;
      const sparePartBranches = getSparePartInventoryBranches(sparePartBranchesQuery.data);
      const sparePartBranchIds = sparePartBranches
        .map(getSparePartBranchId)
        .filter((branchId) => branchId !== undefined && branchId !== null && branchId !== '');

      if (values.closeAction !== 'DRAFT' && userIds.length === 0 && existingAssignmentCount === 0) {
        formik.setFieldTouched('staff', true);
        wizard.setLocalError('Please assign at least one inventory staff member before moving the task forward.');
        return;
      }

      if (values.closeAction !== 'DRAFT' && userIds.length > 0) {
        if (sparePartBranchesQuery.isLoading || sparePartBranchesQuery.isFetching) {
          wizard.setLocalError('Spare part branches are still loading. Please wait a moment and try again.');
          return;
        }

        if (sparePartBranchesQuery.isError) {
          wizard.setLocalError(sparePartBranchesQuery.error?.message || 'Could not load spare part branches for assignment.');
          return;
        }

        if (sparePartBranchIds.length === 0) {
          wizard.setLocalError('No spare part branches were found. Please import the spare part Excel file first.');
          return;
        }

        const staffWithoutBranches = branchAssignments.filter((assignment) => assignment.branchIds.length === 0);
        if (staffWithoutBranches.length > 0) {
          wizard.setLocalError('Assign at least one branch to every selected inventory staff member.');
          return;
        }

        const assignedBranchIds = new Set(branchAssignments.flatMap((assignment) => assignment.branchIds));
        const allBranchesAssigned = sparePartBranchIds.every((branchId) => assignedBranchIds.has(Number(branchId)));

        if (!allBranchesAssigned) {
          wizard.setLocalError('All imported spare part branches must be assigned before moving the task forward.');
          return;
        }
      }

      try {
        if (userIds.length > 0) {
          await assignSparePartMutation.mutateAsync({ taskId: wizard.taskId, userIds, branchAssignments, taskStatus: values.closeAction });
        }

        if (values.closeAction === 'READY_TO_START') {
          // Backend assignment endpoint receives taskStatus. Hook kept for parity with the vehicle/asset flow.
        }

        if (values.closeAction === 'START_NOW') {
          // startMutation is kept for parity with the vehicle/asset flow.
        }

        wizard.markFinished();
        wizard.close(true);
      } catch (error) {
        wizard.setLocalError(error.message || 'Could not save spare part staff and branch assignment.');
      }
    },
  });

  const selectedStaff = Array.isArray(formik.values.staff) ? formik.values.staff : [];
  const branchAssignments = formik.values.branchAssignments || {};
  const sparePartBranches = useMemo(
    () => getSparePartInventoryBranches(sparePartBranchesQuery.data),
    [sparePartBranchesQuery.data],
  );

  const selectedStaffIds = useMemo(
    () => new Set(selectedStaff.map((user) => String(getUserValue(user))).filter(Boolean)),
    [selectedStaff],
  );

  const assignedBranchIds = useMemo(() => {
    const ids = new Set();

    Object.entries(branchAssignments).forEach(([userId, branches]) => {
      if (!selectedStaffIds.has(String(userId))) return;

      (Array.isArray(branches) ? branches : []).forEach((branch) => {
        const branchId = getBranchValue(branch);
        if (branchId !== undefined && branchId !== null && branchId !== '') {
          ids.add(String(branchId));
        }
      });
    });

    return ids;
  }, [branchAssignments, selectedStaffIds]);

  const totalBranchCount = sparePartBranches.length;
  const assignedBranchCount = sparePartBranches.filter((branch) => assignedBranchIds.has(String(getBranchValue(branch)))).length;
  const unassignedBranchCount = Math.max(totalBranchCount - assignedBranchCount, 0);

  const busy =
    formik.isSubmitting ||
    assignSparePartMutation.isPending ||
    readyMutation.isPending ||
    startMutation.isPending ||
    sparePartAssignmentsQuery.isLoading;

  const setUserBranches = (userId, nextBranches) => {
    formik.setFieldValue('branchAssignments', {
      ...(formik.values.branchAssignments || {}),
      [String(userId)]: nextBranches || [],
    });
  };

  const clearUserBranches = (userId) => setUserBranches(userId, []);
  const assignAllBranchesToUser = (userId) => setUserBranches(userId, sparePartBranches);

  useEffect(() => {
    if (sparePartAssignmentsQuery.isLoading || sparePartAssignmentsQuery.isError) return;

    const existingAssignments = getInventoryTaskAssignments(sparePartAssignmentsQuery.data);

    if (existingAssignments.length === 0 || selectedStaff.length > 0) return;

    const assignmentValues = buildBranchAssignmentFormValues(existingAssignments);

    formik.setValues({
      ...formik.values,
      staff: assignmentValues.staff,
      branchAssignments: assignmentValues.branchAssignments,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sparePartAssignmentsQuery.data, sparePartAssignmentsQuery.isLoading, sparePartAssignmentsQuery.isError]);

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
      subtitle: 'Assign inventory staff by spare part branches. Staff will choose the cabinet/rack Location inside the Android app during counting.',
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
  }, [busy, formik.values.closeAction, formik.values.staff, formik.values.branchAssignments]);

  return {
    formik,
    selectedStaff,
    branchAssignments,
    sparePartBranches,
    sparePartBranchesQuery,
    sparePartAssignmentsQuery,
    busy,
    totalBranchCount,
    assignedBranchCount,
    unassignedBranchCount,
    setUserBranches,
    clearUserBranches,
    assignAllBranchesToUser,
  };
}
