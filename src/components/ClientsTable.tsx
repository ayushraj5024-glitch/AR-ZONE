import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, MoreVertical, ShieldAlert, X, ShieldCheck, Lock, Unlock, UserPlus, Eye, EyeOff } from 'lucide-react';
import { collection, query, onSnapshot, doc, setDoc, updateDoc, where } from 'firebase/firestore';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { db, firebaseConfig } from '../firebase';

interface ClientsTableProps {
  title: string;
  subTitle: string;
  breadcrumb: string;
  hideActions?: boolean;
  hideCreate?: boolean;
}

export default function ClientsTable({ title, subTitle, breadcrumb, hideActions = false, hideCreate = false }: ClientsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [selectedUserForManage, setSelectedUserForManage] = useState<any | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [selectedStatement, setSelectedStatement] = useState<any | null>(null);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', name: '', mComm: '2.0%', sComm: '1.5%', share: '10%' });
  const [showPasswordCreate, setShowPasswordCreate] = useState(false);
  const [showPasswordProfile, setShowPasswordProfile] = useState(false);

  const [usersData, setUsersData] = useState<any[]>([]);
  const [statementData, setStatementData] = useState<any[]>([]);
  const [statementLoading, setStatementLoading] = useState(false);

  useEffect(() => {
    if (selectedStatement?.id) {
      setStatementLoading(true);
      const q = query(collection(db, 'statements'), where('userId', '==', selectedStatement.id));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const smts: any[] = [];
        snapshot.forEach((doc) => {
          smts.push({ id: doc.id, ...doc.data() });
        });
        // Sort descending by date
        smts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setStatementData(smts);
        setStatementLoading(false);
      }, (error) => {
        console.error("Error fetching statements:", error);
        setStatementLoading(false);
      });
      return () => unsubscribe();
    } else {
      setStatementData([]);
    }
  }, [selectedStatement]);

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users: any[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.role === 'client') {
          users.push({ id: doc.id, username: data.email, ...data });
        }
      });
      setUsersData(users);
    });
    return () => unsubscribe();
  }, []);

  const filteredData = usersData.filter(d => 
    (d.username && d.username.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (d.name && d.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleMenu = (id: string) => {
    if (activeMenuId === id) setActiveMenuId(null);
    else setActiveMenuId(id);
  };

  const updateStatus = async (id: string, field: string, value: any) => {
    // Optimistic update
    setUsersData(data => data.map(u => u.id === id ? { ...u, [field]: value } : u));
    if (selectedUserForManage && selectedUserForManage.id === id) {
       setSelectedUserForManage({...selectedUserForManage, [field]: value});
    }

    try {
      const userRef = doc(db, 'users', id);
      await updateDoc(userRef, { [field]: value });
    } catch (error: any) {
      alert("Error updating user: " + error.message);
    }
  };

  const handleDeleteUser = async (id: string) => {
    // Optimistic update
    setUsersData(data => data.map(u => u.id === id ? { ...u, status: 'deleted' } : u));
    
    try {
      const userRef = doc(db, 'users', id);
      await updateDoc(userRef, { status: 'deleted' });
    } catch (error: any) {
      alert("Error deleting user: " + error.message);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      const apps = getApps();
      const secondaryApp = apps.find(app => app.name === 'Secondary') ? getApp('Secondary') : initializeApp(firebaseConfig, "Secondary");
      const secondaryAuth = getAuth(secondaryApp);
      
      const baseId = (newUser.email || '').trim();
      let formattedEmail = baseId;
      if (!baseId.includes('@') || !baseId.includes('.')) {
        const safeLocalPart = baseId.replace(/@/g, '_at_').replace(/[^a-zA-Z0-9_.-]/g, '');
        formattedEmail = safeLocalPart ? `${safeLocalPart}@ar-zone-app.local` : `invalid@ar-zone-app.local`;
      }
      
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, formattedEmail, newUser.password);
      await updateProfile(userCredential.user, { displayName: newUser.name });

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: newUser.email,
        name: newUser.name,
        password: newUser.password, // Storing password securely for agent access as requested
        role: 'client',
        mComm: newUser.mComm,
        sComm: newUser.sComm,
        share: newUser.share,
        status: 'active',
        autoBlock: true,
        createdAt: new Date().toISOString()
      });

      await signOut(secondaryAuth);
      
      setIsCreateModalOpen(false);
      setNewUser({email: '', password: '', name: '', mComm: '2.0%', sComm: '1.5%', share: '10%'});
    } catch (error: any) {
      console.error("Create User Error:", error);
      alert("Error creating user: " + error.message);
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">{title}</h2>
        <div className="text-sm font-medium text-slate-400 mt-1 flex items-center space-x-2">
          <span>Dashboard</span>
          <span className="text-slate-300">/</span>
          <span className="text-white">{breadcrumb}</span>
        </div>
      </div>

      <div className="bg-[#05100a] border text-left border-[#00ff88]/20 rounded-lg shadow-sm flex flex-col mt-4 pt-0 relative z-0">
        <div className="bg-[#60999b] text-white px-4 py-3 flex items-center justify-between rounded-t-lg">
          <h3 className="font-semibold">{subTitle}</h3>
          {!hideCreate && (
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-[#182130] hover:bg-[#111823] text-white text-sm px-4 py-1.5 border border-[#1e293b] rounded shadow-sm flex items-center space-x-1 transition-colors">
              <UserPlus size={16} />
              <span>Create new User</span>
            </button>
          )}
        </div>
        
        <div className="p-4 border-b border-[#00ff88]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#020503]/50">
          <div className="flex space-x-2">
            <button className="bg-[#05100a] border border-[#00ff88]/30 text-slate-300 hover:bg-[#020503] px-4 py-1.5 rounded text-sm font-medium shadow-sm transition-colors">
              CSV
            </button>
            <button className="bg-[#05100a] border border-[#00ff88]/30 text-slate-300 hover:bg-[#020503] px-4 py-1.5 rounded text-sm font-medium shadow-sm transition-colors">
              PDF
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search.."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-[#00ff88]/30 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00ff88]/30/20 focus:border-[#00ff88] w-full sm:w-64 bg-[#05100a] text-slate-200"
            />
          </div>
        </div>

        <div className="overflow-x-auto min-h-75">
          <table className="w-full text-sm text-left text-slate-200">
            <thead className="text-xs text-slate-200 bg-[#020503] border-b border-[#00ff88]/20">
              <tr>
                <SortableHeader label="ID" />
                <SortableHeader label="User Name" />
                {!hideActions && <SortableHeader label="Name" />}
                <SortableHeader label="Status" />
                <SortableHeader label="Match Comm." />
                <SortableHeader label="Ssn Comm." />
                <SortableHeader label="Share" />
                <SortableHeader label="Actions" hideSort />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#00ff88]/20">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={hideActions ? 7 : 8} className="px-4 py-8 text-center text-slate-400 bg-[#05100a] border-b border-[#00ff88]/20">
                    No data available in table
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => (
                  <tr key={row.id} className="hover:bg-[#020503]/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-400">{row.id.substring(0, 6)}</td>
                    <td className="px-4 py-3 text-[#00ff88] font-medium cursor-pointer hover:underline">{row.username}</td>
                    {!hideActions && <td className="px-4 py-3">{row.name}</td>}
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${row.status === 'active' ? 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/30' : row.status === 'suspended' ? 'bg-[#f0b429]/10 text-[#f0b429] border border-[#f0b429]/30' : 'bg-[#ff3355]/10 text-[#ff3355] border border-[#ff3355]/30'}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{row.mComm}</td>
                    <td className="px-4 py-3">{row.sComm}</td>
                    <td className="px-4 py-3">{row.share}</td>
                    <td className={`px-4 py-3 relative ${activeMenuId === row.id ? 'z-50' : ''}`}>
                      <button 
                        onClick={() => toggleMenu(row.id)}
                        className="bg-[#00ff88]/10 border border-[#00ff88]/50 hover:bg-[#00ff88]/20 text-[#00ff88] p-1.5 rounded transition-colors focus:outline-none"
                      >
                        <MoreVertical size={16} />
                      </button>
                      
                      {activeMenuId === row.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); }}></div>
                          <div className="absolute right-8 top-10 mt-1 w-48 bg-[#05100a] rounded border border-[#00ff88]/30 py-1 z-50 shadow-[0_0_20px_rgba(0,255,136,0.1)]">
                            <button onClick={(e) => { e.stopPropagation(); setSelectedProfile(row); setActiveMenuId(null); }} className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-[#00ff88]/10 hover:text-[#00ff88]">Profile</button>
                            <button onClick={(e) => { e.stopPropagation(); setSelectedStatement(row); setActiveMenuId(null); }} className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-[#00ff88]/10 hover:text-[#00ff88]">Statement</button>
                            <div className="h-px w-full bg-[#00ff88]/20 my-1"></div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setSelectedUserForManage(row); setActiveMenuId(null); }}
                              className="w-full text-left px-4 py-2 text-sm text-[#f0b429] font-medium hover:bg-[#f0b429]/10"
                            >
                              Manage Access
                            </button>
                            <div className="h-px w-full bg-[#00ff88]/20 my-1"></div>
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                if (window.confirm("Are you sure you want to delete this user? They will no longer be able to log in.")) {
                                  handleDeleteUser(row.id);
                                }
                                setActiveMenuId(null); 
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-[#ff3355] font-medium hover:bg-[#ff3355]/10"
                            >
                              Delete Client
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-[#00ff88]/20 flex flex-col sm:flex-row sm:items-center justify-between text-sm text-slate-400 bg-[#05100a] rounded-b-lg">
          <div>
            Showing 1 to {filteredData.length} of entries {filteredData.length}
          </div>
          <div className="flex mt-3 sm:mt-0 items-center border border-[#00ff88]/20 rounded divide-x divide-[#00ff88]/20 bg-[#05100a]">
            <button className="px-3 py-1.5 hover:bg-[#020503] disabled:opacity-50 text-slate-400" disabled>Previous</button>
            <button className="px-3 py-1.5 bg-[#00ff88]/10 text-[#00ff88] font-medium cursor-default">1</button>
            <button className="px-3 py-1.5 hover:bg-[#020503] disabled:opacity-50 text-slate-400" disabled>Next</button>
          </div>
        </div>
      </div>

      {/* Access Management Modal */}
      {selectedUserForManage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedUserForManage(null)}></div>
          
          <div className="bg-[#05100a] border border-[#00ff88]/30 rounded-xl shadow-[0_0_50px_rgba(0,255,136,0.1)] w-full max-w-md relative z-10 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-[#00ff88] to-transparent opacity-50"></div>
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#00ff88]/20 bg-[#020503]">
              <h3 className="text-lg font-orbitron font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="text-[#00ff88]" size={20} />
                Manage Access
              </h3>
              <button 
                onClick={() => setSelectedUserForManage(null)}
                className="text-slate-400 hover:text-rose-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-[#00ff88]/10 border border-[#00ff88]/30 rounded-full flex items-center justify-center mx-auto mb-3 shadow-[0_0_15px_rgba(0,255,136,0.15)]">
                  <Lock className="text-[#00ff88]" size={28} />
                </div>
                <h4 className="text-white font-bold text-xl">{selectedUserForManage.name}</h4>
                <p className="text-[#00ff88] text-sm">@{selectedUserForManage.username}</p>
              </div>

              {/* Play Status */}
              <div className="bg-slate-900/50 border border-slate-800 rounded p-4">
                <h5 className="text-xs font-bold font-orbitron tracking-widest text-slate-400 uppercase mb-3">Live Play Status</h5>
                <div className="flex bg-[#020503] border border-slate-800 rounded p-1">
                  <button 
                    onClick={() => updateStatus(selectedUserForManage.id, 'status', 'active')}
                    className={`flex-1 py-1.5 text-sm font-medium rounded transition-colors ${selectedUserForManage.status === 'active' ? 'bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                  >
                    Active
                  </button>
                  <button 
                    onClick={() => updateStatus(selectedUserForManage.id, 'status', 'suspended')}
                    className={`flex-1 py-1.5 text-sm font-medium rounded transition-colors ${selectedUserForManage.status === 'suspended' ? 'bg-[#f0b429]/20 text-[#f0b429] border border-[#f0b429]/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                  >
                    Temporary Pause
                  </button>
                  <button 
                    onClick={() => updateStatus(selectedUserForManage.id, 'status', 'blocked')}
                    className={`flex-1 py-1.5 text-sm font-medium rounded transition-colors ${selectedUserForManage.status === 'blocked' ? 'bg-[#ff3355]/20 text-[#ff3355] border border-[#ff3355]/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                  >
                    Block
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2 font-exo">
                  Pause stops match play temporarily. Block revokes all dashboard access.
                </p>
              </div>

              {/* Security Guard */}
              <div className="bg-[#ff3355]/5 border border-[#ff3355]/20 rounded p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-xs font-bold font-orbitron tracking-widest text-[#ff3355] uppercase flex items-center gap-2">
                    <ShieldAlert size={14} />
                    Security Auto-Block
                  </h5>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={selectedUserForManage.autoBlock} 
                      onChange={(e) => updateStatus(selectedUserForManage.id, 'autoBlock', e.target.checked)}
                    />
                    <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00ff88]"></div>
                  </label>
                </div>
                <p className="text-xs text-slate-400 font-exo leading-relaxed">
                  Automatically block the user account if any irregular betting patterns, multi-login locations, or security tampering is detected on the frontend.
                </p>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !createLoading && setIsCreateModalOpen(false)}></div>
          
          <div className="bg-[#05100a] border border-[#00ff88]/30 rounded-xl shadow-[0_0_50px_rgba(0,255,136,0.1)] w-full max-w-md relative z-10 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#00ff88]/20 bg-[#020503]">
              <h3 className="text-lg font-orbitron font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <UserPlus className="text-[#00ff88]" size={20} />
                Create Client Account
              </h3>
              <button 
                disabled={createLoading}
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white disabled:opacity-50 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
               <div>
                 <label className="block text-xs font-semibold text-slate-400 mb-1">User ID</label>
                 <input 
                    required 
                    type="text" 
                    value={newUser.email} 
                    onChange={e => setNewUser({...newUser, email: e.target.value})}
                    className="w-full bg-[#020503] border border-[#00ff88]/30 rounded px-3 py-2 text-white focus:outline-none focus:border-[#00ff88]"
                 />
               </div>
               <div>
                 <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
                 <input 
                    required 
                    type="text" 
                    value={newUser.name} 
                    onChange={e => setNewUser({...newUser, name: e.target.value})}
                    className="w-full bg-[#020503] border border-[#00ff88]/30 rounded px-3 py-2 text-white focus:outline-none focus:border-[#00ff88]"
                 />
               </div>
               <div>
                 <label className="block text-xs font-semibold text-slate-400 mb-1">Password</label>
                 <div className="relative">
                   <input 
                      required 
                      type={showPasswordCreate ? "text" : "password"}
                      minLength={6}
                      value={newUser.password} 
                      onChange={e => setNewUser({...newUser, password: e.target.value})}
                      className="w-full bg-[#020503] border border-[#00ff88]/30 rounded px-3 py-2 text-white focus:outline-none focus:border-[#00ff88] pr-10"
                   />
                   <button 
                     type="button" 
                     onClick={() => setShowPasswordCreate(!showPasswordCreate)}
                     className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#00ff88] transition-colors"
                   >
                     {showPasswordCreate ? <EyeOff size={16} /> : <Eye size={16} />}
                   </button>
                 </div>
               </div>
               <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">Match Comm.</label>
                    <input 
                        type="text" 
                        value={newUser.mComm} 
                        onChange={e => setNewUser({...newUser, mComm: e.target.value})}
                        className="w-full bg-[#020503] border border-[#00ff88]/30 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-[#00ff88]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">Session Comm.</label>
                    <input 
                        type="text" 
                        value={newUser.sComm} 
                        onChange={e => setNewUser({...newUser, sComm: e.target.value})}
                        className="w-full bg-[#020503] border border-[#00ff88]/30 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-[#00ff88]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">Share %</label>
                    <input 
                        type="text" 
                        value={newUser.share} 
                        onChange={e => setNewUser({...newUser, share: e.target.value})}
                        className="w-full bg-[#020503] border border-[#00ff88]/30 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-[#00ff88]"
                    />
                  </div>
               </div>
               
               <button 
                 type="submit" 
                 disabled={createLoading}
                 className="w-full bg-[#00ff88] text-black font-bold py-2.5 rounded mt-4 hover:bg-[#00cc6a] disabled:opacity-50 transition-colors flex justify-center items-center"
               >
                 {createLoading ? 'Creating User...' : 'Create Client'}
               </button>
            </form>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedProfile(null)}></div>
          <div className="bg-[#05100a] border border-[#00ff88]/30 rounded-xl shadow-[0_0_50px_rgba(0,255,136,0.1)] w-full max-w-sm relative z-10 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-[#00ff88] to-transparent opacity-50"></div>
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#00ff88]/20 bg-[#020503]">
              <h3 className="text-lg font-orbitron font-bold text-white uppercase tracking-wider flex items-center gap-2">
                Client Profile
              </h3>
              <button onClick={() => setSelectedProfile(null)} className="text-slate-400 hover:text-rose-500 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4 text-slate-300">
               <div>
                  <label className="text-xs text-slate-500 font-semibold block">User ID / Username</label>
                  <div className="text-white font-medium text-lg">{selectedProfile.username}</div>
               </div>
               <div>
                  <label className="text-xs text-slate-500 font-semibold block">Full Name</label>
                  <div className="text-white font-medium">{selectedProfile.name}</div>
               </div>
               <div>
                  <label className="text-xs text-slate-500 font-semibold block">Password</label>
                  <div className="flex items-center gap-3">
                    <div className="text-white font-medium font-mono text-lg">
                      {showPasswordProfile ? (selectedProfile.password || 'No password set') : '••••••••'}
                    </div>
                    <button 
                      onClick={() => setShowPasswordProfile(!showPasswordProfile)}
                      className="text-slate-400 hover:text-[#00ff88] transition-colors"
                    >
                      {showPasswordProfile ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <div className="text-xs text-slate-600 mt-1">This is the access password for the user.</div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Statement Modal */}
      {selectedStatement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedStatement(null)}></div>
          <div className="bg-[#05100a] border border-[#00ff88]/30 rounded-xl shadow-[0_0_50px_rgba(0,255,136,0.1)] w-full max-w-4xl relative z-10 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#00ff88]/20 bg-[#020503]">
              <h3 className="text-lg font-orbitron font-bold text-white uppercase tracking-wider flex items-center gap-2">
                Statement - {selectedStatement.username}
              </h3>
              <div className="flex items-center gap-2">
                 <button onClick={() => {
                   alert("Real PDF Generation requires a backend service (currently not implemented). Defaulting to browser print.");
                   window.print();
                 }} className="bg-[#05100a] border border-[#00ff88]/30 text-slate-300 hover:bg-[#020503] px-3 py-1 rounded text-xs font-medium shadow-sm transition-colors">PDF</button>
                 <button onClick={() => {
                   if (statementData.length === 0) {
                     alert("No statement data available to download.");
                     return;
                   }
                   const headers = "Date,Event,Type,WinLoss,Balance\n";
                   const csvRows = statementData.map(stmt => {
                     return `${stmt.date},${stmt.event},${stmt.type},${stmt.winLoss},${stmt.balance}`;
                   });
                   const csvContent = `data:text/csv;charset=utf-8,${headers}${csvRows.join("\n")}`;
                   const encodedUri = encodeURI(csvContent);
                   const link = document.createElement("a");
                   link.setAttribute("href", encodedUri);
                   link.setAttribute("download", `Statement_${selectedStatement.username}.csv`);
                   document.body.appendChild(link);
                   link.click();
                   document.body.removeChild(link);
                 }} className="bg-[#05100a] border border-[#00ff88]/30 text-slate-300 hover:bg-[#020503] px-3 py-1 rounded text-xs font-medium shadow-sm transition-colors">CSV</button>
                 <button onClick={() => setSelectedStatement(null)} className="text-slate-400 hover:text-rose-500 transition-colors ml-2">
                   <X size={20} />
                 </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto hidden-scrollbar">
                <table className="w-full text-sm text-left text-slate-200">
                    <thead className="text-xs text-slate-400 bg-[#020503] border-b border-[#00ff88]/20 uppercase">
                        <tr>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Event / Game</th>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3 text-right">Win/Loss</th>
                            <th className="px-4 py-3 text-right">Balance</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#00ff88]/10 text-slate-300">
                        {statementLoading ? (
                          <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-slate-500">Loading statements...</td>
                          </tr>
                        ) : statementData.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-slate-500">No transactions found for this user.</td>
                          </tr>
                        ) : (
                          statementData.map((stmt) => (
                            <tr key={stmt.id} className="hover:bg-[#020503]/50">
                                <td className="px-4 py-3 whitespace-nowrap">{stmt.date}</td>
                                <td className="px-4 py-3 text-white font-medium">{stmt.event}</td>
                                <td className="px-4 py-3">{stmt.type}</td>
                                <td className={`px-4 py-3 text-right font-mono ${parseFloat(stmt.winLoss) >= 0 ? 'text-[#00ff88]' : 'text-[#ff3355]'}`}>
                                  {parseFloat(stmt.winLoss) > 0 ? '+' : ''}{stmt.winLoss}
                                </td>
                                <td className="px-4 py-3 text-right font-medium">{stmt.balance}</td>
                            </tr>
                          ))
                        )}
                    </tbody>
                </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SortableHeader({ label, hideSort = false }: { label: string, hideSort?: boolean }) {
  return (
    <th scope="col" className={`px-4 py-3 font-semibold text-slate-300 whitespace-nowrap ${hideSort ? '' : 'cursor-pointer hover:bg-[#00ff88]/5'} group`}>
      <div className="flex items-center justify-between">
        <span>{label}</span>
        {!hideSort && (
          <div className="flex flex-col ml-2 opacity-30 group-hover:opacity-100 -space-y-1">
            <ChevronUp size={12} />
            <ChevronDown size={12} />
          </div>
        )}
      </div>
    </th>
  );
}
