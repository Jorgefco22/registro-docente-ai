import React, { useState, useEffect } from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  Database,
  Check,
  RefreshCw,
  AlertTriangle,
  Sparkles,
  Cloud,
  LogOut,
  Settings as SettingsIcon
} from 'lucide-react';
import { Modal } from '../components/Modal';
import { useApp } from '../context/AppContext';
import { supabase, setSupabaseConfig, clearSupabaseConfig } from '../lib/supabase';

export const Settings: React.FC = () => {
  const { 
    geminiApiKey, 
    setGeminiApiKey,
    user,
    logout,
    isSyncing,
    isSupabaseActive,
    syncDataFromCloud
  } = useApp();
  
  const [name, setName] = useState('Mario Reyes');
  const [email, setEmail] = useState('mario.reyes@docente.sep.gob.mx');
  const [school, setSchool] = useState('Secundaria Técnica 14');
  
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [riskAlerts, setRiskAlerts] = useState(true);
  
  const [saveStatus, setSaveStatus] = useState(false);
  const [aiSaveStatus, setAiSaveStatus] = useState(false);
  const [localApiKey, setLocalApiKey] = useState(geminiApiKey);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Cloud Config states
  const [showCloudConfig, setShowCloudConfig] = useState(false);
  const [cloudUrl, setCloudUrl] = useState(() => localStorage.getItem('rd_supabase_url') || '');
  const [cloudAnonKey, setCloudAnonKey] = useState(() => localStorage.getItem('rd_supabase_anon_key') || '');
  const [cloudSaveSuccess, setCloudSaveSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.name || '');
      setEmail(user.email || '');
      setSchool(user.user_metadata?.school || '');
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus(true);
    
    if (user && isSupabaseActive) {
      try {
        // Update user metadata in Auth
        await supabase.auth.updateUser({
          data: { name, school }
        });
        // Update profile in profiles table
        await supabase.from('profiles').update({ name, school }).eq('id', user.id);
      } catch (err) {
        console.error('Error al guardar perfil en la nube:', err);
      }
    }
    setTimeout(() => setSaveStatus(false), 2500);
  };

  const handleSaveApiKey = () => {
    setGeminiApiKey(localApiKey.trim());
    setAiSaveStatus(true);
    setTimeout(() => setAiSaveStatus(false), 2500);
  };

  const handleSaveCloudConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cloudUrl || !cloudAnonKey) return;
    
    setSupabaseConfig(cloudUrl.trim(), cloudAnonKey.trim());
    setCloudSaveSuccess(true);
    setTimeout(() => {
      setCloudSaveSuccess(false);
      setShowCloudConfig(false);
      window.location.reload();
    }, 1500);
  };

  const handleDisconnectCloud = async () => {
    await logout();
    clearSupabaseConfig();
    window.location.reload();
  };

  const handleRestoreDatabase = () => {
    localStorage.clear();
    setIsResetConfirmOpen(false);
    window.location.reload();
  };

  const handleDownloadBackup = () => {
    const backupData: { [key: string]: string | null } = {};
    const keys = ['rd_groups', 'rd_students', 'rd_attendance', 'rd_categories', 'rd_columns', 'rd_grades', 'rd_lesson_plans'];
    
    keys.forEach(k => {
      backupData[k] = localStorage.getItem(k);
    });

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "RegistroDocenteAI_backup.json");
    dlAnchorElem.click();
  };

  return (
    <div className="view-container">
      {/* Header */}
      <div className="view-header">
        <div>
          <span className="view-pretitle">Personalización</span>
          <h1 className="view-title">Configuración del Sistema</h1>
        </div>
      </div>

      <div className="settings-layout-grid">
        {/* Main forms Column */}
        <div className="settings-forms-col">
          {/* Profile Card */}
          <div className="glass-card settings-card">
            <div className="settings-card-header">
              <User size={18} className="text-primary" />
              <h3>Perfil del Docente</h3>
            </div>

            <form onSubmit={handleSaveProfile} className="form-group-flex">
              {saveStatus && (
                <div className="form-success-banner">
                  <Check size={16} />
                  <span>Perfil docente actualizado correctamente en la base local.</span>
                </div>
              )}

              <div className="form-row-grid">
                <div className="form-field">
                  <label>Nombre Completo</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Correo Institucional</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Centro de Trabajo / Escuela</label>
                <input
                  type="text"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
                <span>Guardar Cambios</span>
              </button>
            </form>
          </div>

          {/* Gemini AI Card */}
          <div className="glass-card settings-card" style={{ borderLeft: '4px solid #8e2de2' }}>
            <div className="settings-card-header">
              <Sparkles size={18} style={{ color: '#8e2de2' }} />
              <h3>Asistente de Inteligencia Artificial (Gemini AI)</h3>
            </div>

            <div className="form-group-flex">
              {aiSaveStatus && (
                <div className="form-success-banner" style={{ borderLeft: '4px solid #34c759', backgroundColor: 'rgba(52, 199, 89, 0.1)', color: 'var(--color-text)' }}>
                  <Check size={16} style={{ color: '#34c759' }} />
                  <span>Clave API de Gemini guardada de forma segura en tu navegador.</span>
                </div>
              )}

              <p className="settings-aside-desc" style={{ marginBottom: '12px' }}>
                Registro Docente AI integra <strong>Google Gemini 1.5 Flash</strong> para redactar y mejorar planeaciones pedagógicas de forma instantánea. 
                Para habilitar la IA en tiempo real, ingresa tu propia clave API personal. Tus datos se procesan localmente y nunca se comparten con terceros.
              </p>

              <div className="settings-tip-card" style={{ padding: '16px', gap: '12px', background: 'rgba(142, 45, 226, 0.05)', border: '1px dashed rgba(142, 45, 226, 0.2)' }}>
                <Sparkles className="tip-icon" style={{ color: '#8e2de2' }} />
                <div className="tip-content">
                  <h4 style={{ fontSize: '0.85rem', color: '#8e2de2', margin: '0 0 4px 0' }}>¿Cómo obtener una clave API gratis?</h4>
                  <ol style={{ fontSize: '0.75rem', paddingLeft: '16px', margin: '6px 0 0 0', lineHeight: '1.4', color: 'var(--color-text-secondary)' }}>
                    <li>Ve a <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#0071e3', textDecoration: 'underline', fontWeight: '500' }}>Google AI Studio</a> e inicia sesión con tu cuenta de Google.</li>
                    <li>Haz clic en el botón azul <strong>"Get API key"</strong> en la esquina superior izquierda.</li>
                    <li>Crea una nueva clave de API (Create API key) y cópiala.</li>
                    <li>Pégala en el campo de abajo y presiona Guardar.</li>
                  </ol>
                </div>
              </div>

              <div className="form-field" style={{ marginTop: '12px' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Clave API de Gemini</span>
                  {geminiApiKey && (
                    <span style={{ color: '#34c759', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                      <Check size={12} /> Conectado (Activa)
                    </span>
                  )}
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type="password"
                    value={localApiKey}
                    onChange={(e) => setLocalApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    style={{ 
                      paddingRight: '60px',
                      fontFamily: localApiKey ? 'monospace' : 'inherit',
                      letterSpacing: localApiKey ? '0.12em' : 'normal'
                    }}
                  />
                  {localApiKey && (
                    <button
                      type="button"
                      onClick={() => setLocalApiKey('')}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-text-tertiary)',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}
                    >
                      Limpiar
                    </button>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                <button 
                  type="button" 
                  onClick={handleSaveApiKey} 
                  className="btn btn-primary"
                  style={{ background: 'linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%)', borderColor: 'transparent' }}
                >
                  <span>Guardar Clave API</span>
                </button>
                {geminiApiKey && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setLocalApiKey('');
                      setGeminiApiKey('');
                      setAiSaveStatus(true);
                      setTimeout(() => setAiSaveStatus(false), 2000);
                    }} 
                    className="btn btn-secondary"
                  >
                    <span>Desconectar IA</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Notifications Card */}
          <div className="glass-card settings-card">
            <div className="settings-card-header">
              <Bell size={18} className="text-warning" />
              <h3>Notificaciones y Avisos</h3>
            </div>

            <div className="settings-options-list">
              <label className="checkbox-option-item">
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                />
                <div className="opt-details">
                  <h4>Enviar notificaciones por correo electrónico</h4>
                  <p>Informa a los alumnos y tutores de las tareas programadas y calificaciones.</p>
                </div>
              </label>

              <label className="checkbox-option-item">
                <input
                  type="checkbox"
                  checked={riskAlerts}
                  onChange={(e) => setRiskAlerts(e.target.checked)}
                />
                <div className="opt-details">
                  <h4>Alertas automáticas de alumnos en riesgo</h4>
                  <p>Habilita la detección inteligente y resúmenes estadísticos en el Dashboard.</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Database & backup Column */}
        <aside className="settings-side-col">
          {/* Cloud Database Integration (Supabase) */}
          <div className="glass-card settings-card" style={{ borderLeft: '4px solid #0071e3', marginBottom: '20px' }}>
            <div className="settings-card-header">
              <Cloud size={18} style={{ color: '#0071e3' }} />
              <h3>Conexión Cloud (Supabase)</h3>
            </div>

            {isSupabaseActive ? (
              <div className="form-group-flex">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div className="status-indicator-dot online"></div>
                  <span style={{ fontSize: '0.82rem', fontWeight: '600', color: '#34c759' }}>Conectado a la Nube</span>
                </div>

                {user && (
                  <div className="cloud-profile-summary" style={{ fontSize: '0.8rem', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Usuario: <strong>{user.email}</strong></span>
                    {user.user_metadata?.school && (
                      <span style={{ color: 'var(--color-text-tertiary)', fontSize: '0.72rem' }}>Escuela: {user.user_metadata.school}</span>
                    )}
                  </div>
                )}

                <div className="settings-buttons-vertical" style={{ gap: '10px', marginTop: '8px' }}>
                  <button 
                    onClick={syncDataFromCloud} 
                    className="btn btn-secondary btn-full"
                    disabled={isSyncing}
                    style={{ gap: '8px' }}
                  >
                    <RefreshCw size={14} className={isSyncing ? 'spin-animation' : ''} />
                    <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar con la Nube'}</span>
                  </button>

                  <button 
                    onClick={handleDisconnectCloud} 
                    className="btn btn-danger-outlined btn-full"
                    style={{ gap: '8px', border: '1px solid rgba(255, 69, 58, 0.3)', background: 'rgba(255, 69, 58, 0.05)', color: '#ff453a', height: '38px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '0.85rem' }}
                  >
                    <LogOut size={14} />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="form-group-flex">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div className="status-indicator-dot offline"></div>
                  <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Modo Local Activo</span>
                </div>

                <p className="settings-aside-desc" style={{ fontSize: '0.75rem', lineHeight: '1.4', margin: '0 0 12px 0' }}>
                  Conecta tu proyecto privado de Supabase para sincronizar tus calificaciones en la nube y habilitar el login obligatorio de seguridad.
                </p>

                {showCloudConfig ? (
                  <form onSubmit={handleSaveCloudConfig} style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                    {cloudSaveSuccess && (
                      <div className="form-success-banner" style={{ margin: '0 0 8px 0' }}>
                        <span>¡Credenciales guardadas con éxito! Reiniciando...</span>
                      </div>
                    )}
                    
                    <div className="form-field" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.75rem' }}>URL de Supabase</label>
                      <input
                        type="url"
                        value={cloudUrl}
                        onChange={(e) => setCloudUrl(e.target.value)}
                        placeholder="https://xxxxxx.supabase.co"
                        required
                        style={{ fontSize: '0.8rem', padding: '8px 12px' }}
                      />
                    </div>

                    <div className="form-field" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.75rem' }}>Anon Key (Clave Pública)</label>
                      <input
                        type="password"
                        value={cloudAnonKey}
                        onChange={(e) => setCloudAnonKey(e.target.value)}
                        placeholder="eyJhbGciOiJIUzI1Ni..."
                        required
                        style={{ fontSize: '0.8rem', padding: '8px 12px' }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <button type="submit" className="btn btn-primary" style={{ flexGrow: 1, height: '36px', fontSize: '0.8rem', padding: 0 }}>
                        Conectar
                      </button>
                      <button type="button" onClick={() => setShowCloudConfig(false)} className="btn btn-secondary" style={{ flexGrow: 1, height: '36px', fontSize: '0.8rem', padding: 0 }}>
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  <button 
                    onClick={() => setShowCloudConfig(true)} 
                    className="btn btn-primary btn-full"
                    style={{ background: 'linear-gradient(135deg, #0071e3 0%, #00c6ff 100%)', borderColor: 'transparent' }}
                  >
                    <SettingsIcon size={14} style={{ marginRight: '6px' }} />
                    <span>Conectar Supabase</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Database & backup Card */}
          <div className="glass-card settings-card danger-section">
            <div className="settings-card-header">
              <Database size={18} className="text-danger" />
              <h3>Base de Datos y Respaldo</h3>
            </div>
            
            <p className="settings-aside-desc">
              {isSupabaseActive 
                ? 'Tus datos se encuentran respaldados en Supabase, pero puedes descargar una copia local JSON o borrar las configuraciones locales.' 
                : 'Toda la información académica de este MVP se almacena de forma segura en tu navegador local (localStorage).'}
            </p>

            <div className="settings-buttons-vertical">
              <button 
                onClick={handleDownloadBackup}
                className="btn btn-secondary btn-full"
              >
                <span>Exportar Respaldo (JSON)</span>
              </button>

              <div className="danger-divider"></div>

              <button 
                onClick={() => setIsResetConfirmOpen(true)}
                className="btn btn-danger btn-full"
              >
                <RefreshCw size={14} />
                <span>Restablecer Datos Demo</span>
              </button>
            </div>
          </div>

          {/* Privacy Security Tips */}
          <div className="settings-tip-card">
            <Shield className="tip-icon" />
            <div className="tip-content">
              <h4>Seguridad de Datos</h4>
              <p>El sistema cuenta con cifrado en tránsito y seguridad a nivel de filas (RLS) en Supabase para evitar accesos no autorizados.</p>
            </div>
          </div>
        </aside>
      </div>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={isResetConfirmOpen}
        title="¿Restablecer Datos del Sistema?"
        onClose={() => setIsResetConfirmOpen(false)}
      >
        <div className="confirm-modal-content">
          <AlertTriangle size={48} className="danger-icon" />
          <p>¿Estás seguro de que deseas borrar los cambios realizados?</p>
          <p className="subtext">
            Esta acción limpiará todo el almacenamiento local y restablecerá la base de datos inicial con los grupos y alumnos demo provistos de origen.
          </p>

          <div className="modal-buttons-row" style={{ marginTop: '24px' }}>
            <button onClick={() => setIsResetConfirmOpen(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button onClick={handleRestoreDatabase} className="btn btn-danger">
              Sí, Restablecer
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
