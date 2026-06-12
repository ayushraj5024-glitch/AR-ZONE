import React, { useState } from 'react';
import { Lock, Save, Eye, EyeOff } from 'lucide-react';
import { getAuth, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { getFirestore, doc, updateDoc, setDoc } from 'firebase/firestore';

export default function ManagePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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

    const auth = getAuth();
    const user = auth.currentUser;
    const db = getFirestore();

    if (!user || (!user.email && !user.phoneNumber)) {
      setMessage('User not authenticated properly.');
      setIsError(true);
      return;
    }

    setIsLoading(true);
    try {
      if (user.email) {
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
      }
      
      await updatePassword(user, newPassword);
      
      await setDoc(doc(db, 'users', user.uid), {
        password: newPassword
      }, { merge: true });

      setMessage('Password successfully changed in authentication and user record!');
      setIsError(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      if (error.code === 'auth/invalid-credential') {
        setMessage('Incorrect current password.');
      } else if (error.code === 'auth/too-many-requests') {
        setMessage('Too many failed attempts. Please try again later.');
      } else {
        setMessage(error.message || 'Error updating password.');
      }
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
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
            <div className="relative">
              <input 
                type={showCurrentPassword ? "text" : "password"} 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 bg-[rgba(5,16,10,0.5)] border border-slate-700 rounded focus:outline-none focus:ring-1 focus:ring-[#00ff88]/50 focus:border-[#00ff88] transition-all text-white text-sm pr-10"
                placeholder="Enter your current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-[#00ff88] transition-colors focus:outline-none"
                tabIndex={-1}
              >
                {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 font-orbitron uppercase tracking-widest">New Password</label>
            <div className="relative">
              <input 
                type={showNewPassword ? "text" : "password"} 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 bg-[rgba(5,16,10,0.5)] border border-slate-700 rounded focus:outline-none focus:ring-1 focus:ring-[#00ff88]/50 focus:border-[#00ff88] transition-all text-white text-sm pr-10"
                placeholder="Enter your new password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-[#00ff88] transition-colors focus:outline-none"
                tabIndex={-1}
              >
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-xs text-slate-500">Note: Use a strong password to stop the browser from showing compromised password warnings.</p>
          </div>

          <div className="space-y-2 mb-4">
            <label className="text-xs font-bold text-slate-300 font-orbitron uppercase tracking-widest">Confirm New Password</label>
            <div className="relative">
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 bg-[rgba(5,16,10,0.5)] border border-slate-700 rounded focus:outline-none focus:ring-1 focus:ring-[#00ff88]/50 focus:border-[#00ff88] transition-all text-white text-sm pr-10"
                placeholder="Confirm your new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-[#00ff88] transition-colors focus:outline-none"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="self-start flex items-center space-x-2 bg-[#00ff88]/10 hover:bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88] px-6 py-2 rounded text-sm font-semibold transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={16} />
            <span>{isLoading ? 'Saving...' : 'Save Password'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
