import React, { useState, useEffect } from 'react';
import { ShieldAlert, Activity } from 'lucide-react';
import { getFirestore, collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';

export default function ActivityLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getFirestore();
    const logsQuery = query(collection(db, 'activity_logs'), orderBy('timestamp', 'desc'), limit(50));
    const unsubscribe = onSnapshot(logsQuery, (snapshot) => {
      const data: any[] = [];
      snapshot.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setLogs(data);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="p-4 lg:p-8 w-full max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-orbitron text-slate-200 tracking-wider">Security & Activity Logs</h2>
          <div className="flex items-center text-xs text-slate-500 mt-1 uppercase tracking-widest font-exo font-bold">
            <span className="text-slate-400">ADMIN</span>
            <span className="mx-2">/</span>
            <span className="text-[--primary]">Logs</span>
          </div>
        </div>
      </div>

      <div className="bg-[#05100a] border border-[--primary]/20 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-[--primary]/20 bg-[#030a06] flex items-center justify-between">
           <div className="flex items-center space-x-2 text-[--primary]">
             <Activity size={18} />
             <h3 className="font-orbitron font-bold">Recent System Activity</h3>
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-[#020503] text-slate-400 border-b border-[--primary]/20">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">User/Admin</th>
                <th className="px-4 py-3">Action Type</th>
                <th className="px-4 py-3">Details</th>
                <th className="px-4 py-3">IP Address</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">Loading logs...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">No activity recorded yet</td>
                </tr>
              ) : (
                logs.map((log) => {
                  const date = log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString() : new Date().toLocaleString();
                  const typeColor = log.type === 'deposit' ? 'text-emerald-400' 
                                  : log.type === 'withdraw' ? 'text-rose-400' 
                                  : log.type === 'settings' ? 'text-yellow-400' 
                                  : 'text-[--primary]';

                  return (
                    <tr key={log.id} className="border-b border-[--primary]/10 hover:bg-[#020503]/50">
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{date}</td>
                      <td className="px-4 py-3 font-medium text-[--primary]">{log.user || 'Unknown'}</td>
                      <td className="px-4 py-3"><span className={`${typeColor} font-bold text-xs uppercase tracking-wider`}>{log.action || 'Action'}</span></td>
                      <td className="px-4 py-3 text-slate-300">{log.details || '-'}</td>
                      <td className="px-4 py-3 text-slate-500 font-mono">{log.ip || '-'}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
