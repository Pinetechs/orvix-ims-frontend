import React, { useMemo } from 'react';
import { Box } from '@mui/material';

import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import PhoneAndroidOutlinedIcon from '@mui/icons-material/PhoneAndroidOutlined';

import MetricCard from './MetricCard.jsx';
import { getTotalElements, isUserActive } from '../utils/userMappers.js';

function UserMetrics({ data, rows }) {
  const stats = useMemo(() => {
    return {
      total: getTotalElements(data),
      active: rows.filter((row) => isUserActive(row)).length,
      disabled: rows.filter((row) => !isUserActive(row)).length,
      appUsers: rows.filter((row) => ['APP', 'MOBILE', 'BOTH'].includes(row.accessChannel)).length,
    };
  }, [data, rows]);

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          lg: 'repeat(4, 1fr)',
        },
        gap: 2,
        mb: 3,
      }}
    >
      <MetricCard icon={<PeopleAltOutlinedIcon />} label="Total Users" value={stats.total} />
      <MetricCard icon={<CheckCircleRoundedIcon />} label="Active On Page" value={stats.active} />
      <MetricCard icon={<BlockRoundedIcon />} label="Disabled On Page" value={stats.disabled} />
      <MetricCard icon={<PhoneAndroidOutlinedIcon />} label="App Access On Page" value={stats.appUsers} />
    </Box>
  );
}

export default UserMetrics;