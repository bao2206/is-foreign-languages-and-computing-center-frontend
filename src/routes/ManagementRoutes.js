import React from "react";
import { Routes, Route } from "react-router-dom";

import ManagementHeader from "../components/Headers/ManagementHeader";
import StaffPages from "../pages/Management/StaffPages";
import CoursePages from "../pages/Management/CourseManage";
import ClassManage from "../pages/Management/ClassManage";

const ManagementRoutes = () => {
  return (
    <>
      <ManagementHeader />
      <Routes>
        <Route path="/staff" element={<StaffPages />} />
        <Route path="/course" element={<CoursePages />} />
        <Route path="/class" element={<ClassManage />} />
        {/* Có thể thêm các route khác nếu cần */}
      </Routes>
    </>
  );
};

export default ManagementRoutes;
