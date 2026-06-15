import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Autocomplete, CircularProgress, TextField } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';

import { useDebouncedValue } from '../../hooks/useDebouncedValue.js';
import { parseCsvParam, writeQueryParam } from './queryParamHelpers.js';

const normalizeOptions = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.content)) return data.data.content;
  if (Array.isArray(data?.result)) return data.result;
  if (Array.isArray(data?.result?.content)) return data.result.content;
  return [];
};

function QueryAsyncAutocompleteField({
  paramName,
  label,
  queryKey,
  queryFn,
  parentParams = {},
  multiple = false,
  optionValueKey = 'id',
  optionLabelKeys = ['name'],
  getOptionLabel,
  size = 'small',
  disabled = false,
  placeholder,
  debounceMs = 400,
  minSearchLength = 0,
  resetPage = true,
  pageParam = 'page',
  clearWhenParentChanges = true,
  sx,
}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const debouncedInputValue = useDebouncedValue(inputValue, debounceMs);
  const parentSignature = JSON.stringify(parentParams || {});
  const firstParentRender = useRef(true);

  const rawValue = searchParams.get(paramName);
  const selectedIds = useMemo(() => {
    if (multiple) {
      return parseCsvParam(rawValue).map(String);
    }

    return rawValue ? [String(rawValue)] : [];
  }, [rawValue, multiple]);

  useEffect(() => {
    if (!clearWhenParentChanges) return;

    if (firstParentRender.current) {
      firstParentRender.current = false;
      return;
    }

    const next = writeQueryParam(searchParams, paramName, multiple ? [] : '', {
      resetPage,
      pageParam,
    });

    setSearchParams(next, { replace: true });
  }, [parentSignature]);

  const enabled =
    !disabled &&
    (open || selectedIds.length > 0) &&
    debouncedInputValue.trim().length >= minSearchLength;

  const query = useQuery({
    queryKey: [...queryKey, debouncedInputValue, parentParams],
    queryFn: () =>
      queryFn({
        search: debouncedInputValue,
        ...parentParams,
      }),
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  const options = useMemo(() => normalizeOptions(query.data), [query.data]);

  const resolveValue = (option) => {
    return String(option?.[optionValueKey] ?? '');
  };

  const resolveLabel = (option) => {
    if (!option) return '';

    if (typeof option === 'string') {
      return option;
    }

    if (getOptionLabel) {
      return getOptionLabel(option);
    }

    return optionLabelKeys
      .map((key) => option?.[key])
      .filter(Boolean)
      .join(' - ');
  };

  const value = useMemo(() => {
    if (multiple) {
      return selectedIds.map((id) => {
        return (
          options.find((option) => resolveValue(option) === id) || {
            [optionValueKey]: id,
            [optionLabelKeys[0]]: id,
          }
        );
      });
    }

    const id = selectedIds[0];

    if (!id) {
      return null;
    }

    return (
      options.find((option) => resolveValue(option) === id) || {
        [optionValueKey]: id,
        [optionLabelKeys[0]]: id,
      }
    );
  }, [multiple, selectedIds, options, optionValueKey, optionLabelKeys]);

  const handleChange = (_, nextValue) => {
    if (multiple) {
      const values = (nextValue || []).map((item) => resolveValue(item)).filter(Boolean);

      const next = writeQueryParam(searchParams, paramName, values, {
        resetPage,
        pageParam,
      });

      setSearchParams(next, { replace: true });
      return;
    }

    const nextValueId = nextValue ? resolveValue(nextValue) : '';

    const next = writeQueryParam(searchParams, paramName, nextValueId, {
      resetPage,
      pageParam,
    });

    setSearchParams(next, { replace: true });
  };

  return (
    <Autocomplete
      multiple={multiple}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      options={options}
      value={value}
      disabled={disabled}
      size={size}
      inputValue={inputValue}
      onInputChange={(_, nextInputValue, reason) => {
        if (reason === 'input' || reason === 'clear') {
          setInputValue(nextInputValue);
        }
      }}
      onChange={handleChange}
      loading={query.isLoading || query.isFetching}
      getOptionLabel={resolveLabel}
      isOptionEqualToValue={(option, selectedValue) => {
        return resolveValue(option) === resolveValue(selectedValue);
      }}
      filterOptions={(items) => items}
      disableCloseOnSelect={multiple}
      sx={sx}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {(query.isLoading || query.isFetching) && (
                  <CircularProgress color="inherit" size={18} />
                )}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}

export default QueryAsyncAutocompleteField;