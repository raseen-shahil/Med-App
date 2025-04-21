import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import AddMedicine from './components/dashboard/pages/AddMedicine';
import MedicineList from './components/dashboard/pages/MedicineList';
import CompletedOrders from './components/dashboard/pages/completedOrders';
import PendingOrders from './components/dashboard/pages/PendingOrders';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<MedicineList />} />
            <Route path="medicines" element={<MedicineList />} />
            <Route path="add-medicine" element={<AddMedicine />} />
            <Route path="completed" element={<CompletedOrders />} />
            <Route path="pending" element={<PendingOrders />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
