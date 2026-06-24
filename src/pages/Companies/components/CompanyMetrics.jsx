import React, { useMemo } from 'react';
import { Box } from '@mui/material';

import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';

import MetricCard from '../../Users/components/MetricCard.jsx';
import { getTotalElements, isCompanyActive } from '../utils/companyMappers.js';

function CompanyMetrics({ data, rows }) {
  const stats = useMemo(() => {
    return {
      total: getTotalElements(data),
      active: rows.filter((row) => isCompanyActive(row)).length,
      disabled: rows.filter((row) => !isCompanyActive(row)).length,
      shown: rows.length,
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
        gap: { xs: 1.25, sm: 2 },
        mb: { xs: 2, md: 3 },
        minWidth: 0,
      }}
    >
      <MetricCard icon={<BusinessRoundedIcon />} label="Total Companies" value={stats.total} />
      <MetricCard icon={<CheckCircleRoundedIcon />} label="Active On Page" value={stats.active} />
      <MetricCard icon={<BlockRoundedIcon />} label="Disabled On Page" value={stats.disabled} />
      <MetricCard icon={<Inventory2OutlinedIcon />} label="Shown On Page" value={stats.shown} />
    </Box>
  );
}

export default CompanyMetrics;
