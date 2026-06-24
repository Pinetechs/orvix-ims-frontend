import React, { useEffect } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import FormikPasswordField, { isPasswordValid } from '../../components/form/FormikPasswordField.jsx';
import { getFullName } from './utils/userMappers.js';

const initialValues = {
  password: '',
  confirmPassword: '',
};

const validationSchema = Yup.object({
  password: Yup.string()
    .required('Password is required.')
    .test('password-requirements', 'Password does not meet the minimum requirements.', (value) =>
      isPasswordValid(value)
    ),
  confirmPassword: Yup.string()
    .required('Please retype the password.')
    .oneOf([Yup.ref('password')], 'Passwords do not match.'),
});

function ResetUserPasswordDialog({ open, user, onClose, onSubmit, loading = false, error = null }) {
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      await onSubmit({ password: values.password });
    },
  });

  useEffect(() => {
    if (open) {
      formik.resetForm();
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Reset Password</DialogTitle>

      <DialogContent>
        <Stack component="form" id="reset-user-password-form" onSubmit={formik.handleSubmit} spacing={2.2} sx={{ pt: 1 }}>
          {user && (
            <Typography color="text.secondary" sx={{ lineHeight: 1.5 }}>
              Set a new password for {getFullName(user)}.
            </Typography>
          )}

          {error && <Alert severity="error">{error}</Alert>}

          <FormikPasswordField
            formik={formik}
            name="password"
            confirmName="confirmPassword"
            label="New Password"
            confirmLabel="Retype New Password"
            disabled={loading}
            required
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" form="reset-user-password-form" variant="contained" disabled={loading}>
          {loading ? 'Saving...' : 'Reset Password'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ResetUserPasswordDialog;
