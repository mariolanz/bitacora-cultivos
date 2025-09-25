import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AppProvider';

// Fix: Replaced JSX.Element with React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
// Fix: Add logic to redirect users to role selection if no role is active.
const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { currentUser, activeRole } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is logged in but has not selected a role, redirect to role selection.
  // The SelectRole component will then handle setting the role and redirecting back.
  if (currentUser.roles.length > 0 && !activeRole) {
    return <Navigate to="/select-role" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;
