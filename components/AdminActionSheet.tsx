
import React, { useState } from 'react';
import { User } from '../types';
import { useData } from '../context/DataContext';

interface AdminActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId: string | null;
  targetContentId?: string | null;
  channelId?: string; // For messages/channel actions
  contentType: 'post' | 'message' | 'user_only' | null;
  currentUser: User;
}

export const AdminActionSheet: React.FC<AdminActionSheetProps> = ({
  isOpen, onClose, targetUserId, targetContentId, channelId, contentType, currentUser
}) => {
  const { users, channels, banUser, unbanUser, blockUserFromChannel, toggleUserVerification, deletePost, deleteMessage, toggleChannelStatus } = useData();
  const [isLoading, setIsLoading] = useState(false);
  
  if (!isOpen || !targetUserId) return null;
  
  const realCurrentUser = users[currentUser.id] || currentUser;
  const targetUser = users[targetUserId];
  const channel = channelId ? channels.find(c => c.id === channelId) : null;
  
  if (!targetUser) return null;

  // Role Hierarchy
  const isTargetAdmin = targetUser.role === 'admin' || targetUser.role === 'super_admin';
  const isCurrentSuper = realCurrentUser.role === 'super_admin';
  const isCurrentAdmin = realCurrentUser.role === 'admin';
  const canActionUser = isCurrentSuper || (!isTargetAdmin && isCurrentAdmin);

  // Permissions
  const perms = realCurrentUser.permissions || {
      managePosts: false,
      manageDistricts: false,
      manageUsers: false,
      verifyUsers: false,
      manageChannels: false
  };

  const canBan = canActionUser && (isCurrentSuper || perms.manageUsers);
  const canVerify = canActionUser && (isCurrentSuper || perms.verifyUsers);
  const canDelete = isCurrentSuper || (isCurrentAdmin && perms.managePosts);
  const canBlockFromGroup = channelId && canActionUser && (isCurrentSuper || isCurrentAdmin); // Admins can block from groups
  const canManageChannel = channelId && (isCurrentSuper || (isCurrentAdmin && perms.manageChannels));

  const handleAction = async (action: () => Promise<void>) => {
      setIsLoading(true);
      try {
          await action();
          // Short delay for visual feedback
          await new Promise(resolve => setTimeout(resolve, 500)); 
          onClose();
      } catch (e) {
          console.error(e);
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
        <div className="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl animate-slideUp overflow-hidden relative" onClick={e => e.stopPropagation()}>
            
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-2xl font-black text-slate-500 border-4 border-slate-50">
                    {targetUser.name[0]}
                </div>
                <div>
                    <h3 className="text-xl font-black text-slate-900 leading-tight">{targetUser.name}</h3>
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

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                {/* Verification */}
                {canVerify && (
                    <ActionButton 
                        isLoading={isLoading}
                        onClick={() => handleAction(() => toggleUserVerification(targetUserId))}
                        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        label={targetUser.isVerified ? 'Remove Verification' : 'Verify User'}
                        colorClass="bg-blue-50 text-blue-700"
                    />
                )}
                
                {/* Global Ban */}
                {canBan && (
                    <ActionButton 
                        isLoading={isLoading}
                        onClick={() => handleAction(async () => {
                            if (targetUser.status === 'banned') await unbanUser(targetUserId);
                            else await banUser(targetUserId);
                        })}
                        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>}
                        label={targetUser.status === 'banned' ? 'Unban User (Global)' : 'Ban User (Global)'}
                        colorClass={targetUser.status === 'banned' ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'}
                    />
                )}

                {/* Local Block (Group Specific) */}
                {canBlockFromGroup && channelId && (
                     <ActionButton 
                        isLoading={isLoading}
                        onClick={() => handleAction(() => blockUserFromChannel(channelId, targetUserId))}
                        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>}
                        label="Block from this Group"
                        colorClass="bg-slate-100 text-slate-700"
                     />
                )}

                {/* Content Deletion */}
                {contentType !== 'user_only' && canDelete && targetContentId && (
                    <ActionButton 
                        isLoading={isLoading}
                        onClick={() => handleAction(async () => {
                             if (contentType === 'post') await deletePost(targetContentId);
                             else if (contentType === 'message' && channelId) await deleteMessage(channelId, targetContentId);
                        })}
                        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
                        label={`Delete ${contentType === 'post' ? 'Post' : 'Message'}`}
                        colorClass="bg-red-50 text-red-700"
                    />
                )}

                 {/* Group Management (Close/Open) */}
                 {canManageChannel && channel && (
                    <div className="border-t border-slate-100 pt-3 mt-3">
                         <ActionButton 
                            isLoading={isLoading}
                            onClick={() => handleAction(() => toggleChannelStatus(channel.id, channel.status === 'open' ? 'closed' : 'open'))}
                            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>}
                            label={channel.status === 'open' ? 'Close This Group' : 'Open This Group'}
                            colorClass={channel.status === 'open' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}
                        />
                    </div>
                 )}
            </div>

            <button onClick={onClose} disabled={isLoading} className="w-full mt-6 py-3 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-600">
                Cancel
            </button>
        </div>
    </div>
  );
};

const ActionButton: React.FC<{ isLoading: boolean; onClick: () => void; icon: React.ReactNode; label: string; colorClass: string }> = ({ isLoading, onClick, icon, label, colorClass }) => (
    <button 
        onClick={onClick} 
        disabled={isLoading}
        className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all active:scale-[0.98] ${colorClass} ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
    >
        <div className={`w-10 h-10 rounded-full bg-white/60 flex items-center justify-center shadow-sm`}>
             {isLoading ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : icon}
        </div>
        <span className="flex-1 text-left">{label}</span>
    </button>
);
