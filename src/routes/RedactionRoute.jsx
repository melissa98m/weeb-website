import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { hasAnyRedactionRole } from "../utils/roles";

export default function RedactionRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return hasAnyRedactionRole(user) ? children : <Navigate to="/" replace />;
}
