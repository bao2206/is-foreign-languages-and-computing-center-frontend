import React from "react";
import { Routes, Route } from "react-router-dom";
import ManagementLayout from "../layouts/ManagementLayout";
import StaffPages from "../pages/StaffPages";
import CourseManage from "../pages/CourseManage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<div>Trang chính</div>} />

      <Route path="/management" element={<ManagementLayout />}>
        <Route path="staff" element={<StaffPages />} />
        <Route path="course" element={<CourseManage />} />
      </Route>
    </Routes>
  );
}
