// components/RequireAuth.js
import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function RequireAuth() {
  const token = localStorage.getItem("token");

  // Nếu chưa đăng nhập => chuyển hướng đến trang /login
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}
