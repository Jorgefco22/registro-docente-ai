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
  Sparkles,
  LogOut
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { currentView, navigateTo } = useNavigation();
  const { getStudentsInRisk, user, isSupabaseActive, logout } = useApp();
  
  const riskCount = getStudentsInRisk().length;

  const userName = user?.user_metadata?.name || 'Prof. Docente';
  const userInitial = userName.charAt(0).toUpperCase() || 'D';
  const schoolName = user?.user_metadata?.school || 'Modo Demo/Local';

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
      <div className="sidebar-user-card" style={{ position: 'relative' }}>
        <div className="user-avatar">{userInitial}</div>
        <div className="user-info" style={{ flexGrow: 1, marginRight: '24px' }}>
          <h4 style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '140px' }}>{userName}</h4>
          <p style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '140px' }}>{schoolName}</p>
        </div>
        {isSupabaseActive && user && (
          <button 
            onClick={logout} 
            title="Cerrar Sesión" 
            style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', color: 'var(--color-text-tertiary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#ff453a'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-tertiary)'}
          >
            <LogOut size={16} />
          </button>
        )}
      </div>

      {/* Cloud Status Badge */}
      <div className="connection-status-container" style={{ padding: '0 16px', margin: '8px 0 16px 0' }}>
        {isSupabaseActive ? (
          <div className="status-badge cloud-active" style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(52, 199, 89, 0.1)', color: '#34c759', padding: '6px 12px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '700', border: '1px solid rgba(52, 199, 89, 0.2)' }}>
            <div className="status-indicator-dot online" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#34c759', boxShadow: '0 0 8px #34c759' }}></div>
            <span>☁️ NUBE ACTIVA</span>
          </div>
        ) : (
          <div className="status-badge local-active" style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(142, 142, 147, 0.1)', color: '#8e8e93', padding: '6px 12px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '700', border: '1px solid rgba(142, 142, 147, 0.2)' }}>
            <div className="status-indicator-dot offline" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#8e8e93' }}></div>
            <span>💾 MODO LOCAL</span>
          </div>
        )}
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

