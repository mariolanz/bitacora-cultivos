import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from "./src/context/AppProvider";

import MainLayout from './components/layout/MainLayout';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Setup from './components/Setup';
import Log from './components/Log';
import Harvest from './components/Harvest';
import Reports from './components/Reports';
import AiDiagnosis from './components/AiDiagnosis';
import Settings from './components/Settings';
import PrivateRoute from './components/PrivateRoute';
import BatchManagement from './components/BatchManagement';
import Expenses from './components/Expenses';
import Archive from './components/Archive';
import MaintenanceReports from './components/MaintenanceReports';
import MaintenanceDashboard from './components/MaintenanceDashboard';
import SelectRole from './components/SelectRole';
import MotherPlants from './components/MotherPlants';
import Schedule from './components/Schedule';
import Trimming from './components/Trimming';

const App: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={currentUser ? <Navigate to="/" /> : <Login />} />
      <Route path="/select-role" element={<SelectRole />} />
      <Route 
        path="/" 
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="schedule" element={<Schedule />} />
        <Route path="setup" element={<Setup />} />
        <Route path="batches" element={<BatchManagement />} />
        <Route path="mother-plants" element={<MotherPlants />} />
        <Route path="log" element={<Log />} />
        <Route path="harvest" element={<Harvest />} />
        <Route path="reports" element={<Reports />} />
        <Route path="ai-diagnosis" element={<AiDiagnosis />} />
        <Route path="trimming" element={<Trimming />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="settings" element={<Settings />} />
        <Route path="archive" element={<Archive />} />
        <Route path="maintenance-reports" element={<MaintenanceReports />} />
        <Route path="maintenance-calendar" element={<MaintenanceDashboard />} />
      </Route>
      <Route path="*" element={<Navigate to={currentUser ? "/" : "/login"} />} />
    </Routes>
  );
};

export default App;