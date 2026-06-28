export const normalizeRows = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.content)) return data.data.content;
  if (Array.isArray(data?.result)) return data.result;
  if (Array.isArray(data?.result?.content)) return data.result.content;
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
  return row.company?.name || row.company?.nameEn || row?.companyName || row?.company?.code || '-';
};

export const getCreatedByName = (row = {}) => {
  const firstName = row.createdBy?.firstName || '';
  const lastName = row.createdBy?.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || row.createdByName || row.createdBy?.username || '-';
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
  const planned = Number(row.plannedRecords ?? row.totalRecords ?? 0);
  const scanned = Number(row.scannedRecords ?? 0);

  if (!planned || planned <= 0) return 0;

  return Math.min(100, Math.round((scanned / planned) * 100));
};

export const getImportSummary = (data) => {
  const source = unwrapResponseData(data) || {};

  return {
    plannedRecords: source.plannedRecords ?? source.totalRecords ?? source.savedRecords ?? source.importedRecords ?? 0,
    savedRecords: source.savedRecords ?? source.importedRecords ?? source.plannedRecords ?? 0,
    duplicateRecords: source.duplicateRecords ?? source.duplicates ?? 0,
    invalidRecords: source.invalidRecords ?? source.errorsCount ?? source.errorRecords ?? 0,
    locationCount: source.locationCount ?? source.locationsCount ?? source.createdLocationCount ?? 0,
    storeNoCount: source.storeNoCount ?? source.stStoreNoCount ?? source.storeNosCount ?? source.createdStoreNoCount ?? 0,
    locations: source.locations ?? source.locationCount ?? source.createdLocations ?? 0,
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
