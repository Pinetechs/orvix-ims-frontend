import React from 'react'
import { QueryMultiSelectMenu, QuerySearchField, QuerySelectField } from '../../../components/search'
import { Box } from '@mui/material'
import { USER_TYPE_OPTIONS , ACCESS_CHANNEL_OPTIONS,STATUS_OPTIONS, INVENTORY_DOMAIN_OPTIONS} from '../constants/userOptions'

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

              <QuerySelectField
                paramName="userType"
                label="User Type"
                allLabel="All Types"
                minWidth={210}
                options={USER_TYPE_OPTIONS}
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

              <QueryMultiSelectMenu
                title="Domains"
                queryParam="inventoryDomains"
                allLabel="All Domains"
                options={INVENTORY_DOMAIN_OPTIONS}
                buttonProps={{ sx: { width: '100%', minWidth: 0, justifyContent: 'space-between' } }}
                menuWidth={300}
              />
            </Box>
          </Box>
  )
}
