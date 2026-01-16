
import React, { useState, useEffect } from 'react';
import { Onboarding } from './components/Onboarding';
import { MainLayout } from './components/Layout';
import { DataProvider, useData } from './context/DataContext';
import { AdminDashboard } from './components/AdminDashboard';

const AppContent: React.FC = () => {
  const { currentUser, registerUser, logout, toasts, removeToast, updateLastActive } = useData();
  const [activeTab, setActiveTab] = useState<'home' | 'chat' | 'videos' | 'profile'>('home');
  const [activeChannel, setActiveChannel] = useState<string>('main');
  const [isAdminRoute, setIsAdminRoute] = useState(false);

  useEffect(() => {
    const checkHash = () => {
      setIsAdminRoute(window.location.hash === '#adminlp');
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  // Heartbeat for online status
  useEffect(() => {
    if (currentUser) {
      updateLastActive(); // Initial
      const interval = setInterval(() => {
        updateLastActive();
      }, 60000); // Update every minute
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  if (isAdminRoute) {
    return (
        <>
            <AdminDashboard />
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </>
    );
  }

  if (!currentUser) {
    return (
        <>
            <Onboarding onComplete={registerUser} />
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </>
    );
  }

  return (
    <>
      <MainLayout
        user={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeChannel={activeChannel}
        setActiveChannel={setActiveChannel}
        onLogout={logout}
      />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
};

const ToastContainer: React.FC<{ toasts: any[], removeToast: (id: string) => void }> = ({ toasts, removeToast }) => (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[10000] flex flex-col gap-2 w-[90%] max-w-sm pointer-events-none">
        {toasts.map(t => (
            <div 
                key={t.id} 
                className={`p-4 rounded-xl shadow-2xl flex items-center justify-between pointer-events-auto animate-slideDown ${
                    t.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-500 text-white'
                }`}
            >
                <span className="font-bold text-sm">{t.message}</span>
                <button onClick={() => removeToast(t.id)} className="p-1 hover:bg-white/20 rounded-full">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
        ))}
    </div>
);

const App: React.FC = () => {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
};

export default App;
