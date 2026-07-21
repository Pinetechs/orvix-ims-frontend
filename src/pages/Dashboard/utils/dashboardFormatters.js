export const dashboardLocale = (language = 'en') => (language?.startsWith('ar') ? 'ar-JO' : 'en-GB');

export const formatDashboardNumber = (value, language = 'en') =>
  new Intl.NumberFormat(dashboardLocale(language), { maximumFractionDigits: 0 }).format(Number(value || 0));

export const formatDashboardDateTime = (value, language = 'en') => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat(dashboardLocale(language), {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const clampPercentage = (value) => Math.min(Math.max(Number(value || 0), 0), 100);
