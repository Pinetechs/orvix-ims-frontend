import * as Yup from 'yup';

export const initialInventoryTypeValues = {
  inventoryDomain: 'VEHICLE',
  scanImageRequired: true,
  sparePartLocationProgressMode: 'BASIC',
};

export const inventoryTypeSchema = Yup.object({
  inventoryDomain: Yup.string().required('Inventory domain is required.'),
  scanImageRequired: Yup.boolean().required(),
  sparePartLocationProgressMode: Yup.string().oneOf(['BASIC', 'DETAILED']).required(),
});
