import React from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { getIn } from 'formik';

function FormikStaticAutocomplete({
  formik,
  name,
  label,
  options = [],
  disabled = false,
  multiple = false,
  helperText,
  getOptionLabel,
  ...props
}) {
  const rawValue = getIn(formik.values, name) ?? (multiple ? [] : '');
  const touched = getIn(formik.touched, name);
  const error = getIn(formik.errors, name);
  const hasError = Boolean(touched && error);

  const resolveOptionLabel = (option) => {
    if (!option) return '';
    if (getOptionLabel) return getOptionLabel(option);
    if (typeof option === 'string') return option;
    return option.label || option.value || '';
  };

  const resolveOptionValue = (option) => {
    if (!option) return '';
    if (typeof option === 'string') return option;
    return option.value;
  };

  const selectedValue = multiple
    ? options.filter((option) => rawValue.includes(resolveOptionValue(option)))
    : options.find((option) => resolveOptionValue(option) === rawValue) || null;

  const handleChange = (_, nextValue) => {
    if (multiple) {
      formik.setFieldValue(name, nextValue.map(resolveOptionValue));
      return;
    }

    formik.setFieldValue(name, resolveOptionValue(nextValue));
  };

  return (
    <Autocomplete
      multiple={multiple}
      options={options}
      value={selectedValue}
      disabled={disabled}
      onChange={handleChange}
      getOptionLabel={resolveOptionLabel}
      isOptionEqualToValue={(option, value) => resolveOptionValue(option) === resolveOptionValue(value)}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          error={hasError}
          helperText={hasError ? error : helperText}
          onBlur={() => formik.setFieldTouched(name, true)}
        />
      )}
      {...props}
    />
  );
}

export default FormikStaticAutocomplete;
