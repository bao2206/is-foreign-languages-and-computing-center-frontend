import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ManagementRoutes from './ManagementRoutes';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" />

      <Route path="/management" element={<ManagementRoutes/>} />

    </Routes>
  );
}
