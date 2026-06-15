import React from 'react';
import { TextField } from '@mui/material';
import { getIn } from 'formik';

function FormikTextField({
  formik,
  name,
  label,
  disabled = false,
  required = false,
  helperText,
  ...props
}) {
  const value = getIn(formik.values, name) ?? '';
  const touched = getIn(formik.touched, name);
  const error = getIn(formik.errors, name);
  const hasError = Boolean(touched && error);

  return (
    <TextField
      name={name}
      label={label}
      value={value}
      disabled={disabled}
      required={required}
      error={hasError}
      helperText={hasError ? error : helperText}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      fullWidth
      {...props}
    />
  );
}

export default FormikTextField;