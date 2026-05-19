import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigation } from '../context/NavigationContext';
import { 
  Lock, 
  Mail, 
  Sparkles, 
  Cloud, 
  Database,
  ArrowRight,
  AlertCircle,
  Settings
} from 'lucide-react';
import { setSupabaseConfig } from '../lib/supabase';

interface LoginProps {
  onToggleView: () => void;
}

export const Login: React.FC<LoginProps> = ({ onToggleView }) => {
  const { login, isSyncing, isSupabaseActive } = useApp();
  const { navigateTo } = useNavigation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Custom setup states if Supabase is not configured yet
  const [showConfig, setShowConfig] = useState(!isSupabaseActive);
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [configSuccess, setConfigSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setError(null);
    const { error: loginError } = await login(email, password);
    
    if (loginError) {
      setError(loginError.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } else {
      navigateTo('dashboard');
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrl || !supabaseAnonKey) {
      setError('Por favor completa ambos campos para conectar Supabase.');
      return;
    }
    
    try {
      setSupabaseConfig(supabaseUrl, supabaseAnonKey);
      setConfigSuccess(true);
      setError(null);
      setTimeout(() => {
        setShowConfig(false);
        setConfigSuccess(false);
      }, 1500);
    } catch (err) {
      setError('Error al inicializar la base de datos. Verifica la URL.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-backdrop-gradients">
        <div className="gradient-blob g-purple"></div>
        <div className="gradient-blob g-blue"></div>
      </div>

      <div className="glass-card auth-card">
        {/* Logo and Brand Header */}
        <div className="auth-header">
          <div className="auth-logo-badge">
            <Sparkles size={24} className="text-purple-glow" />
            <Cloud size={16} className="cloud-overlap" />
          </div>
          <h1 className="auth-title">Registro Docente AI</h1>
          <p className="auth-subtitle">Gestión escolar premium de calificaciones y planeación didáctica</p>
        </div>

        {error && (
          <div className="form-error-banner" style={{ margin: '0 0 20px 0' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {configSuccess && (
          <div className="form-success-banner" style={{ margin: '0 0 20px 0', borderLeft: '4px solid #34c759', backgroundColor: 'rgba(52, 199, 89, 0.1)', color: '#34c759' }}>
            <span>¡Nube conectada! Redireccionando al inicio de sesión...</span>
          </div>
        )}

        {showConfig ? (
          /* CONFIGURATION VIEW: If Supabase not set up in .env or Settings */
          <form onSubmit={handleSaveConfig} className="form-group-flex">
            <div className="auth-section-title">
              <Database size={16} />
              <h3>Conectar tu Base de Datos Cloud (Supabase)</h3>
            </div>
            
            <p className="auth-desc-text">
              Para garantizar privacidad y control total de tus datos, Registro Docente AI funciona sobre tu propio backend de Supabase.
            </p>

            <div className="form-field">
              <label>URL del Proyecto Supabase</label>
              <input
                type="url"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://xxxxxx.supabase.co"
                required
                className="auth-input"
              />
            </div>

            <div className="form-field">
              <label>Clave Anónima (Anon Key)</label>
              <input
                type="password"
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                required
                className="auth-input"
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-full auth-btn"
              style={{ background: 'linear-gradient(135deg, #0071e3 0%, #00c6ff 100%)', borderColor: 'transparent', marginTop: '10px' }}
            >
              <span>Conectar Base de Datos</span>
              <ArrowRight size={16} />
            </button>

            {isSupabaseActive && (
              <button 
                type="button" 
                onClick={() => setShowConfig(false)}
                className="btn btn-secondary btn-full auth-btn-secondary"
                style={{ marginTop: '6px' }}
              >
                <span>Volver al Inicio de Sesión</span>
              </button>
            )}
          </form>
        ) : (
          /* REGULAR LOGIN FORM */
          <form onSubmit={handleSubmit} className="form-group-flex">
            <div className="auth-section-title">
              <Lock size={16} />
              <h3>Iniciar Sesión Obligatorio</h3>
            </div>

            <div className="form-field">
              <label>Correo Electrónico</label>
              <div className="auth-input-wrapper">
                <Mail size={16} className="auth-input-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mario.reyes@docente.sep.gob.mx"
                  required
                  className="auth-input input-with-icon"
                  disabled={isSyncing}
                />
              </div>
            </div>

            <div className="form-field">
              <label>Contraseña</label>
              <div className="auth-input-wrapper">
                <Lock size={16} className="auth-input-icon" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="auth-input input-with-icon"
                  disabled={isSyncing}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-full auth-btn"
              style={{ background: 'linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%)', borderColor: 'transparent', marginTop: '10px' }}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="auth-spinner"></div>
                  <span>Autenticando y Sincronizando...</span>
                </div>
              ) : (
                <>
                  <span>Iniciar Sesión</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <div className="auth-footer-links">
              <button 
                type="button" 
                onClick={onToggleView} 
                className="auth-link-btn"
                disabled={isSyncing}
              >
                ¿No tienes cuenta? <strong>Regístrate aquí</strong>
              </button>
              
              <button 
                type="button" 
                onClick={() => setShowConfig(true)} 
                className="auth-link-btn text-secondary"
                style={{ marginTop: '12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}
                disabled={isSyncing}
              >
                <Settings size={12} /> Configuración de Base de Datos
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
