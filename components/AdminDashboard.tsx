
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { User, Channel, Report } from '../types';

// --- Reusable UI Components ---

const Badge: React.FC<{ children: React.ReactNode; color: string }> = ({ children, color }) => (
  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${color}`}>
    {children}
  </span>
);

const ToggleSwitch: React.FC<{ active: boolean; onChange: () => void }> = ({ active, onChange }) => (
  <button 
    onClick={onChange}
    className={`w-12 h-6 rounded-full transition-all relative ${active ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-slate-700'}`}
  >
    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${active ? 'translate-x-7' : 'translate-x-1'}`} />
  </button>
);

// --- Sub-components for Sections ---

const StatCard: React.FC<{ label: string; value: string; subtext: string; trend?: string; color?: string; icon?: React.ReactNode }> = ({ label, value, subtext, trend, color = 'text-white', icon }) => (
  <div className="bg-[#161a1d] rounded-2xl p-4 border border-white/5 flex flex-col justify-between h-32 relative overflow-hidden">
    <div className="space-y-1">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
      <h3 className={`text-2xl font-black ${color}`}>{value}</h3>
    </div>
    <div className="flex items-center gap-1.5 mt-auto">
      {icon}
      <p className={`text-[10px] font-bold ${trend ? 'text-emerald-500' : 'text-slate-400'}`}>
        {trend && <span className="mr-0.5">↗</span>}
        {subtext}
      </p>
    </div>
  </div>
);

export const AdminDashboard: React.FC = () => {
  const { users, channels, reports, districts, banUser, dismissReport, toggleChannelStatus } = useData();
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '22lp') setAuthenticated(true);
    else alert('Invalid PIN');
  };

  const handleLock = () => {
    setAuthenticated(false);
    setPin('');
    window.location.hash = '';
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#0a0c0d] flex items-center justify-center p-6 font-sans">
        <div className="bg-[#161a1d] rounded-[40px] p-10 w-full max-w-sm shadow-2xl border border-white/5">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
             <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h2 className="text-2xl font-black text-white mb-2 text-center">Admin Access</h2>
          <p className="text-slate-500 text-center text-sm mb-8">Secure Terminal Connection</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              className="w-full bg-slate-900 border border-white/5 p-5 rounded-2xl font-black text-center tracking-[0.5em] text-2xl text-white outline-none focus:border-emerald-500 transition-all"
              autoFocus
            />
            <button className="w-full bg-emerald-600 text-white p-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-emerald-900/20 hover:bg-emerald-500 transition-all">
              Initialize Session
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0c0d] text-white font-sans pb-32">
      {/* Top Header */}
      <div className="px-6 pt-8 pb-4 flex items-center justify-between sticky top-0 bg-[#0a0c0d]/80 backdrop-blur-md z-40">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
            <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight leading-none">Admin Mode: Authorized</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Session ID: 882-XQZ</p>
          </div>
        </div>
        <button 
          onClick={handleLock}
          className="bg-slate-800/50 hover:bg-red-500/10 border border-white/5 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase text-orange-500 flex items-center gap-2 transition-all"
        >
          Lock & Exit
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>
        </button>
      </div>

      <div className="px-6 space-y-8 mt-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard 
            label="Active Users" 
            value="14.2k" 
            subtext="2.1%" 
            trend="up"
          />
          <StatCard 
            label="Reports" 
            value="42" 
            subtext="High Priority" 
            color="text-orange-500"
            icon={<div className="w-1 h-3 bg-orange-500 rounded-full" />}
          />
          <StatCard 
            label="Node Health" 
            value="99%" 
            subtext="Stable" 
            color="text-emerald-500"
            icon={<div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
          />
        </div>

        {/* Moderation Queue */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black tracking-tight flex items-center gap-3">
              <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              Moderation Queue
            </h2>
            <Badge color="bg-emerald-500/20 text-emerald-500">3 New</Badge>
          </div>

          <div className="bg-[#161a1d] rounded-3xl p-6 border-l-4 border-orange-500 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center overflow-hidden border border-white/5">
                   <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Abdi" alt="Abdi" />
                </div>
                <div>
                  <h4 className="font-black text-sm">Abdi Farah</h4>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">District: Hamar Weyne</p>
                </div>
              </div>
              <Badge color="bg-slate-800 text-slate-400">Spam</Badge>
            </div>
            
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              Reported message: "Unrelated commercial link posted in the community cleanliness group..."
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button className="py-3.5 rounded-2xl bg-slate-800 text-xs font-black uppercase tracking-widest hover:bg-slate-700 transition-colors">
                Dismiss
              </button>
              <button className="py-3.5 rounded-2xl bg-[#ff5f3f] text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-orange-900/20 hover:brightness-110 transition-all">
                Ban User
              </button>
            </div>
          </div>
        </section>

        {/* District Control Center */}
        <section className="space-y-4">
          <h2 className="text-lg font-black tracking-tight flex items-center gap-3">
             <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
             District Control Center
          </h2>
          
          <div className="space-y-3">
            {[
              { name: 'Hodan District Chat', status: 'Active & Secure', active: true },
              { name: 'Wadajir District Chat', status: 'Paused for Review', active: false },
              { name: 'Shingani District', status: 'Active & Secure', active: true },
            ].map((d, i) => (
              <div key={i} className="bg-[#161a1d] rounded-2xl p-4 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${d.active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-500'}`}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{d.name}</h4>
                    <p className={`text-[10px] font-black uppercase tracking-widest mt-0.5 ${d.active ? 'text-emerald-500' : 'text-slate-500'}`}>{d.status}</p>
                  </div>
                </div>
                <ToggleSwitch active={d.active} onChange={() => {}} />
              </div>
            ))}
          </div>
        </section>

        {/* Global User Management */}
        <section className="space-y-4">
           <h2 className="text-lg font-black tracking-tight flex items-center gap-3">
              <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              Global User Management
           </h2>

           <div className="space-y-3">
             {[
               { name: 'Eng. Hassan', tag: 'Contributor', seed: 'Hassan' },
               { name: 'Layla Jama', tag: 'New Member', seed: 'Layla' },
             ].map((u, i) => (
               <div key={i} className="bg-[#161a1d] rounded-2xl p-4 border border-white/5 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full border border-white/10 p-0.5 overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.seed}`} alt={u.name} />
                   </div>
                   <div>
                     <h4 className="font-bold text-sm">{u.name}</h4>
                     <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500">{u.tag}</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-2">
                   <button className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 hover:bg-emerald-500/20 transition-all">
                     <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>
                   </button>
                   <button className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20 hover:bg-red-500/20 transition-all">
                     <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8 0-1.85.63-3.55 1.69-4.9L16.9 16.31C15.55 17.37 13.85 18 12 18zm4.31-3.1L5.69 7.69C7.05 6.63 8.75 6 10.69 6c4.42 0 8 3.58 8 8 0 1.85-.63 3.55-1.69 4.9z"/></svg>
                   </button>
                 </div>
               </div>
             ))}
           </div>

           <button className="w-full py-4 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-white/5 transition-all">
             View All 14.2k Users
           </button>
        </section>
      </div>

      {/* Custom Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 p-4 z-50">
        <div className="max-w-md mx-auto bg-[#161a1d]/80 backdrop-blur-xl border border-white/5 rounded-[32px] p-3 flex items-center justify-between shadow-2xl">
          <NavItem active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" label="Overview" />
          <NavItem active={activeTab === 'queue'} onClick={() => setActiveTab('queue')} icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" label="Queue" />
          
          {/* Center Shield Button */}
          <div className="relative -mt-10">
            <button className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.5)] border-4 border-[#0a0c0d] active:scale-90 transition-transform">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
            </button>
          </div>

          <NavItem active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" label="Users" />
          <NavItem active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} icon="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" label="Logs" />
        </div>
      </nav>
    </div>
  );
};

const NavItem: React.FC<{ active: boolean; onClick: () => void; icon: string; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all flex-1 ${active ? 'text-emerald-500' : 'text-slate-500'}`}
  >
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={icon} /></svg>
    <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
  </button>
);
