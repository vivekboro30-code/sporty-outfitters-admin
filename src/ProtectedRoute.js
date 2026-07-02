import React from 'react';
import { Navigate } from 'react-router-dom';

// Wraps a route and only lets you see it if a login token exists.
// No token → bounced to /login.
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('adminToken');
  return token ? children : <Navigate to="/login" replace />;
}

export default ProtectedRoute;