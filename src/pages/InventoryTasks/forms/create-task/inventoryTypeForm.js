import * as Yup from 'yup';

export const initialInventoryTypeValues = {
  inventoryDomain: 'VEHICLE',
};

export const inventoryTypeSchema = Yup.object({
  inventoryDomain: Yup.string().required('Inventory domain is required.'),
});
