import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import Dashboard from '../pages/Dashboard';
import Revenue from '../pages/Revenue';
import Users from '../pages/Users';
import Problems from '../pages/Problems';
import System from '../pages/System';
import ProblemStudio from '../pages/ProblemStudio';
import Submissions from '../pages/Submissions';
import Curriculum from '../pages/Curriculum';
import Login from '../pages/Login';
import ProtectedRoute from '../components/ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Studio: Full-screen, protected */}
      <Route path="/problems/:id/studio" element={
        <ProtectedRoute>
          <ProblemStudio />
        </ProtectedRoute>
      } />

      {/* Regular Admin Routes: Wrapped in layout and protected */}
      <Route path="/" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/revenue" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Revenue />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/users" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Users />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/problems" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Problems />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/content" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Curriculum />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/submissions" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Submissions />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/system" element={
        <ProtectedRoute>
          <DashboardLayout>
            <System />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
