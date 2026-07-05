import React, { useEffect, useMemo, useState } from 'react';

import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';

import { useBackgroundJobQuery } from '../../../../../hooks/useBackgroundJobQuery.js';
import { parseBackgroundJobResult } from '../../../../../services/backgroundJobUtils.js';
import { useAssetInventoryItemsQuery } from '../../useAssetInventoryItemsQuery.js';
import { useAssetInventoryLocationsQuery } from '../../useAssetInventoryLocationsQuery.js';
import { useAssetInventoryCategoriesQuery } from '../../useAssetInventoryCategoriesQuery.js';
import { IMPORT_COMPLETED_STATUS } from '../../../utils/createInventoryTaskDialogUtils.js';
import {
  getAssetImportCategories,
  getAssetImportFloors,
  getAssetImportLocations,
  getAssetImportPlaces,
  getAssetImportRows,
  getAssetImportSummary,
  getAssetImportTotalElements,
  getAssetInventoryCategories,
  getAssetInventoryLocations,
} from '../../../utils/inventoryTaskMappers.js';
import { getAssetImportRowId } from '../../../components/CreateInventoryTaskDialogParts.jsx';

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

const getCategoryNamesFromCategoriesApi = (categories = []) => {
  return uniqueStringValues(
    categories.map((category) => category.assetCategory || category.category || category.name || category.label),
  );
};

export function useAssetReviewImportStep({ wizard }) {
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });

  const hasCompletedImport = wizard.taskStatus === IMPORT_COMPLETED_STATUS;
  const canReadImportedData = Boolean(wizard.taskId) && hasCompletedImport;

  const backgroundJobQuery = useBackgroundJobQuery(wizard.importJobId, {
    enabled: Boolean(wizard.importJobId) && hasCompletedImport,
    intervalMs: 3000,
    polling: false,
  });

  const backgroundJob = useMemo(() => backgroundJobQuery.data, [backgroundJobQuery.data]);

  const backgroundJobResult = useMemo(
    () => parseBackgroundJobResult(backgroundJob) || null,
    [backgroundJob],
  );

  const assetItemsQuery = useAssetInventoryItemsQuery({
    taskId: wizard.taskId,
    page: paginationModel.page,
    size: paginationModel.pageSize,
    enabled: canReadImportedData,
  });

  const assetLocationsQuery = useAssetInventoryLocationsQuery({
    taskId: wizard.taskId,
    enabled: canReadImportedData,
  });

  const assetCategoriesQuery = useAssetInventoryCategoriesQuery({
    taskId: wizard.taskId,
    enabled: canReadImportedData,
  });

  const importSummarySource = useMemo(
    () => backgroundJobResult || wizard.currentTask || assetItemsQuery.data,
    [backgroundJobResult, assetItemsQuery.data, wizard.currentTask],
  );

  const importSummary = useMemo(() => getAssetImportSummary(importSummarySource), [importSummarySource]);
  const importRows = useMemo(() => getAssetImportRows(assetItemsQuery.data), [assetItemsQuery.data]);
  const importGridRows = useMemo(
    () => importRows.map((row, index) => ({ ...row, __rowId: getAssetImportRowId(row, index) })),
    [importRows],
  );
  const importTotalElements = useMemo(() => {
    const pageableTotal = getAssetImportTotalElements(assetItemsQuery.data);
    return pageableTotal || importSummary.savedRecords || importSummary.plannedRecords || 0;
  }, [assetItemsQuery.data, importSummary.plannedRecords, importSummary.savedRecords]);

  const assetLocations = useMemo(
    () => getAssetInventoryLocations(assetLocationsQuery.data),
    [assetLocationsQuery.data],
  );

  const assetCategories = useMemo(
    () => getAssetInventoryCategories(assetCategoriesQuery.data),
    [assetCategoriesQuery.data],
  );

  const importLocations = useMemo(() => {
    const fromResult = getAssetImportLocations(importSummarySource);
    if (fromResult.length > 0) return fromResult;

    const fromLocationsApi = getLocationNamesFromLocationsApi(assetLocations);
    if (fromLocationsApi.length > 0) return fromLocationsApi;

    return getAssetImportLocations(assetItemsQuery.data);
  }, [importSummarySource, assetItemsQuery.data, assetLocations]);

  const importCategories = useMemo(() => {
    const fromRows = getAssetImportCategories(assetItemsQuery.data);
    if (fromRows.length > 0) return fromRows;

    const fromCategoriesApi = getCategoryNamesFromCategoriesApi(assetCategories);
    if (fromCategoriesApi.length > 0) return fromCategoriesApi;

    return getAssetImportCategories(importSummarySource);
  }, [assetItemsQuery.data, assetCategories, importSummarySource]);

  const importFloors = useMemo(() => getAssetImportFloors(assetItemsQuery.data), [assetItemsQuery.data]);
  const importPlaces = useMemo(() => getAssetImportPlaces(assetItemsQuery.data), [assetItemsQuery.data]);

  useEffect(() => {
    const canContinue = Boolean(backgroundJobResult) || hasCompletedImport;

    wizard.setStepConfig({
      subtitle: 'Review the import summary and pageable asset records before assigning staff by location.',
      canClose: true,
      closeBlocked: false,
      closeConfirmMessage: null,
      nextLabel: 'Continue to Staff & Locations',
      nextDisabled: !canContinue,
      nextLoading: false,
      onNext: () => {
        if (!canContinue) {
          wizard.setLocalError('Please upload and validate the asset Excel file before continuing.');
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
    assetItemsQuery,
    assetLocationsQuery,
    assetCategoriesQuery,
    importSummary,
    importGridRows,
    importTotalElements,
    importLocations,
    importFloors,
    importPlaces,
    importCategories,
  };
}
