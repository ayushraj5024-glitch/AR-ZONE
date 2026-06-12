import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase';

export default function CommissionLimits() {
  const [usersData, setUsersData] = useState<any[]>([]);

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;
    const auth = getAuth();
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const q = query(collection(db, 'users'));
        unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          const users: any[] = [];
          snapshot.forEach((userDoc) => {
            const data = userDoc.data();
            if (data.status !== 'deleted') {
              users.push({ id: userDoc.id, ...data });
            }
          });
          setUsersData(users);
        }, (error) => {
          console.error("Error fetching users:", error);
        });
      } else {
        setUsersData([]);
        if (unsubscribeSnapshot) {
          unsubscribeSnapshot();
          unsubscribeSnapshot = null;
        }
      }
    });

    return () => {
      if (unsubscribeSnapshot) unsubscribeSnapshot();
      unsubscribeAuth();
    };
  }, []);

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white uppercase">CLIENTS</h2>
        <div className="text-sm font-medium text-slate-400 mt-1 flex items-center space-x-2">
          <span>Dashboard</span>
          <span className="text-slate-300">/</span>
          <span className="text-white">Commission & Limits</span>
        </div>
      </div>

      <div className="space-y-6">
        <ClientSection title="Stockist" users={usersData.filter(u => u.role === 'stockist')} />
        <ClientSection title="Agent" users={usersData.filter(u => u.role === 'agent')} />
        <ClientSection title="All Users" users={usersData.filter(u => u.role === 'client' || !u.role)} />
      </div>
    </div>
  );
}

function ClientSection({ title, users }: { title: string, users: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(d => 
    (d.email && d.email.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (d.name && d.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (d.username && d.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-[#05100a] border text-left border-[#00ff88]/20 rounded-lg shadow-sm overflow-hidden flex flex-col">
      <div className="bg-[#60999b] text-white px-4 py-3">
        <h3 className="font-semibold">{title}</h3>
      </div>
      
      <div className="p-4 border-b border-[#00ff88]/20 bg-[#020503]/50">
        <input
          type="text"
          placeholder={`Search ${title}`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-[#00ff88]/30 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00ff88]/30/20 focus:border-[#00ff88] w-full md:w-64 bg-[#05100a] text-white"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-center text-slate-200">
          <thead className="text-xs text-slate-200 font-semibold bg-[#020503] border-b border-[#00ff88]/20">
            <tr>
              <th rowSpan={2} className="px-4 py-3 text-left w-1/5 border-r border-[#00ff88]/20">
                Client<br />Name
              </th>
              <th colSpan={2} className="px-4 py-2 border-b border-r border-[#00ff88]/20">Client Commission</th>
              <th colSpan={2} className="px-4 py-2 border-b border-r border-[#00ff88]/20">Client Limit</th>
              <th rowSpan={2} className="px-4 py-3 w-1/6">Action</th>
            </tr>
            <tr>
              <th className="px-4 py-2 border-r border-[#00ff88]/20">Match<br />Comm. (%)</th>
              <th className="px-4 py-2 border-r border-[#00ff88]/20">Ssn<br />Comm. (%)</th>
              <th className="px-4 py-2 border-r border-[#00ff88]/20">Current Limit</th>
              <th className="px-4 py-2 border-r border-[#00ff88]/20">Down Balance</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
               <tr>
                 <td colSpan={6} className="px-4 py-4 text-center text-slate-400">No data found</td>
               </tr>
            ) : (
               filteredUsers.map(user => (
                 <ClientRow key={user.id} user={user} />
               ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ClientRow({ user }: { user: any }) {
   const [mComm, setMComm] = useState(user.mComm || 0);
   const [sComm, setSComm] = useState(user.sComm || 0);
   const [limit, setLimit] = useState(user.limit || 0);
   const [downBalance, setDownBalance] = useState(user.downBalance || 0);
   const [updating, setUpdating] = useState(false);

   useEffect(() => {
     setMComm(user.mComm || 0);
     setSComm(user.sComm || 0);
     setLimit(user.limit || 0);
     setDownBalance(user.downBalance || 0);
   }, [user]);

   const handleUpdate = async () => {
      setUpdating(true);
      try {
        await updateDoc(doc(db, 'users', user.id), {
           mComm: Number(mComm),
           sComm: Number(sComm),
           limit: Number(limit),
           downBalance: Number(downBalance)
        });
        alert('Updated successfully');
      } catch(e: any) {
        alert('Error updating: ' + e.message);
      } finally {
        setUpdating(false);
      }
   };

   return (
       <tr className="hover:bg-[#020503] border-b border-[#00ff88]/20 transition-colors">
         <td className="px-4 py-3 text-left font-medium border-r border-[#00ff88]/20">{user.name || user.username || user.email}</td>
         <td className="px-4 py-3 border-r border-[#00ff88]/20">
           <input type="number" value={mComm} onChange={e => setMComm(e.target.value)} className="w-16 border border-[#00ff88]/30 rounded px-2 py-1 text-center font-medium bg-[#020503] text-white focus:outline-none focus:border-[#00ff88]" />
         </td>
         <td className="px-4 py-3 border-r border-[#00ff88]/20">
           <input type="number" value={sComm} onChange={e => setSComm(e.target.value)} className="w-16 border border-[#00ff88]/30 rounded px-2 py-1 text-center font-medium bg-[#020503] text-white focus:outline-none focus:border-[#00ff88]" />
         </td>
         <td className="px-4 py-3 border-r border-[#00ff88]/20">
            <input type="number" value={limit} onChange={e => setLimit(e.target.value)} className="w-24 border border-[#00ff88]/30 rounded px-2 py-1 text-center font-medium bg-[#020503] text-white focus:outline-none focus:border-[#00ff88]" />
         </td>
         <td className="px-4 py-3 border-r border-[#00ff88]/20">
            <input type="number" value={downBalance} onChange={e => setDownBalance(e.target.value)} className="w-24 border border-[#00ff88]/30 rounded px-2 py-1 text-center font-medium bg-[#020503] text-white focus:outline-none focus:border-[#00ff88]" />
         </td>
         <td className="px-4 py-3">
           <button onClick={handleUpdate} disabled={updating} className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-3 py-1.5 rounded font-medium text-xs shadow-sm transition-colors uppercase tracking-wide">
             {updating ? 'Updating...' : 'Update'}
           </button>
         </td>
       </tr>
   );
}

