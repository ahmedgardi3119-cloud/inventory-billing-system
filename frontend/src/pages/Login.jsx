import React, { useState } from 'react';
import axios from 'axios';
import { Store, KeyRound, Mail, ShieldCheck, User } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [useOtpMode, setUseOtpMode] = useState(false);
  const [demoOtp, setDemoOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendOtp = async () => {
    try {
      setError('');
      const res = await axios.post('http://localhost:5000/api/auth/send-otp', { identifier });
      setDemoOtp(res.data.demoOtp);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (isRegister) {
        // Registration Flow
        await axios.post('http://localhost:5000/api/auth/register', { name, identifier, password });
        setSuccess('Registration successful! Please login now.');
        setIsRegister(false);
      } else {
        // Login Flow
        const payload = useOtpMode ? { identifier, otp } : { identifier, password };
        const res = await axios.post('http://localhost:5000/api/auth/login', payload);
        onLoginSuccess(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-indigo-100 rounded-full text-indigo-600 mb-2">
            <Store className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            {isRegister ? 'Create Admin Account' : 'Shop Admin Login'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">Inventory & Billing Management System</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-100 text-green-700 text-sm rounded-lg">{success}</div>}
        {demoOtp && (
          <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 text-sm rounded-lg flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <span>Demo OTP Code: <strong>{demoOtp}</strong></span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Admin Name"
                  className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                />
                <User className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email or Phone Number</label>
            <div className="relative">
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="9876543210 or admin@shop.com"
                className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              />
              <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {!useOtpMode ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                />
                <KeyRound className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">OTP Verification</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="6-digit OTP"
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="bg-indigo-100 text-indigo-600 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-indigo-200 transition"
                >
                  Get OTP
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-semibold transition shadow-md cursor-pointer"
          >
            {isRegister ? 'Register Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 flex flex-col items-center space-y-2 text-xs">
          {!isRegister && (
            <button
              type="button"
              onClick={() => { setUseOtpMode(!useOtpMode); setError(''); }}
              className="text-indigo-600 hover:underline font-medium cursor-pointer"
            >
              {useOtpMode ? 'Switch to Password Login' : 'Login using OTP instead'}
            </button>
          )}

          <button
            type="button"
            onClick={() => { setIsRegister(!isRegister); setError(''); setSuccess(''); }}
            className="text-gray-500 hover:text-indigo-600 font-semibold cursor-pointer"
          >
            {isRegister ? 'Already have an account? Sign In' : 'New User? Create Account'}
          </button>
        </div>
      </div>
    </div>
  );
}