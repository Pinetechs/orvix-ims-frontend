import React from 'react';
import { MenuItem, TextField } from '@mui/material';
import { getIn } from 'formik';

function FormikSelect({formik,
  name,
  label,
  options = [],
  disabled = false,
  required = false,
  onValueChange,
  ...props
}) {
  const value = getIn(formik.values, name) ?? '';
  const touched = getIn(formik.touched, name);
  const error = getIn(formik.errors, name);
  const hasError = Boolean(touched && error);

  const handleChange = (event) => {
    const nextValue = event.target.value;
    formik.setFieldValue(name, nextValue);

    if (onValueChange) {
      onValueChange(nextValue);
    }
  };

  return (
    <TextField
      select
      name={name}
      label={label}
      value={value}
      disabled={disabled}
      required={required}
      error={hasError}
      helperText={hasError ? error : props.helperText}
      onChange={handleChange}
      onBlur={() => formik.setFieldTouched(name, true)}
      fullWidth
      {...props}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
}

export default FormikSelect;