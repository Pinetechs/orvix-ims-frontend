import React from 'react';
import { Box } from '@mui/material';

import { QuerySearchField, QuerySelectField } from '../../../components/search/index.js';
import { INVENTORY_DOMAIN_OPTIONS, INVENTORY_TASK_STATUS_OPTIONS } from '../constants/inventoryTaskOptions.js';

function SearchInventoryTaskCard() {
  return (
    <Box sx={{ p: { xs: 1.5, sm: 2.4 } }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'minmax(260px, 1fr) 190px 220px',
          },
          gap: 1.5,
          alignItems: 'center',
          minWidth: 0,
        }}
      >
        <QuerySearchField
          paramName="search"
          placeholder="Search by task name, number or company..."
          updateOnEnterOnly
          sx={{ width: '100%', minWidth: 0, gridColumn: { xs: '1', sm: '1 / -1', lg: 'auto' } }}
        />

        <QuerySelectField
          paramName="inventoryDomain"
          label="Domain"
          allLabel="All Domains"
          minWidth={190}
          options={INVENTORY_DOMAIN_OPTIONS}
          sx={{ width: '100%', minWidth: 0 }}
        />

        <QuerySelectField
          paramName="status"
          label="Status"
          allLabel="All Statuses"
          minWidth={220}
          options={INVENTORY_TASK_STATUS_OPTIONS}
          sx={{ width: '100%', minWidth: 0 }}
        />
      </Box>
    </Box>
  );
}

export default SearchInventoryTaskCard;
