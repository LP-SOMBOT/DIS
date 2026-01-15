import React from 'react';
import { User } from '../types';
import { HomeFeed } from './HomeFeed';
import { ChatView } from './ChatView';
import { VideoFeed } from './VideoFeed';
import { Profile } from './Profile';

interface MainLayoutProps {
  user: User;
  activeTab: 'home' | 'chat' | 'videos' | 'profile';
  setActiveTab: (tab: 'home' | 'chat' | 'videos' | 'profile') => void;
  activeChannel: string;
  setActiveChannel: (channel: string) => void;
  onLogout: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  user,
  activeTab,
  setActiveTab,
  activeChannel,
  setActiveChannel,
  onLogout
}) => {
  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto bg-white shadow-xl">
      {/* Header */}
      <header className="glass sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b">
        <div>
          <h1 className="text-2xl font-black text-emerald-600 tracking-tighter">DIS</h1>
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest leading-none">New Mogadishu 2026</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs font-bold text-emerald-700">{user.district}</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto hide-scrollbar bg-slate-50">
        {activeTab === 'home' && <HomeFeed user={user} />}
        {activeTab === 'chat' && (
          <ChatView
            user={user}
            activeChannelId={activeChannel}
            setActiveChannelId={setActiveChannel}
          />
        )}
        {activeTab === 'videos' && <VideoFeed />}
        {activeTab === 'profile' && <Profile user={user} onLogout={onLogout} />}
      </main>

      {/* Bottom Navigation */}
      <nav className="glass sticky bottom-0 z-50 flex justify-around items-center px-4 py-3 border-t">
        <NavButton
          active={activeTab === 'home'}
          onClick={() => setActiveTab('home')}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          }
          label="Home"
        />
        <NavButton
          active={activeTab === 'chat'}
          onClick={() => setActiveTab('chat')}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          }
          label="Chats"
        />
        <NavButton
          active={activeTab === 'videos'}
          onClick={() => setActiveTab('videos')}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          }
          label="DIS-TV"
        />
        <NavButton
          active={activeTab === 'profile'}
          onClick={() => setActiveTab('profile')}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
          label="Profile"
        />
      </nav>
    </div>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all ${
      active ? 'text-emerald-600 scale-110' : 'text-slate-400'
    }`}
  >
    {icon}
    <span className="text-[10px] font-bold uppercase">{label}</span>
  </button>
);