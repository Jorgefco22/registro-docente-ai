import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigation } from '../context/NavigationContext';
import { Modal } from '../components/Modal';
import { 
  Plus, 
  Trash2, 
  ArrowRight,
  Calendar,
  AlertTriangle
} from 'lucide-react';

export const Groups: React.FC = () => {
  const { groups, addGroup, deleteGroup, getGroupAverage, getGroupAttendanceRate } = useApp();
  const { navigateTo } = useNavigation();

  // Create Group Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('Matemáticas');
  const [grade, setGrade] = useState('1º de Secundaria');
  const [schedule, setSchedule] = useState('');
  const [error, setError] = useState('');

  // Delete Confirm State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre del grupo es obligatorio.');
      return;
    }
    if (!schedule.trim()) {
      setError('El horario es obligatorio (ej. Lun y Mié 8:00 a 9:30).');
      return;
    }

    addGroup(name, subject, grade, schedule);
    
    // Reset Form
    setName('');
    setSubject('Matemáticas');
    setGrade('1º de Secundaria');
    setSchedule('');
    setError('');
    setIsModalOpen(false);
  };

  const handleDelete = (groupId: string) => {
    deleteGroup(groupId);
    setDeleteConfirmId(null);
  };

  const subjectOptions = [
    'Matemáticas', 'Física', 'Química', 'Español', 'Historia', 
    'Biología', 'Inglés', 'Cívica', 'Geografía', 'Tecnología'
  ];

  const gradeOptions = [
    '1º de Secundaria', '2º de Secundaria', '3º de Secundaria',
    '1º de Preparatoria', '2º de Preparatoria', '3º de Preparatoria',
    'Primaria - Grado 5º', 'Primaria - Grado 6º'
  ];

  return (
    <div className="view-container">
      {/* Header */}
      <div className="view-header">
        <div>
          <span className="view-pretitle">Tus Clases</span>
          <h1 className="view-title">Grupos Académicos</h1>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary"
        >
          <Plus size={18} />
          <span>Nuevo Grupo</span>
        </button>
      </div>

      {/* Grid of Groups */}
      {groups.length === 0 ? (
        <div className="empty-state">
          <span className="empty-emoji">🏫</span>
          <h4>Sin Grupos Registrados</h4>
          <p>Comienza creando tu primer grupo académico haciendo clic en el botón superior.</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary"
            style={{ marginTop: '16px' }}
          >
            <Plus size={18} />
            <span>Crear Grupo</span>
          </button>
        </div>
      ) : (
        <div className="groups-grid">
          {groups.map((group) => {
            const groupAvg = getGroupAverage(group.id);
            const attendance = getGroupAttendanceRate(group.id);
            const isLowAttendance = attendance < 80;

            return (
              <div key={group.id} className="group-card-wrapper">
                {/* Delete Button (absolute positions card hover) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirmId(group.id);
                  }}
                  className="group-delete-btn"
                  title="Eliminar grupo"
                >
                  <Trash2 size={16} />
                </button>

                <div 
                  onClick={() => navigateTo('group-detail', { groupId: group.id })}
                  className="group-card"
                >
                  {/* Subject Tag */}
                  <div className="group-subject-badge">
                    {group.subject}
                  </div>

                  <h3 className="group-card-title">{group.name}</h3>
                  <span className="group-card-grade">{group.grade}</span>

                  <div className="group-card-schedule">
                    <Calendar size={14} />
                    <span>{group.schedule}</span>
                  </div>

                  {/* Divider */}
                  <div className="group-card-divider"></div>

                  {/* Metrics */}
                  <div className="group-card-metrics">
                    <div className="metric">
                      <span className="lbl">Alumnos</span>
                      <span className="val">{group.studentsCount}</span>
                    </div>

                    <div className="metric">
                      <span className="lbl">Promedio</span>
                      <span className={`val ${groupAvg < 6.0 ? 'bad' : ''}`}>
                        {groupAvg}
                      </span>
                    </div>

                    <div className="metric">
                      <span className="lbl">Asistencia</span>
                      <span className={`val ${isLowAttendance ? 'bad' : ''}`}>
                        {attendance}%
                        {isLowAttendance && (
                          <span title="Baja asistencia (<80%)" style={{ display: 'inline-flex', alignItems: 'center', marginLeft: '4px' }}>
                            <AlertTriangle size={12} className="low-att-alert" />
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="group-card-footer">
                    <span>Gestionar grupo</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Group Modal */}
      <Modal
        isOpen={isModalOpen}
        title="Crear Nuevo Grupo Académico"
        onClose={() => {
          setIsModalOpen(false);
          setError('');
        }}
      >
        <form onSubmit={handleSubmit} className="form-group-flex">
          {error && (
            <div className="form-error-banner">
              {error}
            </div>
          )}

          <div className="form-field">
            <label>Nombre del Grupo / Aula</label>
            <input
              type="text"
              placeholder="Ej. Matemáticas I - Grupo 1A"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-row-grid">
            <div className="form-field">
              <label>Materia o Asignatura</label>
              <select 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)}
              >
                {subjectOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Nivel Educativo</label>
              <select 
                value={grade} 
                onChange={(e) => setGrade(e.target.value)}
              >
                {gradeOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-field">
            <label>Horario</label>
            <input
              type="text"
              placeholder="Ej. Lun, Mié y Vie - 07:00 a 08:30"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              required
            />
          </div>

          <div className="modal-buttons-row">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Crear Grupo
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmId !== null}
        title="¿Eliminar Grupo?"
        onClose={() => setDeleteConfirmId(null)}
      >
        <div className="confirm-modal-content">
          <AlertTriangle size={48} className="danger-icon" />
          <p>¿Estás seguro de que deseas eliminar este grupo?</p>
          <p className="subtext">
            Esta acción es irreversible y se perderán todos los datos relacionados, incluyendo alumnos, registros de asistencia y todas las calificaciones.
          </p>
          
          <div className="modal-buttons-row" style={{ marginTop: '24px' }}>
            <button
              onClick={() => setDeleteConfirmId(null)}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              className="btn btn-danger"
            >
              Sí, Eliminar Grupo
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
