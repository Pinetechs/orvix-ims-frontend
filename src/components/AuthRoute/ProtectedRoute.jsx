import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import Loader from '../Loader/index.js';

const ProtectedRoute = ({ requiredPermission = null, children }) => {
  const { isAuthenticate, loading, hasPermission } = useAuth();
  const location = useLocation();

  if (loading) return <Loader />;

  if (!isAuthenticate) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requiredPermission) {
    const ok = hasPermission ? hasPermission(requiredPermission) : false;
    if (!ok) return <Navigate to="/" replace />;
  }

  // If children provided, render them; otherwise render nested routes outlet
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
