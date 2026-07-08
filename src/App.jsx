import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthPage from './components/auth/AuthPage';
import AppLayout from './components/layout/AppLayout';
import HousingHub from './components/modules/HousingHub';
import Marketplace from './components/modules/Marketplace';
import TeamUp from './components/modules/TeamUp';
import CareerBoard from './components/modules/CareerBoard';
import Resources from './components/modules/Resources';

function AppContent() {
  const { user, loading } = useAuth();
  const [activeModule, setActiveModule] = useState('housing');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center animate-fade-in">
          <div className="w-12 h-12 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Loading CampusConnect...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  function renderModule() {
    switch (activeModule) {
      case 'housing':
        return <HousingHub />;
      case 'marketplace':
        return <Marketplace />;
      case 'teamup':
        return <TeamUp />;
      case 'career':
        return <CareerBoard />;
      case 'resources':
        return <Resources />;
      default:
        return <HousingHub />;
    }
  }

  return (
    <AppLayout activeModule={activeModule} onNavigate={setActiveModule}>
      {renderModule()}
    </AppLayout>
  );
}

import { ThemeProvider } from './contexts/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
