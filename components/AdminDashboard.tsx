
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { User, Channel, Report, UserPermissions } from '../types';
import { VerificationBadge } from '../constants';

// --- Dashboard Components ---

const Sidebar: React.FC<{ activeTab: string; setActiveTab: (t: string) => void; isOpen: boolean; onClose: () => void }> = ({ activeTab, setActiveTab, isOpen, onClose }) => {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { id: 'districts', label: 'Districts & Groups', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { id: 'users', label: 'User Management', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { id: 'reports', label: 'Posts & Reports', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
  ];

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />}
      <aside className={`w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 overflow-y-auto flex flex-col z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-emerald-500 tracking-tighter flex items-center gap-2">
              <span className="text-white">DIS</span> ADMIN
            </h1>
            <p className="text-[10px] uppercase font-bold text-slate-500 mt-1 tracking-widest">Super Admin Panel</p>
          </div>
          <button onClick={onClose} className="md:hidden text-slate-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); onClose(); }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-bold text-sm ${
                activeTab === item.id 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
           <div className="bg-slate-800 rounded-xl p-3 flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center font-bold">A</div>
               <div className="overflow-hidden">
                   <p className="text-sm font-bold truncate">Admin User</p>
                   <p className="text-[10px] text-slate-400">Super Administrator</p>
               </div>
           </div>
        </div>
      </aside>
    </>
  );
};

// --- Sub Views ---

const Overview: React.FC = () => {
  const { users, channels, posts, reports, districts } = useData();
  const bannedCount = (Object.values(users) as User[]).filter(u => u.status === 'banned').length;
  const pendingReports = reports.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-3xl font-black text-slate-900">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Users" value={Object.keys(users).length} icon="users" color="bg-blue-500" />
        <StatCard label="Active Districts" value={districts.length} icon="map" color="bg-emerald-500" />
        <StatCard label="Total Groups" value={channels.length} icon="chat" color="bg-purple-500" />
        <StatCard label="Pending Reports" value={pendingReports} icon="alert" color="bg-orange-500" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4">Quick Stats</h3>
            <div className="space-y-4">
               <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <span className="text-sm font-medium text-slate-600">Total Posts</span>
                  <span className="font-black text-slate-900">{posts.length}</span>
               </div>
               <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <span className="text-sm font-medium text-slate-600">Banned Users</span>
                  <span className="font-black text-red-600">{bannedCount}</span>
               </div>
               <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <span className="text-sm font-medium text-slate-600">Resolved Reports</span>
                  <span className="font-black text-emerald-600">{reports.filter(r => r.status !== 'pending').length}</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

const DistrictManager: React.FC = () => {
  const { channels, addDistrict, updateChannel, toggleChannelStatus } = useData();
  const [newDistrict, setNewDistrict] = useState('');
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpdateChannel = async () => {
      if(editingChannel) {
          setLoading(true);
          await updateChannel(editingChannel.id, {
              name: editingChannel.name,
              status: editingChannel.status,
              avatar: editingChannel.avatar
          });
          setLoading(false);
          setEditingChannel(null);
      }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && editingChannel) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setEditingChannel({ ...editingChannel, avatar: reader.result as string });
          };
          reader.readAsDataURL(file);
      }
  };

  const add = async () => {
      if(newDistrict) {
          setLoading(true);
          await addDistrict(newDistrict);
          setNewDistrict('');
          setLoading(false);
      }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-3xl font-black text-slate-900">Districts & Groups</h2>
      
      {/* Add District */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full space-y-2">
              <label className="text-xs font-bold uppercase text-slate-400">Add New District</label>
              <input 
                 value={newDistrict} 
                 onChange={e => setNewDistrict(e.target.value)}
                 disabled={loading}
                 className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 font-bold text-slate-800 disabled:opacity-50"
                 placeholder="e.g. Deg. Warta Nabada"
              />
          </div>
          <button 
             onClick={add}
             disabled={loading}
             className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 rounded-xl font-bold transition-colors shadow-lg shadow-emerald-200 disabled:opacity-50"
          >
              {loading ? 'Adding...' : 'Add District'}
          </button>
      </div>

      {/* Groups List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50">
              <h3 className="font-bold text-lg text-slate-800">All Groups</h3>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black">
                      <tr>
                          <th className="p-4">Group Name</th>
                          <th className="p-4">Type</th>
                          <th className="p-4">District</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Actions</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                      {channels.map(ch => (
                          <tr key={ch.id} className="hover:bg-slate-50/50">
                              <td className="p-4 font-bold text-slate-800 flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 overflow-hidden">
                                      {ch.avatar ? <img src={ch.avatar} className="w-full h-full object-cover" alt="icon"/> : ch.icon}
                                  </div>
                                  {ch.name}
                              </td>
                              <td className="p-4 text-sm text-slate-500 capitalize">{ch.type}</td>
                              <td className="p-4 text-sm text-slate-500">{ch.district || 'Global'}</td>
                              <td className="p-4">
                                  <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${ch.status === 'open' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                      {ch.status}
                                  </span>
                              </td>
                              <td className="p-4">
                                  <button onClick={() => setEditingChannel(ch)} className="text-blue-600 font-bold text-xs hover:underline">Edit</button>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>

      {/* Edit Modal */}
      {editingChannel && (
          <div className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl animate-slideUp">
                  <h3 className="text-xl font-black text-slate-900 mb-6">Edit Group</h3>
                  <div className="space-y-4">
                      
                      {/* Avatar Upload */}
                      <div className="flex justify-center mb-6">
                          <label className="relative cursor-pointer group">
                              <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
                                  {editingChannel.avatar ? (
                                      <img src={editingChannel.avatar} className="w-full h-full object-cover" alt="Preview" />
                                  ) : (
                                      <span className="text-4xl text-slate-300 font-bold">{editingChannel.icon}</span>
                                  )}
                              </div>
                              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <span className="text-white text-xs font-bold uppercase">Change</span>
                              </div>
                              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                          </label>
                      </div>

                      <div>
                          <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Group Name</label>
                          <input 
                              value={editingChannel.name} 
                              onChange={e => setEditingChannel({...editingChannel, name: e.target.value})}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold"
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Status</label>
                          <div className="flex bg-slate-100 p-1 rounded-xl">
                              <button 
                                  onClick={() => setEditingChannel({...editingChannel, status: 'open'})}
                                  className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase ${editingChannel.status === 'open' ? 'bg-white shadow text-emerald-600' : 'text-slate-400'}`}
                              >Open</button>
                              <button 
                                  onClick={() => setEditingChannel({...editingChannel, status: 'closed'})}
                                  className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase ${editingChannel.status === 'closed' ? 'bg-white shadow text-red-600' : 'text-slate-400'}`}
                              >Closed</button>
                          </div>
                      </div>
                      <div className="flex gap-3 pt-4">
                          <button onClick={() => setEditingChannel(null)} disabled={loading} className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl disabled:opacity-50">Cancel</button>
                          <button onClick={handleUpdateChannel} disabled={loading} className="flex-1 py-3 font-bold bg-emerald-600 text-white rounded-xl shadow-lg hover:bg-emerald-700 disabled:opacity-50">
                              {loading ? 'Saving...' : 'Save Changes'}
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

const UserManager: React.FC = () => {
    const { users, banUser, unbanUser, toggleUserVerification, updateUserRole } = useData();
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'admin' | 'banned'>('all');
    const [permissionUser, setPermissionUser] = useState<User | null>(null);
    const [loadingActionId, setLoadingActionId] = useState<string | null>(null);

    const filteredUsers = (Object.values(users) as User[]).filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.id.includes(search);
        const matchesFilter = filter === 'all' ? true : filter === 'admin' ? (u.role === 'admin' || u.role === 'super_admin') : u.status === 'banned';
        return matchesSearch && matchesFilter;
    });

    const handlePromote = (user: User) => {
        setPermissionUser(user);
    };

    const handleSavePermissions = async (role: 'user' | 'admin', perms: UserPermissions) => {
        if (permissionUser) {
            await updateUserRole(permissionUser.id, role, perms);
            setPermissionUser(null);
        }
    };

    const wrapAction = async (id: string, fn: () => Promise<void>) => {
        setLoadingActionId(id);
        await fn();
        setLoadingActionId(null);
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <h2 className="text-3xl font-black text-slate-900">User Management</h2>
            
            <div className="flex flex-col md:flex-row gap-4 justify-between">
                <input 
                    placeholder="Search by name or ID..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full md:w-auto bg-white border border-slate-200 rounded-xl px-4 py-3 font-medium min-w-[300px]"
                />
                <div className="flex bg-white rounded-xl border border-slate-200 p-1">
                    {['all', 'admin', 'banned'].map((f) => (
                        <button 
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${filter === f ? 'bg-slate-900 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black">
                            <tr>
                                <th className="p-4">User</th>
                                <th className="p-4">District</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredUsers.map(u => (
                                <tr key={u.id} className="hover:bg-slate-50/50">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-600 text-sm">
                                                {u.name[0]}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800 flex items-center">
                                                    {u.name}
                                                    {u.isVerified && <VerificationBadge />}
                                                </div>
                                                <div className="text-xs text-slate-500">ID: {u.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm font-medium text-slate-600">{u.district}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${u.role !== 'user' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-500'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${u.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                            {u.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => wrapAction(u.id, () => toggleUserVerification(u.id))}
                                                disabled={loadingActionId === u.id}
                                                className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${u.isVerified ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:bg-slate-100'}`}
                                                title="Toggle Verification"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            </button>
                                            <button 
                                                onClick={() => handlePromote(u)}
                                                className="p-2 rounded-lg text-slate-400 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                                                title="Permissions"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                                            </button>
                                            {u.status === 'active' ? (
                                                <button 
                                                    onClick={() => wrapAction(u.id, () => banUser(u.id))}
                                                    disabled={loadingActionId === u.id}
                                                    className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                                                    title="Ban User"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => wrapAction(u.id, () => unbanUser(u.id))}
                                                    disabled={loadingActionId === u.id}
                                                    className="p-2 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
                                                    title="Unban User"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {permissionUser && (
                <PermissionsModal 
                    user={permissionUser} 
                    onClose={() => setPermissionUser(null)} 
                    onSave={handleSavePermissions} 
                />
            )}
        </div>
    );
};

const PermissionsModal: React.FC<{ user: User; onClose: () => void; onSave: (role: 'user' | 'admin', perms: UserPermissions) => void }> = ({ user, onClose, onSave }) => {
    const [role, setRole] = useState<'user' | 'admin'>(user.role === 'super_admin' ? 'admin' : user.role as 'user' | 'admin');
    const [perms, setPerms] = useState<UserPermissions>(user.permissions || {
        managePosts: false,
        manageDistricts: false,
        manageUsers: false,
        verifyUsers: false
    });
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        await onSave(role, perms);
        setSaving(false);
    }

    return (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl animate-slideUp overflow-hidden">
                <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                    <h3 className="text-xl font-black text-slate-900">Manage Permissions</h3>
                    <p className="text-sm text-slate-500 font-medium">For {user.name}</p>
                </div>
                <div className="p-6 space-y-6">
                    <div>
                        <label className="text-xs font-bold uppercase text-slate-400 mb-2 block">Role</label>
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                            <button onClick={() => setRole('user')} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all ${role === 'user' ? 'bg-white shadow text-slate-900' : 'text-slate-400'}`}>User</button>
                            <button onClick={() => setRole('admin')} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all ${role === 'admin' ? 'bg-emerald-500 shadow text-white' : 'text-slate-400'}`}>Admin</button>
                        </div>
                    </div>

                    {role === 'admin' && (
                        <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <Toggle label="Manage Posts" checked={perms.managePosts} onChange={v => setPerms({...perms, managePosts: v})} />
                            <Toggle label="Manage Districts/Groups" checked={perms.manageDistricts} onChange={v => setPerms({...perms, manageDistricts: v})} />
                            <Toggle label="Manage Users (Ban/Block)" checked={perms.manageUsers} onChange={v => setPerms({...perms, manageUsers: v})} />
                            <Toggle label="Verify Users" checked={perms.verifyUsers} onChange={v => setPerms({...perms, verifyUsers: v})} />
                        </div>
                    )}
                </div>
                <div className="p-6 border-t border-slate-50 flex gap-3">
                    <button onClick={onClose} disabled={saving} className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl disabled:opacity-50">Cancel</button>
                    <button onClick={handleSave} disabled={saving} className="flex-1 py-3 font-bold bg-slate-900 text-white rounded-xl shadow-lg hover:bg-slate-800 disabled:opacity-50">
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const Toggle: React.FC<{ label: string; checked: boolean; onChange: (v: boolean) => void }> = ({ label, checked, onChange }) => (
    <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-slate-700">{label}</span>
        <button 
            onClick={() => onChange(!checked)}
            className={`w-11 h-6 rounded-full transition-colors relative ${checked ? 'bg-emerald-500' : 'bg-slate-300'}`}
        >
            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${checked ? 'left-6' : 'left-1'}`} />
        </button>
    </div>
);

const ReportsManager: React.FC = () => {
    const { reports, deletePost, deleteMessage, dismissReport, resolveReport } = useData();
    const [activeReport, setActiveReport] = useState<Report | null>(null);
    const [loading, setLoading] = useState(false);

    const pending = reports.filter(r => r.status === 'pending');

    const handleAction = async (action: 'remove' | 'dismiss' | 'resolve') => {
        if (!activeReport) return;
        setLoading(true);
        if (action === 'remove') {
            if (activeReport.type === 'post') await deletePost(activeReport.targetId);
            await resolveReport(activeReport.id);
        } else if (action === 'dismiss') {
            await dismissReport(activeReport.id);
        } else if (action === 'resolve') {
            await resolveReport(activeReport.id);
        }
        setLoading(false);
        setActiveReport(null);
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <h2 className="text-3xl font-black text-slate-900">Reports & Moderation</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pending.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border-dashed border-2 border-slate-200">
                        No pending reports. Great job!
                    </div>
                )}
                {pending.map(r => (
                    <div key={r.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                        <div className="flex items-start justify-between mb-4">
                             <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${r.type === 'post' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                                 {r.type}
                             </span>
                             <span className="text-xs text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="font-bold text-slate-800 mb-2">Reason: <span className="text-red-500">{r.reason}</span></p>
                        <p className="text-xs text-slate-500 mb-6 flex-1">
                            Reported by ID: {r.reporterId}<br/>
                            Target ID: {r.targetId}
                        </p>
                        <div className="flex gap-2 mt-auto">
                            <button 
                                onClick={() => setActiveReport(r)}
                                className="flex-1 bg-slate-900 text-white py-2 rounded-lg text-xs font-bold"
                            >
                                Review
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {activeReport && (
                <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl animate-slideUp overflow-hidden">
                        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                            <h3 className="text-xl font-black text-slate-900">Review Content</h3>
                            <button onClick={() => setActiveReport(null)} className="text-slate-400 hover:text-slate-600">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-6 bg-slate-50/50">
                            <p className="text-sm font-bold text-slate-700 mb-2">Report Reason:</p>
                            <div className="bg-red-50 border border-red-100 p-3 rounded-xl text-red-700 text-sm font-medium mb-6">
                                {activeReport.reason}
                            </div>
                            
                            <p className="text-sm font-bold text-slate-700 mb-2">Action:</p>
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => handleAction('remove')} disabled={loading} className="p-3 bg-red-600 text-white rounded-xl font-bold text-sm shadow hover:bg-red-700 disabled:opacity-50">Remove Content</button>
                                <button onClick={() => handleAction('dismiss')} disabled={loading} className="p-3 bg-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-300 disabled:opacity-50">Dismiss Report</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Main Layout ---

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [authenticated, setAuthenticated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pin, setPin] = useState('');

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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
        <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
             <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2 text-center">Admin Access</h2>
          <p className="text-slate-500 text-center text-sm mb-6">Enter your security PIN to continue</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-black text-center tracking-[0.5em] text-2xl outline-none focus:border-emerald-500 focus:bg-white transition-all"
              autoFocus
            />
            <button className="w-full bg-slate-900 text-white p-4 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all">
              Unlock Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex relative">
      {/* Mobile Toggle */}
      <button 
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed top-4 right-4 z-30 bg-slate-900 text-white p-2 rounded-lg shadow-lg"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
      </button>

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 md:ml-64 p-4 md:p-8 h-screen overflow-y-auto">
        {activeTab === 'overview' && <Overview />}
        {activeTab === 'districts' && <DistrictManager />}
        {activeTab === 'users' && <UserManager />}
        {activeTab === 'reports' && <ReportsManager />}
      </main>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: number; icon: string; color: string }> = ({ label, value, icon, color }) => {
    let d = "";
    if (icon === 'users') d = "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z";
    if (icon === 'map') d = "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z";
    if (icon === 'chat') d = "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z";
    if (icon === 'alert') d = "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z";

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-xl ${color} text-white flex items-center justify-center shadow-lg shadow-emerald-100`}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={d} />
                </svg>
            </div>
            <div>
                <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">{label}</p>
                <p className="text-2xl font-black text-slate-900">{value}</p>
            </div>
        </div>
    );
};
