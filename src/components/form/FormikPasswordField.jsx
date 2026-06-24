import React, { useMemo, useState } from 'react';
import {
  Box,
  FormHelperText,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { getIn } from 'formik';

import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';

export const passwordRequirements = [
  {
    key: 'minLength',
    label: 'At least 8 characters',
    test: (value) => value.length >= 8,
  },
  {
    key: 'uppercase',
    label: 'One uppercase letter',
    test: (value) => /[A-Z]/.test(value),
  },
  {
    key: 'lowercase',
    label: 'One lowercase letter',
    test: (value) => /[a-z]/.test(value),
  },
  {
    key: 'number',
    label: 'One number',
    test: (value) => /\d/.test(value),
  },
  {
    key: 'special',
    label: 'One special character',
    test: (value) => /[^A-Za-z0-9]/.test(value),
  },
];

export function isPasswordValid(value, requirements = passwordRequirements) {
  const password = value || '';
  return requirements.every((requirement) => requirement.test(password));
}

function generatePassword(length = 14) {
  const groups = ['ABCDEFGHJKLMNPQRSTUVWXYZ', 'abcdefghijkmnopqrstuvwxyz', '23456789', '!@#$%^&*'];
  const allCharacters = groups.join('');
  const chars = groups.map((group) => group[Math.floor(Math.random() * group.length)]);

  while (chars.length < length) {
    chars.push(allCharacters[Math.floor(Math.random() * allCharacters.length)]);
  }

  return chars
    .map((char) => ({ char, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map((item) => item.char)
    .join('');
}

function getFieldState(formik, name, helperText) {
  const value = getIn(formik.values, name) ?? '';
  const touched = getIn(formik.touched, name);
  const error = getIn(formik.errors, name);
  const hasError = Boolean(touched && error);

  return {
    value,
    hasError,
    helperText: hasError ? error : helperText,
  };
}

function FormikPasswordField({
  formik,
  name,
  label = 'Password',
  confirmName,
  confirmLabel = 'Retype Password',
  disabled = false,
  required = false,
  helperText,
  confirmHelperText,
  showRequirements = true,
  showGenerate = true,
  requirements = passwordRequirements,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [copyLabel, setCopyLabel] = useState('Copy password');

  const passwordState = getFieldState(formik, name, helperText);
  const confirmState = confirmName ? getFieldState(formik, confirmName, confirmHelperText) : null;

  const requirementResults = useMemo(() => {
    return requirements.map((requirement) => ({
      ...requirement,
      valid: requirement.test(passwordState.value),
    }));
  }, [passwordState.value, requirements]);

  const handleGeneratePassword = () => {
    const nextPassword = generatePassword();

    formik.setFieldValue(name, nextPassword);
    formik.setFieldTouched(name, true, false);

    if (confirmName) {
      formik.setFieldValue(confirmName, nextPassword);
      formik.setFieldTouched(confirmName, true, false);
    }
  };

  const handleCopyPassword = async () => {
    if (!passwordState.value) return;

    await navigator.clipboard.writeText(passwordState.value);
    setCopyLabel('Copied');
    window.setTimeout(() => setCopyLabel('Copy password'), 1200);
  };

  const passwordEndAdornment = (
    <InputAdornment position="end">
      <Stack direction="row" spacing={0.25}>
        {showGenerate && (
          <Tooltip title="Generate password">
            <span>
              <IconButton
                aria-label="Generate password"
                onClick={handleGeneratePassword}
                disabled={disabled}
              >
                <KeyRoundedIcon />
              </IconButton>
            </span>
          </Tooltip>
        )}

        <Tooltip title={copyLabel}>
          <span>
            <IconButton
              aria-label="Copy password"
              onClick={handleCopyPassword}
              disabled={disabled || !passwordState.value}
            >
              <ContentCopyRoundedIcon />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title={showPassword ? 'Hide password' : 'Show password'}>
          <span>
            <IconButton
              edge="end"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((value) => !value)}
              disabled={disabled}
            >
              {showPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
            </IconButton>
          </span>
        </Tooltip>
      </Stack>
    </InputAdornment>
  );

  const confirmEndAdornment = (
    <InputAdornment position="end">
      <IconButton
        edge="end"
        aria-label={showConfirmPassword ? 'Hide retyped password' : 'Show retyped password'}
        onClick={() => setShowConfirmPassword((value) => !value)}
        disabled={disabled}
      >
        {showConfirmPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
      </IconButton>
    </InputAdornment>
  );

  return (
    <Stack spacing={1.4}>
      <TextField
        name={name}
        label={label}
        value={passwordState.value}
        disabled={disabled}
        required={required}
        error={passwordState.hasError}
        helperText={passwordState.helperText}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        type={showPassword ? 'text' : 'password'}
        fullWidth
        InputProps={{
          endAdornment: passwordEndAdornment,
        }}
        {...props}
      />

      {confirmName && (
        <TextField
          name={confirmName}
          label={confirmLabel}
          value={confirmState.value}
          disabled={disabled}
          required={required}
          error={confirmState.hasError}
          helperText={confirmState.helperText}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          type={showConfirmPassword ? 'text' : 'password'}
          fullWidth
          InputProps={{
            endAdornment: confirmEndAdornment,
          }}
        />
      )}

      {showRequirements && (
        <Box
          sx={(theme) => ({
            border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
            borderRadius: 2,
            p: 1.5,
            bgcolor: alpha(theme.palette.primary.main, 0.025),
          })}
        >
          <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, mb: 1 }}>
            Minimum requirements
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
              gap: 0.8,
            }}
          >
            {requirementResults.map((requirement) => (
              <Stack
                key={requirement.key}
                direction="row"
                alignItems="center"
                spacing={0.8}
                sx={(theme) => ({
                  color: requirement.valid ? theme.palette.success.main : theme.palette.text.secondary,
                  minWidth: 0,
                })}
              >
                {requirement.valid ? (
                  <CheckCircleRoundedIcon sx={{ fontSize: 18 }} />
                ) : (
                  <RadioButtonUncheckedRoundedIcon sx={{ fontSize: 18 }} />
                )}

                <Typography sx={{ fontSize: '0.8rem', overflowWrap: 'anywhere' }}>
                  {requirement.label}
                </Typography>
              </Stack>
            ))}
          </Box>

          {passwordState.hasError && (
            <FormHelperText error sx={{ mt: 1 }}>
              {passwordState.helperText}
            </FormHelperText>
          )}
        </Box>
      )}
    </Stack>
  );
}

export default FormikPasswordField;
