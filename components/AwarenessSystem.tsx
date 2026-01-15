
import React, { useState } from 'react';
// Import MOCK_FEED from constants as MOCK_AWARENESS is not exported
import { MOCK_FEED } from '../constants';
import { HomePost } from '../types';

export const AwarenessSystem: React.FC = () => {
  // Filter MOCK_FEED to get posts of type 'awareness'
  const awarenessItems = MOCK_FEED.filter(post => post.type === 'awareness');

  return (
    <div className="p-4 space-y-6 animate-fadeIn pb-24">
      {/* Awareness Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-blue-600 rounded-3xl p-6 text-white shadow-xl overflow-hidden relative">
        <div className="relative z-10">
          <span className="bg-white/20 text-xs px-2 py-1 rounded-lg font-bold uppercase mb-2 inline-block">Ma Ogtahay?</span>
          <h2 className="text-xl font-bold leading-tight mb-2">Nadaafadda waa qayb ka mid ah iimaanka.</h2>
          <p className="text-emerald-50 text-sm opacity-90">Degmadaada oo nadiif ah waa caafimaadka qoyskaaga. Nagala qayb qaado ololaha nadaafadda ee Axad kasta.</p>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
      </div>

      <h3 className="text-lg font-bold text-slate-800 px-2 flex items-center justify-between">
        <span>Waxqabadka Muuqda</span>
        <span className="text-xs text-emerald-600 font-bold">Arag Dhamaantood</span>
      </h3>

      <div className="space-y-8">
        {awarenessItems.map((item) => (
          <AwarenessCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

const AwarenessCard: React.FC<{ item: HomePost }> = ({ item }) => {
  const [sliderPos, setSliderPos] = useState(50);

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPos(parseInt(e.target.value));
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 p-4">
      <div className="mb-4">
        <h4 className="font-bold text-slate-800">{item.title}</h4>
        <p className="text-xs text-slate-500 mb-2">{item.date}</p>
        <p className="text-sm text-slate-600">{item.description}</p>
      </div>

      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden group">
        {/* After Image (Background) */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${item.afterImg})` }}
        />
        {/* Before Image (Overlay) */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${item.beforeImg})`,
            clipPath: `inset(0 ${100 - sliderPos}% 0 0)`
          }}
        />

        {/* Labels */}
        <div className="absolute top-4 left-4 bg-black/40 text-white text-[10px] px-2 py-1 rounded font-bold backdrop-blur-sm">BEFORE</div>
        <div className="absolute top-4 right-4 bg-emerald-500/80 text-white text-[10px] px-2 py-1 rounded font-bold backdrop-blur-sm">AFTER</div>

        {/* Divider line */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg pointer-events-none z-20"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-2xl border-2 border-emerald-500">
            <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 7l-4 4m0 0l4 4m-4-4h16m0 0l-4-4m4 4l-4 4" />
            </svg>
          </div>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          value={sliderPos}
          onChange={handleSlider}
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
        />
      </div>
    </div>
  );
};
