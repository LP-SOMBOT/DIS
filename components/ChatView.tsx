
import React, { useState, useEffect, useRef } from 'react';
import { User, Message, Channel } from '../types';
import { useData } from '../context/DataContext';
import { VerificationBadge } from '../constants';

interface ChatViewProps {
  user: User;
  activeChannelId: string;
  setActiveChannelId: (id: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({ user, activeChannelId, setActiveChannelId }) => {
  const { channels, messages, sendMessage, deleteMessage, users, unreadCounts, markChannelAsRead } = useData();
  const [inputValue, setInputValue] = useState('');
  const [currentView, setCurrentView] = useState<'list' | 'chat' | 'details'>('list');
  const [showWorkDoneModal, setShowWorkDoneModal] = useState(false);
  const [workText, setWorkText] = useState('');
  const [workImage, setWorkImage] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const visibleChannels = channels.filter(channel => 
    channel.type === 'main' || 
    channel.district === user.district || 
    user.role === 'admin' || 
    user.role === 'super_admin'
  );

  const activeMessages = messages[activeChannelId] || [];
  const activeChannel = channels.find(c => c.id === activeChannelId);

  useEffect(() => {
    if (currentView === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      markChannelAsRead(activeChannelId);
    }
  }, [activeMessages, activeChannelId, currentView]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    await sendMessage(activeChannelId, inputValue, 'text');
    setInputValue('');
  };

  const handleSendWorkDone = async () => {
    if (!workText.trim() || !workImage) return;
    await sendMessage(activeChannelId, workText, 'work_done', workImage);
    setWorkText('');
    setWorkImage(null);
    setShowWorkDoneModal(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setWorkImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const selectChannel = (id: string) => {
    setActiveChannelId(id);
    setCurrentView('chat');
  };

  if (currentView === 'list') {
    return (
      <div className="flex flex-col h-full bg-white animate-fadeIn overflow-hidden">
        <div className="p-3 bg-white">
          <div className="bg-slate-100 flex items-center gap-4 px-4 py-2.5 rounded-2xl">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Raadi ama bilaw sheeko cusub" 
              className="bg-transparent border-none outline-none text-slate-700 text-sm w-full font-medium"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {visibleChannels.map((chan) => {
             const channelMessages = messages[chan.id] || [];
             const lastMsg = channelMessages.length > 0 ? channelMessages[channelMessages.length - 1] : null;
             const unread = unreadCounts[chan.id] || 0;
             
             let previewText = 'No messages yet';
             if (lastMsg) {
                 const senderName = lastMsg.senderId === user.id ? 'You' : lastMsg.senderName.split(' ')[0];
                 const content = lastMsg.type === 'image' ? 'Sent an image' : lastMsg.type === 'work_done' ? 'Shared work' : lastMsg.text;
                 previewText = `${senderName}: ${content}`;
             }

             return (
            <button
              key={chan.id}
              onClick={() => selectChannel(chan.id)}
              className="w-full flex items-center gap-4 px-4 py-4 hover:bg-slate-50 transition-colors border-b border-slate-50 active:bg-slate-100"
            >
              <div className="relative shrink-0">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-emerald-50 bg-white p-0.5 shadow-sm">
                   {chan.type === 'main' ? (
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Flag_of_Somalia.svg/1200px-Flag_of_Somalia.svg.png" className="w-full h-full object-cover rounded-full" alt="Flag" />
                   ) : (
                      <div className="w-full h-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-600 rounded-full">{chan.icon}</div>
                   )}
                </div>
              </div>

              <div className="flex-1 text-left overflow-hidden">
                <div className="flex justify-between items-center mb-0.5">
                  <h3 className="text-slate-900 font-bold truncate text-[16px]">
                    {chan.name}
                  </h3>
                  <div className="flex gap-2 items-center">
                    {chan.status === 'closed' && <span className="text-[9px] bg-red-100 text-red-600 px-1 rounded uppercase">Closed</span>}
                    {lastMsg && <span className="text-[10px] text-slate-400">{new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <p className={`text-sm truncate pr-2 ${unread > 0 ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                    {previewText}
                  </p>
                  {unread > 0 && (
                      <div className="bg-emerald-500 text-white text-[10px] font-bold h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full">
                          {unread}
                      </div>
                  )}
                </div>
              </div>
            </button>
          )})}
        </div>
      </div>
    );
  }

  // Redesigned Details View
  if (currentView === 'details') {
    const groupMembers = (Object.values(users) as User[]).filter(u => 
      u.district === activeChannel?.district || activeChannel?.type === 'main'
    );
    // Mock online count: roughly 30% of members + 1 (self)
    const onlineCount = Math.max(1, Math.floor(groupMembers.length * 0.3) + 1);

    return (
      <div className="flex flex-col h-full bg-slate-50 animate-fadeIn">
        {/* Header Image/Pattern */}
        <div className="h-40 bg-emerald-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          
          <button 
            onClick={() => setCurrentView('chat')}
            className="absolute top-4 left-4 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-colors z-10"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
        </div>

        {/* Group Info Card */}
        <div className="px-6 -mt-12 relative z-10 mb-6">
          <div className="bg-white rounded-3xl shadow-lg p-6 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full border-4 border-white shadow-md -mt-16 mb-4 bg-emerald-50 flex items-center justify-center overflow-hidden">
               {activeChannel?.type === 'main' ? (
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Flag_of_Somalia.svg/1200px-Flag_of_Somalia.svg.png" className="w-full h-full object-cover" alt="Flag" />
               ) : (
                  <span className="text-4xl">{activeChannel?.icon}</span>
               )}
            </div>
            
            <h2 className="text-2xl font-black text-slate-900 text-center leading-tight mb-1">{activeChannel?.name}</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">
              {activeChannel?.type === 'main' ? 'Public Channel' : 'District Channel'}
            </p>

            <div className="flex gap-8 w-full justify-center border-t pt-4">
              <div className="text-center">
                <div className="text-xl font-black text-slate-900">{groupMembers.length}</div>
                <div className="text-[10px] uppercase text-slate-400 font-bold">Members</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-black text-slate-900">{onlineCount}</div>
                <div className="text-[10px] uppercase text-slate-400 font-bold">Online</div>
              </div>
            </div>
          </div>
        </div>

        {/* Members List */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 ml-2">Group Members</h3>
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            {groupMembers.map((u, idx) => (
              <div key={u.id} className={`flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors ${idx !== groupMembers.length - 1 ? 'border-b border-slate-50' : ''}`}>
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-600">
                  {u.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 truncate flex items-center">
                      {u.name}
                      {u.isVerified && <VerificationBadge />}
                  </h4>
                  <p className="text-xs text-slate-500 truncate">{u.district}</p>
                </div>
                {u.role !== 'user' && (
                  <span className="text-[10px] font-bold bg-purple-100 text-purple-600 px-2 py-1 rounded uppercase">
                    {u.role}
                  </span>
                )}
              </div>
            ))}
          </div>

          <button className="w-full mt-6 py-4 text-red-500 font-bold text-sm bg-red-50 rounded-2xl border border-red-100 hover:bg-red-100 transition-colors">
            Exit Group
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white relative animate-fadeIn overflow-hidden">
      <div className="bg-slate-50 border-b p-3 flex items-center gap-3">
        <button 
          onClick={() => setCurrentView('list')}
          className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-lg border-2 border-white shadow-sm overflow-hidden">
            {activeChannel?.type === 'main' ? (
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Flag_of_Somalia.svg/1200px-Flag_of_Somalia.svg.png" className="w-full h-full object-cover" alt="icon"/>
            ) : (
                <span>{activeChannel?.icon}</span>
            )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-slate-900 truncate leading-tight">{activeChannel?.name}</h2>
        </div>
        <button onClick={() => setCurrentView('details')} className="p-2 text-slate-400">
           <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50 relative">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://i.pinimg.com/originals/97/c0/07/97c00754174d276293430ee283ee3691.jpg')] bg-repeat" />
        
        <div className="space-y-6 relative z-10">
          {activeMessages.map((msg) => {
            const isMe = msg.senderId === user.id;
            const isAdmin = user.role === 'admin' || user.role === 'super_admin';
            const sender = users[msg.senderId];

            if (msg.type === 'work_done' && !msg.deleted) {
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[92%] bg-white rounded-[32px] overflow-hidden shadow-2xl border-2 ${isMe ? 'border-emerald-100' : 'border-slate-100'}`}>
                    <div className="relative aspect-[16/10]">
                      <img src={msg.mediaUrl} className="w-full h-full object-cover" alt="Work Done" />
                      <div className="absolute top-4 left-4 bg-emerald-600 text-white text-[9px] font-black px-3 py-1.5 rounded-full shadow-lg border border-white/20 uppercase tracking-[0.2em]">
                        Waxqabad
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="text-[11px] font-black text-emerald-600 mb-2 uppercase tracking-widest flex items-center">
                          {msg.senderName}
                          {sender?.isVerified && <VerificationBadge />}
                      </p>
                      <p className="text-[15px] font-bold text-slate-800 leading-relaxed mb-4">{msg.text}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-300 uppercase">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isAdmin && (
                            <button onClick={() => deleteMessage(activeChannelId, msg.id)} className="text-red-400 text-xs font-bold">Delete</button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] px-4 py-3 rounded-2xl shadow-sm text-[15px] relative ${isMe ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'} ${msg.deleted ? 'opacity-60 italic' : ''}`}>
                  {!isMe && (
                      <p className="text-[10px] font-black text-emerald-600 mb-1 uppercase tracking-tighter flex items-center">
                          {msg.senderName}
                          {sender?.isVerified && <VerificationBadge />}
                      </p>
                  )}
                  <p className="leading-relaxed font-semibold">{msg.text}</p>
                  <div className="flex justify-end items-center gap-2 mt-1">
                    <span className={`text-[9px] font-bold ${isMe ? 'text-emerald-100' : 'text-slate-400'}`}>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {isAdmin && !msg.deleted && (
                         <button onClick={() => deleteMessage(activeChannelId, msg.id)} className="text-red-300 hover:text-red-100 text-[10px] font-bold">DEL</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>
      </div>

      {showWorkDoneModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[40px] p-8 shadow-2xl animate-slideUp">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Lawadaag waxqabadkaaga</h3>
              <button onClick={() => setShowWorkDoneModal(false)} className="p-2 bg-slate-100 rounded-full">
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="relative aspect-video rounded-[32px] overflow-hidden border-4 border-slate-50 shadow-inner bg-slate-100 group">
                {workImage ? (
                    <img src={workImage} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">No Image Selected</div>
                )}
                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-sm cursor-pointer">
                  {workImage ? 'Change Image' : 'Select Image'}
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Warbixin Kooban</label>
                <textarea
                  value={workText}
                  onChange={(e) => setWorkText(e.target.value)}
                  placeholder="Maxaad qabatay maanta?"
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-[24px] p-5 outline-none text-slate-800 font-bold min-h-[120px]"
                />
              </div>

              <button
                onClick={handleSendWorkDone}
                disabled={!workText.trim() || !workImage}
                className="w-full bg-emerald-600 text-white py-6 rounded-[32px] font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:bg-emerald-700 disabled:opacity-30"
              >
                Dir
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-3 bg-white border-t flex items-end gap-2">
         {activeChannel?.status === 'closed' && user.role === 'user' ? (
            <div className="w-full p-3 text-center bg-slate-100 text-slate-500 font-bold rounded-2xl text-sm">
                This group is currently closed by admins.
            </div>
         ) : (
            <>
                <button 
                  onClick={() => setShowWorkDoneModal(true)}
                  className="p-3 text-white bg-emerald-500 hover:bg-emerald-600 rounded-2xl shadow-lg transition-all"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <div className="flex-1 bg-slate-50 rounded-2xl px-4 py-3 flex items-center shadow-inner">
                  <textarea
                    rows={1}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                    placeholder="Qor fariintaada..."
                    className="w-full bg-transparent border-none outline-none text-[15px] resize-none max-h-32 py-0 text-slate-800 font-bold"
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="bg-slate-900 text-white p-3 rounded-2xl shadow-lg disabled:opacity-50 transition-all flex items-center justify-center shrink-0"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
            </>
         )}
      </div>
    </div>
  );
};
