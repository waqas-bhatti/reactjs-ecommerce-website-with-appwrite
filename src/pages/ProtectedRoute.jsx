import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
function ProtectedRoute({ children }) {
  const isAuthenticated = useSelector((auth) => auth.cart.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace></Navigate>;
  }

  return children;
}

export default ProtectedRoute;
