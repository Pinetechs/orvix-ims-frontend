import { useSearchParams } from 'react-router-dom';

export function useUrlPagination(defaultPageSize = 10) {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get('page') || 0);
  const pageSize = Number(searchParams.get('size') || defaultPageSize);

  const setPagination = (model) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(model.page));
    next.set('size', String(model.pageSize));
    setSearchParams(next, { replace: true });
  };

  return {
    page,
    pageSize,
    setPagination,
    searchParams,
    setSearchParams,
  };
}