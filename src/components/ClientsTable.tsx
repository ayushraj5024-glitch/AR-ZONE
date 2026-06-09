import React, { useState } from 'react';
import { ChevronUp, ChevronDown, MoreVertical, ShieldAlert, X, ShieldCheck, Lock, Unlock } from 'lucide-react';

interface ClientsTableProps {
  title: string;
  subTitle: string;
  breadcrumb: string;
  hideActions?: boolean;
  hideCreate?: boolean;
}

export default function ClientsTable({ title, subTitle, breadcrumb, hideActions = false, hideCreate = false }: ClientsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [selectedUserForManage, setSelectedUserForManage] = useState<any | null>(null);

  const [mockData, setMockData] = useState([
    { id: 101, username: 'user_john', name: 'John Doe', mComm: '2.5%', sComm: '1.0%', share: '10%', status: 'active', autoBlock: true },
    { id: 102, username: 'alex_trader', name: 'Alex M', mComm: '2.0%', sComm: '1.5%', share: '15%', status: 'suspended', autoBlock: true },
    { id: 103, username: 'evil_hacker', name: 'Bad Actor', mComm: '0%', sComm: '0%', share: '0%', status: 'blocked', autoBlock: false },
  ]);

  const filteredData = mockData.filter(d => 
    d.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (d.name && d.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleMenu = (id: number) => {
    if (activeMenuId === id) setActiveMenuId(null);
    else setActiveMenuId(id);
  };

  const updateStatus = (id: number, field: string, value: any) => {
    setMockData(data => data.map(u => u.id === id ? { ...u, [field]: value } : u));
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
            <button className="bg-[#182130] hover:bg-[#111823] text-white text-sm px-4 py-1.5 border border-[#1e293b] rounded shadow-sm flex items-center space-x-1 transition-colors">
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
                    <td className="px-4 py-3 font-medium text-slate-400">{row.id}</td>
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
                    <td className="px-4 py-3 relative">
                      <button 
                        onClick={() => toggleMenu(row.id)}
                        className="bg-[#00ff88]/10 border border-[#00ff88]/50 hover:bg-[#00ff88]/20 text-[#00ff88] p-1.5 rounded transition-colors focus:outline-none"
                      >
                        <MoreVertical size={16} />
                      </button>
                      
                      {activeMenuId === row.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)}></div>
                          <div className="absolute right-8 top-10 mt-1 w-48 bg-[#05100a] rounded border border-[#00ff88]/30 py-1 z-20 shadow-[0_0_20px_rgba(0,255,136,0.1)]">
                            <button className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-[#00ff88]/10 hover:text-[#00ff88]">Profile</button>
                            <button className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-[#00ff88]/10 hover:text-[#00ff88]">Statement</button>
                            <div className="h-px w-full bg-[#00ff88]/20 my-1"></div>
                            <button 
                              onClick={() => { setSelectedUserForManage(row); setActiveMenuId(null); }}
                              className="w-full text-left px-4 py-2 text-sm text-[#f0b429] font-medium hover:bg-[#f0b429]/10"
                            >
                              Manage Access
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
