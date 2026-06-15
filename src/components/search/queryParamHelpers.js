export const isEmptyQueryValue = (value) => {
  return value === undefined || value === null || value === '' || value === 'ALL';
};

export const parseCsvParam = (value) => {
  if (!value) return [];

  return String(value)
    .split(',')
    .map((item) => decodeURIComponent(item).trim())
    .filter(Boolean);
};

export const writeQueryParam = (searchParams, key, value, options = {}) => {
  const { resetPage = true, pageParam = 'page' } = options;
  const next = new URLSearchParams(searchParams);

  if (Array.isArray(value)) {
    const cleanValues = value.filter((item) => !isEmptyQueryValue(item));

    if (cleanValues.length === 0) {
      next.delete(key);
    } else {
      next.set(key, cleanValues.join(','));
    }
  } else if (isEmptyQueryValue(value)) {
    next.delete(key);
  } else {
    next.set(key, String(value));
  }

  if (resetPage && pageParam) {
    next.set(pageParam, '0');
  }

  return next;
};