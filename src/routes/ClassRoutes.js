import React from "react";
import { Routes, Route } from "react-router-dom";
import SchedulePage from "../pages/Class/SchedulePage";

const ClassRoutes = () => {
  return (
    <>
      <Routes>
        <Route path="/schedule" element={<SchedulePage />} />
        {/* Có thể thêm các route khác nếu cần */}
      </Routes>
    </>
  );
};

export default ClassRoutes;
