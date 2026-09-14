import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Billing from './pages/Billing';
import SalesRecord from './pages/SalesRecord';
import Settings from './pages/Settings';

export default function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('userInfo')) || null);

  const handleLoginSuccess = (userData) => {
    localStorage.setItem('userInfo', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <Routes>
              <Route path="/" element={<Dashboard token={user.token} />} />
              <Route path="/inventory" element={<Inventory token={user.token} />} />
              <Route path="/billing" element={<Billing token={user.token} />} />
              <Route path="/sales" element={<SalesRecord token={user.token} />} />
              <Route path="/settings" element={<Settings token={user.token} onUserUpdate={(name) => setUser({...user, name})} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}