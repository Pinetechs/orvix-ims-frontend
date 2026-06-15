import React from 'react';
import { Alert, Box, Card, CardContent, Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth.js';

const reports = [
  'Task Progress',
  'Unscanned Items',
  'Duplicate Scans',
  'Moved Locations',
  'Staff Productivity',
  'Final Reconciliation',
];

function Reports() {
  const { t } = useTranslation();
  const auth = useAuth();
  const canViewReport = auth.hasPermission(['VEHICLE_REPORT_VIEW', 'ASSET_REPORT_VIEW', 'SPARE_PART_REPORT_VIEW']);

  if (!canViewReport) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {t('permissions.noReportViewPermission')}
        </Alert>
        <Typography>{t('permissions.contactAdmin')}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={900} gutterBottom>Reports</Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>Report placeholders ready for backend report APIs.</Typography>
      <Alert severity="info" sx={{ mb: 2 }}>ربط التقارير يتم لاحقاً حسب endpoints النهائية في الباك إند.</Alert>
      <Grid container spacing={2}>
        {reports.map((report) => (
          <Grid item xs={12} sm={6} md={4} key={report}>
            <Card>
              <CardContent>
                <Typography fontWeight={800}>{report}</Typography>
                <Typography variant="body2" color="text.secondary">Coming soon</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default Reports;
