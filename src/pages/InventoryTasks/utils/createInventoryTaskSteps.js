import TaskInformationStep from '../components/create-task/common/TaskInformationStep.jsx';
import InventoryTypeStep from '../components/create-task/common/InventoryTypeStep.jsx';
import DomainNotImplementedStep from '../components/create-task/domain/DomainNotImplementedStep.jsx';
import AssetReviewImportStep from '../components/create-task/asset/AssetReviewImportStep.jsx';
import AssetStaffLocationsStep from '../components/create-task/asset/AssetStaffLocationsStep.jsx';
import AssetUploadExcelStep from '../components/create-task/asset/AssetUploadExcelStep.jsx';
import VehicleReviewImportStep from '../components/create-task/vehicle/VehicleReviewImportStep.jsx';
import VehicleStaffLocationsStep from '../components/create-task/vehicle/VehicleStaffLocationsStep.jsx';
import VehicleUploadExcelStep from '../components/create-task/vehicle/VehicleUploadExcelStep.jsx';

export const COMMON_CREATE_TASK_STEPS = [
  {
    key: 'task-information',
    label: 'Task information',
    subtitle: 'Add the basic task information and select the owning company.',
    component: TaskInformationStep,
  },
  {
    key: 'inventory-type',
    label: 'Inventory type',
    subtitle: 'Choose the inventory domain before creating the draft task.',
    component: InventoryTypeStep,
  },
];

export const DOMAIN_CREATE_TASK_STEPS = {
  VEHICLE: [
    {
      key: 'vehicle-upload-excel',
      label: 'Upload Excel',
      subtitle: 'Upload the vehicle Excel file and process it in the background.',
      component: VehicleUploadExcelStep,
    },
    {
      key: 'vehicle-review-import',
      label: 'Review',
      subtitle: 'Review the imported vehicle records before assignment.',
      component: VehicleReviewImportStep,
    },
    {
      key: 'vehicle-staff-locations',
      label: 'Staff & locations',
      subtitle: 'Assign inventory staff and imported vehicle locations.',
      component: VehicleStaffLocationsStep,
      final: true,
    },
  ],
  ASSET: [
    {
      key: 'asset-upload-excel',
      label: 'Upload Excel',
      subtitle: 'Upload the fixed asset Excel file and process it in the background.',
      component: AssetUploadExcelStep,
    },
    {
      key: 'asset-review-import',
      label: 'Review',
      subtitle: 'Review imported assets, locations, floors, places and categories.',
      component: AssetReviewImportStep,
    },
    {
      key: 'asset-staff-locations',
      label: 'Staff & locations',
      subtitle: 'Assign inventory staff to imported asset locations.',
      component: AssetStaffLocationsStep,
      final: true,
    },
  ],
  SPARE_PART: [
    {
      key: 'spare-part-not-implemented',
      label: 'Spare part workflow',
      subtitle: 'Spare part import workflow is not implemented yet.',
      component: DomainNotImplementedStep,
      final: true,
    },
  ],
};

export function buildCreateTaskSteps({ inventoryDomain } = {}) {
  const domainSteps = DOMAIN_CREATE_TASK_STEPS[inventoryDomain] || [];
  return [...COMMON_CREATE_TASK_STEPS, ...domainSteps];
}
