import React from "react";
import { Routes, Route } from "react-router-dom";

import ManagementLayout from "../layouts/ManagementLayout";
import UserPage from "../pages/Management/UserPage";
import CoursePages from "../pages/Management/CourseManage";
import ClassManage from "../pages/Management/ClassManage";
import ContactPage from "../pages/Management/ContactPage";
<<<<<<< HEAD
import ProtectedRoute from "../utils/ProtectedRoute"; // Bảo vệ route

const ManagementRoutes = () => {
  return (
    <Routes>
      <Route element={<ManagementLayout />}>
        {/* Các route con của ManagementLayout */}
        <Route path="/" />
        <Route
          path="/staff"
          element={
            <ProtectedRoute allowedRoles={["6800d06a32b289b2fe5b040c"]}>
              <UserPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/course"
          element={
            <ProtectedRoute
              allowedRoles={[
                "6800d06a32b289b2fe5b040c",
                "6800d06a32b289b2fe5b040f",
                "6800d06a32b289b2fe5b0412",
              ]}
            >
              <CoursePages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/class"
          element={
            <ProtectedRoute
              allowedRoles={[
                "6800d06a32b289b2fe5b040c",
                "6800d06a32b289b2fe5b0412",
              ]}
            >
              <ClassManage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contact"
          element={
            <ProtectedRoute
              allowedRoles={[
                "6800d06a32b289b2fe5b040c",
                "6800d06a32b289b2fe5b040f",
              ]}
            >
              <ContactPage />
            </ProtectedRoute>
          }
        />
        {/* Thêm các route khác nếu cần */}
      </Route>
    </Routes>
=======
import FinancePage from "../pages/Management/FinancePage";

const ManagementRoutes = () => {
  return (
    <>
      <ManagementHeader />
      <Routes>
        <Route path="/staff" element={<UserPage />} />
        <Route path="/course" element={<CoursePages />} />
        <Route path="/class" element={<ClassManage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/finance" element={<FinancePage />} />
        {/* Có thể thêm các route khác nếu cần */}
      </Routes>
    </>
>>>>>>> 8ddda3b (Add)
  );
};

export default ManagementRoutes;
