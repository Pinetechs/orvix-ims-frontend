import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Autocomplete,
  CircularProgress,
  TextField,
} from '@mui/material';
import { getIn } from 'formik';
import { useQuery } from '@tanstack/react-query';

import { useDebouncedValue } from '../../hooks/useDebouncedValue.js';

const DIALOG_OPTION_ID = '__open_dialog__';

const normalizeOptions = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.content)) return data.data.content;
  if (Array.isArray(data?.result)) return data.result;
  if (Array.isArray(data?.result?.content)) return data.result.content;
  return [];
};

function FormikAsyncAutocomplete({
  formik,
  name,
  label,
  queryKey,
  queryFn,
  disabled = false,
  multiple = false,
  debounceMs = 400,
  minSearchLength = 0,
  extraParams = {},
  lookup = false,
  valueMode = 'option',
  optionValueKey,
  optionLabelKeys,
  getOptionValue,
  getOptionLabel,
  isOptionEqualToValue,
  dialogComponent = null,
  dialogOptionLabel = 'Advanced Search...',
  onChange,
  helperText,
  required = false,
}) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const selectedOptionCache = useRef(new Map());

  const resolvedOptionValueKey = optionValueKey || (lookup ? 'value' : 'id');
  const resolvedOptionLabelKeys = optionLabelKeys || (lookup ? ['label'] : ['name']);
  const debouncedInputValue = useDebouncedValue(inputValue, debounceMs);

  const rawValue = getIn(formik.values, name) ?? (multiple ? [] : null);
  const touched = getIn(formik.touched, name);
  const error = getIn(formik.errors, name);
  const hasError = Boolean(touched && error);
  const queryKeyParts = Array.isArray(queryKey) ? queryKey : [queryKey];

  const resolveOptionValue = (option) => {
    if (option === undefined || option === null) return '';

    if (typeof option !== 'object') {
      return String(option);
    }

    if (getOptionValue) {
      return String(getOptionValue(option) ?? '');
    }

    return String(option?.[resolvedOptionValueKey] ?? '');
  };

  const resolveOptionLabel = (option) => {
    if (!option) return '';

    if (typeof option !== 'object') {
      return String(option);
    }

    if (getOptionLabel) {
      return getOptionLabel(option);
    }

    const label = resolvedOptionLabelKeys
      .map((key) => option?.[key])
      .filter(Boolean)
      .join(' - ');

    return label || resolveOptionValue(option);
  };

  const selectedIds = useMemo(() => {
    if (valueMode === 'value') {
      return multiple
        ? (Array.isArray(rawValue) ? rawValue : []).map((item) => String(item))
        : rawValue
          ? [String(rawValue)]
          : [];
    }

    return multiple
      ? (Array.isArray(rawValue) ? rawValue : []).map(resolveOptionValue).filter(Boolean)
      : rawValue
        ? [resolveOptionValue(rawValue)].filter(Boolean)
        : [];
  }, [multiple, rawValue, valueMode, resolvedOptionValueKey, getOptionValue]);

  const enabled =
    !disabled &&
    (open || (valueMode === 'value' && selectedIds.length > 0)) &&
    debouncedInputValue.trim().length >= minSearchLength;

  const query = useQuery({
    queryKey: [...queryKeyParts, debouncedInputValue, extraParams],
    queryFn: () =>
      queryFn({
        search: debouncedInputValue,
        ...extraParams,
      }),
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  const options = useMemo(() => {
    const baseOptions = normalizeOptions(query.data);

    if (!dialogComponent) {
      return baseOptions;
    }

    return [
      ...baseOptions,
      {
        id: DIALOG_OPTION_ID,
        _dialogTrigger: true,
        name: dialogOptionLabel,
      },
    ];
  }, [query.data, dialogComponent, dialogOptionLabel]);

  useEffect(() => {
    options.forEach((option) => {
      const id = resolveOptionValue(option);

      if (id) {
        selectedOptionCache.current.set(id, option);
      }
    });
  }, [options, resolvedOptionValueKey, getOptionValue]);

  useEffect(() => {
    if (valueMode === 'value') return;

    const selectedOptions = multiple ? (Array.isArray(rawValue) ? rawValue : []) : [rawValue];

    selectedOptions.forEach((option) => {
      const id = resolveOptionValue(option);

      if (id) {
        selectedOptionCache.current.set(id, option);
      }
    });
  }, [multiple, rawValue, valueMode, resolvedOptionValueKey, getOptionValue]);

  const buildFallbackOption = (id) => ({
    [resolvedOptionValueKey]: id,
    [resolvedOptionLabelKeys[0]]: id,
  });

  const value = useMemo(() => {
    if (valueMode === 'option') {
      return rawValue;
    }

    if (multiple) {
      return selectedIds.map((id) => {
        return (
          options.find((option) => resolveOptionValue(option) === id) ||
          selectedOptionCache.current.get(id) ||
          buildFallbackOption(id)
        );
      });
    }

    const id = selectedIds[0];

    if (!id) {
      return null;
    }

    return (
      options.find((option) => resolveOptionValue(option) === id) ||
      selectedOptionCache.current.get(id) ||
      buildFallbackOption(id)
    );
  }, [
    multiple,
    options,
    rawValue,
    resolvedOptionLabelKeys,
    resolvedOptionValueKey,
    selectedIds,
    valueMode,
    getOptionValue,
  ]);

  const resolveOptionEqual = (option, selectedValue) => {
    if (isOptionEqualToValue) {
      return isOptionEqualToValue(option, selectedValue);
    }

    return resolveOptionValue(option) === resolveOptionValue(selectedValue);
  };

  const toFieldValue = (nextValue) => {
    if (valueMode === 'option') {
      return nextValue;
    }

    if (multiple) {
      return (nextValue || []).map(resolveOptionValue).filter(Boolean);
    }

    return nextValue ? resolveOptionValue(nextValue) : '';
  };

  const commitValue = (nextValue) => {
    const fieldValue = toFieldValue(nextValue);

    if (onChange) {
      onChange(fieldValue, nextValue);
    } else {
      formik.setFieldValue(name, fieldValue);
    }
  };

  const handleChange = (_, nextValue) => {
    const selectedDialogOption = Array.isArray(nextValue)
      ? nextValue.some((item) => item?.id === DIALOG_OPTION_ID)
      : nextValue?.id === DIALOG_OPTION_ID;

    if (selectedDialogOption) {
      setDialogOpen(true);
      return;
    }

    commitValue(nextValue);
  };

  const renderedDialog = React.isValidElement(dialogComponent)
    ? React.cloneElement(dialogComponent, {
        open: dialogOpen,
        onClose: () => setDialogOpen(false),
        onSelect: (selectedValue) => {
          commitValue(selectedValue);
          setDialogOpen(false);
        },
      })
    : null;

  return (
    <>
      <Autocomplete
        multiple={multiple}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        disabled={disabled}
        options={options}
        value={value}
        inputValue={inputValue}
        onInputChange={(_, nextInputValue) => setInputValue(nextInputValue)}
        onChange={handleChange}
        getOptionLabel={resolveOptionLabel}
        isOptionEqualToValue={resolveOptionEqual}
        filterOptions={(items) => items}
        disableCloseOnSelect={multiple}
        loading={query.isLoading || query.isFetching}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            error={hasError}
            helperText={hasError ? error : helperText}
            onBlur={() => formik.setFieldTouched(name, true)}
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
        renderOption={(props, option) => {
          const { key, ...optionProps } = props;

          if (option?._dialogTrigger) {
            return (
              <li
                {...optionProps}
                key={`${name}-${DIALOG_OPTION_ID}`}
                onMouseDown={(event) => event.preventDefault()}
                style={{
                  borderTop: '1px solid rgba(0,0,0,0.08)',
                  fontWeight: 700,
                  background: '#f5f9fc',
                }}
              >
                {resolveOptionLabel(option)}
              </li>
            );
          }

          const optionValue = resolveOptionValue(option);

          return (
            <li {...optionProps} key={`${name}-${optionValue || key}`}>
              {resolveOptionLabel(option)}
            </li>
          );
        }}
      />

      {renderedDialog}
    </>
  );
}

export default FormikAsyncAutocomplete;
