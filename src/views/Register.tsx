import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigation } from '../context/NavigationContext';
import { 
  User, 
  Mail, 
  Lock, 
  Sparkles, 
  Cloud,
  ArrowRight,
  AlertCircle,
  Building
} from 'lucide-react';

interface RegisterProps {
  onToggleView: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onToggleView }) => {
  const { register, isSyncing } = useApp();
  const { navigateTo } = useNavigation();
  
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !school || !email || !password || !confirmPassword) {
      setError('Por favor, completa todos los campos.');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    
    setError(null);
    const { error: regError } = await register(email, password, name, school);
    
    if (regError) {
      setError(regError.message || 'Error al registrar usuario. Intenta de nuevo.');
    } else {
      navigateTo('dashboard');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-backdrop-gradients">
        <div className="gradient-blob g-purple"></div>
        <div className="gradient-blob g-blue"></div>
      </div>

      <div className="glass-card auth-card">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo-badge">
            <Sparkles size={24} className="text-purple-glow" />
            <Cloud size={16} className="cloud-overlap" />
          </div>
          <h1 className="auth-title">Crear Cuenta</h1>
          <p className="auth-subtitle">Registra tu perfil docente y sincroniza tu trabajo escolar en la nube</p>
        </div>

        {error && (
          <div className="form-error-banner" style={{ margin: '0 0 20px 0' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-group-flex">
          <div className="form-field">
            <label>Nombre Completo</label>
            <div className="auth-input-wrapper">
              <User size={16} className="auth-input-icon" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Mario Reyes"
                required
                className="auth-input input-with-icon"
                disabled={isSyncing}
              />
            </div>
          </div>

          <div className="form-field">
            <label>Centro de Trabajo / Escuela</label>
            <div className="auth-input-wrapper">
              <Building size={16} className="auth-input-icon" />
              <input
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="Ej. Secundaria Técnica 14"
                required
                className="auth-input input-with-icon"
                disabled={isSyncing}
              />
            </div>
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

          <div className="form-row-grid" style={{ gap: '12px' }}>
            <div className="form-field">
              <label>Contraseña</label>
              <div className="auth-input-wrapper">
                <Lock size={16} className="auth-input-icon" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mín. 6 caract."
                  required
                  className="auth-input input-with-icon"
                  disabled={isSyncing}
                />
              </div>
            </div>

            <div className="form-field">
              <label>Confirmar</label>
              <div className="auth-input-wrapper">
                <Lock size={16} className="auth-input-icon" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="auth-input input-with-icon"
                  disabled={isSyncing}
                />
              </div>
            </div>
          </div>

          <div className="sync-notice-box">
            <Cloud size={16} className="text-primary" />
            <p>Se subirán y fusionarán automáticamente los alumnos y planeaciones creados localmente a tu cuenta.</p>
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
                <span>Creando Cuenta y Sincronizando...</span>
              </div>
            ) : (
              <>
                <span>Registrarme y Sincronizar</span>
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
              ¿Ya tienes cuenta? <strong>Inicia sesión aquí</strong>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
