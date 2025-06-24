// components/RequireAuth.js
import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function RequireAuth() {
  console.log("Checking authentication...");

  const token = localStorage.getItem("token");

  // Kiểm tra token còn hạn không (giả sử token là JWT)
  function isTokenValid(token) {
    if (!token) {
      // localStorage.clear();
      return false;
    }
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      // exp là thời gian hết hạn tính bằng giây kể từ epoch
      const isValid = payload.exp * 1000 > Date.now();
      console.log(isValid);
      if (!isValid) {
        localStorage.clear();
      }
      return isValid;
    } catch (e) {
      return false;
    }
  }

  // Nếu chưa đăng nhập hoặc token hết hạn => chuyển hướng đến trang /login
  return isTokenValid(token) ? <Outlet /> : <Navigate to="/login" replace />;
}

export function RequireAuthClass() {
  console.log("Checking authentication...");

  const token = localStorage.getItem("token");

  // Kiểm tra token còn hạn không (giả sử token là JWT)
  function isTokenValid(token) {
    if (!token) {
      // localStorage.clear();
      return false;
    }
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      // exp là thời gian hết hạn tính bằng giây kể từ epoch
      const isValid = payload.exp * 1000 > Date.now();
      console.log(isValid);
      if (!isValid) {
        localStorage.clear();
      }
      return isValid;
    } catch (e) {
      return false;
    }
  }

  // Nếu chưa đăng nhập hoặc token hết hạn => chuyển hướng đến trang /login
  return isTokenValid(token) ? (
    <Outlet />
  ) : (
    <Navigate to="/class/login" replace />
  );
}
