/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  LayoutDashboard,
  Users,
  PlayCircle,
  CheckCircle,
  Gamepad2,
  Crown,
  ClipboardList,
  Ban,
  UserCog,
  Key,
  Globe,
  BookOpen,
  LogOut,
  Menu,
  ChevronRight,
  ChevronDown,
  User as UserIcon,
  Bell,
  AlertTriangle,
  IndianRupee,
  BarChart3,
  FileText
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import AgentsTable from './components/AgentsTable';
import CreateAgent from './components/CreateAgent';
import CreateStockist from './components/CreateStockist';
import ClientsTable from './components/ClientsTable';
import CommissionLimits from './components/CommissionLimits';
import CollectionReport from './components/CollectionReport';
import LedgerTable from './components/LedgerTable';
import ProfitLoss from './components/ProfitLoss';
import ManagePassword from './components/ManagePassword';
import Login from './components/Login';
import LiveMatches from './components/LiveMatches';
import LiveMatchReport from './components/LiveMatchReport';
import CompletedMatches from './components/CompletedMatches';
import LiveCasino from './components/LiveCasino';
import CasinoGame from './components/CasinoGame';
import Dashboard from './components/Dashboard';

type ViewType = 'dashboard' | 'stockists' | 'agent' | 'create_agent' | 'create_stockist' | 'my_clients' | 'blocked_clients' | 'commission_limits' | 'collection_report' | 'company_ledgers' | 'my_stmt' | 'profit_loss' | 'manage_password' | 'live_matches' | 'live_report' | 'completed_matches' | 'live_casino' | 'casino_game';

export type AgentData = {
  id: string;
  userName: string;
  name: string;
  fixLimit: string;
  myShare: string;
  maxShare: string;
  password?: string;
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [selectedCasinoGame, setSelectedCasinoGame] = useState<{id: string, name: string} | null>(null);
  const [isManageExpanded, setIsManageExpanded] = useState(false);
  const [isManageClientsExpanded, setIsManageClientsExpanded] = useState(false);
  const [isManageLedgersExpanded, setIsManageLedgersExpanded] = useState(false);

  const [agents, setAgents] = useState<AgentData[]>([]);

  const [stockists, setStockists] = useState<AgentData[]>([]);

  const handleNavClick = (view?: ViewType) => {
    if (view) setCurrentView(view);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setIsLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Stats matching the specific 365bsf dashboard
  const stats = [
    { title: "MY USERNAME", value: "ADMIN", subLabel: "Master", highlight: true },
    { title: "MY LEVEL", value: "System Admin" },
    { title: "MY FIX LIMIT", value: "1,000" },
    { title: "Company Contact", value: "SC211607" },
    { title: "Maximum My Share", value: "50.0%" },
    { title: "Minimum Company Share", value: "50%" },
    { title: "Match Commission", value: "3" },
    { title: "Session Commission", value: "3" },
  ];

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#05100a] flex items-center justify-center flex-col">
        <div className="w-12 h-12 border-4 border-[#00ff88]/30 border-t-[#00ff88] rounded-full animate-spin mb-4"></div>
        <p className="text-[#00ff88] font-orbitron font-bold tracking-widest animate-pulse">AUTHENTICATING...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#020503] flex font-exo text-slate-200">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[#05100a] text-slate-300 border-r border-[#00ff88]/20 transition-all duration-300 ease-in-out md:relative
          ${isSidebarOpen ? 'translate-x-0 w-64 shadow-[0_0_20px_rgba(0,255,136,0.1)] md:shadow-none' : '-translate-x-full w-64 md:translate-x-0 md:w-20'}
        `}
      >
        <div className="h-16 flex items-center justify-between px-4 bg-[#030a06] shrink-0 relative overflow-hidden">
          {/* Subtle background light for professional look */}
          {isSidebarOpen && (
            <div className="absolute -left-4 top-0 w-32 h-16 bg-[#00ff88]/10 blur-2xl"></div>
          )}
          {isSidebarOpen && (
            <div className="flex flex-col justify-center w-full pr-2 relative z-10">
              <span className="font-bobbaluna text-white text-[20px] uppercase tracking-wider whitespace-nowrap leading-none py-1 drop-shadow-[0_2px_4px_rgba(0,255,136,0.3)] mt-1">SYSTEM ADMIN</span>
              <span className="text-[11px] text-[#00ff88] font-medium tracking-wide drop-shadow-md">Master Account</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-1.5 hover:bg-[#00ff88]/10 rounded border border-transparent hover:border-[#00ff88]/30 text-slate-400 hover:text-[#00ff88] transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            isOpen={isSidebarOpen} 
            active={currentView === 'dashboard'} 
            onClick={() => handleNavClick('dashboard')}
          />
          
          <div className="space-y-1">
            <div 
              onClick={() => {
                setIsManageExpanded(!isManageExpanded);
                if (!isSidebarOpen) setSidebarOpen(true);
              }}
              className={`flex items-center justify-between px-3 py-2.5 rounded cursor-pointer transition-all duration-200 group group-hover:text-white ${
                (currentView === 'stockists' || currentView === 'agent' || currentView === 'create_agent' || currentView === 'create_stockist') 
                  ? 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/30 shadow-[0_0_10px_rgba(0,255,136,0.1)]' 
                  : 'text-slate-400 hover:bg-[#00ff88]/5 border border-transparent'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`${(currentView === 'stockists' || currentView === 'agent' || currentView === 'create_agent' || currentView === 'create_stockist') ? 'text-[#00ff88]' : 'text-slate-400 group-hover:text-[#00ff88]'}`}>
                  <Users size={20} />
                </div>
                {isSidebarOpen && <span className="font-semibold text-sm whitespace-nowrap tracking-wide">Manage</span>}
              </div>
              {isSidebarOpen && (
                isManageExpanded ? 
                  <ChevronDown size={16} className="text-[#00ff88]" /> : 
                  <ChevronRight size={16} className="text-slate-500 group-hover:text-[#00ff88]" />
              )}
            </div>
            
            {/* Manage Dropdown Items */}
            {isSidebarOpen && isManageExpanded && (
              <div className="pl-9 pr-2 space-y-1 py-1">
                <div 
                  onClick={() => handleNavClick('stockists')}
                  className={`flex items-center space-x-3 px-3 py-2 rounded cursor-pointer transition-all duration-150 text-sm ${
                    (currentView === 'stockists' || currentView === 'create_stockist') ? 'text-[#f0b429] bg-[#f0b429]/10 font-medium' : 'text-slate-400 hover:text-white hover:bg-[#00ff88]/10'
                  }`}
                >
                  <Users size={16} />
                  <span>Stockists</span>
                </div>
                <div 
                  onClick={() => handleNavClick('agent')}
                  className={`flex items-center space-x-3 px-3 py-2 rounded cursor-pointer transition-all duration-150 text-sm ${
                    (currentView === 'agent' || currentView === 'create_agent') ? 'text-[#f0b429] bg-[#f0b429]/10 font-medium' : 'text-slate-400 hover:text-white hover:bg-[#00ff88]/10'
                  }`}
                >
                  <Users size={16} />
                  <span>Agent</span>
                </div>
              </div>
            )}
          </div>
          
          <NavItem icon={<PlayCircle size={20} />} label="Live Matches" isOpen={isSidebarOpen} active={currentView === 'live_matches' || currentView === 'live_report'} onClick={() => handleNavClick('live_matches')} />
          <NavItem icon={<CheckCircle size={20} />} label="Completed Matches" isOpen={isSidebarOpen} active={currentView === 'completed_matches'} onClick={() => handleNavClick('completed_matches')} />
          <NavItem icon={<Gamepad2 size={20} />} label="Live Casino" isOpen={isSidebarOpen} active={currentView === 'live_casino' || currentView === 'casino_game'} onClick={() => handleNavClick('live_casino')} />
          <NavItem icon={<Crown size={20} />} label="Royal Casino" isOpen={isSidebarOpen} onClick={() => handleNavClick()} />
          <NavItem icon={<ClipboardList size={20} />} label="Check Casino Result" isOpen={isSidebarOpen} onClick={() => handleNavClick()} />
          <NavItem icon={<Ban size={20} />} label="Block Market" isOpen={isSidebarOpen} onClick={() => handleNavClick()} />
          
          {/* Manage Clients Dropdown */}
          <div className="space-y-1">
            <div 
              onClick={() => {
                setIsManageClientsExpanded(!isManageClientsExpanded);
                if (!isSidebarOpen) setSidebarOpen(true);
              }}
              className={`flex items-center justify-between px-3 py-2.5 rounded cursor-pointer transition-all duration-200 group group-hover:text-white ${
                (currentView === 'my_clients' || currentView === 'blocked_clients' || currentView === 'commission_limits') 
                  ? 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/30 shadow-[0_0_10px_rgba(0,255,136,0.1)]' 
                  : 'text-slate-400 hover:bg-[#00ff88]/5 border border-transparent'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`${(currentView === 'my_clients' || currentView === 'blocked_clients' || currentView === 'commission_limits') ? 'text-[#00ff88]' : 'text-slate-400 group-hover:text-[#00ff88]'}`}>
                  <UserCog size={20} />
                </div>
                {isSidebarOpen && <span className="font-semibold text-sm whitespace-nowrap tracking-wide">Manage Clients</span>}
              </div>
              {isSidebarOpen && (
                isManageClientsExpanded ? 
                  <ChevronDown size={16} className="text-[#00ff88]" /> : 
                  <ChevronRight size={16} className="text-slate-500 group-hover:text-[#00ff88]" />
              )}
            </div>
            
            {/* Manage Clients Dropdown Items */}
            {isSidebarOpen && isManageClientsExpanded && (
              <div className="pl-9 pr-2 space-y-1 py-1">
                <div 
                  onClick={() => handleNavClick('my_clients')}
                  className={`flex items-center space-x-3 px-3 py-2 rounded cursor-pointer transition-all duration-150 text-sm ${
                    currentView === 'my_clients' ? 'text-[#f0b429] bg-[#f0b429]/10 font-medium' : 'text-slate-400 hover:text-white hover:bg-[#00ff88]/10'
                  }`}
                >
                  <Users size={16} />
                  <span>My Clients</span>
                </div>
                <div 
                  onClick={() => handleNavClick('blocked_clients')}
                  className={`flex items-center space-x-3 px-3 py-2 rounded cursor-pointer transition-all duration-150 text-sm ${
                    currentView === 'blocked_clients' ? 'text-[#f0b429] bg-[#f0b429]/10 font-medium' : 'text-slate-400 hover:text-white hover:bg-[#00ff88]/10'
                  }`}
                >
                  <Users size={16} />
                  <span>Blocked Clients</span>
                </div>
                <div 
                  onClick={() => handleNavClick('commission_limits')}
                  className={`flex items-center space-x-3 px-3 py-2 rounded cursor-pointer transition-all duration-150 text-sm ${
                    currentView === 'commission_limits' ? 'text-[#f0b429] bg-[#f0b429]/10 font-medium' : 'text-slate-400 hover:text-white hover:bg-[#00ff88]/10'
                  }`}
                >
                  <IndianRupee size={16} />
                  <span>Commission & Limits</span>
                </div>
              </div>
            )}
          </div>
          
          <NavItem icon={<Key size={20} />} label="Manage Password" isOpen={isSidebarOpen} active={currentView === 'manage_password'} onClick={() => handleNavClick('manage_password')} />
          <NavItem icon={<Globe size={20} />} label="Language" isOpen={isSidebarOpen} onClick={() => handleNavClick()} />
          
          {/* Manage Ledgers Dropdown */}
          <div className="space-y-1">
            <div 
              onClick={() => {
                setIsManageLedgersExpanded(!isManageLedgersExpanded);
                if (!isSidebarOpen) setSidebarOpen(true);
              }}
              className={`flex items-center justify-between px-3 py-2.5 rounded cursor-pointer transition-all duration-200 group group-hover:text-white ${
                (currentView === 'collection_report' || currentView === 'company_ledgers' || currentView === 'my_stmt' || currentView === 'profit_loss') 
                  ? 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/30 shadow-[0_0_10px_rgba(0,255,136,0.1)]' 
                  : 'text-slate-400 hover:bg-[#00ff88]/5 border border-transparent'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`${(currentView === 'collection_report' || currentView === 'company_ledgers' || currentView === 'my_stmt' || currentView === 'profit_loss') ? 'text-[#00ff88]' : 'text-slate-400 group-hover:text-[#00ff88]'}`}>
                  <BookOpen size={20} />
                </div>
                {isSidebarOpen && <span className="font-semibold text-sm whitespace-nowrap tracking-wide">Manage Ledgers</span>}
              </div>
              {isSidebarOpen && (
                isManageLedgersExpanded ? 
                  <ChevronDown size={16} className="text-[#00ff88]" /> : 
                  <ChevronRight size={16} className="text-slate-500 group-hover:text-[#00ff88]" />
              )}
            </div>
            
            {/* Manage Ledgers Dropdown Items */}
            {isSidebarOpen && isManageLedgersExpanded && (
              <div className="pl-9 pr-2 space-y-1 py-1">
                <div 
                  onClick={() => handleNavClick('collection_report')}
                  className={`flex items-center space-x-3 px-3 py-2 rounded cursor-pointer transition-all duration-150 text-sm ${
                    currentView === 'collection_report' ? 'text-[#f0b429] bg-[#f0b429]/10 font-medium' : 'text-slate-400 hover:text-white hover:bg-[#00ff88]/10'
                  }`}
                >
                  <BarChart3 size={16} />
                  <span>Collection Report</span>
                </div>
                <div 
                  onClick={() => handleNavClick('company_ledgers')}
                  className={`flex items-center space-x-3 px-3 py-2 rounded cursor-pointer transition-all duration-150 text-sm ${
                    currentView === 'company_ledgers' ? 'text-[#f0b429] bg-[#f0b429]/10 font-medium' : 'text-slate-400 hover:text-white hover:bg-[#00ff88]/10'
                  }`}
                >
                  <BookOpen size={16} />
                  <span>Company Ledgers</span>
                </div>
                <div 
                  onClick={() => handleNavClick('my_stmt')}
                  className={`flex items-center space-x-3 px-3 py-2 rounded cursor-pointer transition-all duration-150 text-sm ${
                    currentView === 'my_stmt' ? 'text-[#f0b429] bg-[#f0b429]/10 font-medium' : 'text-slate-400 hover:text-white hover:bg-[#00ff88]/10'
                  }`}
                >
                  <BarChart3 size={16} />
                  <span>My Stmt.</span>
                </div>
                <div 
                  onClick={() => handleNavClick('profit_loss')}
                  className={`flex items-center space-x-3 px-3 py-2 rounded cursor-pointer transition-all duration-150 text-sm ${
                    currentView === 'profit_loss' ? 'text-[#f0b429] bg-[#f0b429]/10 font-medium' : 'text-slate-400 hover:text-white hover:bg-[#00ff88]/10'
                  }`}
                >
                  <IndianRupee size={16} />
                  <span>Profit & Loss</span>
                </div>
              </div>
            )}
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      {currentView === 'dashboard' ? (
        <main className="flex-1 min-w-0 h-[100dvh] overflow-hidden">
           <Dashboard 
             onMenuClick={() => setSidebarOpen(!isSidebarOpen)} 
             onLogout={() => {
               signOut(auth).then(() => {
                 setIsAuthenticated(false);
               });
             }} 
             onNavigate={(view) => setCurrentView(view)}
           />
        </main>
      ) : (
      <main className="flex-1 flex flex-col min-w-0 h-[100dvh] overflow-hidden bg-[#020503]">
        {/* Header */}
        <header className="h-16 bg-[#05100a] border-b border-[#00ff88]/20 flex flex-shrink-0 items-center justify-between px-4 lg:px-8 z-10 sticky top-0 shadow-[0_4px_20px_rgba(0,255,136,0.05)]">
          <div className="flex items-center space-x-4">
            <button 
              className="md:hidden p-2 -ml-2 text-[#00ff88] hover:bg-[#00ff88]/10 rounded border border-transparent hover:border-[#00ff88]/30"
              onClick={() => setSidebarOpen(!isSidebarOpen)}
            >
              <Menu size={20} />
            </button>
            <h1 className="flex items-center space-x-2">
              <span className="ar-zone-logo text-3xl pb-1 tracking-normal flex items-center">
                <img src="/logo.png" alt="AR Logo" className="h-10 w-10 mr-2 object-contain" />
                ZONE
              </span>
            </h1>
          </div>
          
          <div className="flex items-center space-x-3 sm:space-x-6">
            <div className="hidden sm:flex items-center space-x-2 text-sm font-semibold tracking-wider text-[#00ff88]">
              <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse shadow-[0_0_10px_rgba(0,255,136,1)]"></span>
              <span className="font-orbitron font-bold">SYSTEM ONLINE</span>
            </div>
            
            <div className="h-6 w-px bg-[#00ff88]/20 hidden sm:block"></div>
            
            <button 
              onClick={() => {
                signOut(auth).then(() => {
                  setIsAuthenticated(false);
                });
              }}
              className="flex items-center space-x-2 text-sm font-bold font-orbitron uppercase text-[#ff3355] hover:text-[#ff3355]/80 hover:bg-[#ff3355]/10 px-3 py-1.5 rounded transition-all border border-transparent hover:border-[#ff3355]/30"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </header>

        {/* Scrollable body */}
        <div className="flex-1 overflow-auto bg-[#020503] text-slate-200">
          
          {/* Alert Banner */}
          <div className="bg-gradient-to-r from-[#00ff88]/10 to-[#020503] border-b border-[#00ff88]/20 text-slate-200 px-4 py-3 flex items-center shadow-sm">
            <div className="bg-[#00ff88]/20 p-1.5 rounded mr-3 flex-shrink-0 border border-[#00ff88]/30">
              <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse block shadow-[0_0_8px_rgba(0,255,136,1)]"></span>
            </div>
            <div className="text-sm font-medium overflow-hidden text-ellipsis whitespace-nowrap animate-[marquee_25s_linear_infinite] font-exo flex items-center gap-8 text-[#00ff88]">
              <span>🏏 <span className="font-bold text-white">Somerset</span> <span className="text-[#f0b429]">145/3 (14.3 ov)</span> vs <span className="font-bold text-white">Glamorgan</span></span>
              <span className="text-[#00ff88]/50 font-bold">•</span>
              <span>🏏 <span className="font-bold text-white">India</span> <span className="text-[#f0b429]">210/4 (20.0 ov)</span> vs <span className="font-bold text-white">Australia</span> <span className="text-[#f0b429]">185/8 (20.0 ov)</span></span>
              <span className="text-[#00ff88]/50 font-bold">•</span>
              <span>🏏 <span className="font-bold text-white">CSK</span> <span className="text-[#f0b429]">165/2 (15.0 ov)</span> vs <span className="font-bold text-white">MI</span></span>
              <span className="text-[#00ff88]/50 font-bold">•</span>
              <span>⚽ <span className="font-bold text-white">Real Madrid</span> <span className="text-[#f0b429]">2 - 1</span> <span className="font-bold text-white">Barcelona</span></span>
            </div>
            <div className="ml-auto pl-4 hidden sm:block">
              <button onClick={() => setCurrentView('live_matches')} className="bg-[#00ff88]/10 border border-[#00ff88]/50 text-[#00ff88] hover:bg-[#00ff88] hover:text-[#020503] text-xs font-bold px-3 py-1.5 rounded uppercase tracking-wider transition-all shadow-sm font-orbitron">
                Live View
              </button>
            </div>
          </div>

          {currentView === 'stockists' && (
            <AgentsTable 
              title="Stockists" 
              breadcrumb="Stockists" 
              buttonLabel="Create Stockists" 
              data={stockists}
              onCreateClick={() => setCurrentView('create_stockist')}
            />
          )}

          {currentView === 'agent' && (
            <AgentsTable 
              title="Agent" 
              breadcrumb="Agent" 
              buttonLabel="Create Agent" 
              data={agents}
              onCreateClick={() => setCurrentView('create_agent')}
            />
          )}

          {currentView === 'create_agent' && (
            <CreateAgent 
              onCancel={() => setCurrentView('agent')} 
              onSave={(newAgent) => {
                setAgents([newAgent, ...agents]);
                setCurrentView('agent');
              }}
            />
          )}

          {currentView === 'create_stockist' && (
            <CreateStockist 
              onCancel={() => setCurrentView('stockists')} 
              onSave={(newStockist) => {
                setStockists([newStockist, ...stockists]);
                setCurrentView('stockists');
              }}
            />
          )}

          {currentView === 'my_clients' && (
            <ClientsTable title="CLIENTS" subTitle="All Users" breadcrumb="CLIENTS" hideActions={false} />
          )}

          {currentView === 'blocked_clients' && (
            <ClientsTable hideCreate={true} title="CLIENTS" subTitle="Blocked Users" breadcrumb="Blocked Clients" hideActions={true} />
          )}

          {currentView === 'commission_limits' && (
            <CommissionLimits />
          )}

          {currentView === 'collection_report' && (
            <CollectionReport />
          )}

          {currentView === 'company_ledgers' && (
            <LedgerTable title="MY LEDGERS" breadcrumb="MY LEDGERS" />
          )}

          {currentView === 'my_stmt' && (
            <LedgerTable title="Agent" breadcrumb="Statement" />
          )}

          {currentView === 'profit_loss' && (
            <ProfitLoss />
          )}

          {currentView === 'manage_password' && (
            <ManagePassword />
          )}

          {currentView === 'live_matches' && (
            <LiveMatches onViewReport={() => setCurrentView('live_report')} />
          )}

          {currentView === 'live_report' && (
            <LiveMatchReport 
              onNavigateBack={() => setCurrentView('live_matches')}
              onGoToDashboard={() => setCurrentView('dashboard')}
            />
          )}

          {currentView === 'completed_matches' && (
            <CompletedMatches />
          )}

          {currentView === 'live_casino' && (
            <LiveCasino 
              onSelectGame={(id, name) => {
                setSelectedCasinoGame({ id, name });
                setCurrentView('casino_game');
              }} 
            />
          )}

          {currentView === 'casino_game' && selectedCasinoGame && (
             <CasinoGame 
               gameId={selectedCasinoGame.id}
               gameName={selectedCasinoGame.name}
               onBack={() => setCurrentView('live_casino')}
             />
          )}
          
          {/* Footer */}
          <footer className="mt-8 border-t border-[#00ff88]/20 bg-[#05100a] py-6 px-4 lg:px-8 text-xs font-medium tracking-wide text-slate-500 flex flex-col sm:flex-row justify-between items-center font-exo">
            <div>
              <span className="ar-zone-logo text-lg flex items-center inline-flex">
                <img src="/logo.png" alt="AR Logo" className="h-6 w-6 mr-1.5 object-contain" />
                ZONE
              </span> <span className="mx-2 text-[#00ff88]/30">|</span> Powered By <span className="text-[#f0b429] font-bold">AR Gaming</span> <span className="mx-2 text-[#00ff88]/30">|</span> Copyright © 2021-2026
            </div>
            <div className="mt-2 sm:mt-0 font-orbitron text-[#00ff88]">
              Admin Panel <span className="font-bold">v2.0.0</span>
            </div>
          </footer>
        </div>
      </main>
      )}
    </div>
  );
}

// Sidebar Navigation Item
function NavItem({ icon, label, isOpen, active = false, onClick }: { icon: React.ReactNode, label: string, isOpen: boolean, active?: boolean, onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center space-x-3 px-3 py-2.5 rounded cursor-pointer transition-all duration-200 group ${
        active 
          ? 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/30 shadow-[0_0_10px_rgba(0,255,136,0.1)]' 
          : 'text-slate-400 hover:bg-[#00ff88]/5 hover:text-white border border-transparent'
      }`}
    >
      <div className={`${active ? 'text-[#00ff88]' : 'text-slate-400 group-hover:text-[#00ff88]'}`}>
        {icon}
      </div>
      {isOpen && <span className={`font-medium text-sm overflow-hidden text-ellipsis whitespace-nowrap ${active ? 'font-semibold tracking-wide' : ''}`}>{label}</span>}
    </div>
  );
}

// Sidebar Navigation Group (Items with children/dropdown arrow)
function NavGroup({ icon, label, isOpen }: { icon: React.ReactNode, label: string, isOpen: boolean }) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5 rounded cursor-pointer transition-all duration-200 text-slate-400 hover:bg-[#00ff88]/5 hover:text-white border border-transparent group">
      <div className="flex items-center space-x-3">
        <div className="text-slate-400 group-hover:text-[#00ff88]">
          {icon}
        </div>
        {isOpen && <span className="font-medium text-sm whitespace-nowrap">{label}</span>}
      </div>
      {isOpen && (
        <ChevronRight size={16} className="text-slate-500 group-hover:text-[#00ff88]" />
      )}
    </div>
  );
}

