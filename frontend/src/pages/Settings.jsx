import React, { useState } from 'react';
import axios from 'axios';
import { ShieldAlert, UserCheck, KeyRound } from 'lucide-react';

export default function Settings({ token, onUserUpdate }) {
  const [name, setName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        'http://localhost:5000/api/auth/update-profile',
        { name, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMsg('Profile updated successfully!');
      if (name) onUserUpdate(name);
      setName('');
      setNewPassword('');
    } catch (err) {
      alert('Update failed');
    }
  };

  const handleClearAllData = async () => {
    if (window.confirm('🚨 DANGER: Delete ALL items & sales history? This cannot be undone!')) {
      try {
        await axios.delete('http://localhost:5000/api/auth/clear-all-data', {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('All store data has been wiped.');
      } catch (err) {
        alert('Action failed');
      }
    }
  };

  return (
    <div className="max-w-xl space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">Account & System Settings</h2>

      {msg && <div className="p-3 bg-green-100 text-green-700 rounded-xl text-sm">{msg}</div>}

      <form onSubmit={handleUpdate} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
          <UserCheck className="w-5 h-5 text-indigo-600" />
          <span>Update Profile</span>
        </h3>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">New Display Name</label>
          <input
            type="text"
            placeholder="Change Admin Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-xl text-sm outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">New Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-xl text-sm outline-none"
          />
        </div>

        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-xl text-sm transition">
          Save Settings
        </button>
      </form>

      {/* Danger Zone */}
      <div className="bg-red-50 p-6 rounded-2xl border border-red-200 space-y-3">
        <h3 className="text-lg font-bold text-red-700 flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-red-600" />
          <span>Danger Zone</span>
        </h3>
        <p className="text-xs text-red-600">Wipe all store inventory, sales, and analytics records. Recommended for clean college project demos.</p>
        <button
          onClick={handleClearAllData}
          className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition cursor-pointer"
        >
          Clear All Data
        </button>
      </div>
    </div>
  );
}