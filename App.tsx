
import React, { useState, useEffect } from 'react';
import { Onboarding } from './components/Onboarding';
import { MainLayout } from './components/Layout';
import { DataProvider, useData } from './context/DataContext';
import { AdminDashboard } from './components/AdminDashboard';
import { User } from './types';

const AppContent: React.FC = () => {
  const { currentUser, registerUser, logout } = useData();
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

  if (isAdminRoute) {
    return <AdminDashboard />;
  }

  if (!currentUser) {
    return <Onboarding onComplete={registerUser} />;
  }

  return (
    <MainLayout
      user={currentUser}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      activeChannel={activeChannel}
      setActiveChannel={setActiveChannel}
      onLogout={logout}
    />
  );
};

const App: React.FC = () => {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
};

export default App;
