import React, { useEffect } from 'react';
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
import FormikSelect from '../../components/form/FormikSelect.jsx';
import FormikAsyncAutocomplete from '../../components/form/FormikAsyncAutocomplete.jsx';
import { getCompanies } from '../../services/companyService.js';

const USER_TYPES = [
  { value: 'SYSTEM_ADMIN', label: 'System Admin' },
  { value: 'PINETECHS_SUPPORT_STAFF', label: 'Pinetechs Support' },
  { value: 'COMPANY_ADMIN', label: 'Company Admin' },
  { value: 'SUPERVISOR', label: 'Supervisor' },
  { value: 'INVENTORY_STAFF', label: 'Inventory Staff' },
];

const ACCESS_CHANNELS = [
  { value: 'WEB', label: 'WEB' },
  { value: 'APP', label: 'APP' },
  { value: 'BOTH', label: 'BOTH' },
];

const initialValues = {
  username: '',
  password: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  userType: 'INVENTORY_STAFF',
  accessChannel: 'APP',
  companies: [],
  enabled: true,
};

const requiresCompany = (userType) => {
  return ['COMPANY_ADMIN', 'SUPERVISOR', 'INVENTORY_STAFF'].includes(userType);
};

const getDefaultAccessChannel = (userType) => {
  if (userType === 'INVENTORY_STAFF') return 'APP';
  return 'WEB';
};

const validationSchema = Yup.object({
  username: Yup.string().trim().required('Username is required.'),
  password: Yup.string().required('Password is required.'),
  firstName: Yup.string().trim().required('First name is required.'),
  lastName: Yup.string().trim().required('Last name is required.'),
  email: Yup.string().trim().email('Invalid email address.').nullable(),
  phone: Yup.string().trim().nullable(),
  userType: Yup.string().required('User type is required.'),
  accessChannel: Yup.string().required('Access channel is required.'),
  companies: Yup.array().when('userType', {
    is: (userType) => requiresCompany(userType),
    then: (schema) => schema.min(1, 'Company is required for this user type.'),
    otherwise: (schema) => schema,
  }),
});

function UserFormDrawer({
  open,
  onClose,
  onSubmit,
  loading = false,
  error = null,
}) {
  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      const companyRequired = requiresCompany(values.userType);

      const payload = {
        username: values.username.trim(),
        password: values.password,
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email?.trim() || null,
        phone: values.phone?.trim() || null,
        userType: values.userType,
        accessChannel: values.accessChannel,
        enabled: values.enabled,
        companyIds: companyRequired ? values.companies.map((company) => company.id) : [],
      };

      await onSubmit(payload);
    },
  });

  useEffect(() => {
    if (open) {
      formik.resetForm();
    }
  }, [open]);

  const companyRequired = requiresCompany(formik.values.userType);

  const handleUserTypeChange = (userType) => {
    formik.setFieldValue('userType', userType);
    formik.setFieldValue('accessChannel', getDefaultAccessChannel(userType));

    if (!requiresCompany(userType)) {
      formik.setFieldValue('companies', []);
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
                Add User
              </Typography>
              <Typography color="text.secondary" sx={{ fontSize: '0.88rem' }}>
                Create a new system user account.
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
              disabled={loading}
              required
            />

            <FormikTextField
              formik={formik}
              name="password"
              label="Password"
              type="password"
              disabled={loading}
              required
              helperText="Required only when creating a new user."
            />

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

            <FormikSelect
              formik={formik}
              name="userType"
              label="User Type"
              options={USER_TYPES}
              disabled={loading}
              required
              onValueChange={handleUserTypeChange}
            />

            <FormikSelect
              formik={formik}
              name="accessChannel"
              label="Access Channel"
              options={ACCESS_CHANNELS}
              disabled={loading}
              required
            />

            <FormikAsyncAutocomplete
              formik={formik}
              name="companies"
              label={companyRequired ? 'Companies *' : 'Companies'}
              multiple
              disabled={loading || !companyRequired}
              required={companyRequired}
              queryKey={['companies', 'autocomplete']}
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