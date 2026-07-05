import React, { useEffect, useMemo, useState } from 'react';

import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';

import { useBackgroundJobQuery } from '../../../../../hooks/useBackgroundJobQuery.js';
import {parseBackgroundJobResult} from '../../../../../services/backgroundJobUtils.js';
import { useVehicleInventoryItemsQuery } from '../../useVehicleInventoryItemsQuery.js';
import { useVehicleInventoryLocationsQuery } from '../../useVehicleInventoryLocationsQuery.js';
import { IMPORT_COMPLETED_STATUS } from '../../../utils/createInventoryTaskDialogUtils.js';
import {
  getImportSummary,
  getVehicleImportLocations,
  getVehicleImportRows,
  getVehicleImportStoreNos,
  getVehicleImportTotalElements,
  getVehicleInventoryLocations,
} from '../../../utils/inventoryTaskMappers.js';
import { getVehicleImportRowId } from '../../../components/CreateInventoryTaskDialogParts.jsx';

const uniqueStringValues = (values = []) => {
  return Array.from(
    new Set(
      values
        .filter((value) => value !== undefined && value !== null && value !== '')
        .map((value) => String(value).trim())
        .filter(Boolean),
    ),
  );
};

const getLocationNamesFromLocationsApi = (locations = []) => {
  return uniqueStringValues(
    locations.map((location) => location.locationName || location.name || location.label || location.location),
  );
};

const getStoreNosFromLocationsApi = (locations = []) => {
  return uniqueStringValues(
    locations.map((location) => location.storeNo || location.stStoreNo || location.ST_STORE_NO || location.code),
  );
};

export function useVehicleReviewImportStep({ wizard }) {
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });

  const hasCompletedImport = wizard.taskStatus === IMPORT_COMPLETED_STATUS;
  const canReadImportedData = Boolean(wizard.taskId) && hasCompletedImport;

  const backgroundJobQuery = useBackgroundJobQuery(wizard.importJobId, {
    enabled: Boolean(wizard.importJobId) && hasCompletedImport,
    intervalMs: 3000,
    polling: false,

  });

  const backgroundJob = useMemo(
    () => backgroundJobQuery.data
  );

  const backgroundJobResult = useMemo(
    () => parseBackgroundJobResult(backgroundJob) || null,
    [backgroundJob],
  );

  const vehicleItemsQuery = useVehicleInventoryItemsQuery({
    taskId: wizard.taskId,
    page: paginationModel.page,
    size: paginationModel.pageSize,
    enabled: canReadImportedData,
  });

  const vehicleLocationsQuery = useVehicleInventoryLocationsQuery({
    taskId: wizard.taskId,
    enabled: canReadImportedData,
  });

  const importSummarySource = useMemo(
    () => backgroundJobResult || wizard.currentTask || vehicleItemsQuery.data,
    [backgroundJobResult, vehicleItemsQuery.data, wizard.currentTask],
  );

  const importSummary = useMemo(() => getImportSummary(importSummarySource), [importSummarySource]);
  const importRows = useMemo(() => getVehicleImportRows(vehicleItemsQuery.data), [vehicleItemsQuery.data]);
  const importGridRows = useMemo(
    () => importRows.map((row, index) => ({ ...row, __rowId: getVehicleImportRowId(row, index) })),
    [importRows],
  );
  const importTotalElements = useMemo(() => {
    const pageableTotal = getVehicleImportTotalElements(vehicleItemsQuery.data);
    return pageableTotal || importSummary.savedRecords || importSummary.plannedRecords || 0;
  }, [vehicleItemsQuery.data, importSummary.plannedRecords, importSummary.savedRecords]);

  const vehicleLocations = useMemo(
    () => getVehicleInventoryLocations(vehicleLocationsQuery.data),
    [vehicleLocationsQuery.data],
  );

  const importLocations = useMemo(() => {
    const fromResult = getVehicleImportLocations(importSummarySource);
    if (fromResult.length > 0) return fromResult;

    const fromLocationsApi = getLocationNamesFromLocationsApi(vehicleLocations);
    if (fromLocationsApi.length > 0) return fromLocationsApi;

    return getVehicleImportLocations(vehicleItemsQuery.data);
  }, [importSummarySource, vehicleItemsQuery.data, vehicleLocations]);

  const importStoreNos = useMemo(() => {
    const fromResult = getVehicleImportStoreNos(importSummarySource);
    if (fromResult.length > 0) return fromResult;

    const fromLocationsApi = getStoreNosFromLocationsApi(vehicleLocations);
    if (fromLocationsApi.length > 0) return fromLocationsApi;

    return getVehicleImportStoreNos(vehicleItemsQuery.data);
  }, [importSummarySource, vehicleItemsQuery.data, vehicleLocations]);

  useEffect(() => {
    const canContinue = Boolean(backgroundJobResult) || hasCompletedImport;

    wizard.setStepConfig({
      subtitle: 'Review the import summary and pageable vehicle records before assigning staff.',
      canClose: true,
      closeBlocked: false,
      closeConfirmMessage: null,
      nextLabel: 'Continue to Staff & Locations',
      nextDisabled: !canContinue,
      nextLoading: false,
      onNext: () => {
        if (!canContinue) {
          wizard.setLocalError('Please upload and validate the vehicle Excel file before continuing.');
          return;
        }
        wizard.goNext();
      },
      nextEndIcon: React.createElement(KeyboardArrowRightRoundedIcon),
    });

    return wizard.resetStepControls;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backgroundJobResult, hasCompletedImport]);

  return {
    paginationModel,
    setPaginationModel,
    hasCompletedImport,
    backgroundJobQuery,
    vehicleItemsQuery,
    vehicleLocationsQuery,
    importSummary,
    importGridRows,
    importTotalElements,
    importLocations,
    importStoreNos,
  };
}
