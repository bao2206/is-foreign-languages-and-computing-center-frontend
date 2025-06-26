import React from "react";
import { Routes, Route } from "react-router-dom";

import ManagementLayout from "../layouts/ManagementLayout";
import UserPage from "../pages/Management/UserPage";
import CoursePages from "../pages/Management/CourseManage";
import ClassManage from "../pages/Management/ClassManage";
import ContactPage from "../pages/Management/ContactPage";
import ProtectedRoute from "../utils/ProtectedRoute"; // Bảo vệ route
import FinancePage from "../pages/Management/FinancePage";

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
        <Route path="/finance" element={<FinancePage />} />
        {/* Thêm các route khác nếu cần */}
      </Route>
      <Route
          path="/finance"
          element={
            <ProtectedRoute
              allowedRoles={[
                "6800d06a32b289b2fe5b040c",
                "683d70ba5b2fc9ee627b92cc",
              ]}
            >
              <FinancePage />
            </ProtectedRoute>
          }
        />
     
     
    
    </Routes>
  );
};

export default ManagementRoutes;
