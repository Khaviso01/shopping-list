import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';

export const ProtectedRoute: React.FC = () => {
  // Check auth state from Redux (or fallback check to localStorage)
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  // If authenticated, render child routes (<Outlet />); otherwise redirect to login
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;