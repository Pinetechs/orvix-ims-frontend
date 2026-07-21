import React from 'react';
import { Box, Card, CardContent, Grid, Skeleton, Stack } from '@mui/material';

function DashboardSkeleton() {
  return (
    <Box aria-busy="true">
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Skeleton variant="text" width={230} height={48} />
          <Skeleton variant="text" width={360} />
        </Box>
        <Skeleton variant="rounded" width={150} height={40} />
      </Stack>
      <Grid container spacing={2.2} sx={{ mb: 2.2 }}>
        {[0, 1, 2, 3].map((item) => (
          <Grid item xs={12} sm={6} xl={3} key={item}>
            <Card><CardContent><Skeleton height={92} /></CardContent></Card>
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={2.2}>
        <Grid item xs={12} lg={7}><Card><CardContent><Skeleton height={310} /></CardContent></Card></Grid>
        <Grid item xs={12} lg={5}><Card><CardContent><Skeleton height={310} /></CardContent></Card></Grid>
      </Grid>
    </Box>
  );
}

export default DashboardSkeleton;
