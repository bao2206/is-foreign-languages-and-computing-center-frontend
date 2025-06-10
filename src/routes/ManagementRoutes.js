import React from "react";
import { Routes, Route } from "react-router-dom";

import ManagementLayout from "../layouts/ManagementLayout";
import UserPage from "../pages/Management/UserPage";
import CoursePages from "../pages/Management/CourseManage";
import ClassManage from "../pages/Management/ClassManage";
import ContactPage from "../pages/Management/ContactPage";

const ManagementRoutes = () => {
  return (
    <Routes>
      <Route element={<ManagementLayout />}>
        <Route path="/staff" element={<UserPage />} />
        <Route path="/course" element={<CoursePages />} />
        <Route path="/class" element={<ClassManage />} />
        <Route path="/contact" element={<ContactPage />} />
        {/* Thêm các route khác nếu cần */}
      </Route>
    </Routes>
  );
};

export default ManagementRoutes;
