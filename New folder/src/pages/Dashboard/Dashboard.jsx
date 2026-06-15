import React from 'react';
import { Box, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FactCheckIcon from '@mui/icons-material/FactCheck';

const cards = [
  { title: 'Companies', value: '-', icon: <BusinessIcon fontSize="large" />, hint: 'Multi-company inventory scope' },
  { title: 'Users', value: '-', icon: <PeopleIcon fontSize="large" />, hint: 'Admins, supervisors and staff' },
  { title: 'Open Tasks', value: '-', icon: <AssignmentIcon fontSize="large" />, hint: 'Vehicle, asset and spare parts tasks' },
  { title: 'Completed Tasks', value: '-', icon: <FactCheckIcon fontSize="large" />, hint: 'Closed inventory tasks' },
];

function Dashboard() {
  return (
    <Box>
      <Typography variant="h4" fontWeight={900} gutterBottom>Dashboard</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>Orvix IMS web portal starter dashboard.</Typography>
      <Grid container spacing={2.5}>
        {cards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Box sx={{ color: 'primary.main' }}>{card.icon}</Box>
                  <Typography variant="h4" fontWeight={900}>{card.value}</Typography>
                </Stack>
                <Typography fontWeight={800}>{card.title}</Typography>
                <Typography variant="body2" color="text.secondary">{card.hint}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default Dashboard;
