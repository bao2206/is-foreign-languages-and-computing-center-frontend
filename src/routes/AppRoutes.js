// AppRoutes.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import ManagementLayout from "../layouts/ManagementLayout";

import LoginPage from "../pages/LoginPage"; // Trang đăng nhập
import RequireAuth from "../utils/RequireAuth"; // Bảo vệ route
import HomePage from "../pages/HomePage"; // Trang chính
import ManagementRoutes from "./ManagementRoutes";
import ClassRoutes from "./ClassRoutes"; // Các route liên quan đến lớp học

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Bọc các route cần bảo vệ */}
      <Route element={<RequireAuth />}>
        <Route path="/management/*" element={<ManagementRoutes />} />

        <Route path="/class/*" element={<ClassRoutes />} />
      </Route>
    </Routes>
  );
}
