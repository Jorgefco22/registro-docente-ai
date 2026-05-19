import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Send, 
  Users, 
  Mail, 
  MessageSquare,
  FileText,
  CheckCircle,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

export const Messages: React.FC = () => {
  const { groups, getStudentsInRisk, studentsByGroup } = useApp();

  const [selectedGroup, setSelectedGroup] = useState(groups[0]?.id || 'all');
  const [recipientFilter, setRecipientFilter] = useState<'all' | 'risk-parents' | 'students'>('all');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Sending status
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sentCount, setSentCount] = useState(0);

  // Template picker
  const templates = [
    {
      title: 'Alerta de Asistencia',
      subject: 'Aviso Importante: Faltas Acumuladas en Clase',
      body: 'Estimado padre de familia,\n\nLe escribimos para informarle que su hijo(a) ha registrado un nivel alto de inasistencias en la materia de [Asignatura]. Agradecemos su apoyo en casa platicando con él/ella sobre la importancia de asistir a todas las clases puntualmente.\n\nQuedamos a su disposición para cualquier duda.\n\nAtentamente,\nProf. Mario Reyes'
    },
    {
      title: 'Reporte de Calificaciones',
      subject: 'Boleta de Calificaciones Parciales Disponible',
      body: 'Estimados padres de familia y alumnos,\n\nSe les notifica que la captura de calificaciones de la evaluación parcial del grupo [Grupo] ha concluido. Les invitamos a revisar los promedios en sus respectivas asignaturas. En caso de alumnos con promedio menor a 6.0, les sugerimos contactar al docente para acordar un plan de regularización.\n\nSaludos cordiales,\nProf. Mario Reyes'
    },
    {
      title: 'Entrega de Tarea Pendiente',
      subject: 'Recordatorio: Tarea Pendiente por Entregar',
      body: 'Hola [Alumno],\n\nTe recordamos que tienes una o más tareas registradas como "Sin Entregar" o "Pendientes" en la plataforma. La fecha de entrega máxima para regularizar estos pendientes es el próximo viernes. Evita penalizar tu promedio final.\n\nÉxito,\nProf. Mario Reyes'
    }
  ];

  const handleApplyTemplate = (tpl: typeof templates[0]) => {
    let finalSub = tpl.subject;
    let finalBody = tpl.body;

    const activeGrpObj = groups.find(g => g.id === selectedGroup);
    const grpName = activeGrpObj ? activeGrpObj.name : 'tu clase';
    const subjName = activeGrpObj ? activeGrpObj.subject : 'Materia';

    finalSub = finalSub.replace('[Grupo]', grpName).replace('[Asignatura]', subjName);
    finalBody = finalBody.replace('[Grupo]', grpName).replace('[Asignatura]', subjName).replace('[Alumno]', 'Estimado Alumno');

    setSubject(finalSub);
    setMessage(finalBody);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !subject.trim()) {
      setError('El asunto y el mensaje son campos requeridos.');
      return;
    }

    setIsSending(true);
    setError('');

    // Calculate count of simulated recipients
    let count = 0;
    if (recipientFilter === 'all') {
      // Parents + Students of selected group
      const grpId = selectedGroup === 'all' ? (groups[0]?.id || '') : selectedGroup;
      const list = studentsByGroup[grpId] || [];
      count = list.length * 2; // student + parent
    } else if (recipientFilter === 'risk-parents') {
      const riskList = getStudentsInRisk(selectedGroup === 'all' ? undefined : selectedGroup);
      count = riskList.length; // parents of risk students
    } else {
      const grpId = selectedGroup === 'all' ? (groups[0]?.id || '') : selectedGroup;
      const list = studentsByGroup[grpId] || [];
      count = list.length; // only students
    }

    if (count === 0) {
      setIsSending(false);
      setError('No se encontraron destinatarios activos para los filtros seleccionados.');
      return;
    }

    setTimeout(() => {
      setIsSending(false);
      setSentCount(count);
      setSendSuccess(true);
      
      // Reset
      setSubject('');
      setMessage('');
      
      setTimeout(() => {
        setSendSuccess(false);
      }, 3500);
    }, 2000);
  };

  return (
    <div className="view-container">
      {/* Header */}
      <div className="view-header">
        <div>
          <span className="view-pretitle">Comunicación Directa</span>
          <h1 className="view-title">Mensajes a Padres y Alumnos</h1>
        </div>
      </div>

      <div className="messages-layout-grid">
        {/* Left pane: Composition */}
        <div className="glass-card composition-card">
          {sendSuccess ? (
            <div className="send-success-full-overlay">
              <CheckCircle size={56} className="success-check-pulse" />
              <h2>¡Notificación Enviada!</h2>
              <p>Se enviaron con éxito <strong>{sentCount}</strong> correos electrónicos simulados a los destinatarios seleccionados.</p>
              <div className="recipients-summary-list">
                <span>✓ Filtros aplicados de forma correcta</span>
                <span>✓ Notificación registrada en el log docente</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSend} className="form-group-flex">
              {error && (
                <div className="form-error-banner">
                  <AlertTriangle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {/* Step 1: Filter Recipients */}
              <div className="form-row-grid">
                <div className="form-field">
                  <label>Seleccionar Grupo Escolar</label>
                  <select 
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                  >
                    <option value="all">Todos los grupos</option>
                    {groups.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label>Enviar a:</label>
                  <select
                    value={recipientFilter}
                    onChange={(e) => setRecipientFilter(e.target.value as 'all' | 'risk-parents' | 'students')}
                  >
                    <option value="all">Alumnos y Tutores (Padres)</option>
                    <option value="risk-parents">Padres de alumnos en riesgo académico/faltas</option>
                    <option value="students">Únicamente Alumnos</option>
                  </select>
                </div>
              </div>

              {/* Step 2: Subject */}
              <div className="form-field">
                <label>Asunto del Correo</label>
                <div className="input-with-icon-left">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="text"
                    placeholder="Ej. Citatorio de padres, aviso de evaluación..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Step 3: Message */}
              <div className="form-field">
                <label>Cuerpo del Mensaje</label>
                <textarea
                  rows={8}
                  placeholder="Escribe el contenido del mensaje aquí..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                ></textarea>
              </div>

              {/* Action row */}
              <div className="form-actions-submit-row">
                <button
                  type="submit"
                  disabled={isSending}
                  className="btn btn-primary btn-full"
                >
                  {isSending ? (
                    <>
                      <RefreshCw size={16} className="spin" />
                      <span>Enviando correos masivos...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Enviar Notificación</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right pane: Templates & Stats */}
        <aside className="messages-side-panel">
          {/* Templates Card */}
          <div className="glass-card side-card">
            <div className="side-card-header">
              <MessageSquare size={18} className="text-primary" />
              <h3>Plantillas Oficiales</h3>
            </div>
            
            <p className="side-card-intro">
              Selecciona una plantilla para rellenar automáticamente los campos de texto con formatos institucionales recomendados.
            </p>

            <div className="templates-list-buttons">
              {templates.map((tpl, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplyTemplate(tpl)}
                  className="template-picker-btn"
                >
                  <div className="tpl-icon">
                    <FileText size={16} />
                  </div>
                  <div className="tpl-info">
                    <h4>{tpl.title}</h4>
                    <p>{tpl.subject}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Recipients Stats Card */}
          <div className="glass-card side-card">
            <div className="side-card-header">
              <Users size={18} className="text-success" />
              <h3>Registro de Comunicaciones</h3>
            </div>
            
            <div className="simulated-logs-list">
              <div className="log-item">
                <span className="time">Ayer 14:32</span>
                <span className="log-desc">Se enviaron 8 avisos de "Tarea Pendiente" a Matemáticas I.</span>
              </div>
              <div className="log-item">
                <span className="time">15 Mayo 09:12</span>
                <span className="log-desc">Boleta de parcial enviada a Física General (14 destinatarios).</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
