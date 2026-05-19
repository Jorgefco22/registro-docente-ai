import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';

// Views
import { Dashboard } from './views/Dashboard';
import { Groups } from './views/Groups';
import { GroupDetail } from './views/GroupDetail';
import { Planning } from './views/Planning';
import { AIPlanner } from './views/AIPlanner';
import { Messages } from './views/Messages';
import { Settings } from './views/Settings';
import { Login } from './views/Login';
import { Register } from './views/Register';

const AppContent: React.FC = () => {
  const { currentView } = useNavigation();
  const { user, isSupabaseActive } = useApp();
  const [authScreen, setAuthScreen] = useState<'login' | 'register'>('login');

  // Login obligatorio: Si Supabase está activo pero no hay sesión iniciada
  if (isSupabaseActive && !user) {
    if (authScreen === 'login') {
      return <Login onToggleView={() => setAuthScreen('register')} />;
    } else {
      return <Register onToggleView={() => setAuthScreen('login')} />;
    }
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'groups':
        return <Groups />;
      case 'group-detail':
        return <GroupDetail />;
      case 'planning':
        return <Planning />;
      case 'ai-planner':
        return <AIPlanner />;
      case 'messages':
        return <Messages />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar navigation visible on desktop screen sizes */}
      <Sidebar />
      
      {/* Main content display container */}
      <main className="app-main-content">
        {renderView()}
      </main>

      {/* Floating navigation bar optimized for iOS and Android web views */}
      <BottomNav />
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <NavigationProvider>
        <AppContent />
      </NavigationProvider>
    </AppProvider>
  );
}

export default App;

