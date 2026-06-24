import React, { useMemo, useState } from 'react';
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
  optionLabelKeys = ['name'],
  getOptionLabel,
  isOptionEqualToValue,
  dialogComponent = null,
  dialogOptionLabel = 'Advanced Search...',
  onChange,
  helperText,
}) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const debouncedInputValue = useDebouncedValue(inputValue, debounceMs);

  const value = getIn(formik.values, name) ?? (multiple ? [] : null);
  const touched = getIn(formik.touched, name);
  const error = getIn(formik.errors, name);
  const hasError = Boolean(touched && error);

  const enabled =
    open &&
    !disabled &&
    debouncedInputValue.trim().length >= minSearchLength;

  const query = useQuery({
    queryKey: [...queryKey, debouncedInputValue, extraParams],
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

  const resolveOptionLabel = (option) => {
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

  const resolveOptionEqual = (option, selectedValue) => {
    if (isOptionEqualToValue) {
      return isOptionEqualToValue(option, selectedValue);
    }

    return option?.id === selectedValue?.id;
  };

  const handleChange = (_, nextValue) => {
    const selectedDialogOption = Array.isArray(nextValue)
      ? nextValue.some((item) => item?.id === DIALOG_OPTION_ID)
      : nextValue?.id === DIALOG_OPTION_ID;

    if (selectedDialogOption) {
      setDialogOpen(true);
      return;
    }

    if (onChange) {
      onChange(nextValue);
    } else {
      formik.setFieldValue(name, nextValue);
    }
  };

  const renderedDialog = React.isValidElement(dialogComponent)
    ? React.cloneElement(dialogComponent, {
        open: dialogOpen,
        onClose: () => setDialogOpen(false),
        onSelect: (selectedValue) => {
          if (onChange) {
            onChange(selectedValue);
          } else {
            formik.setFieldValue(name, selectedValue);
          }

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
          if (option?._dialogTrigger) {
            return (
              <li
                {...props}
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

          return (
            <li {...props} key={option.id}>
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