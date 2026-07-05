import * as Yup from 'yup';

export const initialAssetStaffLocationsValues = {
  staff: [],
  closeAction: 'DRAFT',
  locationAssignments: {},
};

export const assetStaffLocationsSchema = Yup.object({
  staff: Yup.array(),
  closeAction: Yup.string().required('Final action is required.'),
  locationAssignments: Yup.object(),
});
