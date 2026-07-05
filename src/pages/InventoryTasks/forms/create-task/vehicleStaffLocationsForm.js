import * as Yup from 'yup';

export const initialVehicleStaffLocationsValues = {
  staff: [],
  closeAction: 'DRAFT',
  locationAssignments: {},
};

export const vehicleStaffLocationsSchema = Yup.object({
  staff: Yup.array(),
  closeAction: Yup.string().required('Final action is required.'),
  locationAssignments: Yup.object(),
});
