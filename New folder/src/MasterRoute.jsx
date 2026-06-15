import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import NoMatch from './components/404/index.js';
import ProtectedRoute from './components/AuthRoute/index.js';
import NavBar from './components/NavBar/index.js';
import Login from './pages/Login/index.js';
import Dashboard from './pages/Dashboard/index.js';
import Companies from './pages/Companies/index.js';
import Users from './pages/Users/index.js';
import InventoryTasks from './pages/InventoryTasks/index.js';
import Reports from './pages/Reports/index.js';
import ChangePassword from './pages/Account/index.js';

function MasterRoute() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<NavBar />}>
          <Route index element={<Dashboard />} />
          <Route path="companies" element={<Companies />} />
          <Route path="users" element={<Users />} />
          <Route path="inventory-tasks" element={<InventoryTasks />} />
          <Route path="reports" element={<Reports />} />
          <Route path="update-password" element={<ChangePassword />} />
          <Route path="login" element={<Navigate to="/" replace />} />
        </Route>
      </Route>

      <Route path="*" element={<NoMatch />} />
    </Routes>
  );
}

export default MasterRoute;
