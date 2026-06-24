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

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';

import FormikTextField from '../../components/form/FormikTextField.jsx';
import FormikPasswordField, { isPasswordValid } from '../../components/form/FormikPasswordField.jsx';
import FormikSelect from '../../components/form/FormikSelect.jsx';
import FormikAsyncAutocomplete from '../../components/form/FormikAsyncAutocomplete.jsx';
import FormikStaticAutocomplete from '../../components/form/FormikStaticAutocomplete.jsx';
import { getCompanies } from '../../services/companyService.js';
import { queryKeys } from '../../services/queryKeys.js';
import { USER_TYPE_OPTIONS as USER_TYPES, INVENTORY_DOMAIN_OPTIONS } from './constants/userOptions.js';
import { isUserActive } from './utils/userMappers.js';



const initialValues = {username: '', password: '', confirmPassword: '',firstName: '',lastName: '',email: '',phone: '',userType: 'INVENTORY_STAFF',companies: [], inventoryDomains: [],enabled: true,};

const requiresCompany = (userType) => {
  return ['COMPANY_ADMIN', 'SUPERVISOR', 'INVENTORY_STAFF'].includes(userType);
};

const requiresInventoryDomains = (userType) => {
  return userType === 'SUPERVISOR';
};

const createValidationSchema = (isEditMode) => Yup.object({
  username: Yup.string().trim().required('Username is required.'),
  password: isEditMode
    ? Yup.string()
    : Yup.string()
        .required('Password is required.')
        .test('password-requirements', 'Password does not meet the minimum requirements.', (value) =>
          isPasswordValid(value)
        ),
  confirmPassword: isEditMode
    ? Yup.string()
    : Yup.string().required('Please retype the password.').oneOf([Yup.ref('password')], 'Passwords do not match.'),
  firstName: Yup.string().trim().required('First name is required.'),
  lastName: Yup.string().trim().required('Last name is required.'),
  email: Yup.string().trim().email('Invalid email address.').nullable(),
  phone: Yup.string().trim().nullable(),
  userType: Yup.string().required('User type is required.'),
  companies: Yup.array().when('userType', {
    is: (userType) => requiresCompany(userType),
    then: (schema) => schema.min(1, 'Company is required for this user type.'),
    otherwise: (schema) => schema,
  }),
  inventoryDomains: Yup.array().when('userType', {
    is: (userType) => requiresInventoryDomains(userType),
    then: (schema) => schema.min(1, 'At least one inventory domain is required for supervisors.'),
    otherwise: (schema) => schema,
  }),
});

const getInitialCompanies = (initialData) => {
  if (Array.isArray(initialData?.companies)) {
    return initialData.companies;
  }

  if (Array.isArray(initialData?.companyIds)) {
    return initialData.companyIds.map((id, index) => ({
      id,
      name: Array.isArray(initialData.companyNames) ? initialData.companyNames[index] : String(id),
    }));
  }

  return [];
};

function UserFormDrawer({open, mode = 'create', initialData = null, onClose,  onSubmit,loading = false, error = null,}) {
  const isEditMode = mode === 'edit';

  const formValues = useMemo(() => {
    if (!isEditMode || !initialData) {
      return initialValues;
    }

    return {
      username: initialData.username || '',
      password: '',
      confirmPassword: '',
      firstName: initialData.firstName || '',
      lastName: initialData.lastName || '',
      email: initialData.email || '',
      phone: initialData.mobile || initialData.phone || '',
      userType: initialData.userType || 'INVENTORY_STAFF',
      companies: getInitialCompanies(initialData),
      inventoryDomains: Array.isArray(initialData.inventoryDomains) ? initialData.inventoryDomains : [],
      enabled: isUserActive(initialData),
    };
  }, [initialData, isEditMode]);

  const validationSchema = useMemo(() => createValidationSchema(isEditMode), [isEditMode]);

  const formik = useFormik({initialValues: formValues,validationSchema,enableReinitialize: true,
    
    onSubmit: async (values) => {
      const companyRequired = requiresCompany(values.userType);

      const payload = {
        username: values.username.trim(),
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email?.trim() || null,
        mobile: values.phone?.trim() || null,
        userType: values.userType,
        enabled: values.enabled,
        companyIds: companyRequired ? values.companies.map((company) => company.id) : [],
        inventoryDomains: requiresInventoryDomains(values.userType) ? values.inventoryDomains : [],
      };

      if (!isEditMode) {
        payload.password = values.password;
      } else {
        payload.permissions = Array.isArray(initialData?.permissions) ? initialData.permissions : [];
      }

      await onSubmit(payload);
    },
  });

  useEffect(() => {
    if (open) {
      formik.resetForm({ values: formValues });
    }
  }, [open, formValues]);

  const companyRequired = requiresCompany(formik.values.userType);
  const inventoryDomainsRequired = requiresInventoryDomains(formik.values.userType);

  const handleUserTypeChange = (userType) => {
    formik.setFieldValue('userType', userType);

    if (!requiresCompany(userType)) {
      formik.setFieldValue('companies', []);
    }

    if (!requiresInventoryDomains(userType)) {
      formik.setFieldValue('inventoryDomains', []);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={loading ? undefined : onClose}
      PaperProps={{
        sx: {
          width: {
            xs: '100%',
            sm: 580,
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
              <PersonAddAlt1RoundedIcon />
            </Box>

            <Box>
              <Typography sx={{ fontSize: '1.35rem', fontWeight: 950, lineHeight: 1.2 }}>
                {isEditMode ? 'Edit User' : 'Add User'}
              </Typography>
              <Typography color="text.secondary" sx={{ fontSize: '0.88rem' }}>
                {isEditMode ? 'Update account profile and access.' : 'Create a new system user account.'}
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
          id="user-form"
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
              Account Information
            </Typography>

            <FormikTextField
              formik={formik}
              name="username"
              label="Username"
              disabled={loading || isEditMode}
              required
            />

            {!isEditMode && (
              <FormikPasswordField
                formik={formik}
                name="password"
                confirmName="confirmPassword"
                label="Password"
                confirmLabel="Retype Password"
                disabled={loading}
                required
              />
            )}

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormikTextField
                formik={formik}
                name="firstName"
                label="First Name"
                disabled={loading}
                required
              />

              <FormikTextField
                formik={formik}
                name="lastName"
                label="Last Name"
                disabled={loading}
                required
              />
            </Stack>

            <FormikTextField
              formik={formik}
              name="email"
              label="Email"
              type="email"
              disabled={loading}
            />

            <FormikTextField
              formik={formik}
              name="phone"
              label="Phone"
              disabled={loading}
            />

            <Divider sx={{ my: 1 }} />

            <Typography sx={{ fontWeight: 900 }}>
              Access Information
            </Typography>


               <FormikAsyncAutocomplete
              formik={formik}
              name="companies"
              label={companyRequired ? 'Companies *' : 'Companies'}
              multiple
              disabled={loading || !companyRequired}
              queryKey={queryKeys.companies.autocomplete({ active: true, page: 0, size: 20, sort: 'name,asc' })}
              queryFn={(params) =>
                getCompanies({
                  search: params.search,
                  active: true,
                  page: 0,
                  size: 20,
                  sort: 'name,asc',
                })
              }
              optionLabelKeys={['name', 'code']}
              helperText={
                companyRequired
                  ? 'Required for company admin, supervisor and inventory staff.'
                  : 'Not required for global users.'
              }
            />

            <FormikSelect
              formik={formik}
              name="userType"
              label="User Type"
              options={USER_TYPES}
              disabled={loading}
              required
              onValueChange={handleUserTypeChange}
            />

            {inventoryDomainsRequired && (
              <FormikStaticAutocomplete
                formik={formik}
                name="inventoryDomains"
                label="Inventory Domains"
                options={INVENTORY_DOMAIN_OPTIONS}
                multiple
                disabled={loading}
                required
                helperText="Required for supervisor users."
              />
            )}

         

            <FormControlLabel
              control={
                <Switch
                  checked={formik.values.enabled}
                  onChange={(event) => formik.setFieldValue('enabled', event.target.checked)}
                  disabled={loading}
                />
              }
              label={formik.values.enabled ? 'Enabled' : 'Disabled'}
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
            form="user-form"
            variant="contained"
            startIcon={<SaveRoundedIcon />}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save User'}
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
}

export default UserFormDrawer;
