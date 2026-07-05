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


  return row?.company?.name;

}

export const getCompanyCode = (row = {}) => {
  return row?.company?.code;
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


export const getVehicleInventoryLocations = (data) => {
  const source = unwrapResponseData(data);

  if (Array.isArray(source)) return source;
  if (Array.isArray(source?.content)) return source.content;
  if (Array.isArray(source?.data)) return source.data;
  if (Array.isArray(source?.data?.content)) return source.data.content;
  if (Array.isArray(source?.result)) return source.result;
  if (Array.isArray(source?.result?.content)) return source.result.content;

  return [];
};

export const getVehicleLocationId = (location = {}) => location.id ?? location.locationId ?? location.value;

export const getInventoryTaskAssignments = (data) => {
  const source = unwrapResponseData(data);

  if (Array.isArray(source)) return source;
  if (Array.isArray(source?.content)) return source.content;
  if (Array.isArray(source?.data)) return source.data;
  if (Array.isArray(source?.data?.content)) return source.data.content;
  if (Array.isArray(source?.result)) return source.result;
  if (Array.isArray(source?.result?.content)) return source.result.content;

  return [];
};

export const buildAssignmentFormValues = (assignments = []) => {
  const staff = [];
  const locationAssignments = {};

  assignments.forEach((assignment) => {
    const userId = assignment.userId ?? assignment.user?.id ?? assignment.id;

    if (!userId) return;

    staff.push({
      id: userId,
      userId,
      username: assignment.username,
      fullName: assignment.fullName,
      firstName: assignment.firstName,
      lastName: assignment.lastName,
      email: assignment.email,
    });

    locationAssignments[String(userId)] = getVehicleInventoryLocations(assignment.locations || assignment.locationAssignments);
  });

  return { staff, locationAssignments };
};

export const normalizeListResponse = (data) => {
  const source = unwrapResponseData(data);

  if (Array.isArray(source)) return source;
  if (Array.isArray(source?.content)) return source.content;
  if (Array.isArray(source?.data)) return source.data;
  if (Array.isArray(source?.data?.content)) return source.data.content;
  if (Array.isArray(source?.result)) return source.result;
  if (Array.isArray(source?.result?.content)) return source.result.content;

  return [];
};

export const getAssetImportRows = (data) => {
  const source = normalizeImportSource(data);

  const possibleSources = [
    source.records,
    source.items,
    source.importedRecordsPage,
    source.importedItems,
    source.assetItems,
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

export const getAssetImportTotalElements = (data) => {
  const source = normalizeImportSource(data);

  return (
    source.records?.totalElements ??
    source.items?.totalElements ??
    source.importedRecordsPage?.totalElements ??
    source.importedItems?.totalElements ??
    source.assetItems?.totalElements ??
    source.page?.totalElements ??
    source.totalElements ??
    getAssetImportRows(data).length
  );
};

export const getAssetImportSummary = (data) => {
  const source = unwrapResponseData(data) || {};
  const errors = Array.isArray(source.errors) ? source.errors : [];

  return {
    plannedRecords:
      source.plannedRecords ??
      source.totalRecords ??
      source.totalRows ??
      source.importedRows ??
      source.importedItems ??
      source.savedRecords ??
      0,
    savedRecords:
      source.savedRecords ??
      source.importedItems ??
      source.importedRows ??
      source.importedRecords ??
      source.plannedRecords ??
      0,
    duplicateRecords:
      source.duplicatedBarcodeCount ??
      source.duplicateBarcodeCount ??
      source.duplicateRecords ??
      source.duplicates ??
      0,
    invalidRecords: source.invalidRecords ?? source.errorsCount ?? source.errorRecords ?? errors.length ?? 0,
    locationCount: source.locationCount ?? source.locationsCount ?? source.createdLocationCount ?? 0,
    floorCount: source.floorCount ?? source.floorsCount ?? source.createdFloorCount ?? 0,
    placeCount: source.placeCount ?? source.placesCount ?? source.createdPlaceCount ?? 0,
    categoryCount: source.categoryCount ?? source.categoriesCount ?? source.createdCategoryCount ?? 0,
    locations: source.locations ?? source.locationNames ?? source.createdLocations ?? [],
    errors,
    message: source.message || data?.message || '',
  };
};

export const getAssetImportLocations = (data) => {
  const source = normalizeImportSource(data);
  const explicitValues = getListValue(source.locationsList || source.locations || source.locationNames || source.createdLocations);

  if (explicitValues.length > 0) {
    return Array.from(new Set(explicitValues.map((value) => String(value).trim()).filter(Boolean)));
  }

  return getUniqueValuesFromRows(getAssetImportRows(data), ['plannedLocationName', 'locationName', 'location', 'LOCATION']);
};

export const getAssetImportFloors = (data) => {
  return getUniqueValuesFromRows(getAssetImportRows(data), ['plannedFloorName', 'floorName', 'floor', 'FLOOR']);
};

export const getAssetImportPlaces = (data) => {
  return getUniqueValuesFromRows(getAssetImportRows(data), ['plannedPlaceName', 'placeName', 'place', 'PLACE']);
};

export const getAssetImportCategories = (data) => {
  return getUniqueValuesFromRows(getAssetImportRows(data), ['assetCategory', 'category', 'ASSET_CATEGORY']);
};

export const getAssetInventoryLocations = (data) => normalizeListResponse(data);
export const getAssetInventoryFloors = (data) => normalizeListResponse(data);
export const getAssetInventoryPlaces = (data) => normalizeListResponse(data);
export const getAssetInventoryCategories = (data) => normalizeListResponse(data);

export const getAssetLocationId = (location = {}) => location.id ?? location.locationId ?? location.value;
