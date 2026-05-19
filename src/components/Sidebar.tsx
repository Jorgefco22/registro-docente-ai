import React from 'react';
import { useNavigation } from '../context/NavigationContext';
import type { ViewType } from '../context/NavigationContext';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  MessageSquare, 
  Settings, 
  Bell,
  Sparkles
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { currentView, navigateTo } = useNavigation();
  const { getStudentsInRisk } = useApp();
  
  const riskCount = getStudentsInRisk().length;

  const menuItems = [
    { view: 'dashboard' as ViewType, label: 'Inicio', icon: LayoutDashboard },
    { view: 'groups' as ViewType, label: 'Grupos', icon: Users },
    { view: 'planning' as ViewType, label: 'Planeaciones', icon: BookOpen },
    { view: 'messages' as ViewType, label: 'Mensajería', icon: MessageSquare },
    { view: 'settings' as ViewType, label: 'Configuración', icon: Settings },
  ];

  return (
    <aside className="sidebar-container no-print">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-logo">
          <Sparkles className="logo-spark" />
        </div>
        <div className="brand-details">
          <h3>Docente AI</h3>
          <span>Registro Inteligente</span>
        </div>
      </div>

      {/* User Stats Card */}
      <div className="sidebar-user-card">
        <div className="user-avatar">M</div>
        <div className="user-info">
          <h4>Prof. Mario Reyes</h4>
          <p>Secundaria Técnica 14</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.view || 
              (item.view === 'groups' && currentView === 'group-detail') ||
              (item.view === 'planning' && currentView === 'ai-planner');

            return (
              <li key={item.view}>
                <button
                  onClick={() => navigateTo(item.view)}
                  className={`nav-link-btn ${isActive ? 'active' : ''}`}
                >
                  <Icon className="nav-icon" />
                  <span className="nav-label">{item.label}</span>
                  {item.view === 'dashboard' && riskCount > 0 && (
                    <span className="nav-badge">{riskCount}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer / App status */}
      <div className="sidebar-footer">
        <Bell className="footer-bell" />
        <span>Versión MVP v1.0.0</span>
      </div>
    </aside>
  );
};
