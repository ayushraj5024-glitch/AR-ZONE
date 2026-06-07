import React, { useState } from 'react';
import { Lock, Save } from 'lucide-react';

export default function ManagePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage('Please fill in all fields.');
      setIsError(true);
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage('New password and confirm password do not match.');
      setIsError(true);
      return;
    }
    if (newPassword.length < 6) {
      setMessage('New password must be at least 6 characters long.');
      setIsError(true);
      return;
    }

    // Simulate password change success
    setMessage('Password successfully changed!');
    setIsError(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto">
      <div className="flex items-center space-x-3 mb-6">
        <Lock size={24} className="text-[#00ff88]" />
        <h2 className="text-2xl font-orbitron font-bold text-white tracking-wider">Manage Password</h2>
      </div>

      <div className="bg-[#05100a] border border-[#00ff88]/20 rounded-lg p-6 shadow-[0_0_15px_rgba(0,255,136,0.05)]">
        {message && (
          <div className={`px-4 py-3 rounded mb-6 text-sm font-medium border ${isError ? 'bg-[#ff3355]/10 text-[#ff3355] border-[#ff3355]/30' : 'bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/30'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 flex flex-col">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 font-orbitron uppercase tracking-widest">Current Password</label>
            <input 
              type="password" 
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2 bg-[rgba(5,16,10,0.5)] border border-slate-700 rounded focus:outline-none focus:ring-1 focus:ring-[#00ff88]/50 focus:border-[#00ff88] transition-all text-white text-sm"
              placeholder="Enter your current password"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 font-orbitron uppercase tracking-widest">New Password</label>
            <input 
              type="password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 bg-[rgba(5,16,10,0.5)] border border-slate-700 rounded focus:outline-none focus:ring-1 focus:ring-[#00ff88]/50 focus:border-[#00ff88] transition-all text-white text-sm"
              placeholder="Enter your new password"
            />
            <p className="text-xs text-slate-500">Note: Use a strong password to stop the browser from showing compromised password warnings.</p>
          </div>

          <div className="space-y-2 mb-4">
            <label className="text-xs font-bold text-slate-300 font-orbitron uppercase tracking-widest">Confirm New Password</label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 bg-[rgba(5,16,10,0.5)] border border-slate-700 rounded focus:outline-none focus:ring-1 focus:ring-[#00ff88]/50 focus:border-[#00ff88] transition-all text-white text-sm"
              placeholder="Confirm your new password"
            />
          </div>

          <button 
            type="submit"
            className="self-start flex items-center space-x-2 bg-[#00ff88]/10 hover:bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88] px-6 py-2 rounded text-sm font-semibold transition-all mt-4"
          >
            <Save size={16} />
            <span>Save Password</span>
          </button>
        </form>
      </div>
    </div>
  );
}
