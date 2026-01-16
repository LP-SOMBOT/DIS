
import React from 'react';
import { User } from '../types';
import { useData } from '../context/DataContext';

interface AdminActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId: string | null;
  targetContentId?: string | null;
  channelId?: string; // For messages
  contentType: 'post' | 'message' | 'user_only' | null;
  currentUser: User;
}

export const AdminActionSheet: React.FC<AdminActionSheetProps> = ({
  isOpen, onClose, targetUserId, targetContentId, channelId, contentType, currentUser
}) => {
  const { users, banUser, unbanUser, toggleUserVerification, deletePost, deleteMessage } = useData();
  
  if (!isOpen || !targetUserId) return null;
  const targetUser = users[targetUserId];
  if (!targetUser) return null;

  const isSuperAdmin = currentUser.role === 'super_admin';
  const perms = currentUser.permissions || {};
  
  // Permissions Logic
  const canBan = isSuperAdmin || perms.manageUsers;
  const canVerify = isSuperAdmin || perms.verifyUsers;
  const canDelete = isSuperAdmin || perms.managePosts;

  const handleBan = async () => {
     if (targetUser.status === 'banned') await unbanUser(targetUserId);
     else await banUser(targetUserId);
     onClose();
  };

  const handleVerify = async () => {
     await toggleUserVerification(targetUserId);
     onClose();
  };

  const handleDelete = async () => {
     if (!targetContentId) return;
     if (contentType === 'post') {
         await deletePost(targetContentId);
     } else if (contentType === 'message' && channelId) {
         await deleteMessage(channelId, targetContentId);
     }
     onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
        <div className="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl animate-slideUp overflow-hidden relative" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-2xl font-black text-slate-500 border-4 border-slate-50">
                    {targetUser.name[0]}
                </div>
                <div>
                    <h3 className="text-xl font-black text-slate-900 leading-tight">{targetUser.name}</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">{targetUser.district}</p>
                    <div className="flex gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${targetUser.role !== 'user' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-500'}`}>
                            {targetUser.role}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${targetUser.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                            {targetUser.status}
                        </span>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                {canVerify && (
                    <button onClick={handleVerify} className="w-full flex items-center gap-4 p-4 bg-blue-50 text-blue-700 rounded-2xl font-bold hover:bg-blue-100 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-blue-500">
                             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <span className="flex-1 text-left">{targetUser.isVerified ? 'Remove Verification' : 'Verify User'}</span>
                    </button>
                )}
                
                {canBan && (
                    <button onClick={handleBan} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-colors ${targetUser.status === 'banned' ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'}`}>
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                        </div>
                        <span className="flex-1 text-left">{targetUser.status === 'banned' ? 'Unban User' : 'Ban User'}</span>
                    </button>
                )}

                {contentType !== 'user_only' && canDelete && targetContentId && (
                    <button onClick={handleDelete} className="w-full flex items-center gap-4 p-4 bg-red-50 text-red-700 rounded-2xl font-bold hover:bg-red-100 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-red-500">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </div>
                        <span className="flex-1 text-left">Delete {contentType === 'post' ? 'Post' : 'Message'}</span>
                    </button>
                )}
            </div>

            <button onClick={onClose} className="w-full mt-6 py-3 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-600">
                Cancel
            </button>
        </div>
    </div>
  );
};
