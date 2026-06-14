import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import { useLocation, useNavigate } from 'react-router-dom';
import Logo from '../../assets/images/logo/orvix-ims-logo.svg';
import { baseUrl } from '../../util/constant.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useSettings } from '../../hooks/useSettings.js';
import Progress from '../../components/Loader/Progress.jsx';
import AnimatedBackground from './AnimatedBackground.jsx';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const settings = useSettings();

  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');

  const from = location.state?.from?.pathname || '/';
  const companyLogoUrl = settings.settingsMap.companyLogoUrl ? `${baseUrl}/${settings.settingsMap.companyLogoUrl}` : null;



  useEffect(() => {
        console.log("Auth state changed: isAuthenticate =", settings);

  }, [settings]);


  useEffect(() => {



    if (auth.isAuthenticate) navigate(from, { replace: true });
  }, [auth.isAuthenticate, from, navigate]);



  const handleLogin = async (event) => {
    event.preventDefault();
    console.log("username", username, "password", password);
    await auth.login({ username, password });
  };

  return (
    <Box sx={{ minHeight: '100vh', width: '100%', position: 'relative', overflow: 'hidden' }}>
      <AnimatedBackground />
      <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 10 }}>
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4, mb: -2, zIndex: 12 }}>
            <img src={Logo} alt="Orvix IMS Logo" style={{ height: 90 }} />
          </Box>

          {settings.isLoading ? (
            <Box sx={{ height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Progress msg="Please wait" />
            </Box>
          ) : (
            <Card
              sx={{
                width: '100%',
                borderRadius: '16px',
                background: 'rgba(255,255,255,0.98)',
                boxShadow: '0 8px 32px 0 rgba(11, 60, 93, 0.10)',
                overflow: 'hidden',
                border: '1px solid #e9ecef',
              }}
            >
              <Box sx={{ bgcolor: '#0B3C5D', py: 2, px: 3, textAlign: 'center' }}>
                {companyLogoUrl ? (
                  <img src={companyLogoUrl} alt="Company Logo" style={{ height: 90, maxWidth: '100%', objectFit: 'contain' }} />
                ) : (
                  <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold', letterSpacing: 1 }}>
                    Orvix IMS Login
                  </Typography>
                )}
              </Box>

              <CardContent sx={{ position: 'relative', minHeight: 260 }}>
                {auth.loading && (
                  <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.65)', zIndex: 20 }}>
                    <Progress msg="Loading..." />
                  </Box>
                )}

                <Box component="form" onSubmit={handleLogin} sx={{ p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    disabled={auth.loading}
                    label="Username"
                    value={username}
                    onChange={(event) => setUserName(event.target.value)}
                    error={Boolean(auth.error)}
                    InputProps={{ startAdornment: <PersonIcon sx={{ color: '#D9B310', mr: 1 }} /> }}
                    autoComplete="username"
                    fullWidth
                    required
                  />

                  <TextField
                    disabled={auth.loading}
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    error={Boolean(auth.error)}
                    InputProps={{ startAdornment: <LockIcon sx={{ color: '#D9B310', mr: 1 }} /> }}
                    autoComplete="current-password"
                    fullWidth
                    required
                  />

                  {auth.error && <Alert severity="error">{auth.error}</Alert>}
                  {settings.isError && <Alert severity="warning">Settings could not be loaded. Login is still available.</Alert>}

                  <Button type="submit" variant="contained" size="large" disabled={auth.loading} fullWidth sx={{ py: 1.3, mt: 1 }}>
                    Login
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>
      </Container>
    </Box>
  );
}

export default Login;
