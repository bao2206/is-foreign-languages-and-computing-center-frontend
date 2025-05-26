// AppRoutes.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import ManagementLayout from "../layouts/ManagementLayout";
import StaffPages from "../pages/StaffPages";
import CourseManage from "../pages/CourseManage";
import LoginPage from "../pages/LoginPage"; // Trang đăng nhập
import RequireAuth from "../utils/RequireAuth"; // Bảo vệ route
import HomePage from "../pages/HomePage"; // Trang chính

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
       <Route >
        <Route path="/management" element={<ManagementLayout />}>
          <Route path="staff" element={<StaffPages />} />
          <Route path="course" element={<CourseManage />} />
        </Route>
      </Route>
    </Routes>
  );
}
