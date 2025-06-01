import React from "react";
import { Routes, Route } from "react-router-dom";

import ManagementHeader from "../components/Headers/ManagementHeader";
import UserPage from "../pages/Management/UserPage";
import CoursePages from "../pages/Management/CourseManage";
import ClassManage from "../pages/Management/ClassManage";
import ContactPage from "../pages/Management/ContactPage";

const ManagementRoutes = () => {
  return (
    <>
      <ManagementHeader />
      <Routes>
        <Route path="/staff" element={<UserPage />} />
        <Route path="/course" element={<CoursePages />} />
        <Route path="/class" element={<ClassManage />} />
        <Route path="/contact" element={<ContactPage />} />
        {/* Có thể thêm các route khác nếu cần */}
      </Routes>
    </>
  );
};

export default ManagementRoutes;
