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

export const getFullName = (row) => {
  const fullName = `${row.firstName || ''} ${row.lastName || ''}`.trim();
  return fullName || row.name || row.username || '-';
};

export const getInitials = (row) => {
  return getFullName(row)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
};

export const getCompanyName = (row) => {
  if (Array.isArray(row.companies) && row.companies.length > 0) {
    return row.companies
      .map((company) => company.name || company.nameEn || company.code)
      .filter(Boolean)
      .join(', ');
  }

  return row.company?.name || row.company?.nameEn || row.companyName || row.company?.code || 'Global';
};

export const isUserActive = (row) => {
  if (typeof row.enabled === 'boolean') return row.enabled && !row.deleted;
  if (typeof row.active === 'boolean') return row.active && !row.deleted;
  return !row.deleted;
};