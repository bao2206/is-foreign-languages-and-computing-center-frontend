import React from "react";
import { Outlet } from "react-router-dom";
import ManagementHeader from "../components/Headers/ManagementHeader";

const ManagementLayout = () => {
  return (
    <>
      <ManagementHeader />
      <div className="p-4 sm:ml-64 mt-16 min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white transition-colors">
        <div className="p-1 rounded-lg border-2 border-t-0 border-gray-200 dark:border-gray-700 border-dashed">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default ManagementLayout;
