// src/routes/RoleRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@context/AuthContext";

interface Props {
  children: React.ReactNode;
  requiredRole?: "CUSTOMER" | "ADMIN"; 
  // optional → if not passed, just checks isLoggedIn
}

/**
 * ✅ RoleRoute - Unified route guard
 *
 * - If `requiredRole` is not passed → acts like PrivateRoute (just checks login).
 * - If `requiredRole="CUSTOMER"` → acts like CustomerRoute.
 * - If `requiredRole="ADMIN"` → acts like AdminRoute.
 *
 * Usage:
 *   <RoleRoute>
 *     <Dashboard />
 *   </RoleRoute>
 *
 *   <RoleRoute requiredRole="CUSTOMER">
 *     <CartPage />
 *   </RoleRoute>
 *
 *   <RoleRoute requiredRole="ADMIN">
 *     <AdminPanel />
 *   </RoleRoute>
 */
const RoleRoute = ({ children, requiredRole }: Props) => {
  const { isLoggedIn, isAdmin, isCustomer, loading } = useAuth();

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  // 🔹 If not logged in → redirect to login
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  // 🔹 If role required, enforce it
  if (requiredRole === "CUSTOMER" && !isCustomer) {
    return <Navigate to="/not-authorized" replace />;
  }
  if (requiredRole === "ADMIN" && !isAdmin) {
    return <Navigate to="/not-authorized" replace />;
  }

  // ✅ Passed checks → render child component
  return <>{children}</>;
};

export default RoleRoute;