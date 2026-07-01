export const normalizeRows = (data) => {
 
  if (Array.isArray(data?.content)) return data.content;
 
  return [];
};

export const getTotalElements = (data) => {
  return (
    data?.totalElements ??
    data?.data?.totalElements ??
    data?.result?.totalElements ??
    normalizeRows(data).length
  );
};

export const unwrapResponseData = (data) => {
  return data?.data ?? data?.result ?? data;
};

export const getTaskId = (row = {}) => row?.id ?? row?.taskId;

export const getTaskName = (row = {}) => row?.taskName || row?.name || row?.title || row?.taskNumber || '-';

export const getTaskNumber = (row = {}) => row?.taskNumber || row?.code || row?.number || '-';

export const getCompanyName = (row = {}) => {
  return   row?.companyCode +"-" + row?.companyName;

}
export const getCreatedByName = (row = {}) => {
 
  return row?.createBy || '';
};

export const formatDateTime = (value) => {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const getProgressPercent = (row = {}) => {
  
  return row?.progress
};

export const getImportSummary = (data) => {
  const source = unwrapResponseData(data) || {};
  const errors = Array.isArray(source.errors) ? source.errors : [];

  return {
    plannedRecords:
      source.plannedRecords ??
      source.totalRecords ??
      source.totalRows ??
      source.savedRecords ??
      source.importedRows ??
      source.importedItems ??
      source.importedRecords ??
      0,
    savedRecords:
      source.savedRecords ??
      source.importedRows ??
      source.importedItems ??
      source.importedRecords ??
      source.plannedRecords ??
      0,
    duplicateRecords: source.duplicatedVinCount ?? source.duplicateRecords ?? source.duplicates ?? 0,
    invalidRecords: source.invalidRecords ?? source.errorsCount ?? source.errorRecords ?? errors.length ?? 0,
    locationCount: source.locationCount ?? source.locationsCount ?? source.createdLocationCount ?? 0,
    storeNoCount: source.storeNoCount ?? source.stStoreNoCount ?? source.storeNosCount ?? source.createdStoreNoCount ?? 0,
    locations: source.locations ?? source.locationCount ?? source.createdLocations ?? 0,
    storeNos: source.storeNos ?? source.storeNoList ?? source.stStoreNos ?? [],
    errors,
    message: source.message || data?.message || '',
  };
};

const normalizeImportSource = (data) => {
  const source = unwrapResponseData(data) || {};
  return source;
};

export const getVehicleImportRows = (data) => {
  const source = normalizeImportSource(data);

  const possibleSources = [
    source.records,
    source.items,
    source.importedRecordsPage,
    source.importedItems,
    source.vehicleItems,
    source.page,
    source.preview,
    source,
  ];

  for (const item of possibleSources) {
    if (Array.isArray(item)) return item;
    if (Array.isArray(item?.content)) return item.content;
    if (Array.isArray(item?.data)) return item.data;
    if (Array.isArray(item?.data?.content)) return item.data.content;
    if (Array.isArray(item?.result)) return item.result;
    if (Array.isArray(item?.result?.content)) return item.result.content;
  }

  return [];
};

export const getVehicleImportTotalElements = (data) => {
  const source = normalizeImportSource(data);

  return (
    source.records?.totalElements ??
    source.items?.totalElements ??
    source.importedRecordsPage?.totalElements ??
    source.importedItems?.totalElements ??
    source.vehicleItems?.totalElements ??
    source.page?.totalElements ??
    source.totalElements ??
    getVehicleImportRows(data).length
  );
};

const getUniqueValuesFromRows = (rows, keys = []) => {
  const values = rows
    .map((row) => keys.map((key) => row?.[key]).find((value) => value !== undefined && value !== null && value !== ''))
    .filter((value) => value !== undefined && value !== null && value !== '')
    .map((value) => String(value).trim())
    .filter(Boolean);

  return Array.from(new Set(values));
};

const getListValue = (value) => {
  if (Array.isArray(value)) return value.map((item) => (typeof item === 'object' ? item.name || item.locationName || item.storeNo || item.code : item)).filter(Boolean);
  return [];
};

export const getVehicleImportLocations = (data) => {
  const source = normalizeImportSource(data);
  const explicitValues = getListValue(source.locationsList || source.locations || source.locationNames || source.createdLocations);

  if (explicitValues.length > 0) {
    return Array.from(new Set(explicitValues.map((value) => String(value).trim()).filter(Boolean)));
  }

  return getUniqueValuesFromRows(getVehicleImportRows(data), ['locationName', 'location', 'LOCATION', 'storeLocation']);
};

export const getVehicleImportStoreNos = (data) => {
  const source = normalizeImportSource(data);
  const explicitValues = getListValue(source.storeNos || source.storeNoList || source.stStoreNos || source.storeNumbers);

  if (explicitValues.length > 0) {
    return Array.from(new Set(explicitValues.map((value) => String(value).trim()).filter(Boolean)));
  }

  return getUniqueValuesFromRows(getVehicleImportRows(data), ['storeNo', 'stStoreNo', 'ST_STORE_NO', 'storeNumber']);
};
