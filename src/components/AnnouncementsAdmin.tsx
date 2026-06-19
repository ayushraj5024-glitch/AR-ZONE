import React, { useState } from 'react';
import { Megaphone, Send, CheckCircle2 } from 'lucide-react';

export default function AnnouncementsAdmin() {
  const [announcement, setAnnouncement] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [activeBroadcasts, setActiveBroadcasts] = useState<string[]>([]);

  const handlePublish = () => {
    if (!announcement.trim()) return;
    setIsPublishing(true);
    setTimeout(() => {
      setActiveBroadcasts(prev => [announcement, ...prev]);
      setAnnouncement('');
      setIsPublishing(false);
      setPublished(true);
      setTimeout(() => setPublished(false), 3000);
    }, 1000);
  };

  return (
    <div className="p-4 lg:p-8 w-full max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-orbitron text-slate-200 tracking-wider">Live Announcements</h2>
          <div className="flex items-center text-xs text-slate-500 mt-1 uppercase tracking-widest font-exo font-bold">
            <span className="text-slate-400">ADMIN</span>
            <span className="mx-2">/</span>
            <span className="text-[--primary]">Broadcast</span>
          </div>
        </div>
      </div>

      <div className="bg-[#05100a] border border-[--primary]/20 rounded-lg p-6">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-[--primary]/10 text-[--primary] rounded-full shrink-0">
            <Megaphone size={24} />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">Broadcast Message (Scrolling Ticker)</label>
              <textarea 
                className="w-full h-32 bg-[#020503] border border-[--primary]/20 rounded p-3 text-slate-200 focus:outline-none focus:border-[--primary]/50 font-medium placeholder-slate-600"
                placeholder="Enter important updates like 'Market suspended due to rain...' or 'New deposit methods available...'"
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
              ></textarea>
            </div>
            
            <div className="flex justify-end items-center gap-4">
               {published && <span className="text-emerald-400 text-sm font-bold flex items-center gap-1"><CheckCircle2 size={16}/> Published Successfully</span>}
               <button 
                 onClick={handlePublish}
                 disabled={isPublishing || !announcement.trim()}
                 className={`flex items-center space-x-2 bg-[--primary]/20 text-[--primary] hover:bg-[--primary] hover:text-[#020503] font-bold px-6 py-2.5 rounded transition-all uppercase tracking-wider text-sm border border-[--primary]/50 shadow-[0_0_15px_rgba(0,255,136,0.2)] ${isPublishing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                 <Send size={16} />
                 <span>{isPublishing ? 'Publishing...' : 'Publish Broadcast'}</span>
               </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#05100a] border border-[--primary]/20 rounded-lg overflow-hidden mt-6">
        <div className="p-4 border-b border-[--primary]/20 bg-[#030a06]">
          <h3 className="font-orbitron font-bold text-slate-300">Active Broadcasts</h3>
        </div>
        <div className="p-0">
          {activeBroadcasts.length === 0 ? (
            <div className="p-6 text-center text-slate-500 font-medium">
              No custom active broadcasts right now. Using default system ticker.
            </div>
          ) : (
            <ul className="divide-y divide-[--primary]/10">
              {activeBroadcasts.map((b, i) => (
                <li key={i} className="p-4 text-slate-300 font-medium hover:bg-[#020503]">
                  {b}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
