import React from "react";
import { Routes, Route } from "react-router-dom";

import ManagementHeader from "../components/Headers/ManagementHeader";
import StaffPages from "../pages/Management/StaffPages";

const ManagementRoutes = () => {
  return (
    <>
      <ManagementHeader />
      <Routes>
        <Route path="/staff" element={<StaffPages />} />
      </Routes>
    </>
  );
};

export default ManagementRoutes;
