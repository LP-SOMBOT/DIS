
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { User } from '../types';

export const AdminDashboard: React.FC = () => {
  const { 
    users, channels, posts, reports, districts,
    banUser, addDistrict, deletePost, toggleChannelStatus 
  } = useData();
  const [pin, setPin] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'districts' | 'users' | 'reports'>('overview');
  const [newDistrict, setNewDistrict] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '22lp') {
      setAuthenticated(true);
    } else {
      alert('Invalid PIN');
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 w-full max-w-sm">
          <h2 className="text-2xl font-black text-slate-900 mb-6 text-center">Super Admin Access</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter PIN"
              className="w-full bg-slate-100 p-4 rounded-xl font-bold text-center tracking-[0.5em] text-xl"
            />
            <button className="w-full bg-emerald-600 text-white p-4 rounded-xl font-bold">
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <nav className="bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <h1 className="font-black text-xl tracking-tight text-emerald-500">DIS ADMIN</h1>
        <div className="flex gap-4 text-xs font-bold uppercase">
          {['overview', 'districts', 'users', 'reports'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-3 py-2 rounded-lg transition-colors ${activeTab === tab ? 'bg-emerald-600' : 'hover:bg-slate-800'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>

      <main className="p-6 max-w-6xl mx-auto">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fadeIn">
            <StatCard label="Total Users" value={Object.keys(users).length.toString()} color="bg-blue-50 text-blue-600" />
            <StatCard label="Districts" value={districts.length.toString()} color="bg-emerald-50 text-emerald-600" />
            <StatCard label="Posts" value={posts.length.toString()} color="bg-purple-50 text-purple-600" />
            <StatCard label="Pending Reports" value={reports.filter(r => r.status === 'pending').length.toString()} color="bg-orange-50 text-orange-600" />
          </div>
        )}

        {activeTab === 'districts' && (
          <div className="space-y-6 animate-fadeIn">
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
               <h3 className="font-bold text-lg mb-4">Add New District</h3>
               <div className="flex gap-2">
                 <input 
                    value={newDistrict} 
                    onChange={e => setNewDistrict(e.target.value)}
                    placeholder="e.g. Deg. Warta Nabada" 
                    className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-200"
                 />
                 <button 
                    onClick={() => { if(newDistrict) { addDistrict(newDistrict); setNewDistrict(''); } }}
                    className="bg-emerald-600 text-white px-6 rounded-xl font-bold"
                 >Add</button>
               </div>
             </div>

             <div className="grid gap-4">
               {channels.map(ch => (
                 <div key={ch.id} className="bg-white p-4 rounded-xl flex items-center justify-between border border-slate-100">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                       {ch.icon}
                     </div>
                     <div>
                       <div className="font-bold text-slate-800">{ch.name}</div>
                       <div className="text-xs text-slate-400">{ch.type.toUpperCase()}</div>
                     </div>
                   </div>
                   <button 
                      onClick={() => toggleChannelStatus(ch.id, ch.status === 'open' ? 'closed' : 'open')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${
                        ch.status === 'open' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}
                   >
                     {ch.status}
                   </button>
                 </div>
               ))}
             </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden animate-fadeIn">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="p-4 font-black text-slate-400 uppercase text-xs">User</th>
                  <th className="p-4 font-black text-slate-400 uppercase text-xs">District</th>
                  <th className="p-4 font-black text-slate-400 uppercase text-xs">Status</th>
                  <th className="p-4 font-black text-slate-400 uppercase text-xs">Action</th>
                </tr>
              </thead>
              <tbody>
                {(Object.values(users) as User[]).map(user => (
                  <tr key={user.id} className="border-b last:border-0 hover:bg-slate-50">
                    <td className="p-4 font-bold">{user.name} <br/><span className="text-slate-400 font-normal">{user.whatsapp}</span></td>
                    <td className="p-4">{user.district}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${user.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {user.status === 'active' && (
                        <button 
                          onClick={() => banUser(user.id)}
                          className="text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg font-bold text-xs border border-red-200"
                        >
                          Ban User
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-4 animate-fadeIn">
            {reports.length === 0 && <div className="text-center text-slate-400 py-10">No reports found</div>}
            {reports.map(report => (
              <div key={report.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                   <div className="flex gap-2 mb-1">
                     <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-[10px] font-black uppercase">{report.type}</span>
                     <span className="text-xs text-slate-400 font-medium">{new Date(report.createdAt).toLocaleDateString()}</span>
                   </div>
                   <p className="font-bold text-slate-800">Reason: {report.reason}</p>
                   <p className="text-xs text-slate-500">Reporter ID: {report.reporterId} | Target ID: {report.targetId}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => deletePost(report.targetId)} className="bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold">
                    Remove Content
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <div className={`p-6 rounded-2xl ${color} flex flex-col items-center justify-center text-center`}>
    <div className="text-3xl font-black mb-1">{value}</div>
    <div className="text-[10px] font-bold uppercase tracking-widest opacity-70">{label}</div>
  </div>
);
