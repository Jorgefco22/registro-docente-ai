import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigation } from '../context/NavigationContext';
import { Modal } from '../components/Modal';
import { 
  Trash2, 
  Sparkles, 
  Clock, 
  FileText,
  AlertTriangle,
  UploadCloud,
  CheckCircle
} from 'lucide-react';

export const Planning: React.FC = () => {
  const { lessonPlans, deleteLessonPlan } = useApp();
  const { navigateTo } = useNavigation();

  const [deletePlanId, setDeletePlanId] = useState<string | null>(null);
  
  // Custom format upload state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [fileName, setFileName] = useState('');

  const getPlanTitleById = (id: string) => {
    return lessonPlans.find(p => p.id === id)?.title || 'Planeación';
  };

  const handleDelete = (id: string) => {
    deleteLessonPlan(id);
    setDeletePlanId(null);
  };

  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
      setUploadSuccess(true);
      setTimeout(() => {
        setUploadSuccess(false);
        setIsUploadOpen(false);
        setFileName('');
      }, 2000);
    }
  };

  return (
    <div className="view-container">
      {/* Header */}
      <div className="view-header">
        <div>
          <span className="view-pretitle">Preparación de Clases</span>
          <h1 className="view-title">Planeaciones Didácticas</h1>
        </div>

        <div className="controls-buttons-row">
          <button 
            onClick={() => setIsUploadOpen(true)}
            className="btn btn-secondary no-print"
          >
            <UploadCloud size={16} />
            <span>Subir Formato Vacío</span>
          </button>
          
          <button 
            onClick={() => navigateTo('ai-planner')}
            className="btn btn-primary"
          >
            <Sparkles size={16} />
            <span>Asistente AI</span>
          </button>
        </div>
      </div>

      {/* Grid List */}
      {lessonPlans.length === 0 ? (
        <div className="empty-state">
          <span className="empty-emoji">📚</span>
          <h4>Sin Planeaciones Creadas</h4>
          <p>Utiliza nuestro asistente estructurado con Inteligencia Artificial para redactar planeaciones docentes en minutos.</p>
          <button 
            onClick={() => navigateTo('ai-planner')}
            className="btn btn-primary"
            style={{ marginTop: '16px' }}
          >
            <Sparkles size={16} />
            <span>Iniciar Asistente AI</span>
          </button>
        </div>
      ) : (
        <div className="planning-list">
          {lessonPlans.map((plan) => (
            <div key={plan.id} className="planning-card">
              <div className="plan-main-details">
                <div className="plan-icon-bg">
                  <FileText size={24} />
                </div>
                <div className="plan-text-meta">
                  <h3>{plan.title}</h3>
                  <div className="plan-tags">
                    <span className="plan-subject-tag">{plan.subject}</span>
                    <span className="plan-grade-tag">{plan.gradeLevel}</span>
                  </div>
                  <div className="plan-date-row">
                    <Clock size={12} />
                    <span>Modificado el: {plan.lastModified}</span>
                  </div>
                </div>
              </div>

              <div className="plan-actions-column no-print">
                <span className={`plan-status-badge ${plan.status === 'Completa' ? 'success' : 'draft'}`}>
                  {plan.status}
                </span>

                <div className="plan-btn-row">
                  <button 
                    onClick={() => navigateTo('ai-planner', { planId: plan.id })}
                    className="btn btn-secondary btn-sm"
                  >
                    <span>Editar</span>
                  </button>
                  <button 
                    onClick={() => setDeletePlanId(plan.id)}
                    className="btn btn-secondary text-danger btn-sm"
                    title="Eliminar planeación"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Blank Template Modal */}
      <Modal
        isOpen={isUploadOpen}
        title="Subir Formato de Planeación"
        onClose={() => setIsUploadOpen(false)}
      >
        <div className="confirm-modal-content">
          {uploadSuccess ? (
            <div className="bulk-import-success">
              <CheckCircle size={40} className="success-check-pulse" />
              <h3>¡Formato Guardado!</h3>
              <p>El formato "<strong>{fileName}</strong>" se cargó correctamente. Ahora el Copiloto AI puede rellenar este diseño paso a paso.</p>
            </div>
          ) : (
            <>
              <UploadCloud size={48} className="upload-cloud-pulse-icon" />
              <p>Sube la plantilla oficial de tu escuela (Word, PDF o Excel en blanco).</p>
              <p className="subtext">
                El asistente de IA leerá la estructura de tu formato escolar para guiarte en el llenado paso a paso de los apartados necesarios.
              </p>

              <div className="file-input-wrapper">
                <label className="btn btn-primary btn-full file-label-btn">
                  <span>Seleccionar Archivo</span>
                  <input 
                    type="file" 
                    accept=".doc,.docx,.pdf,.xls,.xlsx" 
                    onChange={handleUploadFile}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deletePlanId !== null}
        title="¿Eliminar Planeación?"
        onClose={() => setDeletePlanId(null)}
      >
        <div className="confirm-modal-content">
          <AlertTriangle size={40} className="danger-icon" />
          <p>¿Estás seguro de que deseas eliminar la planeación "<strong>{deletePlanId ? getPlanTitleById(deletePlanId) : ''}</strong>"?</p>
          <p className="subtext">
            Esta acción es irreversible y se eliminará toda la estructura redactada de tu base de datos local.
          </p>

          <div className="modal-buttons-row" style={{ marginTop: '24px' }}>
            <button onClick={() => setDeletePlanId(null)} className="btn btn-secondary">
              Cancelar
            </button>
            <button 
              onClick={() => deletePlanId && handleDelete(deletePlanId)} 
              className="btn btn-danger"
            >
              Sí, Eliminar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
