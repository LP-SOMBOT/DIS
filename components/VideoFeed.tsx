import React from 'react';

export const VideoFeed: React.FC = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-slate-50 p-6 animate-fadeIn text-center">
      <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[32px] flex items-center justify-center mb-8 animate-bounce shadow-lg border-4 border-white">
         <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
         </svg>
      </div>
      <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Coming Soon</h2>
      <p className="text-slate-500 max-w-xs font-medium leading-relaxed">
        Muuqaallo dhiirigelin leh oo ku saabsan horumarka degmooyinka iyo isku-tashiga bulshada ayaa dhawaan soo socda.
      </p>
      <div className="mt-8 px-6 py-2 bg-slate-200/50 rounded-full text-xs font-black text-slate-400 uppercase tracking-widest">
        DIS TV
      </div>
    </div>
  );
};
