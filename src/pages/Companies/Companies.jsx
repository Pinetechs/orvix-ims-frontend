import React from 'react';
import { useQuery } from '@tanstack/react-query';
import ServerTablePage from '../Placeholder/ServerTablePage.jsx';
import { getCompanies } from '../../services/companyService.js';

function Companies() {
  const query = useQuery({ queryKey: ['companies'], queryFn: getCompanies });
  return <ServerTablePage title="Companies" description="Manage companies available in Orvix IMS." query={query} />;
}

export default Companies;
