import React from 'react';
import { useApp } from '../context/AppContext';
import { useNavigation } from '../context/NavigationContext';
import { 
  Users, 
  Award, 
  CalendarCheck, 
  PlusCircle, 
  Sparkles, 
  Send,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { groups, getGroupAverage, getGroupAttendanceRate, getStudentsInRisk } = useApp();
  const { navigateTo } = useNavigation();

  // Combined stats
  const totalGroups = groups.length;
  
  const totalStudents = groups.reduce((acc, g) => acc + g.studentsCount, 0);
  
  const globalAverage = totalGroups > 0 
    ? Number((groups.reduce((acc, g) => acc + getGroupAverage(g.id), 0) / totalGroups).toFixed(1))
    : 10.0;

  const globalAttendance = totalGroups > 0
    ? Math.round(groups.reduce((acc, g) => acc + getGroupAttendanceRate(g.id), 0) / totalGroups)
    : 100;

  const studentsInRisk = getStudentsInRisk();

  return (
    <div className="view-container">
      {/* Header */}
      <div className="view-header">
        <div>
          <span className="view-pretitle">Panel de Control</span>
          <h1 className="view-title">Bienvenido, Docente</h1>
        </div>
        <div className="header-date">
          <span>Martes, 19 de Mayo, 2026</span>
        </div>
      </div>

      {/* Grid Indicators */}
      <div className="stats-grid">
        <div className="stat-card" onClick={() => navigateTo('groups')}>
          <div className="stat-icon-wrapper blue">
            <Users />
          </div>
          <div className="stat-content">
            <span className="stat-label">Grupos Activos</span>
            <h3 className="stat-val">{totalGroups}</h3>
            <span className="stat-desc">Ver todos los grupos</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper green">
            <Users />
          </div>
          <div className="stat-content">
            <span className="stat-label">Alumnos Inscritos</span>
            <h3 className="stat-val">{totalStudents}</h3>
            <span className="stat-desc">Promedio por grupo: {totalGroups > 0 ? (totalStudents / totalGroups).toFixed(1) : 0}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper purple">
            <Award />
          </div>
          <div className="stat-content">
            <span className="stat-label">Promedio General</span>
            <h3 className="stat-val">{globalAverage}</h3>
            <span className="stat-desc">Escala 0 a 10</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper orange">
            <CalendarCheck />
          </div>
          <div className="stat-content">
            <span className="stat-label">Asistencia Promedio</span>
            <h3 className="stat-val">{globalAttendance}%</h3>
            <span className="stat-desc">Asistencia global</span>
          </div>
        </div>
      </div>

      {/* Two Columns Section */}
      <div className="dashboard-grid">
        {/* Left Column: Alumnos en Riesgo */}
        <div className="dashboard-main-card">
          <div className="card-header-risk">
            <div className="card-title-with-icon">
              <AlertTriangle className="risk-icon" />
              <h3>Alumnos en Riesgo Académico / Faltas</h3>
            </div>
            {studentsInRisk.length > 0 && (
              <span className="risk-badge-count">{studentsInRisk.length}</span>
            )}
          </div>

          {studentsInRisk.length === 0 ? (
            <div className="empty-state">
              <span className="empty-emoji">🎉</span>
              <h4>¡Excelente trabajo!</h4>
              <p>Ningún alumno se encuentra en estado de riesgo actualmente.</p>
            </div>
          ) : (
            <div className="risk-list">
              {studentsInRisk.map((item, idx) => (
                <div key={idx} className="risk-item">
                  <div className="risk-student-details">
                    <h4>{item.student.name}</h4>
                    <div className="risk-meta">
                      <span className="risk-group-tag">{item.groupName}</span>
                      <span className="risk-reason-text">• {item.reason}</span>
                    </div>
                  </div>

                  <div className="risk-metrics">
                    <div className="metric-badge">
                      <span className="lbl">Promedio</span>
                      <span className={`val ${item.avg < 6 ? 'bad' : ''}`}>{item.avg || 'N/A'}</span>
                    </div>
                    <div className="metric-badge">
                      <span className="lbl">Asist.</span>
                      <span className={`val ${item.attRate < 80 ? 'bad' : ''}`}>{item.attRate}%</span>
                    </div>
                    <button 
                      onClick={() => navigateTo('messages')}
                      className="risk-action-btn"
                      title="Enviar mensaje de alerta"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Accesos Rápidos */}
        <div className="dashboard-side-column">
          <div className="dashboard-main-card">
            <h3>Acciones Rápidas</h3>
            <div className="quick-actions-list">
              <button 
                onClick={() => navigateTo('groups')} 
                className="quick-action-item"
              >
                <div className="action-icon-bg blue">
                  <PlusCircle size={20} />
                </div>
                <div className="action-info">
                  <h4>Nuevo Grupo</h4>
                  <p>Crea o importa alumnos a un grupo</p>
                </div>
                <ArrowRight size={18} className="action-arrow" />
              </button>

              <button 
                onClick={() => navigateTo('ai-planner')} 
                className="quick-action-item"
              >
                <div className="action-icon-bg purple">
                  <Sparkles size={20} />
                </div>
                <div className="action-info">
                  <h4>Asistente AI</h4>
                  <p>Crea planeaciones paso a paso con IA</p>
                </div>
                <ArrowRight size={18} className="action-arrow" />
              </button>

              <button 
                onClick={() => navigateTo('messages')} 
                className="quick-action-item"
              >
                <div className="action-icon-bg green">
                  <Send size={20} />
                </div>
                <div className="action-info">
                  <h4>Enviar Notificación</h4>
                  <p>Envía reportes o avisos a padres</p>
                </div>
                <ArrowRight size={18} className="action-arrow" />
              </button>
            </div>
          </div>
          
          {/* Tip Card */}
          <div className="dashboard-tip-card">
            <div className="tip-icon"><Sparkles /></div>
            <div className="tip-content">
              <h4>Consejo Docente AI</h4>
              <p>Puedes importar alumnos al instante en el detalle del grupo copiando y pegando una lista numerada de nombres desde Word o PDF.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
