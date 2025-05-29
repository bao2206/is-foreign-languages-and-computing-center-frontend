// AppRoutes.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import ManagementLayout from "../layouts/ManagementLayout";

import LoginPage from "../pages/LoginPage"; // Trang đăng nhập
import RequireAuth from "../utils/RequireAuth"; // Bảo vệ route
import HomePage from "../pages/HomePage"; // Trang chính
import ClassManagementPage from "../pages/Management/ClassManagementPage"; // Trang quản lý lớp học
import StaffPages from "../pages/Management/StaffPages";
import CourseManage from "../pages/Management/CourseManage";
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Bọc các route cần bảo vệ */}
      {/* <Route element={<RequireAuth />}>
        <Route path="/management" element={<ManagementLayout />}>
          <Route path="staff" element={<StaffPages />} />
          <Route path="course" element={<CourseManage />} />
        </Route>
      </Route> */}
      <Route>
        <Route path="/manage" element={<ManagementLayout />}>
          <Route path="staff" element={<StaffPages />} />
          <Route path="course" element={<CourseManage />} />
          <Route path="class" element={<ClassManagementPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
