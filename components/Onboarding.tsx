
import React, { useState } from 'react';
import { District, User } from '../types';
import { useData } from '../context/DataContext';

interface OnboardingProps {
  onComplete: (user: Partial<User>) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const { districts } = useData();
  const [step, setStep] = useState<'landing' | 'district' | 'details'>('landing');
  const [district, setDistrict] = useState<District | null>(null);
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [bio, setBio] = useState('');

  // Validation Logic
  const isNameValid = name.trim().split(/\s+/).length >= 2;
  const isPhoneValid = whatsapp.replace(/[^0-9]/g, '').length >= 8;

  const handleFinish = () => {
    if (isNameValid && isPhoneValid && district) {
      const generatedId = Math.floor(10000 + Math.random() * 90000).toString();
      
      onComplete({
        id: generatedId,
        name,
        whatsapp,
        bio,
        district,
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-100 rounded-full blur-[120px] opacity-60 animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-60"></div>

      <div className="w-full max-w-xl z-10 px-6 py-12">
        
        {step === 'landing' && (
          <div className="text-center space-y-8 animate-fadeIn">
            <div className="inline-block p-4 bg-emerald-600 rounded-3xl shadow-2xl shadow-emerald-200 mb-4 transform hover:rotate-3 transition-transform">
              <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Nadiifi, <span className="text-emerald-600">Qurxi Dalkaaga.</span>
              </h1>
              <p className="text-lg text-slate-500 max-w-md mx-auto leading-relaxed">
                Ku soo dhawaada DIS — Madal isku xirta muwaadiniinta u taagan qurxinta iyo horumarinta degmooyinka caasimadda.
              </p>
            </div>

            <div className="pt-8 flex flex-col gap-4">
              <button
                onClick={() => setStep('district')}
                className="group relative bg-emerald-600 text-white py-5 px-8 rounded-2xl font-bold text-lg shadow-xl shadow-emerald-200 hover:bg-emerald-700 hover:scale-[1.02] active:scale-95 transition-all overflow-hidden"
              >
                <span className="relative z-10">Ku biir</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </button>
            </div>
          </div>
        )}

        {step === 'district' && (
          <div className="animate-slideUp space-y-8">
            <div className="text-center">
              <button 
                onClick={() => setStep('landing')}
                className="text-emerald-600 font-bold text-sm mb-4 inline-flex items-center gap-2 hover:gap-3 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Dib u noqo
              </button>
              <h2 className="text-3xl font-black text-slate-900">Xagee degan tahay?</h2>
              <p className="text-slate-500 mt-2">Dooro degmadaada si aad ula xiriirto dadka kula degan.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 max-h-[50vh] overflow-y-auto pr-2">
              {districts.map((d) => (
                <button
                  key={d}
                  onClick={() => setDistrict(d)}
                  className={`relative p-6 rounded-3xl border-2 text-left transition-all flex items-center gap-5 group ${
                    district === d 
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-inner' 
                      : 'border-slate-100 bg-white hover:border-emerald-200 hover:shadow-lg'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                    district === d ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600'
                  }`}>
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <span className={`block text-xl font-bold ${district === d ? 'text-emerald-800' : 'text-slate-700'}`}>{d}</span>
                  </div>
                  {district === d && (
                    <div className="bg-emerald-600 rounded-full p-1.5 shadow-lg">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>

            <button
              disabled={!district}
              onClick={() => setStep('details')}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold text-lg shadow-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group"
            >
              Horey u soco
            </button>
          </div>
        )}

        {step === 'details' && (
          <div className="animate-slideUp space-y-8 bg-white p-10 rounded-[40px] shadow-2xl border border-slate-50">
            <div className="text-center">
              <h2 className="text-3xl font-black text-slate-900">Ku Dhawaad...</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Magacaaga oo buuxa</label>
                  {!isNameValid && name.length > 0 && (
                    <span className="text-[10px] font-bold text-red-500 animate-pulse">Gali magacaga oo dhameystiran</span>
                  )}
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full p-5 bg-slate-50 rounded-2xl border-2 outline-none transition-all text-slate-800 font-semibold ${
                    !isNameValid && name.length > 0 
                    ? 'border-red-300 focus:border-red-500 bg-red-50' 
                    : 'border-transparent focus:border-emerald-500 focus:bg-white'
                  }`}
                  placeholder="Tusaale: Maxamed Cali"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-black uppercase text-slate-400 tracking-widest">WhatsApp Number</label>
                  {!isPhoneValid && whatsapp.length > 0 && (
                    <span className="text-[10px] font-bold text-red-500 animate-pulse">Number sax ah gali</span>
                  )}
                </div>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className={`w-full p-5 bg-slate-50 rounded-2xl border-2 outline-none transition-all text-slate-800 font-semibold ${
                    !isPhoneValid && whatsapp.length > 0 
                    ? 'border-red-300 focus:border-red-500 bg-red-50' 
                    : 'border-transparent focus:border-emerald-500 focus:bg-white'
                  }`}
                  placeholder="+252 61XXXXXXX"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Kusaabsan (Bio)</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none transition-all text-slate-800 font-medium h-28 resize-none"
                  placeholder="Maxaad ka caawin kartaa horumarka degmadaada?"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={() => setStep('district')}
                className="flex-1 py-5 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 transition-colors"
              >
                Dib u noqo
              </button>
              <button
                disabled={!isNameValid || !isPhoneValid}
                onClick={handleFinish}
                className="flex-[2] bg-emerald-600 text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-emerald-100 hover:bg-emerald-700 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none"
              >
                Finish & Enter
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slideUp {
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
