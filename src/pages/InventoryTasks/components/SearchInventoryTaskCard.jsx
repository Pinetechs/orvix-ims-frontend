import React from 'react';
import { Box } from '@mui/material';

import { QueryAsyncAutocompleteField, QuerySearchField } from '../../../components/search/index.js';
import {
  getLookupCompanies,
  getLookupInventoryDomains,
  getLookupTaskStatuses,
} from '../../../services/lookupsServices.js';
import { queryKeys } from '../../../services/queryKeys.js';

const COMPANY_LOOKUP_PARAMS = { active: true, size: 20, sort: 'name,asc' };
const INVENTORY_DOMAIN_LOOKUP_PARAMS = { size: 20 };
const TASK_STATUS_LOOKUP_PARAMS = { size: 20 };

const fieldSx = {
  width: '100%',
  minWidth: 0,
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    bgcolor: 'background.paper',
    transition: 'box-shadow 160ms ease, border-color 160ms ease',
    '&:hover': {
      boxShadow: '0 4px 14px rgba(15, 23, 42, 0.06)',
    },
    '&.Mui-focused': {
      boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.10)',
    },
  },
};

function SearchInventoryTaskCard() {
  return (
    <Box sx={{ p: { xs: 1.25, sm: 2 }, bgcolor: 'rgba(248, 250, 252, 0.72)' }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'minmax(320px, 1.45fr) minmax(210px, 0.85fr) minmax(170px, 0.65fr) minmax(190px, 0.75fr)',
          },
          gap: 1.25,
          alignItems: 'center',
          minWidth: 0,
        }}
      >
        <QuerySearchField
          paramName="search"
          placeholder="Search by task name or number..."
          updateOnEnterOnly
          sx={fieldSx}
        />

        <QueryAsyncAutocompleteField
          paramName="companyId"
          label="Company"
          placeholder="All Companies"
          queryKey={queryKeys.lookups.companies(COMPANY_LOOKUP_PARAMS)}
          queryFn={getLookupCompanies}
          parentParams={COMPANY_LOOKUP_PARAMS}
          optionValueKey="value"
          optionLabelKeys={['label']}
          sx={fieldSx}
        />

        <QueryAsyncAutocompleteField
          paramName="inventoryDomain"
          label="Domain"
          placeholder="All Domains"
          queryKey={queryKeys.lookups.inventoryDomains(INVENTORY_DOMAIN_LOOKUP_PARAMS)}
          queryFn={getLookupInventoryDomains}
          parentParams={INVENTORY_DOMAIN_LOOKUP_PARAMS}
          optionValueKey="value"
          optionLabelKeys={['label']}
          sx={fieldSx}
        />

        <QueryAsyncAutocompleteField
          paramName="status"
          label="Status"
          placeholder="All Statuses"
          queryKey={queryKeys.lookups.taskStatuses(TASK_STATUS_LOOKUP_PARAMS)}
          queryFn={getLookupTaskStatuses}
          parentParams={TASK_STATUS_LOOKUP_PARAMS}
          optionValueKey="value"
          optionLabelKeys={['label']}
          sx={fieldSx}
        />
      </Box>
    </Box>
  );
}

export default SearchInventoryTaskCard;
