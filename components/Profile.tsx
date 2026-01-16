
import React from 'react';
import { User } from '../types';
import { VerificationBadge } from '../constants';

interface ProfileProps {
  user: User;
  onLogout: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onLogout }) => {
  return (
    <div className="min-h-full bg-slate-50 animate-fadeIn pb-32">
      {/* Header Background */}
      <div className="h-48 bg-gradient-to-br from-emerald-600 to-teal-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute top-10 left-10 w-20 h-20 bg-emerald-400/20 rounded-full blur-xl"></div>
      </div>

      <div className="px-6 relative z-10 -mt-20">
        <div className="bg-white rounded-[2.5rem] shadow-xl p-6 flex flex-col items-center">
          
          <div className="relative mb-4">
             <div className="w-32 h-32 rounded-full border-[6px] border-white shadow-lg bg-emerald-100 flex items-center justify-center overflow-hidden">
                <div className="text-4xl font-black text-emerald-600">{user.name[0]}</div>
             </div>
             <div className="absolute bottom-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                <div className="w-5 h-5 bg-emerald-500 rounded-full border-2 border-white"></div>
             </div>
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight text-center flex items-center gap-1">
              {user.name}
              {user.isVerified && <VerificationBadge />}
          </h2>
          <p className="text-slate-400 font-bold text-sm mb-6">{user.whatsapp}</p>

          <div className="flex gap-3 mb-6">
             <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 flex items-center gap-2">
               <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
               <span className="text-xs font-bold text-slate-700">{user.district}</span>
             </div>
             <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 flex items-center gap-2">
               <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0c0 .883-.393 1.627-1 2.131m4.001-2.131C12.393 6.627 12 7.38 12 8.262" /></svg>
               <span className="text-xs font-bold text-slate-700">ID: {user.id}</span>
             </div>
          </div>

          <div className="w-full bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-6">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Bio</h3>
            <p className="text-slate-600 text-sm font-medium leading-relaxed italic">
              "{user.bio || 'No bio provided.'}"
            </p>
          </div>

          <button
            onClick={onLogout}
            className="w-full py-4 text-red-500 font-bold text-sm bg-red-50 rounded-2xl border border-red-100 hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>

        </div>
      </div>
      
      <div className="mt-8 text-center px-8">
        <p className="text-xs text-slate-400 leading-relaxed">
          Thank you for being part of the <strong className="text-emerald-600">DIS</strong> community. Together we build a better Mogadishu.
        </p>
      </div>
    </div>
  );
};
