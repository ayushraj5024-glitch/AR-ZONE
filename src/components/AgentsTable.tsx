import { ChevronUp, ChevronDown, Download, Search, Plus, MoreVertical } from 'lucide-react';
import React, { useState } from 'react';

type Agent = {
  id: string;
  userName: string;
  name: string;
  fixLimit: string;
  myShare: string;
  maxShare: string;
  actions?: string;
};

interface AgentsTableProps {
  title: string;
  breadcrumb: string;
  buttonLabel: string;
  data?: Agent[];
  onCreateClick?: () => void;
}

export default function AgentsTable({ title, breadcrumb, buttonLabel, data = [], onCreateClick }: AgentsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Use provided data, otherwise use mock data if none provided.
  const displayData = data.length > 0 ? data : [
    { id: '101', userName: 'master_agent2', name: 'Master Two', fixLimit: '50000', myShare: '5%', maxShare: '10%' },
    { id: '102', userName: 'sm_trader_5', name: 'SM Trader', fixLimit: '20000', myShare: '2%', maxShare: '5%' }
  ];

  const filteredData = displayData.filter(d => 
    d.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleMenu = (id: string) => {
    if (activeMenuId === id) setActiveMenuId(null);
    else setActiveMenuId(id);
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

      <div className="bg-[#05100a] border text-left border-[#00ff88]/20 rounded-lg shadow-sm overflow-hidden flex flex-col mt-4 pt-0 text-white">
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
              className="border border-[#00ff88]/30 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00ff88]/30/20 focus:border-[#00ff88] w-full sm:w-64 bg-[#05100a]"
            />
          </div>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-sm text-left text-slate-200">
            <thead className="text-xs text-slate-200 uppercase bg-[#020503] border-b border-[#00ff88]/20">
              <tr>
                <SortableHeader label="ID" />
                <SortableHeader label="User Name" />
                <SortableHeader label="Name" />
                <SortableHeader label="Fix Limit" />
                <SortableHeader label="My Share" />
                <SortableHeader label="Max Share" />
                <SortableHeader label="Actions" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#00ff88]/20">
              {filteredData.length > 0 ? (
                filteredData.map((row) => (
                  <tr key={row.id} className="bg-[#05100a] hover:bg-[#020503]/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{row.id}</td>
                    <td className="px-4 py-3 text-[#00ff88] font-medium cursor-pointer hover:underline">{row.userName}</td>
                    <td className="px-4 py-3">{row.name}</td>
                    <td className="px-4 py-3">{row.fixLimit}</td>
                    <td className="px-4 py-3">{row.myShare}</td>
                    <td className="px-4 py-3">{row.maxShare}</td>
                    <td className="px-4 py-3 relative">
                      <button 
                        onClick={() => toggleMenu(row.id)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white p-1 rounded transition-colors focus:outline-none"
                      >
                        <MoreVertical size={16} />
                      </button>
                      
                      {activeMenuId === row.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)}></div>
                          <div className="absolute right-8 top-10 mt-1 w-48 bg-[#05100a] rounded-md shadow-lg border border-[#00ff88]/20 py-1 z-20 shadow-xl">
                            <button className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-[#020503] hover:text-[#00ff88]">Profile</button>
                            <button className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-[#020503] hover:text-[#00ff88]">Statement</button>
                            <button className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-[#020503] hover:text-rose-600 font-medium">Block Agent</button>
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

        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between text-sm text-slate-400 bg-[#05100a] border-t border-[#00ff88]/20 rounded-b-lg">
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
    </div>
  );
}

function SortableHeader({ label }: { label: string }) {
  return (
    <th scope="col" className="px-4 py-3 font-medium text-slate-300 whitespace-nowrap cursor-pointer hover:bg-[#00ff88]/5 group">
      <div className="flex items-center justify-between">
        <span>{label}</span>
        <div className="flex flex-col ml-2 opacity-30 group-hover:opacity-100 space-y-[-4px]">
          <ChevronUp size={12} />
          <ChevronDown size={12} />
        </div>
      </div>
    </th>
  );
}
