import React, { useState } from 'react';
import type { Student } from '../data/demoData';
import { useApp } from '../context/AppContext';
import { 
  Calendar, 
  QrCode, 
  Download, 
  Users,
  Check,
  AlertCircle
} from 'lucide-react';
import { AttendanceQR } from './AttendanceQR';

interface AttendanceProps {
  groupId: string;
  students: Student[];
}

export const Attendance: React.FC<AttendanceProps> = ({
  groupId,
  students
}) => {
  const { attendanceByGroup, updateAttendance } = useApp();

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  
  const [isScanningQR, setIsScanningQR] = useState(false);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  const groupAttendance = attendanceByGroup[groupId] || {};

  // Status mapping
  const statuses = [
    { key: 'A' as const, label: 'Asistencia', class: 'status-present', char: 'A' },
    { key: 'F' as const, label: 'Falta', class: 'status-absent', char: 'F' },
    { key: 'R' as const, label: 'Retardo', class: 'status-late', char: 'R' },
    { key: 'J' as const, label: 'Justificado', class: 'status-excused', char: 'J' }
  ];

  const handleStatusChange = (studentId: string, status: 'A' | 'F' | 'R' | 'J') => {
    updateAttendance(groupId, studentId, selectedDate, status);
  };

  // Export to CSV
  const handleExportCSV = () => {
    // Collect all unique dates in the records for this group to make columns
    const allDates = new Set<string>();
    allDates.add(selectedDate);
    
    students.forEach(s => {
      const records = groupAttendance[s.id] || {};
      Object.keys(records).forEach(d => allDates.add(d));
    });

    const datesList = Array.from(allDates).sort();

    // Build headers
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Nombre de Alumno,Correo," + datesList.join(",") + "\n";

    // Build rows
    students.forEach(student => {
      const row = [student.name, student.email];
      datesList.forEach(d => {
        const state = (groupAttendance[student.id] && groupAttendance[student.id][d]) || 'Sin registro';
        row.push(state);
      });
      csvContent += row.map(val => `"${val}"`).join(",") + "\n";
    });

    // Download trigger
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Asistencia_${groupId}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Mark all as Present for selected date
  const handleMarkAllPresent = () => {
    students.forEach(s => {
      updateAttendance(groupId, s.id, selectedDate, 'A');
    });
    setAlertMsg('Se han marcado todos los alumnos como "Asistencia"');
    setTimeout(() => setAlertMsg(null), 3000);
  };

  if (isScanningQR) {
    return (
      <AttendanceQR 
        students={students}
        onScanSuccess={(studentId) => {
          updateAttendance(groupId, studentId, selectedDate, 'A');
          setAlertMsg(`Se registró asistencia QR para el alumno.`);
          setTimeout(() => setAlertMsg(null), 4000);
        }}
        onBack={() => setIsScanningQR(false)}
      />
    );
  }

  return (
    <div className="attendance-view-container">
      {/* Mini Controls Bar */}
      <div className="sub-view-controls no-print">
        {/* Date Selector */}
        <div className="date-picker-wrapper">
          <Calendar size={18} className="input-calendar-icon" />
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-input"
          />
        </div>

        {/* Buttons Row */}
        <div className="controls-buttons-row">
          <button 
            onClick={handleMarkAllPresent}
            className="btn btn-secondary text-success"
          >
            <Check size={16} />
            <span>Asistencia General</span>
          </button>

          <button 
            onClick={() => setIsScanningQR(true)}
            className="btn btn-secondary text-primary"
          >
            <QrCode size={16} />
            <span>Escáner QR</span>
          </button>

          <button 
            onClick={handleExportCSV}
            className="btn btn-secondary"
          >
            <Download size={16} />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {alertMsg && (
        <div className="attendance-alert-banner">
          <AlertCircle size={16} />
          <span>{alertMsg}</span>
        </div>
      )}

      {/* Main Table Card */}
      <div className="glass-card attendance-table-card">
        <div className="table-header-meta">
          <h3>Pase de Lista Diario</h3>
          <span>Fecha seleccionada: <strong>{selectedDate}</strong></span>
        </div>

        {students.length === 0 ? (
          <div className="empty-state" style={{ padding: '40px 0' }}>
            <Users size={32} />
            <h4>Grupo sin alumnos</h4>
            <p>Agrega o importa alumnos en la pestaña "Alumnos" para iniciar la asistencia.</p>
          </div>
        ) : (
          <div className="modern-table-wrapper">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Nombre del Alumno</th>
                  <th style={{ width: '40%' }} className="text-center">Estado de Asistencia</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const studentRecords = groupAttendance[student.id] || {};
                  const activeState = studentRecords[selectedDate];

                  return (
                    <tr key={student.id} className="table-interactive-row">
                      <td className="student-name-cell">
                        <div>
                          <h4>{student.name}</h4>
                          <span>{student.email}</span>
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="attendance-states-row">
                          {statuses.map((status) => {
                            const isSelected = activeState === status.key;
                            return (
                              <button
                                key={status.key}
                                onClick={() => handleStatusChange(student.id, status.key)}
                                className={`attendance-state-btn ${status.class} ${isSelected ? 'active' : ''}`}
                                title={status.label}
                              >
                                {status.char}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Legend Card */}
      <div className="attendance-legend no-print">
        <div className="legend-title">Abreviaturas del pase de lista:</div>
        <div className="legend-items">
          <span><strong className="text-success">A</strong> = Asistencia</span>
          <span><strong className="text-danger">F</strong> = Falta</span>
          <span><strong className="text-warning">R</strong> = Retardo</span>
          <span><strong className="text-secondary">J</strong> = Justificado</span>
        </div>
      </div>
    </div>
  );
};
