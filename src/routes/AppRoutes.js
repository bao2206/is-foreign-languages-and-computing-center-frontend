// AppRoutes.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import ManagementLayout from "../layouts/ManagementLayout";

import LoginPage from "../pages/LoginPage"; // Trang đăng nhập
import ClassLogin from "../pages/Class/ClassLogin"; // Trang đăng nhập lớp học
import RequireAuth from "../utils/RequireAuth"; // Bảo vệ route
import CheckAndRemoveExpiredToken from "../utils/CheckAndRemoveExpiredToken"; // Kiểm tra và xóa token hết hạn
import HomePage from "../pages/HomePage"; // Trang chính
import ManagementRoutes from "./ManagementRoutes";
import ClassRoutes from "./ClassRoutes"; // Các route liên quan đến lớp học
import SchedulePage from "../pages/Class/SchedulePage";
import CoursePage from "../pages/CoursesPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import { RequireAuthClass } from "../utils/RequireAuth";

export default function AppRoutes() {
  CheckAndRemoveExpiredToken(); // Kiểm tra và xóa token hết hạn khi khởi tạo routes
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/class/login" element={<ClassLogin />} />
      <Route path="/schedule" element={<SchedulePage />} />
      <Route path="/courses" element={<CoursePage />} />
      {/* Bọc các route cần bảo vệ */}
      <Route element={<RequireAuth />}>
        <Route path="/management/*" element={<ManagementRoutes />} />
      </Route>
      <Route element={<RequireAuthClass />}>
        <Route path="/class/*" element={<ClassRoutes />} />
      </Route>
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      {/* Route mặc định nếu không tìm thấy */}
    </Routes>
  );
}
