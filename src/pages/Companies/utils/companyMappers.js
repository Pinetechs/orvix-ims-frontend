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

export const getCompanyName = (row = {}) => {
  return row.name || row.nameEn || row.companyName || '-';
};

export const getCompanyCode = (row = {}) => {
  return row.code || row.companyCode || '-';
};

export const getCompanyInitials = (row = {}) => {
  const source = getCompanyName(row) !== '-' ? getCompanyName(row) : getCompanyCode(row);

  return source
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
};

export const isCompanyActive = (row = {}) => {
  if (typeof row.active === 'boolean') return row.active && !row.deleted;
  if (typeof row.enabled === 'boolean') return row.enabled && !row.deleted;
  return !row.deleted;
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
