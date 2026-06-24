import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllSettingsRequest, mapSettings } from '../services/settingsService.js';
import { queryKeys } from '../services/queryKeys.js';

export const useSettings = () => {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.settings.all;
  const cachedSettings = queryClient.getQueryData(queryKey);

  const query = useQuery({
    queryKey,
    queryFn: getAllSettingsRequest,
    staleTime: 10 * 60 * 1000,
    retry: 1,
    keepPreviousData: true,
    enabled: !cachedSettings,
    initialData: cachedSettings ?? undefined,
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, data);
    },
  });

  const effectiveData = query.data || cachedSettings || [];
  const settingsMap = useMemo(() => mapSettings(effectiveData), [effectiveData]);

  return {
    ...query,
    loading: query.isLoading ? 'pending' : query.isError ? 'failed' : query.isSuccess ? 'succeeded' : 'idle',
    data: effectiveData,
    settingsMap,
    isError: query.isError && !cachedSettings,
    error: query.isError && !cachedSettings ? query.error : null,
  };
};
