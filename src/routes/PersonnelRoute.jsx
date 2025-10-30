// src/routes/PersonnelRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { hasPersonnelRole } from "../utils/roles";

export default function PersonnelRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-8">Chargement...</div>;

  if (!user) return <Navigate to="/login" replace />;
  if (!hasPersonnelRole(user)) return <Navigate to="/" replace />;
  return children;
}