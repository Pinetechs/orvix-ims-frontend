import React from 'react';
import { MenuItem, TextField } from '@mui/material';
import { useSearchParams } from 'react-router-dom';

import { writeQueryParam } from './queryParamHelpers.js';

function QuerySelectField({
  paramName,
  label,
  options = [],
  allLabel = 'All',
  allValue = 'ALL',
  size = 'small',
  sx,
  minWidth = 160,
  disabled = false,
  resetPage = true,
  pageParam = 'page',
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const value = searchParams.get(paramName) || allValue;

  const handleChange = (event) => {
    const nextValue = event.target.value;

    const next = writeQueryParam(searchParams, paramName, nextValue, {
      resetPage,
      pageParam,
    });

    setSearchParams(next, { replace: true });
  };

  return (
    <TextField
      select
      label={label}
      value={value}
      onChange={handleChange}
      size={size}
      disabled={disabled}
      sx={{
        minWidth: {
          xs: '100%',
          lg: minWidth,
        },
        ...sx,
      }}
    >
      <MenuItem value={allValue}>{allLabel}</MenuItem>

      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
}

export default QuerySelectField;