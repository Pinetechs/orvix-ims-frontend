import * as Yup from 'yup';

export const initialSparePartStaffBranchesValues = {
  staff: [],
  closeAction: 'DRAFT',
  branchAssignments: {},
};

export const sparePartStaffBranchesSchema = Yup.object({
  staff: Yup.array(),
  closeAction: Yup.string().required('Final action is required.'),
  branchAssignments: Yup.object(),
});
