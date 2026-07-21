export const trackingLocale = (language = 'en') => (language?.startsWith('ar') ? 'ar-JO' : 'en-GB');

export const formatTrackingNumber = (value, language = 'en', maximumFractionDigits = 0) =>
  new Intl.NumberFormat(trackingLocale(language), { maximumFractionDigits }).format(Number(value || 0));

export const formatTrackingQuantity = (value, language = 'en') =>
  formatTrackingNumber(value, language, 2);

export const formatTrackingDateTime = (value, language = 'en') => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat(trackingLocale(language), {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const formatTrackingDuration = (seconds, t) => {
  const total = Math.max(Number(seconds || 0), 0);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  if (days > 0) return t('taskTracking.duration.daysHours', { days, hours });
  if (hours > 0) return t('taskTracking.duration.hoursMinutes', { hours, minutes });
  return t('taskTracking.duration.minutes', { minutes });
};

export const clampTrackingPercentage = (value) => Math.min(Math.max(Number(value || 0), 0), 100);

export const pageContent = (page) => (Array.isArray(page?.content) ? page.content : []);

export const pageTotal = (page) => Number(page?.totalElements || 0);

export const userDisplayName = (user) => user?.name || user?.username || '-';

export const areaPath = (row) => [row?.actualArea, row?.actualSubArea, row?.actualLeafArea]
  .filter(Boolean)
  .join(' / ') || '-';

export const expectedAreaPath = (row) => [row?.expectedArea, row?.expectedSubArea, row?.expectedLeafArea]
  .filter(Boolean)
  .join(' / ') || '-';

export const resultStatusColor = (row) => {
  if (!row?.processed) return 'default';
  return row?.matched ? 'success' : 'error';
};

export const resultStatusKey = (row) => {
  if (!row?.processed) return 'REMAINING';
  return row?.matched ? 'MATCHED' : 'MISMATCHED';
};

export const hasQuantityMetrics = (overview) => overview?.domain === 'SPARE_PART';
