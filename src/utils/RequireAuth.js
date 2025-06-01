// components/RequireAuth.js
import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function RequireAuth() {
  const token = localStorage.getItem("token");

  // Kiểm tra token còn hạn không (giả sử token là JWT)
  function isTokenValid(token) {
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      // exp là thời gian hết hạn tính bằng giây kể từ epoch
      return payload.exp * 1000 > Date.now();
    } catch (e) {
      return false;
    }
  }

  // Nếu chưa đăng nhập hoặc token hết hạn => chuyển hướng đến trang /login
  return isTokenValid(token) ? <Outlet /> : <Navigate to="/login" replace />;
}
