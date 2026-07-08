import React, { useEffect, useMemo, useState } from 'react';

import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';

import { useBackgroundJobQuery } from '../../../../../hooks/useBackgroundJobQuery.js';
import { parseBackgroundJobResult } from '../../../../../services/backgroundJobUtils.js';
import { useSparePartInventoryItemsQuery } from '../../useSparePartInventoryItemsQuery.js';
import { useSparePartInventoryBranchesQuery } from '../../useSparePartInventoryBranchesQuery.js';
import { useSparePartInventoryBrandsQuery } from '../../useSparePartInventoryBrandsQuery.js';
import { IMPORT_COMPLETED_STATUS } from '../../../utils/createInventoryTaskDialogUtils.js';
import {
  getSparePartImportBranches,
  getSparePartImportBrands,
  getSparePartImportLocations,
  getSparePartImportRows,
  getSparePartImportSummary,
  getSparePartImportTotalElements,
  getSparePartInventoryBranches,
  getSparePartInventoryBrands,
} from '../../../utils/inventoryTaskMappers.js';
import { getSparePartImportRowId } from '../../../components/CreateInventoryTaskDialogParts.jsx';

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

const getBranchNamesFromBranchesApi = (branches = []) => {
  return uniqueStringValues(
    branches.map((branch) => branch.branchName || branch.name || branch.label || branch.branch),
  );
};

const getBrandNamesFromBrandsApi = (brands = []) => {
  return uniqueStringValues(
    brands.map((brand) => brand.brandName || brand.name || brand.label || brand.brand),
  );
};

export function useSparePartReviewImportStep({ wizard }) {
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

  const sparePartItemsQuery = useSparePartInventoryItemsQuery({
    taskId: wizard.taskId,
    page: paginationModel.page,
    size: paginationModel.pageSize,
    enabled: canReadImportedData,
  });

  const sparePartBranchesQuery = useSparePartInventoryBranchesQuery({
    taskId: wizard.taskId,
    enabled: canReadImportedData,
  });

  const sparePartBrandsQuery = useSparePartInventoryBrandsQuery({
    taskId: wizard.taskId,
    enabled: canReadImportedData,
  });

  const importSummarySource = useMemo(
    () => backgroundJobResult || wizard.currentTask || sparePartItemsQuery.data,
    [backgroundJobResult, sparePartItemsQuery.data, wizard.currentTask],
  );

  const importSummary = useMemo(() => getSparePartImportSummary(importSummarySource), [importSummarySource]);
  const importRows = useMemo(() => getSparePartImportRows(sparePartItemsQuery.data), [sparePartItemsQuery.data]);
  const importGridRows = useMemo(
    () => importRows.map((row, index) => ({ ...row, __rowId: getSparePartImportRowId(row, index) })),
    [importRows],
  );
  const importTotalElements = useMemo(() => {
    const pageableTotal = getSparePartImportTotalElements(sparePartItemsQuery.data);
    return pageableTotal || importSummary.savedRecords || importSummary.plannedRecords || 0;
  }, [sparePartItemsQuery.data, importSummary.plannedRecords, importSummary.savedRecords]);

  const sparePartBranches = useMemo(
    () => getSparePartInventoryBranches(sparePartBranchesQuery.data),
    [sparePartBranchesQuery.data],
  );

  const sparePartBrands = useMemo(
    () => getSparePartInventoryBrands(sparePartBrandsQuery.data),
    [sparePartBrandsQuery.data],
  );

  const importBranches = useMemo(() => {
    const fromResult = getSparePartImportBranches(importSummarySource);
    if (fromResult.length > 0) return fromResult;

    const fromBranchesApi = getBranchNamesFromBranchesApi(sparePartBranches);
    if (fromBranchesApi.length > 0) return fromBranchesApi;

    return getSparePartImportBranches(sparePartItemsQuery.data);
  }, [importSummarySource, sparePartItemsQuery.data, sparePartBranches]);

  const importLocations = useMemo(() => getSparePartImportLocations(sparePartItemsQuery.data), [sparePartItemsQuery.data]);

  const importBrands = useMemo(() => {
    const fromRows = getSparePartImportBrands(sparePartItemsQuery.data);
    if (fromRows.length > 0) return fromRows;

    const fromBrandsApi = getBrandNamesFromBrandsApi(sparePartBrands);
    if (fromBrandsApi.length > 0) return fromBrandsApi;

    return getSparePartImportBrands(importSummarySource);
  }, [sparePartItemsQuery.data, sparePartBrands, importSummarySource]);

  useEffect(() => {
    const canContinue = Boolean(backgroundJobResult) || hasCompletedImport;

    wizard.setStepConfig({
      subtitle: 'Review the import summary and pageable spare part records before assigning staff by branch.',
      canClose: true,
      closeBlocked: false,
      closeConfirmMessage: null,
      nextLabel: 'Continue to Staff & Branches',
      nextDisabled: !canContinue,
      nextLoading: false,
      onNext: () => {
        if (!canContinue) {
          wizard.setLocalError('Please upload and validate the spare part Excel file before continuing.');
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
    sparePartItemsQuery,
    sparePartBranchesQuery,
    sparePartBrandsQuery,
    importSummary,
    importGridRows,
    importTotalElements,
    importBranches,
    importLocations,
    importBrands,
  };
}
