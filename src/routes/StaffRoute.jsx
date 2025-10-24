import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { hasAnyStaffRole } from "../utils/roles";

export default function StaffRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return hasAnyStaffRole(user) ? children : <Navigate to="/" replace />;
}
