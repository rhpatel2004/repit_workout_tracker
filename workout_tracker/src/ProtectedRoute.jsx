// src/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const userId = localStorage.getItem('userId'); // Check if user is logged in at all
  const userRole = localStorage.getItem('userRole');

  if (!userId) {
    // Not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.includes(userRole)) {
    // Role is allowed, render the nested routes using Outlet
    return <Outlet />;
  } else {
    // Role is not allowed, redirect based on their actual role
    console.warn(`Unauthorized access attempt. User role: ${userRole}, Allowed: ${allowedRoles}`);
    if (userRole === 'trainer') {
        return <Navigate to="/dashboard" replace />; // Trainers go to dashboard
    } else if (userRole === 'user') {
        return <Navigate to="/workout" replace />; // Users go to workout page
    } else {
        return <Navigate to="/" replace />; // Fallback to landing/login
    }
  }
};

export default ProtectedRoute;