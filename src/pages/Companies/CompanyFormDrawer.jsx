import React, { useEffect, useMemo } from 'react';
import {
  Alert,
  Box,
  Button,
  Divider,
  Drawer,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';

import FormikTextField from '../../components/form/FormikTextField.jsx';
import { isCompanyActive } from './utils/companyMappers.js';

const emptyValues = {
  code: '',
  name: '',
  active: true,
};

const validationSchema = Yup.object({
  code: Yup.string()
    .trim()
    .required('Company code is required.')
    .max(50, 'Company code must be 50 characters or less.')
    .matches(/^[A-Za-z0-9_-]+$/, 'Use letters, numbers, underscore or dash only.'),
  name: Yup.string()
    .trim()
    .required('Company name is required.')
    .max(150, 'Company name must be 150 characters or less.'),
  active: Yup.boolean().required(),
});

function CompanyFormDrawer({
  open,
  mode = 'create',
  initialData = null,
  onClose,
  onSubmit,
  loading = false,
  error = null,
}) {
  const isEditMode = mode === 'edit';

  const initialValues = useMemo(() => {
    if (!isEditMode || !initialData) {
      return emptyValues;
    }

    return {
      code: initialData.code || initialData.companyCode || '',
      name: initialData.name || initialData.nameEn || initialData.companyName || '',
      active: isCompanyActive(initialData),
    };
  }, [initialData, isEditMode]);

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      const payload = {
        code: values.code.trim().toUpperCase(),
        name: values.name.trim(),
        active: values.active,
      };

      await onSubmit(payload);
    },
  });

  useEffect(() => {
    if (open) {
      formik.resetForm({ values: initialValues });
    }
  }, [open, initialValues]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={loading ? undefined : onClose}
      PaperProps={{
        sx: {
          width: {
            xs: '100%',
            sm: 520,
          },
          borderTopLeftRadius: {
            xs: 0,
            sm: 28,
          },
          borderBottomLeftRadius: {
            xs: 0,
            sm: 28,
          },
          overflow: 'hidden',
        },
      }}
    >
      <Box
        sx={(theme) => ({
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.06)}, #fff 28%)`,
        })}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
          sx={{ p: 3 }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={(theme) => ({
                width: 46,
                height: 46,
                borderRadius: 3,
                display: 'grid',
                placeItems: 'center',
                color: theme.palette.primary.main,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
              })}
            >
              <BusinessRoundedIcon />
            </Box>

            <Box>
              <Typography sx={{ fontSize: '1.35rem', fontWeight: 950, lineHeight: 1.2 }}>
                {isEditMode ? 'Edit Company' : 'Add Company'}
              </Typography>
              <Typography color="text.secondary" sx={{ fontSize: '0.88rem' }}>
                {isEditMode ? 'Update company profile and status.' : 'Create a new company in Orvix IMS.'}
              </Typography>
            </Box>
          </Stack>

          <IconButton onClick={onClose} disabled={loading}>
            <CloseRoundedIcon />
          </IconButton>
        </Stack>

        <Divider />

        <Box
          component="form"
          id="company-form"
          onSubmit={formik.handleSubmit}
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: 3,
          }}
        >
          <Stack spacing={2.2}>
            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}

            <Typography sx={{ fontWeight: 900 }}>
              Company Information
            </Typography>

            <FormikTextField
              formik={formik}
              name="code"
              label="Company Code"
              disabled={loading || isEditMode}
              required
              helperText="Used as a short unique key, for example BAS or SAHIB."
              inputProps={{ style: { textTransform: 'uppercase' } }}
            />

            <FormikTextField
              formik={formik}
              name="name"
              label="Company Name"
              disabled={loading}
              required
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formik.values.active}
                  onChange={(event) => formik.setFieldValue('active', event.target.checked)}
                  disabled={loading}
                />
              }
              label={formik.values.active ? 'Active' : 'Disabled'}
            />
          </Stack>
        </Box>

        <Divider />

        <Stack
          direction="row"
          justifyContent="flex-end"
          spacing={1.5}
          sx={{
            p: 2.5,
            bgcolor: 'background.paper',
          }}
        >
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>

          <Button
            type="submit"
            form="company-form"
            variant="contained"
            startIcon={<SaveRoundedIcon />}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Company'}
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
}

export default CompanyFormDrawer;
