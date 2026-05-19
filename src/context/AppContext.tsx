/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import {
  initialGroups,
  initialStudentsByGroup,
  initialAttendanceByGroup,
  initialCategoriesByGroup,
  initialColumnsByGroup,
  initialGradesByGroup,
  initialLessonPlans
} from '../data/demoData';
import type {
  Student,
  Group,
  GradeCategory,
  ColumnGrade,
  StudentGrade,
  LessonPlan
} from '../data/demoData';

interface AppContextProps {
  groups: Group[];
  studentsByGroup: { [groupId: string]: Student[] };
  attendanceByGroup: { [groupId: string]: { [studentId: string]: { [date: string]: 'A' | 'F' | 'R' | 'J' } } };
  categoriesByGroup: { [groupId: string]: GradeCategory[] };
  columnsByGroup: { [groupId: string]: ColumnGrade[] };
  gradesByGroup: { [groupId: string]: StudentGrade[] };
  lessonPlans: LessonPlan[];
  
  // Actions
  addGroup: (name: string, subject: string, grade: string, schedule: string) => void;
  deleteGroup: (groupId: string) => void;
  importStudents: (groupId: string, text: string) => void;
  addStudent: (groupId: string, name: string, email: string, parentEmail: string) => void;
  deleteStudent: (groupId: string, studentId: string) => void;
  updateAttendance: (groupId: string, studentId: string, date: string, status: 'A' | 'F' | 'R' | 'J') => void;
  addCategory: (groupId: string, name: string, weight: number) => string;
  updateCategories: (groupId: string, categories: GradeCategory[]) => void;
  deleteCategory: (groupId: string, categoryId: string) => void;
  addColumnGrade: (groupId: string, name: string, categoryId: string) => void;
  deleteColumnGrade: (groupId: string, columnId: string) => void;
  updateGrade: (groupId: string, studentId: string, columnId: string, value: number | 'NP' | 'P' | 'SE') => void;
  saveLessonPlan: (plan: Omit<LessonPlan, 'lastModified' | 'id'> & { id?: string }) => void;
  deleteLessonPlan: (planId: string) => void;
  
  // Computations
  getStudentCategoryAverage: (groupId: string, studentId: string, categoryId: string) => number | null;
  getStudentFinalGrade: (groupId: string, studentId: string) => number | 'NP' | 'P' | 'SE';
  getStudentAttendanceRate: (groupId: string, studentId: string) => number;
  getGroupAverage: (groupId: string) => number;
  getGroupAttendanceRate: (groupId: string) => number;
  getStudentsInRisk: (groupId?: string) => { student: Student; groupName: string; reason: string; avg: number; attRate: number }[];
  
  // AI Settings
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load initial data from localStorage if exists, otherwise load defaults
  const [groups, setGroups] = useState<Group[]>(() => {
    const saved = localStorage.getItem('rd_groups');
    return saved ? JSON.parse(saved) : initialGroups;
  });

  const [studentsByGroup, setStudentsByGroup] = useState<{ [groupId: string]: Student[] }>(() => {
    const saved = localStorage.getItem('rd_students');
    return saved ? JSON.parse(saved) : initialStudentsByGroup;
  });

  const [attendanceByGroup, setAttendanceByGroup] = useState<{ [groupId: string]: { [studentId: string]: { [date: string]: 'A' | 'F' | 'R' | 'J' } } }>(() => {
    const saved = localStorage.getItem('rd_attendance');
    return saved ? JSON.parse(saved) : initialAttendanceByGroup;
  });

  const [categoriesByGroup, setCategoriesByGroup] = useState<{ [groupId: string]: GradeCategory[] }>(() => {
    const saved = localStorage.getItem('rd_categories');
    return saved ? JSON.parse(saved) : initialCategoriesByGroup;
  });

  const [columnsByGroup, setColumnsByGroup] = useState<{ [groupId: string]: ColumnGrade[] }>(() => {
    const saved = localStorage.getItem('rd_columns');
    return saved ? JSON.parse(saved) : initialColumnsByGroup;
  });

  const [gradesByGroup, setGradesByGroup] = useState<{ [groupId: string]: StudentGrade[] }>(() => {
    const saved = localStorage.getItem('rd_grades');
    return saved ? JSON.parse(saved) : initialGradesByGroup;
  });

  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>(() => {
    const saved = localStorage.getItem('rd_lesson_plans');
    return saved ? JSON.parse(saved) : initialLessonPlans;
  });

  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    return localStorage.getItem('rd_gemini_api_key') || '';
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('rd_groups', JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem('rd_students', JSON.stringify(studentsByGroup));
  }, [studentsByGroup]);

  useEffect(() => {
    localStorage.setItem('rd_attendance', JSON.stringify(attendanceByGroup));
  }, [attendanceByGroup]);

  useEffect(() => {
    localStorage.setItem('rd_categories', JSON.stringify(categoriesByGroup));
  }, [categoriesByGroup]);

  useEffect(() => {
    localStorage.setItem('rd_columns', JSON.stringify(columnsByGroup));
  }, [columnsByGroup]);

  useEffect(() => {
    localStorage.setItem('rd_grades', JSON.stringify(gradesByGroup));
  }, [gradesByGroup]);

  useEffect(() => {
    localStorage.setItem('rd_lesson_plans', JSON.stringify(lessonPlans));
  }, [lessonPlans]);

  useEffect(() => {
    localStorage.setItem('rd_gemini_api_key', geminiApiKey);
  }, [geminiApiKey]);

  // Actions
  const addGroup = (name: string, subject: string, grade: string, schedule: string) => {
    const newId = `g_${Date.now()}`;
    const newGroup: Group = {
      id: newId,
      name,
      subject,
      grade,
      schedule,
      studentsCount: 0,
      average: 10,
      attendanceRate: 100
    };
    
    setGroups(prev => [...prev, newGroup]);
    setStudentsByGroup(prev => ({ ...prev, [newId]: [] }));
    setAttendanceByGroup(prev => ({ ...prev, [newId]: {} }));
    
    // Default categories that sum 100%
    setCategoriesByGroup(prev => ({
      ...prev,
      [newId]: [
        { id: `c1_${newId}`, name: 'Tareas', weight: 40 },
        { id: `c2_${newId}`, name: 'Exámenes', weight: 40 },
        { id: `c3_${newId}`, name: 'Proyecto Final', weight: 20 }
      ]
    }));
    setColumnsByGroup(prev => ({ ...prev, [newId]: [] }));
    setGradesByGroup(prev => ({ ...prev, [newId]: [] }));
  };

  const deleteGroup = (groupId: string) => {
    setGroups(prev => prev.filter(g => g.id !== groupId));
    
    const cleanState = <T,>(prev: Record<string, T>): Record<string, T> => {
      const copy = { ...prev };
      delete copy[groupId];
      return copy;
    };
    
    setStudentsByGroup(cleanState);
    setAttendanceByGroup(cleanState);
    setCategoriesByGroup(cleanState);
    setColumnsByGroup(cleanState);
    setGradesByGroup(cleanState);
  };

  const addStudent = (groupId: string, name: string, email: string, parentEmail: string) => {
    const studentId = `s_${Date.now()}`;
    const newStudent: Student = {
      id: studentId,
      name,
      email,
      parentEmail
    };

    setStudentsByGroup(prev => ({
      ...prev,
      [groupId]: [...(prev[groupId] || []), newStudent]
    }));

    // Add empty grades row for the new student
    setGradesByGroup(prev => {
      const groupGrades = prev[groupId] || [];
      const newGradeRow: StudentGrade = {
        studentId,
        grades: {}
      };
      // Pre-fill columns with "P" (Pendiente)
      const cols = columnsByGroup[groupId] || [];
      cols.forEach(col => {
        newGradeRow.grades[col.id] = 'P';
      });
      return {
        ...prev,
        [groupId]: [...groupGrades, newGradeRow]
      };
    });

    // Update group student count
    setGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        return { ...g, studentsCount: g.studentsCount + 1 };
      }
      return g;
    }));
  };

  const deleteStudent = (groupId: string, studentId: string) => {
    setStudentsByGroup(prev => ({
      ...prev,
      [groupId]: (prev[groupId] || []).filter(s => s.id !== studentId)
    }));

    setGradesByGroup(prev => ({
      ...prev,
      [groupId]: (prev[groupId] || []).filter(row => row.studentId !== studentId)
    }));

    setAttendanceByGroup(prev => {
      const copy = { ...prev };
      if (copy[groupId] && copy[groupId][studentId]) {
        delete copy[groupId][studentId];
      }
      return copy;
    });

    setGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        return { ...g, studentsCount: Math.max(0, g.studentsCount - 1) };
      }
      return g;
    }));
  };

  const importStudents = (groupId: string, text: string) => {
    // Advanced intelligence to extract student names from text
    // Handles formats like list items (1. John, 2- Mary), comma separated, tab separated or simple line breaks
    const lines = text.split(/[\n,;]/);
    const parsedNames: string[] = [];

    lines.forEach(line => {
      // Remove numbering (e.g. "1.", "1 -", "1)") and clean trailing whitespaces
      let clean = line.replace(/^\s*\d+[.\-)\s]*/, '').trim();
      // Remove email or role text if included
      clean = clean.replace(/\([^)]+\)/g, '').trim(); // Remove parenthetical info
      
      if (clean.length > 2 && !clean.includes('@')) {
        // Capitalize words
        const formatted = clean.split(/\s+/).map(word => 
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
        parsedNames.push(formatted);
      }
    });

    if (parsedNames.length === 0) return;

    parsedNames.forEach((name) => {
      // Generate email matching the name
      const nameParts = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(' ');
      const firstName = nameParts[0] || 'alumno';
      const lastName = nameParts[1] || 'apellido';
      const email = `${firstName}.${lastName}@alumno.edu.mx`;
      const parentEmail = `padre.${firstName}@gmail.com`;
      addStudent(groupId, name, email, parentEmail);
    });
  };

  const updateAttendance = (groupId: string, studentId: string, date: string, status: 'A' | 'F' | 'R' | 'J') => {
    setAttendanceByGroup(prev => {
      const groupAtt = prev[groupId] || {};
      const studentAtt = groupAtt[studentId] || {};
      
      return {
        ...prev,
        [groupId]: {
          ...groupAtt,
          [studentId]: {
            ...studentAtt,
            [date]: status
          }
        }
      };
    });
  };

  const addCategory = (groupId: string, name: string, weight: number) => {
    const id = `cat_${Date.now()}`;
    const newCategory: GradeCategory = { id, name, weight };
    
    setCategoriesByGroup(prev => ({
      ...prev,
      [groupId]: [...(prev[groupId] || []), newCategory]
    }));
    
    return id;
  };

  const updateCategories = (groupId: string, categories: GradeCategory[]) => {
    setCategoriesByGroup(prev => ({
      ...prev,
      [groupId]: categories
    }));
  };

  const deleteCategory = (groupId: string, categoryId: string) => {
    setCategoriesByGroup(prev => ({
      ...prev,
      [groupId]: (prev[groupId] || []).filter(c => c.id !== categoryId)
    }));

    // Clean columns and grades of columns that belong to deleted category
    const cols = columnsByGroup[groupId] || [];
    const colsToDelete = cols.filter(c => c.categoryId === categoryId);
    
    colsToDelete.forEach(col => {
      deleteColumnGrade(groupId, col.id);
    });
  };

  const addColumnGrade = (groupId: string, name: string, categoryId: string) => {
    const colId = `col_${Date.now()}`;
    const newCol: ColumnGrade = { id: colId, name, categoryId };

    setColumnsByGroup(prev => ({
      ...prev,
      [groupId]: [...(prev[groupId] || []), newCol]
    }));

    // Pre-fill grades for all students
    setGradesByGroup(prev => {
      const rows = prev[groupId] || [];
      const updatedRows = rows.map(row => ({
        ...row,
        grades: {
          ...row.grades,
          [colId]: 'P' as const // Start as "Pendiente"
        }
      }));
      return {
        ...prev,
        [groupId]: updatedRows
      };
    });
  };

  const deleteColumnGrade = (groupId: string, columnId: string) => {
    setColumnsByGroup(prev => ({
      ...prev,
      [groupId]: (prev[groupId] || []).filter(c => c.id !== columnId)
    }));

    setGradesByGroup(prev => {
      const rows = prev[groupId] || [];
      const updatedRows = rows.map(row => {
        const copy = { ...row.grades };
        delete copy[columnId];
        return {
          ...row,
          grades: copy
        };
      });
      return {
        ...prev,
        [groupId]: updatedRows
      };
    });
  };

  const updateGrade = (groupId: string, studentId: string, columnId: string, value: number | 'NP' | 'P' | 'SE') => {
    setGradesByGroup(prev => {
      const rows = prev[groupId] || [];
      let studentFound = false;

      const updatedRows = rows.map(row => {
        if (row.studentId === studentId) {
          studentFound = true;
          return {
            ...row,
            grades: {
              ...row.grades,
              [columnId]: value
            }
          };
        }
        return row;
      });

      if (!studentFound) {
        // If not found, add a new row
        updatedRows.push({
          studentId,
          grades: { [columnId]: value }
        });
      }

      return {
        ...prev,
        [groupId]: updatedRows
      };
    });
  };

  const saveLessonPlan = (plan: Omit<LessonPlan, 'lastModified' | 'id'> & { id?: string }) => {
    const isNew = !plan.id;
    const planId = plan.id || `plan_${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];

    const finalPlan: LessonPlan = {
      id: planId,
      title: plan.title,
      subject: plan.subject,
      gradeLevel: plan.gradeLevel,
      status: plan.status || 'Borrador',
      steps: plan.steps,
      lastModified: today
    };

    setLessonPlans(prev => {
      if (isNew) {
        return [finalPlan, ...prev];
      } else {
        return prev.map(p => p.id === planId ? finalPlan : p);
      }
    });
  };

  const deleteLessonPlan = (planId: string) => {
    setLessonPlans(prev => prev.filter(p => p.id !== planId));
  };

  // Computations
  const getStudentCategoryAverage = (groupId: string, studentId: string, categoryId: string): number | null => {
    const cols = (columnsByGroup[groupId] || []).filter(c => c.categoryId === categoryId);
    if (cols.length === 0) return null;

    const studentGrades = (gradesByGroup[groupId] || []).find(r => r.studentId === studentId);
    if (!studentGrades) return null;

    let total = 0;
    let count = 0;

    cols.forEach(col => {
      const val = studentGrades.grades[col.id];
      if (typeof val === 'number') {
        total += val;
        count++;
      } else if (val === 'NP' || val === 'SE') {
        // NP or SE counts as 0 for averaging
        total += 0;
        count++;
      }
      // P (Pendiente) is skipped in current averages to avoid penalizing student early
    });

    return count > 0 ? Number((total / count).toFixed(1)) : null;
  };

  const getStudentFinalGrade = (groupId: string, studentId: string): number | 'NP' | 'P' | 'SE' => {
    const categories = categoriesByGroup[groupId] || [];
    if (categories.length === 0) return 'P';

    let finalSum = 0;
    let weightsSum = 0;
    let activeCategoriesCount = 0;

    categories.forEach(cat => {
      const avg = getStudentCategoryAverage(groupId, studentId, cat.id);
      if (avg !== null) {
        finalSum += avg * (cat.weight / 100);
        weightsSum += cat.weight;
        activeCategoriesCount++;
      }
    });

    if (activeCategoriesCount === 0) return 'P';
    
    // Normalize in case not all categories have grades yet (so weightings are relative to what is graded)
    if (weightsSum > 0 && weightsSum < 100) {
      const normalizedGrade = (finalSum / (weightsSum / 100));
      return Number(normalizedGrade.toFixed(1));
    }

    return Number(finalSum.toFixed(1));
  };

  const getStudentAttendanceRate = (groupId: string, studentId: string): number => {
    const groupAtt = attendanceByGroup[groupId] || {};
    const studentRecords = groupAtt[studentId] || {};
    
    const dates = Object.keys(studentRecords);
    if (dates.length === 0) return 100; // Perfect by default

    let attended = 0;
    dates.forEach(d => {
      const state = studentRecords[d];
      if (state === 'A' || state === 'R' || state === 'J') {
        // Attendance, Retardo (counts), and Justificado do not penalize attendance
        attended++;
      }
    });

    return Math.round((attended / dates.length) * 100);
  };

  const getGroupAverage = (groupId: string): number => {
    const students = studentsByGroup[groupId] || [];
    if (students.length === 0) return 0;

    let total = 0;
    let gradedStudents = 0;

    students.forEach(s => {
      const fg = getStudentFinalGrade(groupId, s.id);
      if (typeof fg === 'number') {
        total += fg;
        gradedStudents++;
      }
    });

    return gradedStudents > 0 ? Number((total / gradedStudents).toFixed(1)) : 10;
  };

  const getGroupAttendanceRate = (groupId: string): number => {
    const students = studentsByGroup[groupId] || [];
    if (students.length === 0) return 100;

    let total = 0;
    students.forEach(s => {
      total += getStudentAttendanceRate(groupId, s.id);
    });

    return Math.round(total / students.length);
  };

  const getStudentsInRisk = (groupId?: string) => {
    const riskList: { student: Student; groupName: string; reason: string; avg: number; attRate: number }[] = [];
    
    const groupsToProcess = groupId ? groups.filter(g => g.id === groupId) : groups;

    groupsToProcess.forEach(group => {
      const students = studentsByGroup[group.id] || [];
      students.forEach(student => {
        const avgVal = getStudentFinalGrade(group.id, student.id);
        const attVal = getStudentAttendanceRate(group.id, student.id);
        const avgNum = typeof avgVal === 'number' ? avgVal : 0;
        
        const reasons: string[] = [];
        if (avgNum > 0 && avgNum < 6.0) {
          reasons.push(`Promedio bajo (${avgNum})`);
        }
        if (attVal < 80) {
          reasons.push(`Baja asistencia (${attVal}%)`);
        }

        if (reasons.length > 0) {
          riskList.push({
            student,
            groupName: group.name,
            reason: reasons.join(' y '),
            avg: avgNum,
            attRate: attVal
          });
        }
      });
    });

    return riskList;
  };

  return (
    <AppContext.Provider value={{
      groups,
      studentsByGroup,
      attendanceByGroup,
      categoriesByGroup,
      columnsByGroup,
      gradesByGroup,
      lessonPlans,
      
      addGroup,
      deleteGroup,
      importStudents,
      addStudent,
      deleteStudent,
      updateAttendance,
      addCategory,
      updateCategories,
      deleteCategory,
      addColumnGrade,
      deleteColumnGrade,
      updateGrade,
      saveLessonPlan,
      deleteLessonPlan,
      
      getStudentCategoryAverage,
      getStudentFinalGrade,
      getStudentAttendanceRate,
      getGroupAverage,
      getGroupAttendanceRate,
      getStudentsInRisk,
      
      geminiApiKey,
      setGeminiApiKey
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
