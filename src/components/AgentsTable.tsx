import { ChevronUp, ChevronDown, Download, Search, Plus, MoreVertical, X, ShieldAlert, Lock, ShieldCheck, User, FileText, Eye, EyeOff } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

type Agent = {
  id: string;
  userName: string;
  name: string;
  fixLimit: string;
  myShare: string;
  maxShare?: string;
  status?: string;
  password?: string;
  actions?: string;
};

interface AgentsTableProps {
  title: string;
  breadcrumb: string;
  buttonLabel: string;
  data?: Agent[];
  onCreateClick?: () => void;
  onUpdateAgent?: (id: string, field: string, value: any) => void;
}

export default function AgentsTable({ title, breadcrumb, buttonLabel, data = [], onCreateClick, onUpdateAgent }: AgentsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const [selectedProfile, setSelectedProfile] = useState<Agent | null>(null);
  const [selectedStatement, setSelectedStatement] = useState<Agent | null>(null);
  const [selectedManage, setSelectedManage] = useState<Agent | null>(null);
  const [showPasswordProfile, setShowPasswordProfile] = useState(false);
  const [limitInput, setLimitInput] = useState('');

  // Setup local data mirroring so we can update statuses if the parent doesn't provide onUpdateAgent
  const [localData, setLocalData] = useState<Agent[]>([]);

  useEffect(() => {
    setLocalData(data.map(d => ({ ...d, status: d.status || 'active' })));
  }, [data]);

  const handleUpdateLimit = async (operation: 'add' | 'subtract') => {
    if (!selectedManage) return;
    
    if (!limitInput || isNaN(Number(limitInput)) || Number(limitInput) <= 0) {
      alert("Please enter a valid amount greater than 0");
      return;
    }
    const amount = Number(limitInput);
    
    const auth = getAuth();
    if (!auth.currentUser) {
      alert("You must be logged in to perform this action.");
      return;
    }
    const adminId = auth.currentUser.uid;
    
    try {
      const adminRef = doc(db, 'users', adminId);
      const adminSnap = await getDoc(adminRef);
      
      const isMasterAdmin = auth.currentUser.email === 'ayushraj5024@gmail.com';
      
      if (!adminSnap.exists() && !isMasterAdmin) {
        alert("Admin account not found.");
        return;
      }
      
      const adminData = adminSnap.exists() ? adminSnap.data() : { balance: 0 };
      const currentAdminBalance = Number(adminData.balance) || 0;
      
      const currentLimit = Number(selectedManage.fixLimit) || 0;
      let newLimit = currentLimit;
      let newAdminBalance = currentAdminBalance;
      
      if (operation === 'add') {
        if (!isMasterAdmin && currentAdminBalance < amount) {
          alert("Insufficient coins in admin account.");
          return;
        }
        newLimit += amount;
        newAdminBalance -= amount;
      } else {
        if (currentLimit < amount) {
          alert("Balance/Limit cannot be less than 0");
          return;
        }
        newLimit -= amount;
        newAdminBalance += amount;
      }
      
      // Update admin balance only if it's not the master admin
      if (!isMasterAdmin) {
        await updateDoc(adminRef, { balance: newAdminBalance });
      }
      
      if (onUpdateAgent) {
        onUpdateAgent(selectedManage.id, 'fixLimit', newLimit.toString());
      } else {
        setLocalData(prev => prev.map(a => a.id === selectedManage.id ? { ...a, fixLimit: newLimit.toString() } : a));
      }
      setSelectedManage({ ...selectedManage, fixLimit: newLimit.toString() });
      setLimitInput('');
      alert(`Successfully ${operation === 'add' ? 'added' : 'subtracted'} limit/coins.`);
    } catch (error: any) {
      alert("Error updating limit: " + error.message);
    }
  };

  const filteredData = localData.filter(d => 
    d.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleMenu = (id: string) => {
    if (activeMenuId === id) setActiveMenuId(null);
    else setActiveMenuId(id);
  };

  const handleUpdateStatus = (id: string, status: string) => {
    // Optimistic local update
    setLocalData(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    
    // Call parent to persist if provided
    if (onUpdateAgent) {
      onUpdateAgent(id, 'status', status);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Title & Breadcrumbs */}
      <div>
        <h2 className="text-2xl font-semibold text-white">{title}</h2>
        <div className="text-sm font-medium text-slate-400 mt-1 flex items-center space-x-2">
          <span>Dashboard</span>
          <span className="text-slate-300">/</span>
          <span className="text-white">{breadcrumb}</span>
        </div>
      </div>

      <div className="bg-[#05100a] border text-left border-\(--primary\)/20 rounded-lg shadow-sm overflow-hidden flex flex-col mt-4 pt-0 text-white">
        {/* Table Header Row Component */}
        <div className="bg-[#60999b] text-white px-4 py-3 flex items-center justify-between">
          <h3 className="font-semibold">All Agents</h3>
          <button 
            onClick={onCreateClick}
            className="bg-[#182130] hover:bg-[#111823] text-white text-sm px-4 py-1.5 border border-[#1e293b] rounded shadow-sm flex items-center space-x-1 transition-colors"
          >
            <span>{buttonLabel}</span>
          </button>
        </div>
        
        <div className="p-4 border-b border-\(--primary\)/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#020503]/50">
          <div className="flex space-x-2">
            <button className="bg-[#05100a] border border-\(--primary\)/30 text-slate-300 hover:bg-[#020503] px-4 py-1.5 rounded text-sm font-medium shadow-sm transition-colors">
              CSV
            </button>
            <button className="bg-[#05100a] border border-\(--primary\)/30 text-slate-300 hover:bg-[#020503] px-4 py-1.5 rounded text-sm font-medium shadow-sm transition-colors">
              PDF
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search.."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-\(--primary\)/30 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-\(--primary\)/30/20 focus:border-\(--primary\) w-full sm:w-64 bg-[#05100a]"
            />
          </div>
        </div>

        <div className="overflow-x-auto min-h-75">
          <table className="w-full text-sm text-left text-slate-200">
            <thead className="text-xs text-slate-200 uppercase bg-[#020503] border-b border-\(--primary\)/20">
              <tr>
                <SortableHeader label="ID" />
                <SortableHeader label="User Name" />
                <SortableHeader label="Name" />
                <SortableHeader label="Status" />
                <SortableHeader label="Fix Limit" />
                <SortableHeader label="My Share" />
                <SortableHeader label="Max Share" />
                <SortableHeader label="Actions" />
              </tr>
            </thead>
            <tbody className="divide-y divide-\(--primary\)/20">
              {filteredData.length > 0 ? (
                filteredData.map((row) => (
                  <tr key={row.id} className="bg-[#05100a] hover:bg-[#020503]/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{row.id}</td>
                    <td className="px-4 py-3 text-\(--primary\) font-medium cursor-pointer hover:underline">{row.userName}</td>
                    <td className="px-4 py-3">{row.name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${row.status === 'active' ? 'bg-\(--primary\)/10 text-\(--primary\) border border-\(--primary\)/30' : row.status === 'suspended' ? 'bg-[#f0b429]/10 text-[#f0b429] border border-[#f0b429]/30' : 'bg-[#ff3355]/10 text-[#ff3355] border border-[#ff3355]/30'}`}>
                        {row.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3">{row.fixLimit}</td>
                    <td className="px-4 py-3">{row.myShare}</td>
                    <td className="px-4 py-3">{row.maxShare}</td>
                    <td className={`px-4 py-3 relative ${activeMenuId === row.id ? 'z-50' : ''}`}>
                      <button 
                        onClick={() => toggleMenu(row.id)}
                        className="bg-\(--primary\)/10 border border-\(--primary\)/50 hover:bg-\(--primary\)/20 text-\(--primary\) p-1.5 rounded transition-colors focus:outline-none"
                      >
                        <MoreVertical size={16} />
                      </button>
                      
                      {activeMenuId === row.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); }}></div>
                          <div className="absolute right-8 top-10 mt-1 w-48 bg-[#05100a] rounded border border-\(--primary\)/30 py-1 z-50 shadow-[0_0_20px_rgba(0,255,136,0.1)]">
                            <button onClick={(e) => { e.stopPropagation(); setSelectedProfile(row); setActiveMenuId(null); }} className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-\(--primary\)/10 hover:text-\(--primary\)">Profile</button>
                            <button onClick={(e) => { e.stopPropagation(); setSelectedStatement(row); setActiveMenuId(null); }} className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-\(--primary\)/10 hover:text-\(--primary\)">Statement</button>
                            <div className="h-px w-full bg-\(--primary\)/20 my-1"></div>
                            <button onClick={(e) => { e.stopPropagation(); setSelectedManage(row); setActiveMenuId(null); }} className="w-full text-left px-4 py-2 text-sm text-[#f0b429] hover:bg-[#f0b429]/10 font-medium">Manage Agent</button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400 bg-[#05100a]">
                    No data available in table
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between text-sm text-slate-400 bg-[#05100a] border-t border-\(--primary\)/20 rounded-b-lg">
          <div>
            Showing 1 to {filteredData.length} of entries {filteredData.length}
          </div>
          <div className="flex mt-3 sm:mt-0 items-center border border-\(--primary\)/20 rounded divide-x divide-\(--primary\)/20 bg-[#05100a]">
            <button className="px-3 py-1.5 hover:bg-[#020503] disabled:opacity-50 text-slate-400" disabled>Previous</button>
            <button className="px-3 py-1.5 bg-\(--primary\)/10 text-\(--primary\) font-medium cursor-default">1</button>
            <button className="px-3 py-1.5 hover:bg-[#020503] disabled:opacity-50 text-slate-400" disabled>Next</button>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedProfile(null)}></div>
          <div className="bg-[#05100a] border border-\(--primary\)/30 rounded-xl shadow-[0_0_50px_rgba(0,255,136,0.1)] w-full max-w-md relative z-10 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-\(--primary\)/20 bg-[#020503] shrink-0">
              <h3 className="text-lg font-orbitron font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <User className="text-\(--primary\)" size={20} />
                Agent Profile
              </h3>
              <button onClick={() => setSelectedProfile(null)} className="text-slate-400 hover:text-rose-500 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="space-y-4">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">ID</span>
                  <span className="text-white font-medium">{selectedProfile.id}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">User Name</span>
                  <span className="text-\(--primary\) font-medium">@{selectedProfile.userName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Name</span>
                  <span className="text-white font-medium">{selectedProfile.name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Status</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${selectedProfile.status === 'active' || !selectedProfile.status ? 'bg-\(--primary\)/10 text-\(--primary\) border border-\(--primary\)/30' : selectedProfile.status === 'suspended' ? 'bg-[#f0b429]/10 text-[#f0b429] border border-[#f0b429]/30' : 'bg-[#ff3355]/10 text-[#ff3355] border border-[#ff3355]/30'}`}>
                    {selectedProfile.status || 'Active'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Fix Limit</span>
                  <span className="text-white font-medium">{selectedProfile.fixLimit}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">My Share</span>
                  <span className="text-white font-medium">{selectedProfile.myShare}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Max Share</span>
                  <span className="text-white font-medium">{selectedProfile.maxShare}</span>
                </div>
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="text-slate-400">Password</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#f0b429] font-medium font-mono bg-[#f0b429]/10 px-2 rounded">
                        {showPasswordProfile ? (selectedProfile.password || 'No password set') : '••••••••'}
                      </span>
                      <button 
                        onClick={() => setShowPasswordProfile(!showPasswordProfile)}
                        className="text-slate-400 hover:text-\(--primary\) transition-colors"
                      >
                        {showPasswordProfile ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statement Modal */}
      {selectedStatement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedStatement(null)}></div>
          <div className="bg-[#05100a] border border-\(--primary\)/30 rounded-xl shadow-[0_0_50px_rgba(0,255,136,0.1)] w-full max-w-2xl relative z-10 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-\(--primary\)/20 bg-[#020503] shrink-0">
              <h3 className="text-lg font-orbitron font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="text-\(--primary\)" size={20} />
                Agent Statement
              </h3>
              <button onClick={() => setSelectedStatement(null)} className="text-slate-400 hover:text-rose-500 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <p className="text-slate-400 mb-4">Showing recent statement for <span className="text-\(--primary\)">@{selectedStatement.userName}</span></p>
              <div className="overflow-x-auto border border-\(--primary\)/20 rounded">
                <table className="w-full text-sm text-left text-slate-200">
                  <thead className="text-xs text-slate-400 bg-[#020503] border-b border-\(--primary\)/20">
                    <tr>
                      <th className="px-4 py-2">Date</th>
                      <th className="px-4 py-2">Description</th>
                      <th className="px-4 py-2 text-right">Amount</th>
                      <th className="px-4 py-2 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-\(--primary\)/10 text-slate-300">
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-500">No transactions found for this agent.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manage Access Modal */}
      {selectedManage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedManage(null)}></div>
          
          <div className="bg-[#05100a] border border-\(--primary\)/30 rounded-xl shadow-[0_0_50px_rgba(0,255,136,0.1)] w-full max-w-md relative z-10 flex flex-col max-h-[90vh]">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-\(--primary\) to-transparent opacity-50"></div>
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-\(--primary\)/20 bg-[#020503] shrink-0">
              <h3 className="text-lg font-orbitron font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="text-\(--primary\)" size={20} />
                Manage Access
              </h3>
              <button 
                onClick={() => setSelectedManage(null)}
                className="text-slate-400 hover:text-rose-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-\(--primary\)/10 border border-\(--primary\)/30 rounded-full flex items-center justify-center mx-auto mb-3 shadow-[0_0_15px_rgba(0,255,136,0.15)]">
                  <Lock className="text-\(--primary\)" size={28} />
                </div>
                <h4 className="text-white font-bold text-xl">{selectedManage.name}</h4>
                <p className="text-\(--primary\) text-sm">@{selectedManage.userName}</p>
              </div>

              {/* Play Status */}
              <div className="bg-slate-900/50 border border-slate-800 rounded p-4">
                <h5 className="text-xs font-bold font-orbitron tracking-widest text-slate-400 uppercase mb-3">Agent Status</h5>
                <div className="flex bg-[#020503] border border-slate-800 rounded p-1">
                  <button 
                    onClick={() => { handleUpdateStatus(selectedManage.id, 'active'); setSelectedManage({ ...selectedManage, status: 'active' }); }}
                    className={`flex-1 py-1.5 text-sm font-medium rounded transition-colors ${selectedManage.status === 'active' || !selectedManage.status ? 'bg-\(--primary\)/20 text-\(--primary\) border border-\(--primary\)/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                  >
                    Active
                  </button>
                  <button 
                    onClick={() => { handleUpdateStatus(selectedManage.id, 'suspended'); setSelectedManage({ ...selectedManage, status: 'suspended' }); }}
                    className={`flex-1 py-1.5 text-sm font-medium rounded transition-colors ${selectedManage.status === 'suspended' ? 'bg-[#f0b429]/20 text-[#f0b429] border border-[#f0b429]/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                  >
                    Suspended
                  </button>
                  <button 
                    onClick={() => { handleUpdateStatus(selectedManage.id, 'blocked'); setSelectedManage({ ...selectedManage, status: 'blocked' }); }}
                    className={`flex-1 py-1.5 text-sm font-medium rounded transition-colors ${selectedManage.status === 'blocked' ? 'bg-[#ff3355]/20 text-[#ff3355] border border-[#ff3355]/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                  >
                    Block
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2 font-exo">
                  Update the agent's current dashboard access. Active allows play, Block revokes all access.
                </p>
              </div>

              {/* Balance Management */}
              <div className="bg-slate-900/50 border border-slate-800 rounded p-4">
                <h5 className="text-xs font-bold font-orbitron tracking-widest text-\(--primary\) uppercase mb-3">Balance Management</h5>
                <div className="flex items-center justify-between mb-4 bg-[#020503] p-3 rounded border border-slate-800">
                  <span className="text-slate-400 font-medium">Current Balance:</span>
                  <span className="text-white font-mono font-bold text-lg">{selectedManage.fixLimit}</span>
                </div>
                
                <div className="space-y-3">
                   <div className="flex bg-[#020503] border border-slate-700/50 rounded overflow-hidden">
                     <div className="px-3 flex items-center justify-center text-slate-400 border-r border-slate-700/50 bg-slate-800/50">₹</div>
                     <input
                       type="number"
                       placeholder="Enter Amount..."
                       value={limitInput}
                       onChange={(e) => setLimitInput(e.target.value)}
                       className="bg-transparent border-none w-full px-3 py-2 text-white focus:outline-none placeholder-slate-600 font-mono"
                     />
                   </div>
                   
                   <div className="flex space-x-2">
                    <button 
                    onClick={() => handleUpdateLimit('add')}
                    className="flex-1 bg-\(--primary\)/10 hover:bg-\(--primary\)/20 text-\(--primary\) border border-\(--primary\)/30 font-bold py-2 rounded text-sm transition-colors uppercase tracking-wider">
                    Add Balance
                    </button>
                    <button 
                    onClick={() => handleUpdateLimit('subtract')}
                    className="flex-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 font-bold py-2 rounded text-sm transition-colors uppercase tracking-wider">
                    Subtract Balance
                    </button>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SortableHeader({ label }: { label: string }) {
  return (
    <th scope="col" className="px-4 py-3 font-medium text-slate-300 whitespace-nowrap cursor-pointer hover:bg-\(--primary\)/5 group">
      <div className="flex items-center justify-between">
        <span>{label}</span>
        <div className="flex flex-col ml-2 opacity-30 group-hover:opacity-100 -space-y-1">
          <ChevronUp size={12} />
          <ChevronDown size={12} />
        </div>
      </div>
    </th>
  );
}
