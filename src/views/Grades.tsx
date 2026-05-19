import React, { useState } from 'react';
import type { Student } from '../data/demoData';
import { useApp } from '../context/AppContext';
import { FloatingIsland } from '../components/FloatingIsland';
import { Modal } from '../components/Modal';
import { 
  Plus, 
  Trash2, 
  Settings2, 
  Download, 
  AlertCircle,
  HelpCircle,
  TrendingDown
} from 'lucide-react';

interface GradesProps {
  groupId: string;
  students: Student[];
}

export const Grades: React.FC<GradesProps> = ({
  groupId,
  students
}) => {
  const {
    categoriesByGroup,
    columnsByGroup,
    gradesByGroup,
    updateGrade,
    addColumnGrade,
    deleteColumnGrade,
    updateCategories,
    getStudentCategoryAverage,
    getStudentFinalGrade,
    getStudentAttendanceRate
  } = useApp();

  const groupCategories = categoriesByGroup[groupId] || [];
  const groupColumns = columnsByGroup[groupId] || [];
  const groupGrades = gradesByGroup[groupId] || [];

  // Weights configuration modal
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [editedWeights, setEditedWeights] = useState<{ [catId: string]: number }>({});
  const [weightError, setWeightError] = useState('');

  // Add Column modal
  const [isAddColModalOpen, setIsAddColModalOpen] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [newColCatId, setNewColCatId] = useState(groupCategories[0]?.id || '');

  // Delete Column confirm modal
  const [deleteColId, setDeleteColId] = useState<string | null>(null);

  // Floating Island state
  const [activeCell, setActiveCell] = useState<{
    studentId: string;
    columnId: string;
    studentName: string;
    columnName: string;
  } | null>(null);

  // Inline text edit state
  const [editingCell, setEditingCell] = useState<{
    studentId: string;
    columnId: string;
  } | null>(null);
  const [editValue, setEditValue] = useState('');

  // Validation: verify if weights sum 100%
  const totalWeightSum = groupCategories.reduce((acc, c) => acc + c.weight, 0);
  const isWeightValid = totalWeightSum === 100;

  // Find column name helper
  const getColName = (colId: string) => {
    return groupColumns.find(c => c.id === colId)?.name || 'Columna';
  };

  // Find student row helper
  const getStudentGradesRow = (studentId: string) => {
    return groupGrades.find(r => r.studentId === studentId);
  };

  // Weight edit handler
  const openWeightModal = () => {
    const weights: { [catId: string]: number } = {};
    groupCategories.forEach(c => {
      weights[c.id] = c.weight;
    });
    setEditedWeights(weights);
    setWeightError('');
    setIsWeightModalOpen(true);
  };

  const handleSaveWeights = (e: React.FormEvent) => {
    e.preventDefault();
    const sum = Object.values(editedWeights).reduce((a, b) => a + Number(b), 0);
    
    if (sum !== 100) {
      setWeightError(`La suma de las ponderaciones debe ser exactamente 100%. Actualmente suma ${sum}%.`);
      return;
    }

    const updated = groupCategories.map(cat => ({
      ...cat,
      weight: Number(editedWeights[cat.id])
    }));

    updateCategories(groupId, updated);
    setIsWeightModalOpen(false);
  };

  // Add column handler
  const handleAddColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;

    addColumnGrade(groupId, newColName.trim(), newColCatId);
    setNewColName('');
    setIsAddColModalOpen(false);
  };

  // Column delete handler
  const handleDeleteColumn = (colId: string) => {
    deleteColumnGrade(groupId, colId);
    setDeleteColId(null);
    if (activeCell?.columnId === colId) {
      setActiveCell(null);
    }
  };

  // Cell single click: Open Floating Island
  const handleCellClick = (studentId: string, columnId: string, studentName: string, columnName: string) => {
    if (editingCell) return; // Ignore if writing manually
    setActiveCell({ studentId, columnId, studentName, columnName });
  };

  // Floating Island value select: saves value, and auto-advances to next student
  const handleSelectIslandValue = (val: number | 'NP' | 'P' | 'SE') => {
    if (!activeCell) return;
    
    updateGrade(groupId, activeCell.studentId, activeCell.columnId, val);

    // Auto-advance to the next student for high-speed capture
    const currentIdx = students.findIndex(s => s.id === activeCell.studentId);
    if (currentIdx !== -1 && currentIdx < students.length - 1) {
      const nextStudent = students[currentIdx + 1];
      setActiveCell({
        studentId: nextStudent.id,
        columnId: activeCell.columnId,
        studentName: nextStudent.name,
        columnName: activeCell.columnName
      });
    } else {
      // Close at end of list
      setActiveCell(null);
    }
  };

  // Cell double click: Change to inline input editor
  const handleCellDoubleClick = (studentId: string, columnId: string, currentValue: string | number) => {
    setActiveCell(null); // Close island
    setEditingCell({ studentId, columnId });
    setEditValue(currentValue === 'P' ? '' : String(currentValue));
  };

  // Inline edit submit
  const handleInlineSave = () => {
    if (!editingCell) return;

    const trimmed = editValue.trim().toUpperCase();
    let parsedVal: number | 'NP' | 'P' | 'SE';

    if (trimmed === 'NP' || trimmed === 'P' || trimmed === 'SE') {
      parsedVal = trimmed as 'NP' | 'P' | 'SE';
    } else {
      const num = Number(trimmed);
      if (!isNaN(num) && num >= 0 && num <= 10) {
        parsedVal = Number(num.toFixed(1));
      } else {
        alert('Ingresa una calificación válida entre 0 y 10, o claves: NP, P, SE.');
        setEditingCell(null);
        return;
      }
    }

    updateGrade(groupId, editingCell.studentId, editingCell.columnId, parsedVal);
    setEditingCell(null);
  };

  // CSV Excel export
  const handleExportExcel = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Headers
    const headers = ["Nombre de Alumno", "Asistencia Rate"];
    groupCategories.forEach(cat => {
      const cols = groupColumns.filter(c => c.categoryId === cat.id);
      cols.forEach(col => headers.push(`${cat.name} - ${col.name}`));
      headers.push(`Promedio ${cat.name}`);
    });
    headers.push("Calificación Final");
    
    csvContent += headers.map(h => `"${h}"`).join(",") + "\n";

    // Student Rows
    students.forEach(student => {
      const row: string[] = [student.name, `${getStudentAttendanceRate(groupId, student.id)}%`];
      
      groupCategories.forEach(cat => {
        const cols = groupColumns.filter(c => c.categoryId === cat.id);
        const sRow = getStudentGradesRow(student.id);

        cols.forEach(col => {
          const val = sRow ? sRow.grades[col.id] : 'P';
          row.push(String(val));
        });

        const catAvg = getStudentCategoryAverage(groupId, student.id, cat.id);
        row.push(catAvg !== null ? String(catAvg) : '-');
      });

      const finalGrade = getStudentFinalGrade(groupId, student.id);
      row.push(String(finalGrade));

      csvContent += row.map(v => `"${v}"`).join(",") + "\n";
    });

    // Download trigger
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Calificaciones_${groupId}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grades-view-container">
      {/* Weight Error Banner */}
      {!isWeightValid && (
        <div className="weights-error-banner no-print">
          <AlertCircle size={18} />
          <div>
            <h4>Ajuste de Ponderaciones Requerido</h4>
            <p>Las ponderaciones de evaluación de tu grupo suman un <strong>{totalWeightSum}%</strong>. Deben sumar exactamente **100%** para activar los promedios finales correctos.</p>
          </div>
          <button onClick={openWeightModal} className="btn-action-banner">
            Ajustar
          </button>
        </div>
      )}

      {/* Control Bar */}
      <div className="sub-view-controls no-print">
        <div className="controls-label">
          <TrendingDown size={16} />
          <span>Haga clic en una celda para captura veloz</span>
        </div>
        
        <div className="controls-buttons-row">
          <button onClick={() => setIsAddColModalOpen(true)} className="btn btn-secondary text-primary">
            <Plus size={16} />
            <span>Añadir Columna</span>
          </button>

          <button onClick={openWeightModal} className="btn btn-secondary">
            <Settings2 size={16} />
            <span>Ponderaciones ({totalWeightSum}%)</span>
          </button>

          <button 
            onClick={handleExportExcel} 
            disabled={!isWeightValid}
            className="btn btn-secondary"
            title={!isWeightValid ? "Corrige las ponderaciones para exportar" : ""}
          >
            <Download size={16} />
            <span>Exportar Excel</span>
          </button>
        </div>
      </div>

      {/* Main Spreadsheet Card */}
      <div className="glass-card grades-spreadsheet-card">
        {students.length === 0 ? (
          <div className="empty-state" style={{ padding: '50px 0' }}>
            <AlertCircle size={32} />
            <h4>Sin Alumnos Registrados</h4>
            <p>Agrega alumnos en la primera pestaña del grupo para poder calificar.</p>
          </div>
        ) : (
          <div className="spreadsheet-wrapper">
            <table className="excel-table">
              <thead>
                {/* Level 1: Categories Header */}
                <tr>
                  <th rowSpan={2} className="student-col-header">Estudiante</th>
                  <th rowSpan={2} className="meta-col-header text-center">Asist.</th>
                  
                  {groupCategories.map(cat => {
                    const colsCount = groupColumns.filter(c => c.categoryId === cat.id).length;
                    // colsCount columns + 1 category average column
                    return (
                      <th 
                        key={cat.id} 
                        colSpan={colsCount + 1} 
                        className="category-group-header text-center"
                      >
                        {cat.name} ({cat.weight}%)
                      </th>
                    );
                  })}
                  
                  <th rowSpan={2} className="final-col-header text-center">Final</th>
                  <th rowSpan={2} className="risk-col-header text-center">Estado</th>
                </tr>
                {/* Level 2: Specific Columns Header */}
                <tr>
                  {groupCategories.map(cat => {
                    const cols = groupColumns.filter(c => c.categoryId === cat.id);
                    return (
                      <React.Fragment key={cat.id}>
                        {cols.map(col => (
                          <th key={col.id} className="grade-col-header text-center">
                            <div className="header-col-title-btn">
                              <span>{col.name}</span>
                              <button 
                                onClick={() => setDeleteColId(col.id)} 
                                className="col-del-icon-btn no-print"
                                title="Eliminar columna"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </th>
                        ))}
                        <th className="cat-avg-header text-center">Prom.</th>
                      </React.Fragment>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {students.map(student => {
                  const sRow = getStudentGradesRow(student.id);
                  const attendanceRate = getStudentAttendanceRate(groupId, student.id);
                  const finalGrade = getStudentFinalGrade(groupId, student.id);
                  
                  let isAtRisk = false;
                  let riskReason = '';
                  if (typeof finalGrade === 'number' && finalGrade < 6.0) {
                    isAtRisk = true;
                    riskReason = 'Promedio bajo';
                  }
                  if (attendanceRate < 80) {
                    isAtRisk = true;
                    riskReason = riskReason ? 'Promedio y Asistencia' : 'Baja asistencia';
                  }

                  return (
                    <tr key={student.id}>
                      {/* Name */}
                      <td className="student-name-td">
                        <h4>{student.name}</h4>
                      </td>

                      {/* Attendance */}
                      <td className="meta-td text-center">
                        <span className={`att-rate-badge ${attendanceRate < 80 ? 'bad' : ''}`}>
                          {attendanceRate}%
                        </span>
                      </td>

                      {/* Grade Cells grouped by Category */}
                      {groupCategories.map(cat => {
                        const cols = groupColumns.filter(c => c.categoryId === cat.id);
                        const catAverage = getStudentCategoryAverage(groupId, student.id, cat.id);

                        return (
                          <React.Fragment key={cat.id}>
                            {cols.map(col => {
                              const score = sRow ? sRow.grades[col.id] : 'P';
                              const isEditing = editingCell?.studentId === student.id && editingCell?.columnId === col.id;
                              const isActive = activeCell?.studentId === student.id && activeCell?.columnId === col.id;

                              let cellClass = '';
                              if (score === 'NP') cellClass = 'score-np';
                              else if (score === 'SE') cellClass = 'score-se';
                              else if (score === 'P') cellClass = 'score-p';
                              else if (typeof score === 'number' && score < 6.0) cellClass = 'score-failed';

                              return (
                                <td 
                                  key={col.id} 
                                  onClick={() => handleCellClick(student.id, col.id, student.name, col.name)}
                                  onDoubleClick={() => handleCellDoubleClick(student.id, col.id, score)}
                                  className={`grade-cell text-center ${cellClass} ${isActive ? 'focused' : ''}`}
                                >
                                  {isEditing ? (
                                    <input
                                      type="text"
                                      value={editValue}
                                      onChange={(e) => setEditValue(e.target.value)}
                                      onBlur={handleInlineSave}
                                      onKeyDown={(e) => e.key === 'Enter' && handleInlineSave()}
                                      className="excel-cell-input"
                                      autoFocus
                                    />
                                  ) : (
                                    <span>{score}</span>
                                  )}
                                </td>
                              );
                            })}

                            {/* Category Average */}
                            <td className="cat-avg-td text-center">
                              {catAverage !== null ? catAverage : '-'}
                            </td>
                          </React.Fragment>
                        );
                      })}

                      {/* Final Grade */}
                      <td className="final-grade-td text-center">
                        <span className={`final-badge ${typeof finalGrade === 'number' && finalGrade < 6.0 ? 'bad' : 'good'}`}>
                          {finalGrade}
                        </span>
                      </td>

                      {/* Status Warning */}
                      <td className="risk-status-td text-center">
                        {isAtRisk ? (
                          <span className="badge badge-risk" title={riskReason}>
                            Riesgo
                          </span>
                        ) : (
                          <span className="badge badge-success">Regular</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Capture Help Box */}
      <div className="grades-help-legend no-print">
        <HelpCircle size={14} />
        <span><strong>NP</strong> = No Presentó (vale 0) | <strong>SE</strong> = Sin Entregar (vale 0) | <strong>P</strong> = Pendiente (excluido del promedio)</span>
      </div>

      {/* Floating Island for Capture */}
      {activeCell && (
        <FloatingIsland
          isOpen={activeCell !== null}
          studentName={activeCell.studentName}
          columnName={activeCell.columnName}
          currentValue={
            getStudentGradesRow(activeCell.studentId)?.grades[activeCell.columnId] ?? 'P'
          }
          onSelectValue={handleSelectIslandValue}
          onClose={() => setActiveCell(null)}
          hasPrev={students.findIndex(s => s.id === activeCell.studentId) > 0}
          hasNext={students.findIndex(s => s.id === activeCell.studentId) < students.length - 1}
          onPrev={() => {
            const idx = students.findIndex(s => s.id === activeCell.studentId);
            if (idx > 0) {
              const prevStudent = students[idx - 1];
              setActiveCell({
                ...activeCell,
                studentId: prevStudent.id,
                studentName: prevStudent.name
              });
            }
          }}
          onNext={() => {
            const idx = students.findIndex(s => s.id === activeCell.studentId);
            if (idx < students.length - 1) {
              const nextStudent = students[idx + 1];
              setActiveCell({
                ...activeCell,
                studentId: nextStudent.id,
                studentName: nextStudent.name
              });
            }
          }}
        />
      )}

      {/* Edit Weights Modal */}
      <Modal
        isOpen={isWeightModalOpen}
        title="Ajustar Criterios y Ponderaciones de Evaluación"
        onClose={() => setIsWeightModalOpen(false)}
      >
        <form onSubmit={handleSaveWeights} className="form-group-flex">
          {weightError && (
            <div className="form-error-banner">
              {weightError}
            </div>
          )}

          <p className="modal-intro-text">
            Distribuye el peso conceptual de cada categoría para obtener la calificación final. La suma total de los porcentajes debe ser exactamente <strong>100%</strong>.
          </p>

          <div className="weights-sliders-list">
            {groupCategories.map(cat => (
              <div key={cat.id} className="weight-slider-item">
                <div className="slider-label-row">
                  <h4>{cat.name}</h4>
                  <span className="slider-percentage-badge">{editedWeights[cat.id] || 0}%</span>
                </div>
                <div className="slider-input-row">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={editedWeights[cat.id] || 0}
                    onChange={(e) => setEditedWeights({
                      ...editedWeights,
                      [cat.id]: Number(e.target.value)
                    })}
                    className="slider-range-bar"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Sum Counter Visual */}
          <div className="weight-sum-indicator-row">
            <span>Suma Total:</span>
            <strong className={
              Object.values(editedWeights).reduce((a, b) => a + Number(b), 0) === 100 ? 'text-success' : 'text-danger'
            }>
              {Object.values(editedWeights).reduce((a, b) => a + Number(b), 0)}%
            </strong>
          </div>

          <div className="modal-buttons-row">
            <button
              type="button"
              onClick={() => setIsWeightModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Column Modal */}
      <Modal
        isOpen={isAddColModalOpen}
        title="Añadir Columna de Calificación"
        onClose={() => setIsAddColModalOpen(false)}
      >
        {groupCategories.length === 0 ? (
          <div className="confirm-modal-content">
            <p>Debes crear al menos una categoría de evaluación en ponderaciones antes de agregar columnas.</p>
            <button onClick={() => setIsAddColModalOpen(false)} className="btn btn-secondary">Cerrar</button>
          </div>
        ) : (
          <form onSubmit={handleAddColumn} className="form-group-flex">
            <div className="form-field">
              <label>Nombre de la Evaluación / Columna</label>
              <input
                type="text"
                placeholder="Ej. Tarea 3: División, Examen Unidad 2..."
                value={newColName}
                onChange={(e) => setNewColName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-field">
              <label>Pertenece a la Categoría</label>
              <select 
                value={newColCatId}
                onChange={(e) => setNewColCatId(e.target.value)}
              >
                {groupCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name} ({cat.weight}%)</option>
                ))}
              </select>
            </div>

            <div className="modal-buttons-row" style={{ marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => setIsAddColModalOpen(false)}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                Crear Columna
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Confirm Column Delete Modal */}
      <Modal
        isOpen={deleteColId !== null}
        title="¿Eliminar Columna?"
        onClose={() => setDeleteColId(null)}
      >
        <div className="confirm-modal-content">
          <AlertCircle size={40} className="danger-icon" />
          <p>¿Estás seguro de que deseas eliminar la columna "<strong>{deleteColId ? getColName(deleteColId) : ''}</strong>"?</p>
          <p className="subtext">
            Se borrarán definitivamente todas las calificaciones ingresadas en esta columna para todos los alumnos. Esta acción no se puede deshacer.
          </p>

          <div className="modal-buttons-row" style={{ marginTop: '24px' }}>
            <button onClick={() => setDeleteColId(null)} className="btn btn-secondary">
              Cancelar
            </button>
            <button 
              onClick={() => deleteColId && handleDeleteColumn(deleteColId)} 
              className="btn btn-danger"
            >
              Eliminar Columna
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
