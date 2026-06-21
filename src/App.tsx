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
  Palette,
  AlertTriangle,
  IndianRupee,
  BarChart3,
  FileText,
  Wallet,
  ShieldAlert,
  History,
  Megaphone,
  Dices
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { AnimatePresence, motion } from 'motion/react';
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
import LiveMatches, { Match } from './components/LiveMatches';
import LiveMatchReport from './components/LiveMatchReport';
import CompletedMatches from './components/CompletedMatches';
import LiveCasino from './components/LiveCasino';
import CasinoGame from './components/CasinoGame';
import LiveLudo from './components/LiveLudo';
import Dashboard from './components/Dashboard';
import RoyalCasino from './components/RoyalCasino';
import RoyalCasinoReport from './components/RoyalCasinoReport';
import CheckCasinoResult from './components/CheckCasinoResult';
import BlockMarket from './components/BlockMarket';
import RiskManagement from './components/RiskManagement';
import ActivityLogs from './components/ActivityLogs';
import AnnouncementsAdmin from './components/AnnouncementsAdmin';
import BetHistory from './components/BetHistory';

type ViewType = 'dashboard' | 'stockists' | 'agent' | 'create_agent' | 'create_stockist' | 'my_clients' | 'blocked_clients' | 'commission_limits' | 'collection_report' | 'company_ledgers' | 'my_stmt' | 'profit_loss' | 'manage_password' | 'live_matches' | 'live_report' | 'completed_matches' | 'live_casino' | 'casino_game' | 'live_ludo' | 'royal_casino' | 'royal_casino_report' | 'check_casino_result' | 'block_market' | 'risk_management' | 'activity_logs' | 'announcements' | 'bet_history';

export type AgentData = {
  id: string;
  userName: string;
  name: string;
  fixLimit: string;
  myShare: string;
  maxShare?: string;
  password?: string;
  contact?: string;
  status?: string;
  mcomm?: string;
  scomm?: string;
  mShare?: string;
};

import ThemeAndNotifications from './components/ThemeAndNotifications';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'client'>('client');
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [selectedCasinoGame, setSelectedCasinoGame] = useState<{id: string, name: string} | null>(null);
  const [isManageExpanded, setIsManageExpanded] = useState(false);
  const [isManageClientsExpanded, setIsManageClientsExpanded] = useState(false);
  const [isManageLedgersExpanded, setIsManageLedgersExpanded] = useState(false);

  const [agents, setAgents] = useState<AgentData[]>([]);

  const [stockists, setStockists] = useState<AgentData[]>([]);

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [themeColor, setThemeColor] = useState(localStorage.getItem('arzone_theme') || '#00ff88');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.style.setProperty('--primary', themeColor);
    localStorage.setItem('arzone_theme', themeColor);
  }, [themeColor]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const isAdminPath = window.location.pathname === '/admin5024';

  const handleNavClick = (view?: ViewType) => {
    if (view) setCurrentView(view);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  useEffect(() => {
    let roleUnsubscribe: (() => void) | null = null;
    let agentsUnsubscribe: (() => void) | null = null;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        try {
          roleUnsubscribe = onSnapshot(doc(db, 'users', user.uid), async (userDoc) => {
            let resolvedRole = 'client';
            if (userDoc.exists()) {
              const userData = userDoc.data();
              if (userData.status === 'deleted') {
                alert("Your account has been deleted or disabled.");
                await signOut(auth);
                return;
              }
              resolvedRole = userData.role || 'client';
            } else {
               if (user.email === 'ayushraj5024@gmail.com') {
                 resolvedRole = 'admin';
               } else {
                 alert("Your account has been deleted or does not exist.");
                 await signOut(auth);
                 return;
               }
            }
            
            if (isAdminPath && resolvedRole === 'client') {
              alert("Unauthorized: Clients cannot access the admin portal.");
              await signOut(auth);
              return;
            }
            setUserRole(resolvedRole as any);
            setIsLoadingAuth(false);
          }, (error) => {
            console.error("Error fetching user role:", error);
            setUserRole('client');
            setIsLoadingAuth(false);
          });

          // Fetch agents and stockists
          import('firebase/firestore').then(({ collection, onSnapshot, query }) => {
            const q = query(collection(db, 'users'));
            agentsUnsubscribe = onSnapshot(q, (snapshot) => {
              const fetchedAgents: AgentData[] = [];
              const fetchedStockists: AgentData[] = [];
              snapshot.forEach((docSnap) => {
                const data = docSnap.data();
                if (data.status === 'deleted') return;
                
                const agentData: AgentData = {
                  id: docSnap.id,
                  userName: data.email || '',
                  name: data.name || '',
                  contact: data.contact || '--',
                  fixLimit: data.fixLimit || data.balance?.toString() || '0', // Mapping balance/limit
                  status: data.status || 'active',
                  mcomm: data.mComm || '0%',
                  scomm: data.sComm || '0%',
                  myShare: data.myShare || '0%',
                  mShare: data.mShare || data.share || '0%'
                };

                if (data.role === 'agent') {
                  fetchedAgents.push(agentData);
                } else if (data.role === 'stockist') {
                  fetchedStockists.push(agentData);
                }
              });
              setAgents(fetchedAgents);
              setStockists(fetchedStockists);
            });
          });

        } catch(e) {
           console.error("Error setting up snapshot:", e);
           setIsLoadingAuth(false);
        }
      } else {
        if (roleUnsubscribe) {
          roleUnsubscribe();
          roleUnsubscribe = null;
        }
        if (agentsUnsubscribe) {
          agentsUnsubscribe();
          agentsUnsubscribe = null;
        }
        setIsAuthenticated(false);
        setUserRole('client');
        setIsLoadingAuth(false);
      }
    });

    return () => {
      if (roleUnsubscribe) roleUnsubscribe();
      if (agentsUnsubscribe) agentsUnsubscribe();
      unsubscribe();
    };
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
      <div className="min-h-screen bg-[#020503] flex items-center justify-center flex-col relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-\(--primary\)/10 via-transparent to-transparent opacity-50 blur-xl"></div>
         <motion.div 
           initial={{ opacity: 0, scale: 0.9 }} 
           animate={{ opacity: 1, scale: 1 }} 
           transition={{ duration: 0.5, ease: "easeOut" }}
           className="flex flex-col items-center gap-6 relative z-10"
         >
            <motion.span 
              animate={{ textShadow: ["0px 0px 10px var(--primary)", "0px 0px 30px var(--primary)", "0px 0px 10px var(--primary)"] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="ar-zone-logo text-5xl tracking-widest text-\(--primary\)"
            >
              AR ZONE
            </motion.span>
            <div className="flex items-center gap-2">
              <motion.div animate={{ height: [10, 24, 10] }} transition={{ repeat: Infinity, duration: 1, ease: 'easeInOut', delay: 0 }} className="w-1.5 bg-\(--primary\) rounded-full" />
              <motion.div animate={{ height: [10, 24, 10] }} transition={{ repeat: Infinity, duration: 1, ease: 'easeInOut', delay: 0.15 }} className="w-1.5 bg-\(--primary\) rounded-full" />
              <motion.div animate={{ height: [10, 24, 10] }} transition={{ repeat: Infinity, duration: 1, ease: 'easeInOut', delay: 0.3 }} className="w-1.5 bg-\(--primary\) rounded-full" />
            </div>
         </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} isAdminPath={isAdminPath} />;
  }

  return (
    <div className="h-dvh w-full overflow-hidden bg-[#020503] flex font-exo text-slate-200">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[#05100a] text-slate-300 border-r border-\(--primary\)/20 transition-all duration-300 ease-in-out md:relative
          ${isSidebarOpen ? 'translate-x-0 w-64 shadow-[0_0_20px_rgba(0,255,136,0.1)] md:shadow-none' : '-translate-x-full w-64 md:translate-x-0 md:w-20'}
        `}
      >
        <div className="h-16 flex items-center justify-between px-4 bg-[#030a06] shrink-0 relative overflow-hidden">
          {/* Subtle background light for professional look */}
          {isSidebarOpen && (
            <div className="absolute -left-4 top-0 w-32 h-16 bg-\(--primary\)/10 blur-2xl"></div>
          )}
          {isSidebarOpen && (
            <div className="flex flex-col justify-center w-full pr-2 relative z-10">
              <span className="font-bobbaluna text-white text-[20px] uppercase tracking-wider whitespace-nowrap leading-none py-1 drop-shadow-[0_2px_4px_rgba(0,255,136,0.3)] mt-1">
                {userRole === 'admin' ? 'SYSTEM ADMIN' : 'CLIENT PORTAL'}
              </span>
              <span className="text-[11px] text-\(--primary\) font-medium tracking-wide drop-shadow-md">
                {userRole === 'admin' ? 'Master Account' : 'Welcome'}
              </span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-1.5 hover:bg-\(--primary\)/10 rounded border border-transparent hover:border-\(--primary\)/30 text-slate-400 hover:text-\(--primary\) transition-colors"
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
            {userRole === 'admin' && (
              <>
                <div 
                  onClick={() => {
                    setIsManageExpanded(!isManageExpanded);
                    if (!isSidebarOpen) setSidebarOpen(true);
                  }}
                  className={`flex items-center justify-between px-3 py-2.5 rounded cursor-pointer transition-all duration-200 group group-hover:text-white ${
                    (currentView === 'stockists' || currentView === 'agent' || currentView === 'create_agent' || currentView === 'create_stockist') 
                      ? 'bg-\(--primary\)/10 text-\(--primary\) border border-\(--primary\)/30 shadow-[0_0_10px_rgba(0,255,136,0.1)]' 
                      : 'text-slate-400 hover:bg-\(--primary\)/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`${(currentView === 'stockists' || currentView === 'agent' || currentView === 'create_agent' || currentView === 'create_stockist') ? 'text-\(--primary\)' : 'text-slate-400 group-hover:text-\(--primary\)'}`}>
                      <Users size={20} />
                    </div>
                    {isSidebarOpen && <span className="font-semibold text-sm whitespace-nowrap tracking-wide">Manage</span>}
                  </div>
                  {isSidebarOpen && (
                    isManageExpanded ? 
                      <ChevronDown size={16} className="text-\(--primary\)" /> : 
                      <ChevronRight size={16} className="text-slate-500 group-hover:text-\(--primary\)" />
                  )}
                </div>
                
                {/* Manage Dropdown Items */}
                {isSidebarOpen && isManageExpanded && (
                  <div className="pl-9 pr-2 space-y-1 py-1">
                    <div 
                      onClick={() => handleNavClick('stockists')}
                      className={`flex items-center space-x-3 px-3 py-2 rounded cursor-pointer transition-all duration-150 text-sm ${
                        (currentView === 'stockists' || currentView === 'create_stockist') ? 'text-[#f0b429] bg-[#f0b429]/10 font-medium' : 'text-slate-400 hover:text-white hover:bg-\(--primary\)/10'
                      }`}
                    >
                      <Users size={16} />
                      <span>Stockists</span>
                    </div>
                    <div 
                      onClick={() => handleNavClick('agent')}
                      className={`flex items-center space-x-3 px-3 py-2 rounded cursor-pointer transition-all duration-150 text-sm ${
                        (currentView === 'agent' || currentView === 'create_agent') ? 'text-[#f0b429] bg-[#f0b429]/10 font-medium' : 'text-slate-400 hover:text-white hover:bg-\(--primary\)/10'
                      }`}
                    >
                      <Users size={16} />
                      <span>Agent</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          
          <NavItem icon={<PlayCircle size={20} />} label="Live Matches" isOpen={isSidebarOpen} active={currentView === 'live_matches' || currentView === 'live_report'} onClick={() => handleNavClick('live_matches')} />
          <NavItem icon={<CheckCircle size={20} />} label="Completed Matches" isOpen={isSidebarOpen} active={currentView === 'completed_matches'} onClick={() => handleNavClick('completed_matches')} />
          <NavItem icon={<Gamepad2 size={20} />} label="Live Casino" isOpen={isSidebarOpen} active={currentView === 'live_casino' || currentView === 'casino_game'} onClick={() => handleNavClick('live_casino')} />
          <NavItem icon={<Dices size={20} />} label="Live Ludo" isOpen={isSidebarOpen} active={currentView === 'live_ludo'} onClick={() => handleNavClick('live_ludo')} />
          <NavItem icon={<Crown size={20} />} label="Royal Casino" isOpen={isSidebarOpen} active={currentView === 'royal_casino' || currentView === 'royal_casino_report'} onClick={() => handleNavClick('royal_casino')} />
          <NavItem icon={<ClipboardList size={20} />} label="Check Casino Result" isOpen={isSidebarOpen} active={currentView === 'check_casino_result'} onClick={() => handleNavClick('check_casino_result')} />
          <NavItem icon={<History size={20} />} label="Bet History" isOpen={isSidebarOpen} active={currentView === 'bet_history'} onClick={() => handleNavClick('bet_history')} />
          {userRole === 'admin' && (
            <>
              <NavItem icon={<AlertTriangle size={20} />} label="Risk Management" isOpen={isSidebarOpen} active={currentView === 'risk_management'} onClick={() => handleNavClick('risk_management')} />
              <NavItem icon={<Megaphone size={20} />} label="Broadcasts" isOpen={isSidebarOpen} active={currentView === 'announcements'} onClick={() => handleNavClick('announcements')} />
              <NavItem icon={<ShieldAlert size={20} />} label="Activity Logs" isOpen={isSidebarOpen} active={currentView === 'activity_logs'} onClick={() => handleNavClick('activity_logs')} />
              <NavItem icon={<Ban size={20} />} label="Block Market" isOpen={isSidebarOpen} active={currentView === 'block_market'} onClick={() => handleNavClick('block_market')} />
            </>
          )}
          
          {/* Manage Clients Dropdown */}
          <div className="space-y-1">
            {userRole === 'admin' && (
              <>
                <div 
                  onClick={() => {
                    setIsManageClientsExpanded(!isManageClientsExpanded);
                    if (!isSidebarOpen) setSidebarOpen(true);
                  }}
                  className={`flex items-center justify-between px-3 py-2.5 rounded cursor-pointer transition-all duration-200 group group-hover:text-white ${
                    (currentView === 'my_clients' || currentView === 'blocked_clients' || currentView === 'commission_limits') 
                      ? 'bg-\(--primary\)/10 text-\(--primary\) border border-\(--primary\)/30 shadow-[0_0_10px_rgba(0,255,136,0.1)]' 
                      : 'text-slate-400 hover:bg-\(--primary\)/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`${(currentView === 'my_clients' || currentView === 'blocked_clients' || currentView === 'commission_limits') ? 'text-\(--primary\)' : 'text-slate-400 group-hover:text-\(--primary\)'}`}>
                      <UserCog size={20} />
                    </div>
                    {isSidebarOpen && <span className="font-semibold text-sm whitespace-nowrap tracking-wide">Manage Clients</span>}
                  </div>
                  {isSidebarOpen && (
                    isManageClientsExpanded ? 
                      <ChevronDown size={16} className="text-\(--primary\)" /> : 
                      <ChevronRight size={16} className="text-slate-500 group-hover:text-\(--primary\)" />
                  )}
                </div>
                
                {/* Manage Clients Dropdown Items */}
                {isSidebarOpen && isManageClientsExpanded && (
                  <div className="pl-9 pr-2 space-y-1 py-1">
                    <div 
                      onClick={() => handleNavClick('my_clients')}
                      className={`flex items-center space-x-3 px-3 py-2 rounded cursor-pointer transition-all duration-150 text-sm ${
                        currentView === 'my_clients' ? 'text-[#f0b429] bg-[#f0b429]/10 font-medium' : 'text-slate-400 hover:text-white hover:bg-\(--primary\)/10'
                      }`}
                    >
                      <Users size={16} />
                      <span>My Clients</span>
                    </div>
                    <div 
                      onClick={() => handleNavClick('blocked_clients')}
                      className={`flex items-center space-x-3 px-3 py-2 rounded cursor-pointer transition-all duration-150 text-sm ${
                        currentView === 'blocked_clients' ? 'text-[#f0b429] bg-[#f0b429]/10 font-medium' : 'text-slate-400 hover:text-white hover:bg-\(--primary\)/10'
                      }`}
                    >
                      <Users size={16} />
                      <span>Blocked Clients</span>
                    </div>
                    <div 
                      onClick={() => handleNavClick('commission_limits')}
                      className={`flex items-center space-x-3 px-3 py-2 rounded cursor-pointer transition-all duration-150 text-sm ${
                        currentView === 'commission_limits' ? 'text-[#f0b429] bg-[#f0b429]/10 font-medium' : 'text-slate-400 hover:text-white hover:bg-\(--primary\)/10'
                      }`}
                    >
                      <IndianRupee size={16} />
                      <span>Commission & Limits</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          
          <NavItem icon={<Key size={20} />} label="Manage Password" isOpen={isSidebarOpen} active={currentView === 'manage_password'} onClick={() => handleNavClick('manage_password')} />
          <NavItem icon={<Globe size={20} />} label="Language" isOpen={isSidebarOpen} onClick={() => handleNavClick()} />
          
          {/* Manage Ledgers Dropdown */}
          <div className="space-y-1">
            {userRole === 'admin' && (
              <>
                <div 
                  onClick={() => {
                    setIsManageLedgersExpanded(!isManageLedgersExpanded);
                    if (!isSidebarOpen) setSidebarOpen(true);
                  }}
                  className={`flex items-center justify-between px-3 py-2.5 rounded cursor-pointer transition-all duration-200 group group-hover:text-white ${
                    (currentView === 'collection_report' || currentView === 'company_ledgers' || currentView === 'my_stmt' || currentView === 'profit_loss') 
                      ? 'bg-\(--primary\)/10 text-\(--primary\) border border-\(--primary\)/30 shadow-[0_0_10px_rgba(0,255,136,0.1)]' 
                      : 'text-slate-400 hover:bg-\(--primary\)/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`${(currentView === 'collection_report' || currentView === 'company_ledgers' || currentView === 'my_stmt' || currentView === 'profit_loss') ? 'text-\(--primary\)' : 'text-slate-400 group-hover:text-\(--primary\)'}`}>
                      <BookOpen size={20} />
                    </div>
                    {isSidebarOpen && <span className="font-semibold text-sm whitespace-nowrap tracking-wide">Manage Ledgers</span>}
                  </div>
                  {isSidebarOpen && (
                    isManageLedgersExpanded ? 
                      <ChevronDown size={16} className="text-\(--primary\)" /> : 
                      <ChevronRight size={16} className="text-slate-500 group-hover:text-\(--primary\)" />
                  )}
                </div>
                
                {/* Manage Ledgers Dropdown Items */}
                {isSidebarOpen && isManageLedgersExpanded && (
                  <div className="pl-9 pr-2 space-y-1 py-1">
                    <div 
                      onClick={() => handleNavClick('collection_report')}
                      className={`flex items-center space-x-3 px-3 py-2 rounded cursor-pointer transition-all duration-150 text-sm ${
                        currentView === 'collection_report' ? 'text-[#f0b429] bg-[#f0b429]/10 font-medium' : 'text-slate-400 hover:text-white hover:bg-\(--primary\)/10'
                      }`}
                    >
                      <BarChart3 size={16} />
                      <span>Collection Report</span>
                    </div>
                    <div 
                      onClick={() => handleNavClick('company_ledgers')}
                      className={`flex items-center space-x-3 px-3 py-2 rounded cursor-pointer transition-all duration-150 text-sm ${
                        currentView === 'company_ledgers' ? 'text-[#f0b429] bg-[#f0b429]/10 font-medium' : 'text-slate-400 hover:text-white hover:bg-\(--primary\)/10'
                      }`}
                    >
                      <BookOpen size={16} />
                      <span>Company Ledgers</span>
                    </div>
                    <div 
                      onClick={() => handleNavClick('my_stmt')}
                      className={`flex items-center space-x-3 px-3 py-2 rounded cursor-pointer transition-all duration-150 text-sm ${
                        currentView === 'my_stmt' ? 'text-[#f0b429] bg-[#f0b429]/10 font-medium' : 'text-slate-400 hover:text-white hover:bg-\(--primary\)/10'
                      }`}
                    >
                      <BarChart3 size={16} />
                      <span>My Stmt.</span>
                    </div>
                    <div 
                      onClick={() => handleNavClick('profit_loss')}
                      className={`flex items-center space-x-3 px-3 py-2 rounded cursor-pointer transition-all duration-150 text-sm ${
                        currentView === 'profit_loss' ? 'text-[#f0b429] bg-[#f0b429]/10 font-medium' : 'text-slate-400 hover:text-white hover:bg-\(--primary\)/10'
                      }`}
                    >
                      <IndianRupee size={16} />
                      <span>Profit & Loss</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      {currentView === 'dashboard' ? (
        <main className="flex-1 min-w-0 h-dvh overflow-hidden">
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
      <main className="flex-1 flex flex-col min-w-0 h-dvh overflow-hidden bg-[#020503]">
        {/* Header */}
        <header className="h-16 bg-[#05100a]/80 backdrop-blur-md border-b border-\(--primary\)/20 flex shrink-0 items-center justify-between px-4 lg:px-8 z-10 sticky top-0 shadow-[0_4px_20px_rgba(0,255,136,0.05)] text-slate-200">
          <div className="flex items-center space-x-4">
            <button 
              className="md:hidden p-2 -ml-2 text-\(--primary\) hover:bg-\(--primary\)/10 rounded border border-transparent hover:border-\(--primary\)/30"
              onClick={() => setSidebarOpen(!isSidebarOpen)}
            >
              <Menu size={20} />
            </button>
            <h1 className="flex items-center space-x-2">
              <span className="ar-zone-logo text-3xl pb-1 tracking-normal">
                AR ZONE
              </span>
            </h1>
          </div>
          
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="hidden lg:flex items-center space-x-2 text-sm font-semibold tracking-wider text-\(--primary\)">
              <span className="w-2 h-2 rounded-full bg-\(--primary\) animate-pulse shadow-[0_0_10px_rgba(0,255,136,1)]"></span>
              <span className="font-orbitron font-bold">SYSTEM ONLINE</span>
            </div>
            
            <div className="h-6 w-px bg-\(--primary\)/20 hidden lg:block"></div>
            
            <ThemeAndNotifications />

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
          <div className="bg-linear-to-r from-\(--primary\)/10 to-[#020503] border-b border-\(--primary\)/20 text-slate-200 px-4 py-3 flex items-center shadow-sm w-full overflow-hidden">
            <div className="bg-\(--primary\)/20 p-1.5 rounded mr-3 shrink-0 border border-\(--primary\)/30">
              <span className="w-2 h-2 rounded-full bg-\(--primary\) animate-pulse block shadow-[0_0_8px_rgba(0,255,136,1)]"></span>
            </div>
            <div className="flex-1 min-w-0 overflow-hidden relative h-6">
              <div className="absolute top-0 left-0 text-sm font-medium whitespace-nowrap animate-[marquee_25s_linear_infinite] font-exo flex items-center gap-8 text-\(--primary\)">
                {(currentView === 'live_casino' || currentView === 'casino_game' || currentView === 'live_ludo' || currentView === 'royal_casino' || currentView === 'royal_casino_report' || currentView === 'check_casino_result') ? (
                <>
                  <span>🎰 <span className="font-bold text-white">Lucky 7</span> <span className="text-[#f0b429]">JACKPOT ALERT!</span> ₹2,50,000 Won by user ****42</span>
                  <span className="text-\(--primary\)/50 font-bold">•</span>
                  <span>🃏 <span className="font-bold text-white">TeenPatti T20</span> <span className="text-[#f0b429]">High Stakes</span> Tables Now Open!</span>
                  <span className="text-\(--primary\)/50 font-bold">•</span>
                  <span>🛩️ <span className="font-bold text-white">Aviator</span> <span className="text-[#f0b429]">New Flight</span> taking off in 10s...</span>
                  <span className="text-\(--primary\)/50 font-bold">•</span>
                  <span>🎲 <span className="font-bold text-white">Royal Casino</span> <span className="text-[#f0b429]">Live Dealers</span> 24/7 Availability</span>
                </>
              ) : (
                <>
                  <span>🏏 <span className="font-bold text-white">Somerset</span> <span className="text-[#f0b429]">145/3 (14.3 ov)</span> vs <span className="font-bold text-white">Glamorgan</span></span>
                  <span className="text-\(--primary\)/50 font-bold">•</span>
                  <span>🏏 <span className="font-bold text-white">India</span> <span className="text-[#f0b429]">210/4 (20.0 ov)</span> vs <span className="font-bold text-white">Australia</span> <span className="text-[#f0b429]">185/8 (20.0 ov)</span></span>
                  <span className="text-\(--primary\)/50 font-bold">•</span>
                  <span>🏏 <span className="font-bold text-white">CSK</span> <span className="text-[#f0b429]">165/2 (15.0 ov)</span> vs <span className="font-bold text-white">MI</span></span>
                  <span className="text-\(--primary\)/50 font-bold">•</span>
                  <span>⚽ <span className="font-bold text-white">Real Madrid</span> <span className="text-[#f0b429]">2 - 1</span> <span className="font-bold text-white">Barcelona</span></span>
                </>
              )}
              </div>
            </div>
            <div className="ml-auto pl-4 hidden sm:block">
              {(currentView === 'live_casino' || currentView === 'casino_game' || currentView === 'live_ludo' || currentView === 'royal_casino' || currentView === 'royal_casino_report' || currentView === 'check_casino_result') ? (
                <button onClick={() => setCurrentView('live_casino')} className="bg-\(--primary\)/10 border border-\(--primary\)/50 text-\(--primary\) hover:bg-\(--primary\) hover:text-[#020503] text-xs font-bold px-3 py-1.5 rounded uppercase tracking-wider transition-all shadow-sm font-orbitron">
                  Play Now
                </button>
              ) : (
                <button onClick={() => setCurrentView('live_matches')} className="bg-\(--primary\)/10 border border-\(--primary\)/50 text-\(--primary\) hover:bg-\(--primary\) hover:text-[#020503] text-xs font-bold px-3 py-1.5 rounded uppercase tracking-wider transition-all shadow-sm font-orbitron">
                  Live View
                </button>
              )}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {currentView === 'stockists' && (
                <AgentsTable 
                  title="Stockists" 
                  breadcrumb="Stockists" 
                  buttonLabel="Create Stockists" 
                  data={stockists}
                  onCreateClick={() => setCurrentView('create_stockist')}
                  onUpdateAgent={async (id, field, value) => {
                    const { doc, updateDoc } = await import('firebase/firestore');
                    try {
                      // Note: fixLimit corresponds to balance for limits in some contexts, but we store it as fixLimit
                      const updateData = field === 'fixLimit' ? { fixLimit: value, balance: Number(value) } : { [field]: value };
                      await updateDoc(doc(db, 'users', id), updateData);
                    } catch (error) {
                      console.error("Error updating stockist:", error);
                    }
                  }}
                />
              )}

              {currentView === 'agent' && (
                <AgentsTable 
                  title="Agent" 
                  breadcrumb="Agent" 
                  buttonLabel="Create Agent" 
                  data={agents}
                  onCreateClick={() => setCurrentView('create_agent')}
                  onUpdateAgent={async (id, field, value) => {
                    const { doc, updateDoc } = await import('firebase/firestore');
                    try {
                      const updateData = field === 'fixLimit' ? { fixLimit: value, balance: Number(value) } : { [field]: value };
                      await updateDoc(doc(db, 'users', id), updateData);
                    } catch (error) {
                      console.error("Error updating agent:", error);
                    }
                  }}
                />
              )}

              {currentView === 'create_agent' && (
                <CreateAgent 
                  onCancel={() => setCurrentView('agent')} 
                  onSave={async (newAgent) => {
                    try {
                      // Attempt to create a standard document for reference
                      const { doc, setDoc } = await import('firebase/firestore');
                      // Use a random ID or email format
                      const agentId = newAgent.userName ? newAgent.userName.replace(/[^a-zA-Z0-9]/g, '') : Date.now().toString();
                      await setDoc(doc(db, 'users', agentId), {
                        ...newAgent,
                        email: newAgent.userName,
                        role: 'agent',
                        balance: Number(newAgent.fixLimit) || 0,
                        createdAt: new Date().toISOString()
                      });
                      showToast("Agent Created");
                      setCurrentView('agent');
                    } catch (error) {
                      console.error("Error creating agent in firebase:", error);
                      alert("Error creating agent");
                    }
                  }}
                />
              )}

              {currentView === 'create_stockist' && (
                <CreateStockist 
                  onCancel={() => setCurrentView('stockists')} 
                  onSave={async (newStockist) => {
                    try {
                      const { doc, setDoc } = await import('firebase/firestore');
                      const stockistId = newStockist.userName ? newStockist.userName.replace(/[^a-zA-Z0-9]/g, '') : Date.now().toString();
                      await setDoc(doc(db, 'users', stockistId), {
                        ...newStockist,
                        email: newStockist.userName,
                        role: 'stockist',
                        balance: Number(newStockist.fixLimit) || 0,
                        createdAt: new Date().toISOString()
                      });
                      showToast("Stockist Created");
                      setCurrentView('stockists');
                    } catch (error) {
                      console.error("Error creating stockist in firebase:", error);
                      alert("Error creating stockist");
                    }
                  }}
                />
              )}

              {currentView === 'my_clients' && (
                <ClientsTable title="CLIENTS" subTitle="All Users" breadcrumb="CLIENTS" hideActions={false} onNavigate={(v) => setCurrentView(v as ViewType)} />
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
                <LiveMatches onViewReport={(match) => {
                  setSelectedMatch(match);
                  setCurrentView('live_report');
                }} />
              )}

              {currentView === 'live_report' && (
                <LiveMatchReport 
                  matchData={selectedMatch}
                  onNavigateBack={() => {
                    if (selectedMatch?.status?.toLowerCase().includes('ended') || selectedMatch?.status?.toLowerCase().includes('result') || selectedMatch?.status?.toLowerCase().includes('won') || selectedMatch?.status?.toLowerCase().includes('abandoned')) {
                      setCurrentView('completed_matches');
                    } else {
                      setCurrentView('live_matches');
                    }
                  }}
                  onGoToDashboard={() => setCurrentView('dashboard')}
                />
              )}

              {currentView === 'completed_matches' && (
                <CompletedMatches 
                  title="Completed Matches" 
                  subTitle="All Matches" 
                  breadcrumb="Matches" 
                  hideCreate={true}
                  hideActions={true}
                  onViewReport={(match: Match) => {
                    setSelectedMatch(match);
                    setCurrentView('live_report');
                  }}
                />
              )}

              {currentView === 'live_casino' && (
                <LiveCasino 
                  onSelectGame={(id, name) => {
                    setSelectedCasinoGame({ id, name });
                    setCurrentView('casino_game');
                  }} 
                />
              )}

              {currentView === 'live_ludo' && (
                <LiveLudo />
              )}

              {currentView === 'casino_game' && selectedCasinoGame && (
                 <CasinoGame 
                   gameId={selectedCasinoGame.id}
                   gameName={selectedCasinoGame.name}
                   onBack={() => setCurrentView('live_casino')}
                 />
              )}

              {currentView === 'royal_casino' && (
                <RoyalCasino onOpenReport={() => setCurrentView('royal_casino_report')} />
              )}

              {currentView === 'royal_casino_report' && (
                <RoyalCasinoReport />
              )}

              {currentView === 'check_casino_result' && (
                <CheckCasinoResult />
              )}

              {currentView === 'block_market' && (
                <BlockMarket />
              )}

              {currentView === 'risk_management' && (
                <RiskManagement />
              )}

              {currentView === 'activity_logs' && (
                <ActivityLogs />
              )}

              {currentView === 'announcements' && (
                <AnnouncementsAdmin />
              )}

              {currentView === 'bet_history' && (
                <BetHistory />
              )}
            </motion.div>
          </AnimatePresence>
          
          {/* Footer */}
          <footer className="mt-8 border-t border-\(--primary\)/20 bg-[#05100a] py-6 px-4 lg:px-8 text-xs font-medium tracking-wide text-slate-500 flex flex-col sm:flex-row justify-between items-center font-exo">
            <div>
              <span className="ar-zone-logo text-lg">AR ZONE</span> <span className="mx-2 text-\(--primary\)/30">|</span> Powered By <span className="text-[#f0b429] font-bold">AR Gaming</span> <span className="mx-2 text-\(--primary\)/30">|</span> Copyright © 2021-2026
            </div>
            <div className="mt-2 sm:mt-0 font-orbitron text-\(--primary\)">
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
          ? 'bg-\(--primary\)/10 text-\(--primary\) border border-\(--primary\)/30 shadow-[0_0_10px_rgba(0,255,136,0.1)]' 
          : 'text-slate-400 hover:bg-\(--primary\)/5 hover:text-white border border-transparent'
      }`}
    >
      <div className={`${active ? 'text-\(--primary\)' : 'text-slate-400 group-hover:text-\(--primary\)'}`}>
        {icon}
      </div>
      {isOpen && <span className={`font-medium text-sm overflow-hidden text-ellipsis whitespace-nowrap ${active ? 'font-semibold tracking-wide' : ''}`}>{label}</span>}
    </div>
  );
}

// Sidebar Navigation Group (Items with children/dropdown arrow)
function NavGroup({ icon, label, isOpen }: { icon: React.ReactNode, label: string, isOpen: boolean }) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5 rounded cursor-pointer transition-all duration-200 text-slate-400 hover:bg-\(--primary\)/5 hover:text-white border border-transparent group">
      <div className="flex items-center space-x-3">
        <div className="text-slate-400 group-hover:text-\(--primary\)">
          {icon}
        </div>
        {isOpen && <span className="font-medium text-sm whitespace-nowrap">{label}</span>}
      </div>
      {isOpen && (
        <ChevronRight size={16} className="text-slate-500 group-hover:text-\(--primary\)" />
      )}
    </div>
  );
}

