import React from 'react';
import { Outlet } from 'react-router-dom';
import ManagementHeader from '../components/Headers/ManagementHeader';

const ManagementLayout = () => {
  return (
    <>
      <ManagementHeader />
      <div className="p-4">
        <Outlet />
      </div>
    </>
  );
};

export default ManagementLayout;
