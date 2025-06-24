import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Spinner } from 'react-bootstrap';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Show a loading spinner while checking auth status from the token
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (!isAuthenticated) {
    // If not authenticated, redirect to the login page.
    // Pass the original location so we can redirect back after a successful login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if the user's role is included in the list of allowed roles.
  // Using toLowerCase() to ensure the check is case-insensitive.
  const isAuthorized = user && allowedRoles.map(role => role.toLowerCase()).includes(user.role.toLowerCase());

  if (!isAuthorized) {
    // If authenticated but not authorized, redirect to the "Unauthorized" page.
    return <Navigate to="/unauthorized" replace />;
  }

  // If authenticated and authorized, render the requested component.
  return children;
};

export default ProtectedRoute; 