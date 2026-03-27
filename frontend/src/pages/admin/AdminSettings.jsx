import { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = Cookies.get('adminToken');
      await axios.put(`${(import.meta.env.VITE_API_URL || "")}/api/auth/update-credentials`, { email, password }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Credentials updated successfully');
      setEmail('');
      setPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Account Settings</h2>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <form onSubmit={handleUpdate} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">New Email (Optional)</label>
            <input
              type="email"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter new email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">New Password (Optional)</label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-colors"
          >
            Update Credentials
          </button>
        </form>
      </div>
    </div>
  );
}
