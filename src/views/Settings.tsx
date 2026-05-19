import React, { useState } from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  Database,
  Check,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { Modal } from '../components/Modal';

export const Settings: React.FC = () => {
  const [name, setName] = useState('Mario Reyes');
  const [email, setEmail] = useState('mario.reyes@docente.sep.gob.mx');
  const [school, setSchool] = useState('Secundaria Técnica 14');
  
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [riskAlerts, setRiskAlerts] = useState(true);
  
  const [saveStatus, setSaveStatus] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus(true);
    setTimeout(() => setSaveStatus(false), 2500);
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
          <div className="glass-card settings-card danger-section">
            <div className="settings-card-header">
              <Database size={18} className="text-danger" />
              <h3>Base de Datos y Respaldo</h3>
            </div>
            
            <p className="settings-aside-desc">
              Toda la información académica de este MVP se almacena de forma segura en tu navegador local (localStorage).
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
              <h4>Seguridad Local</h4>
              <p>Este sistema está diseñado para cumplir con las normas de privacidad del alumnado. Ninguna información escolar es compartida con servidores externos sin tu consentimiento expreso.</p>
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
