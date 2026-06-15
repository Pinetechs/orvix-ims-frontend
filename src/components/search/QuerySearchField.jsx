import React, { useEffect, useState } from 'react';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import { useSearchParams } from 'react-router-dom';

import { writeQueryParam } from './queryParamHelpers.js';
import { useDebouncedValue } from '../../hooks/useDebouncedValue.js';

function QuerySearchField({
  paramName = 'search',
  label,
  placeholder = 'Search...',
  debounceMs = 400,
  updateOnEnterOnly = false,
  resetPage = true,
  pageParam = 'page',
  size = 'small',
  sx,
  disabled = false,
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const valueFromUrl = searchParams.get(paramName) || '';

  const [value, setValue] = useState(valueFromUrl);
  const debouncedValue = useDebouncedValue(value, debounceMs);

  const commitValue = (nextValue) => {
    const next = writeQueryParam(searchParams, paramName, nextValue, {
      resetPage,
      pageParam,
    });

    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    setValue(valueFromUrl);
  }, [valueFromUrl]);

  useEffect(() => {
    if (updateOnEnterOnly) {
      return;
    }

    if (debouncedValue === valueFromUrl) {
      return;
    }

    commitValue(debouncedValue);
  }, [debouncedValue, updateOnEnterOnly]);

  const handleKeyDown = (event) => {
    if (!updateOnEnterOnly) {
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      commitValue(value);
    }
  };

  const clearValue = () => {
    setValue('');
    commitValue('');
  };

  return (
    <TextField
      label={label}
      placeholder={placeholder}
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onKeyDown={handleKeyDown}
      size={size}
      disabled={disabled}
      sx={sx}
      fullWidth
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchRoundedIcon fontSize="small" />
          </InputAdornment>
        ),
        endAdornment: value ? (
          <InputAdornment position="end">
            <IconButton
              size="small"
              onClick={clearValue}
              disabled={disabled}
            >
              <ClearRoundedIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ) : null,
      }}
    />
  );
}

export default QuerySearchField;