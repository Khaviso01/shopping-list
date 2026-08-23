import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';

export const PublicRoute: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  // If logged in, send them to /home; otherwise allow access to login/register pages
  return !isAuthenticated ? <Outlet /> : <Navigate to="/home" replace />;
};

export default PublicRoute;