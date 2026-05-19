import React, { useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/Modal';
import { Attendance } from './Attendance';
import { Grades } from './Grades';
import { 
  ArrowLeft, 
  Users, 
  CalendarCheck, 
  TrendingUp, 
  Plus, 
  Trash2,
  FileSpreadsheet,
  CheckCircle,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';

export const GroupDetail: React.FC = () => {
  const { activeGroupId, goBack } = useNavigation();
  const { 
    groups, 
    studentsByGroup, 
    addStudent, 
    deleteStudent,
    importStudents 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'students' | 'attendance' | 'grades'>('students');

  // Single Student creation modal state
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentParentEmail, setStudentParentEmail] = useState('');
  const [studentError, setStudentError] = useState('');

  // Bulk Import area state
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);
  const [importedCount, setImportedCount] = useState(0);

  // Delete Student confirm state
  const [deleteStudentId, setDeleteStudentId] = useState<string | null>(null);

  // Group lookup
  const group = groups.find(g => g.id === activeGroupId);
  const students = activeGroupId ? (studentsByGroup[activeGroupId] || []) : [];

  if (!group || !activeGroupId) {
    return (
      <div className="view-container">
        <button onClick={goBack} className="btn btn-secondary">
          <ArrowLeft size={16} />
          <span>Volver</span>
        </button>
        <div className="empty-state">
          <h4>Grupo no encontrado</h4>
          <p>El grupo seleccionado no existe o fue eliminado.</p>
        </div>
      </div>
    );
  }

  // Handle single student submit
  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      setStudentError('El nombre del estudiante es obligatorio.');
      return;
    }

    // Auto-generate emails if blank
    const nameParts = studentName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(' ');
    const first = nameParts[0] || 'alumno';
    const last = nameParts[1] || 'apellido';
    
    const email = studentEmail.trim() || `${first}.${last}@alumno.edu.mx`;
    const parentEmail = studentParentEmail.trim() || `padre.${first}@gmail.com`;

    addStudent(activeGroupId, studentName.trim(), email, parentEmail);

    setStudentName('');
    setStudentEmail('');
    setStudentParentEmail('');
    setStudentError('');
    setIsAddStudentOpen(false);
  };

  // Handle bulk import
  const handleBulkImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importText.trim()) return;

    const beforeCount = students.length;
    importStudents(activeGroupId, importText);
    const afterCount = (studentsByGroup[activeGroupId] || []).length;
    const added = afterCount - beforeCount;

    setImportedCount(added);
    setImportSuccess(true);
    setImportText('');

    setTimeout(() => {
      setImportSuccess(false);
      setIsImportOpen(false);
    }, 2500);
  };

  const handleDeleteStudent = (studentId: string) => {
    deleteStudent(activeGroupId, studentId);
    setDeleteStudentId(null);
  };

  const getStudentNameById = (id: string) => {
    return students.find(s => s.id === id)?.name || 'Estudiante';
  };

  return (
    <div className="view-container">
      {/* Header with back button */}
      <div className="group-detail-header no-print">
        <button onClick={goBack} className="btn-back-square" title="Volver a grupos">
          <ArrowLeft size={18} />
        </button>
        
        <div className="group-details-meta">
          <span className="subject-tag">{group.subject}</span>
          <h1 className="group-detail-title">{group.name}</h1>
          <p className="group-detail-subtitle">{group.grade} • {group.schedule}</p>
        </div>
      </div>

      {/* Tabs list */}
      <div className="detail-tabs-bar no-print">
        <button 
          onClick={() => setActiveTab('students')}
          className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`}
        >
          <Users size={16} />
          <span>Alumnos ({students.length})</span>
        </button>

        <button 
          onClick={() => setActiveTab('attendance')}
          className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`}
        >
          <CalendarCheck size={16} />
          <span>Asistencia</span>
        </button>

        <button 
          onClick={() => setActiveTab('grades')}
          className={`tab-btn ${activeTab === 'grades' ? 'active' : ''}`}
        >
          <TrendingUp size={16} />
          <span>Calificaciones</span>
        </button>
      </div>

      {/* Dynamic Tab Render */}
      <div className="detail-tab-content">
        {activeTab === 'students' && (
          <div className="students-tab-container">
            {/* Topbar */}
            <div className="sub-view-controls no-print">
              <span className="controls-label">
                Administración de la lista escolar
              </span>
              <div className="controls-buttons-row">
                <button 
                  onClick={() => setIsImportOpen(true)}
                  className="btn btn-secondary text-primary"
                >
                  <FileSpreadsheet size={16} />
                  <span>Importar Alumnos</span>
                </button>
                <button 
                  onClick={() => setIsAddStudentOpen(true)}
                  className="btn btn-secondary"
                >
                  <Plus size={16} />
                  <span>Añadir Individual</span>
                </button>
              </div>
            </div>

            {/* List */}
            <div className="glass-card students-list-card">
              {students.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-emoji">📝</span>
                  <h4>Lista Escolar Vacía</h4>
                  <p>Aún no hay alumnos inscritos en este grupo escolar. Agrega uno de forma manual o importa tu lista.</p>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                    <button onClick={() => setIsImportOpen(true)} className="btn btn-secondary text-primary">
                      <FileSpreadsheet size={16} />
                      <span>Importar Lista</span>
                    </button>
                    <button onClick={() => setIsAddStudentOpen(true)} className="btn btn-primary">
                      <Plus size={16} />
                      <span>Añadir Alumno</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="modern-table-wrapper">
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>Nº</th>
                        <th>Nombre Completo</th>
                        <th>Correo Estudiante</th>
                        <th>Correo de Tutor (Padre/Madre)</th>
                        <th className="text-center no-print">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student, idx) => (
                        <tr key={student.id} className="table-interactive-row">
                          <td style={{ width: '40px', color: 'var(--color-text-secondary)' }}>
                            {idx + 1}
                          </td>
                          <td className="student-name-cell">
                            <h4>{student.name}</h4>
                          </td>
                          <td>{student.email}</td>
                          <td>{student.parentEmail}</td>
                          <td className="text-center no-print">
                            <button
                              onClick={() => setDeleteStudentId(student.id)}
                              className="btn-table-action danger"
                              title="Baja de alumno"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <Attendance groupId={activeGroupId} students={students} />
        )}

        {activeTab === 'grades' && (
          <Grades groupId={activeGroupId} students={students} />
        )}
      </div>

      {/* Add Single Student Modal */}
      <Modal
        isOpen={isAddStudentOpen}
        title="Inscribir Alumno Individual"
        onClose={() => {
          setIsAddStudentOpen(false);
          setStudentError('');
        }}
      >
        <form onSubmit={handleAddStudentSubmit} className="form-group-flex">
          {studentError && (
            <div className="form-error-banner">
              {studentError}
            </div>
          )}

          <div className="form-field">
            <label>Nombre Completo del Alumno</label>
            <input
              type="text"
              placeholder="Ej. Juan Pérez Gómez"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-field">
            <label>Correo Electrónico (Opcional)</label>
            <input
              type="email"
              placeholder="Ej. juan.perez@alumno.edu.mx"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
            />
            <span className="field-hint">* Si se deja vacío, se autogenerará con base en su nombre</span>
          </div>

          <div className="form-field">
            <label>Correo Electrónico del Padre / Tutor (Opcional)</label>
            <input
              type="email"
              placeholder="Ej. tutor.perez@gmail.com"
              value={studentParentEmail}
              onChange={(e) => setStudentParentEmail(e.target.value)}
            />
            <span className="field-hint">* Utilizado para enviar alertas de calificaciones y asistencia</span>
          </div>

          <div className="modal-buttons-row" style={{ marginTop: '16px' }}>
            <button
              type="button"
              onClick={() => setIsAddStudentOpen(false)}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Registrar Alumno
            </button>
          </div>
        </form>
      </Modal>

      {/* Bulk Import Modal */}
      <Modal
        isOpen={isImportOpen}
        title="Importar Alumnos desde Documento"
        onClose={() => {
          setIsImportOpen(false);
          setImportSuccess(false);
        }}
      >
        <form onSubmit={handleBulkImportSubmit} className="form-group-flex">
          {importSuccess ? (
            <div className="bulk-import-success">
              <CheckCircle size={48} className="success-check-pulse" />
              <h3>¡Alumnos Importados!</h3>
              <p>Se añadieron exitosamente <strong>{importedCount}</strong> estudiantes a la lista escolar de forma automática.</p>
            </div>
          ) : (
            <>
              <p className="modal-intro-text">
                Copia y pega la lista de alumnos desde cualquier formato (Excel, CSV, Word o PDF). Nuestro escáner inteligente filtrará números, correos y detectará nombres automáticamente.
              </p>

              <div className="form-field">
                <label>Pega el Texto Aquí</label>
                <textarea
                  rows={8}
                  placeholder="Ejemplo:&#10;1. Juan Pérez Gómez&#10;2. María López Ortiz&#10;3) Pedro Ramírez Ruiz&#10;Sofía Castro Vega"
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  className="import-textarea"
                  required
                  autoFocus
                ></textarea>
              </div>

              <div className="import-help-box">
                <HelpCircle size={16} />
                <span>Formatos soportados: numeraciones (1, 2, 3), guiones (-), comas, saltos de línea simples.</span>
              </div>

              <div className="modal-buttons-row">
                <button
                  type="button"
                  onClick={() => setIsImportOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Detectar e Importar
                </button>
              </div>
            </>
          )}
        </form>
      </Modal>

      {/* Delete Student Confirmation Modal */}
      <Modal
        isOpen={deleteStudentId !== null}
        title="¿Dar de baja alumno?"
        onClose={() => setDeleteStudentId(null)}
      >
        <div className="confirm-modal-content">
          <AlertTriangle size={40} className="danger-icon" />
          <p>¿Estás seguro de que deseas dar de baja al alumno "<strong>{deleteStudentId ? getStudentNameById(deleteStudentId) : ''}</strong>"?</p>
          <p className="subtext">
            Se perderá todo el historial académico, promedios y asistencias de este estudiante en este grupo. Esta acción no se puede deshacer.
          </p>

          <div className="modal-buttons-row" style={{ marginTop: '24px' }}>
            <button onClick={() => setDeleteStudentId(null)} className="btn btn-secondary">
              Cancelar
            </button>
            <button 
              onClick={() => deleteStudentId && handleDeleteStudent(deleteStudentId)} 
              className="btn btn-danger"
            >
              Dar de Baja
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
