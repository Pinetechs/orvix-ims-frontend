import React, { useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { changePasswordRequest } from '../../services/authService.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';

function ChangePassword() {
  const navigate = useNavigate();
  const auth = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [localError, setLocalError] = useState('');

  const mutation = useMutation({
    mutationFn: changePasswordRequest,
    onSuccess: async () => {
      toast.showSuccessToast('Password changed successfully. Please login again.');
      await auth.logout();
      navigate('/login', { replace: true });
    },
    onError: (error) => {
      toast.showErrorToast(error?.message || 'Could not change password');
    },
  });

  const updateField = (field) => (event) => {
    setLocalError('');
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const submit = (event) => {
    event.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      setLocalError('New password and confirmation do not match.');
      return;
    }
    mutation.mutate({ oldPassword: form.oldPassword, newPassword: form.newPassword });
  };

  return (
    <Box sx={{ maxWidth: 560 }}>
      <Typography variant="h4" fontWeight={900} gutterBottom>Change Password</Typography>
      <Card>
        <CardContent>
          <Stack component="form" spacing={2} onSubmit={submit}>
            <TextField label="Old Password" type="password" value={form.oldPassword} onChange={updateField('oldPassword')} required fullWidth />
            <TextField label="New Password" type="password" value={form.newPassword} onChange={updateField('newPassword')} required fullWidth />
            <TextField label="Confirm Password" type="password" value={form.confirmPassword} onChange={updateField('confirmPassword')} required fullWidth />
            {localError && <Alert severity="error">{localError}</Alert>}
            {mutation.isError && <Alert severity="error">{mutation.error?.message}</Alert>}
            <Box>
              <Button type="submit" variant="contained" disabled={mutation.isPending}>Save Password</Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

export default ChangePassword;
