import React from 'react'
import { QueryAsyncAutocompleteField, QuerySearchField, QuerySelectField } from '../../../components/search'
import { Box } from '@mui/material'
import { ACCESS_CHANNEL_OPTIONS, STATUS_OPTIONS } from '../constants/userOptions'
import { getLookupInventoryDomains, getLookupUserTypes } from '../../../services/lookupsServices'
import { queryKeys } from '../../../services/queryKeys'

const INVENTORY_DOMAIN_LOOKUP_PARAMS = { size: 20 };
const USER_TYPE_LOOKUP_PARAMS = { size: 20 };

export default function SearchUserCard() {
  return (
       <Box sx={{ p: { xs: 1.5, sm: 2.4 } }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'minmax(0, 1fr)',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  lg: 'minmax(260px, 1fr) 200px 150px 150px 170px',
                },
                gap: 1.5,
                alignItems: 'center',
                minWidth: 0,
              }}
            >
              <QuerySearchField
                paramName="search"
                placeholder="Search by name, username, email, phone or company..."
                updateOnEnterOnly
                sx={{ width: '100%', minWidth: 0, gridColumn: { xs: '1', sm: '1 / -1', lg: 'auto' } }}
              />

              <QueryAsyncAutocompleteField
                paramName="userType"
                label="User Type"
                placeholder="All Types"
                queryKey={queryKeys.lookups.userTypes(USER_TYPE_LOOKUP_PARAMS)}
                queryFn={getLookupUserTypes}
                parentParams={USER_TYPE_LOOKUP_PARAMS}
                optionValueKey="value"
                optionLabelKeys={['label']}
                sx={{ width: '100%', minWidth: 0 }}
              />

              <QuerySelectField
                paramName="accessChannel"
                label="Channel"
                allLabel="All"
                minWidth={150}
                options={ACCESS_CHANNEL_OPTIONS}
                sx={{ width: '100%', minWidth: 0 }}
              />

              <QuerySelectField
                paramName="status"
                label="Status"
                allLabel="All"
                minWidth={150}
                options={STATUS_OPTIONS}
                sx={{ width: '100%', minWidth: 0 }}
              />

              <QueryAsyncAutocompleteField
                multiple
                paramName="inventoryDomains"
                label="Domains"
                placeholder="All Domains"
                queryKey={queryKeys.lookups.inventoryDomains(INVENTORY_DOMAIN_LOOKUP_PARAMS)}
                queryFn={getLookupInventoryDomains}
                parentParams={INVENTORY_DOMAIN_LOOKUP_PARAMS}
                optionValueKey="value"
                optionLabelKeys={['label']}
                sx={{ width: '100%', minWidth: 0 }}
              />
            </Box>
          </Box>
  )
}
