import React from 'react';
import { Box } from '@mui/material';

import { QuerySearchField, QuerySelectField } from '../../../components/search/index.js';
import { COMPANY_STATUS_OPTIONS } from '../constants/companyOptions.js';

function SearchCompanyCard() {
  return (
    <Box sx={{ p: { xs: 1.5, sm: 2.4 } }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            sm: 'minmax(280px, 1fr) 180px',
          },
          gap: 1.5,
          alignItems: 'center',
          minWidth: 0,
        }}
      >
        <QuerySearchField
          paramName="search"
          placeholder="Search by company name or code..."
          updateOnEnterOnly
          sx={{ width: '100%', minWidth: 0 }}
        />

        <QuerySelectField
          paramName="active"
          label="Status"
          allLabel="All"
          minWidth={180}
          options={COMPANY_STATUS_OPTIONS}
          sx={{ width: '100%', minWidth: 0 }}
        />
      </Box>
    </Box>
  );
}

export default SearchCompanyCard;
