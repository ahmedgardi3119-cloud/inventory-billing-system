import React from 'react';
import { LogOut, User, Store } from 'lucide-react';

export default function Navbar({ user, onLogout }) {
  return (
    <header className="bg-indigo-600 text-white shadow-md px-6 py-4 flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <Store className="w-8 h-8 text-yellow-300" />
        <h1 className="text-xl font-bold tracking-wide">SmartInventory & Billing</h1>
      </div>
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2 bg-indigo-700 px-3 py-1.5 rounded-full text-sm">
          <User className="w-4 h-4 text-indigo-200" />
          <span className="font-medium">{user?.name || 'Admin'}</span>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center space-x-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm transition font-medium cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}