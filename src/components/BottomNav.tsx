import React from 'react';
import { useNavigation } from '../context/NavigationContext';
import type { ViewType } from '../context/NavigationContext';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  MessageSquare, 
  Settings 
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { currentView, navigateTo } = useNavigation();
  const { getStudentsInRisk } = useApp();
  
  const riskCount = getStudentsInRisk().length;

  const navItems = [
    { view: 'dashboard' as ViewType, label: 'Inicio', icon: LayoutDashboard },
    { view: 'groups' as ViewType, label: 'Grupos', icon: Users },
    { view: 'planning' as ViewType, label: 'Planeación', icon: BookOpen },
    { view: 'messages' as ViewType, label: 'Mensajes', icon: MessageSquare },
    { view: 'settings' as ViewType, label: 'Ajustes', icon: Settings },
  ];

  return (
    <nav className="bottom-nav-container no-print">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.view || 
          (item.view === 'groups' && currentView === 'group-detail') ||
          (item.view === 'planning' && currentView === 'ai-planner');

        return (
          <button
            key={item.view}
            onClick={() => navigateTo(item.view)}
            className={`bottom-nav-btn ${isActive ? 'active' : ''}`}
          >
            <div className="bottom-nav-icon-wrapper">
              <Icon className="bottom-nav-icon" />
              {item.view === 'dashboard' && riskCount > 0 && (
                <span className="bottom-nav-badge">{riskCount}</span>
              )}
            </div>
            <span className="bottom-nav-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
