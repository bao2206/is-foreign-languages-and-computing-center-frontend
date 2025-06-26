import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "../components/Slide/ClassSidebar";
import Header from "../components/Headers/ClassHeader";
import LecturerDashboard from "../pages/Class/LecturerDashboard";
import StudentDashboard from "../pages/Class/StudentDashboard";
import Schedule from "../pages/Class/Schedule";
import ClassList from "../pages/Class/ClassList";
import AssignmentList from "../pages/Class/AssignmentList";
import ProfileView from "../pages/Class/ProfileView";
import ProtectedRoute from "../utils/ProtectedRoute";
import { RequireAuthClass } from "../utils/RequireAuth";
import AttendanceManagement from "../pages/Class/AttendanceManagement";
import StudentAttendance from "../pages/Class/StudentAttendance";
import ClassAssignmentManagement from "../pages/Class/ClassAssignmentManagement";
import ClassDetail from "../pages/Class/ClassDetail";

const AttendanceRoute = () => {
  const userRole = localStorage.getItem("userRole");
  if (userRole === "6800d06932b289b2fe5b0409") {
    // Giảng viên
    return (
      <ProtectedRoute allowedRoles={["6800d06932b289b2fe5b0409"]}>
        <AttendanceManagement />
      </ProtectedRoute>
    );
  }
  if (userRole === "6800d06932b289b2fe5b0403") {
    // Sinh viên
    return (
      <ProtectedRoute allowedRoles={["6800d06932b289b2fe5b0403"]}>
        <StudentAttendance />
      </ProtectedRoute>
    );
  }
  return <div className="p-6 text-red-500">No permission</div>;
};

const ClassRoutes = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <Routes>
            <Route element={<RequireAuthClass />}>
              <Route path="schedule" element={<Schedule />} />
              <Route path="classes" element={<ClassList />} />
              <Route path="assignments" element={<AssignmentList />} />
              <Route
                path=":classId/assignments"
                element={
                  <ProtectedRoute allowedRoles={["6800d06932b289b2fe5b0409"]}>
                    <ClassAssignmentManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="detail/:classId"
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      "6800d06932b289b2fe5b0409", // Giảng viên
                      "6800d06932b289b2fe5b0403", // Sinh viên
                    ]}
                  >
                    <ClassDetail />
                  </ProtectedRoute>
                }
              />
              <Route path="profile" element={<ProfileView />} />
              <Route
                path="students"
                element={
                  <ProtectedRoute allowedRoles={["6800d06932b289b2fe5b0409"]}>
                    <div className="p-6">Students Management (Coming Soon)</div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="attendance"
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      "6800d06932b289b2fe5b0409",
                      "6800d06932b289b2fe5b0403",
                    ]}
                  >
                    {AttendanceRoute()}
                  </ProtectedRoute>
                }
              />
              <Route path="" element={<Navigate to="dashboard" replace />} />
            </Route>
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default ClassRoutes;
