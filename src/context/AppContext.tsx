/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
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

  // Supabase Auth and Sync Status
  user: User | null;
  session: Session | null;
  isSyncing: boolean;
  isSupabaseActive: boolean;
  login: (email: string, password: string) => Promise<{ error: any }>;
  register: (email: string, password: string, name: string, school: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  syncDataFromCloud: () => Promise<void>;
  syncLocalToCloud: () => Promise<void>;
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

  // Supabase Integration States
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isSupabaseActive, setIsSupabaseActive] = useState<boolean>(() => isSupabaseConfigured());

  // Listen to Supabase configuration changes via event or periodic check
  useEffect(() => {
    const interval = setInterval(() => {
      const active = isSupabaseConfigured();
      if (active !== isSupabaseActive) {
        setIsSupabaseActive(active);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isSupabaseActive]);

  // Auth State Listener
  useEffect(() => {
    if (!isSupabaseActive) return;

    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        syncDataFromCloud();
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        syncDataFromCloud();
      } else {
        // Logged out
        setGroups(initialGroups);
        setStudentsByGroup(initialStudentsByGroup);
        setAttendanceByGroup(initialAttendanceByGroup);
        setCategoriesByGroup(initialCategoriesByGroup);
        setColumnsByGroup(initialColumnsByGroup);
        setGradesByGroup(initialGradesByGroup);
        setLessonPlans(initialLessonPlans);
      }
    });

    return () => subscription.unsubscribe();
  }, [isSupabaseActive]);

  // Save to localStorage whenever state changes (Local Backup / Fallback)
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

  // Fetch full data from Supabase to Hydrate State
  const syncDataFromCloud = async () => {
    if (!isSupabaseActive) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    setIsSyncing(true);
    try {
      // 1. Fetch groups
      const { data: dbGroups, error: errGroups } = await supabase
        .from('groups')
        .select('*')
        .order('created_at', { ascending: true });
      if (errGroups) throw errGroups;

      // 2. Fetch students
      const { data: dbStudents, error: errStudents } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: true });
      if (errStudents) throw errStudents;

      // 3. Fetch attendance
      const { data: dbAttendance, error: errAttendance } = await supabase
        .from('attendance')
        .select('*');
      if (errAttendance) throw errAttendance;

      // 4. Fetch grade categories
      const { data: dbCats, error: errCats } = await supabase
        .from('grade_categories')
        .select('*')
        .order('created_at', { ascending: true });
      if (errCats) throw errCats;

      // 5. Fetch grade columns
      const { data: dbCols, error: errCols } = await supabase
        .from('grade_columns')
        .select('*')
        .order('created_at', { ascending: true });
      if (errCols) throw errCols;

      // 6. Fetch student grades
      const { data: dbGrades, error: errGrades } = await supabase
        .from('student_grades')
        .select('*');
      if (errGrades) throw errGrades;

      // 7. Fetch lesson plans
      const { data: dbPlans, error: errPlans } = await supabase
        .from('lesson_plans')
        .select('*')
        .order('created_at', { ascending: false });
      if (errPlans) throw errPlans;

      // Set State
      const nextGroups = dbGroups?.map(g => ({
        id: g.id,
        name: g.name,
        subject: g.subject,
        grade: g.grade,
        schedule: g.schedule || '',
        studentsCount: dbStudents?.filter(s => s.group_id === g.id).length || 0,
        average: 10, // will be computed reactively
        attendanceRate: 100 // will be computed reactively
      })) || [];

      // Maps
      const nextStudents: { [groupId: string]: Student[] } = {};
      dbStudents?.forEach(s => {
        if (!nextStudents[s.group_id]) nextStudents[s.group_id] = [];
        nextStudents[s.group_id].push({
          id: s.id,
          name: s.name,
          email: s.email || '',
          parentEmail: s.parent_email || ''
        });
      });

      const nextAttendance: { [groupId: string]: { [studentId: string]: { [date: string]: 'A' | 'F' | 'R' | 'J' } } } = {};
      dbAttendance?.forEach(a => {
        if (!nextAttendance[a.group_id]) nextAttendance[a.group_id] = {};
        if (!nextAttendance[a.group_id][a.student_id]) nextAttendance[a.group_id][a.student_id] = {};
        nextAttendance[a.group_id][a.student_id][a.date] = a.status as 'A' | 'F' | 'R' | 'J';
      });

      const nextCategories: { [groupId: string]: GradeCategory[] } = {};
      dbCats?.forEach(c => {
        if (!nextCategories[c.group_id]) nextCategories[c.group_id] = [];
        nextCategories[c.group_id].push({
          id: c.id,
          name: c.name,
          weight: Number(c.weight)
        });
      });

      const nextColumns: { [groupId: string]: ColumnGrade[] } = {};
      dbCols?.forEach(c => {
        if (!nextColumns[c.group_id]) nextColumns[c.group_id] = [];
        nextColumns[c.group_id].push({
          id: c.id,
          name: c.name,
          categoryId: c.category_id
        });
      });

      const nextGrades: { [groupId: string]: StudentGrade[] } = {};
      dbGrades?.forEach(g => {
        if (!nextGrades[g.group_id]) nextGrades[g.group_id] = [];
        let row = nextGrades[g.group_id].find(r => r.studentId === g.student_id);
        if (!row) {
          row = { studentId: g.student_id, grades: {} };
          nextGrades[g.group_id].push(row);
        }
        const numericVal = Number(g.value);
        row.grades[g.column_id] = isNaN(numericVal) ? (g.value as any) : numericVal;
      });

      const nextPlans: LessonPlan[] = dbPlans?.map(p => ({
        id: p.id,
        title: p.title,
        subject: p.subject,
        gradeLevel: p.grade_level,
        status: p.status as 'Completa' | 'Borrador',
        steps: p.steps as any,
        lastModified: p.last_modified
      })) || [];

      // Hydrate state
      setGroups(nextGroups);
      setStudentsByGroup(nextStudents);
      setAttendanceByGroup(nextAttendance);
      setCategoriesByGroup(nextCategories);
      setColumnsByGroup(nextColumns);
      setGradesByGroup(nextGrades);
      setLessonPlans(nextPlans);
      
      console.log('Datos sincronizados correctamente desde la nube.');
    } catch (err) {
      console.error('Error al sincronizar datos desde Supabase:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Upload/Merge Local Data to Supabase (Punto 2 approved merge strategy)
  const syncLocalToCloud = async () => {
    if (!isSupabaseActive) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    
    const userId = session.user.id;
    setIsSyncing(true);
    try {
      // 1. Upload groups
      if (groups.length > 0) {
        const groupsToUpsert = groups.map(g => ({
          id: g.id,
          user_id: userId,
          name: g.name,
          subject: g.subject,
          grade: g.grade,
          schedule: g.schedule
        }));
        await supabase.from('groups').upsert(groupsToUpsert);
      }

      // 2. Upload students
      const allStudents: any[] = [];
      Object.keys(studentsByGroup).forEach(groupId => {
        studentsByGroup[groupId].forEach(s => {
          allStudents.push({
            id: s.id,
            user_id: userId,
            group_id: groupId,
            name: s.name,
            email: s.email,
            parent_email: s.parentEmail
          });
        });
      });
      if (allStudents.length > 0) {
        await supabase.from('students').upsert(allStudents);
      }

      // 3. Upload attendance
      const allAttendance: any[] = [];
      Object.keys(attendanceByGroup).forEach(groupId => {
        Object.keys(attendanceByGroup[groupId]).forEach(studentId => {
          Object.keys(attendanceByGroup[groupId][studentId]).forEach(dateStr => {
            allAttendance.push({
              user_id: userId,
              group_id: groupId,
              student_id: studentId,
              date: dateStr,
              status: attendanceByGroup[groupId][studentId][dateStr]
            });
          });
        });
      });
      if (allAttendance.length > 0) {
        await supabase.from('attendance').upsert(allAttendance);
      }

      // 4. Upload grade categories
      const allCategories: any[] = [];
      Object.keys(categoriesByGroup).forEach(groupId => {
        categoriesByGroup[groupId].forEach(cat => {
          allCategories.push({
            id: cat.id,
            user_id: userId,
            group_id: groupId,
            name: cat.name,
            weight: cat.weight
          });
        });
      });
      if (allCategories.length > 0) {
        await supabase.from('grade_categories').upsert(allCategories);
      }

      // 5. Upload grade columns
      const allColumns: any[] = [];
      Object.keys(columnsByGroup).forEach(groupId => {
        columnsByGroup[groupId].forEach(col => {
          allColumns.push({
            id: col.id,
            user_id: userId,
            group_id: groupId,
            category_id: col.categoryId,
            name: col.name
          });
        });
      });
      if (allColumns.length > 0) {
        await supabase.from('grade_columns').upsert(allColumns);
      }

      // 6. Upload student grades
      const allGrades: any[] = [];
      Object.keys(gradesByGroup).forEach(groupId => {
        gradesByGroup[groupId].forEach(row => {
          Object.keys(row.grades).forEach(columnId => {
            allGrades.push({
              user_id: userId,
              group_id: groupId,
              student_id: row.studentId,
              column_id: columnId,
              value: String(row.grades[columnId])
            });
          });
        });
      });
      if (allGrades.length > 0) {
        await supabase.from('student_grades').upsert(allGrades);
      }

      // 7. Upload lesson plans
      if (lessonPlans.length > 0) {
        const plansToUpsert = lessonPlans.map(p => ({
          id: p.id,
          user_id: userId,
          title: p.title,
          subject: p.subject,
          grade_level: p.gradeLevel,
          status: p.status,
          steps: p.steps,
          last_modified: p.lastModified
        }));
        await supabase.from('lesson_plans').upsert(plansToUpsert);
      }

      console.log('Datos locales fusionados en la nube con éxito.');
    } catch (err) {
      console.error('Error al fusionar datos locales en Supabase:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Auth Operations
  const login = async (email: string, password: string) => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      // Load their data
      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
        await syncDataFromCloud();
      }
      return { error: null };
    } catch (err: any) {
      return { error: err };
    } finally {
      setIsSyncing(false);
    }
  };

  const register = async (email: string, password: string, name: string, school: string) => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, school }
        }
      });
      if (error) throw error;

      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
        // User created, sync their local data to the cloud! (Merge strategy)
        await syncLocalToCloud();
      }
      return { error: null };
    } catch (err: any) {
      return { error: err };
    } finally {
      setIsSyncing(false);
    }
  };

  const logout = async () => {
    setIsSyncing(true);
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Actions
  const addGroup = async (name: string, subject: string, grade: string, schedule: string) => {
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
    const defaultCats = [
      { id: `c1_${newId}`, name: 'Tareas', weight: 40 },
      { id: `c2_${newId}`, name: 'Exámenes', weight: 40 },
      { id: `c3_${newId}`, name: 'Proyecto Final', weight: 20 }
    ];
    setCategoriesByGroup(prev => ({ ...prev, [newId]: defaultCats }));
    setColumnsByGroup(prev => ({ ...prev, [newId]: [] }));
    setGradesByGroup(prev => ({ ...prev, [newId]: [] }));

    // Supabase double-write
    if (user) {
      setIsSyncing(true);
      try {
        await supabase.from('groups').insert({
          id: newId,
          user_id: user.id,
          name,
          subject,
          grade,
          schedule
        });
        await supabase.from('grade_categories').insert(
          defaultCats.map(c => ({
            id: c.id,
            user_id: user.id,
            group_id: newId,
            name: c.name,
            weight: c.weight
          }))
        );
      } catch (err) {
        console.error('Error al guardar grupo en Supabase:', err);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const deleteGroup = async (groupId: string) => {
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

    // Supabase double-write
    if (user) {
      setIsSyncing(true);
      try {
        await supabase.from('groups').delete().eq('id', groupId);
      } catch (err) {
        console.error('Error al borrar grupo de Supabase:', err);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const addStudent = async (groupId: string, name: string, email: string, parentEmail: string) => {
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

    // Supabase double-write
    if (user) {
      setIsSyncing(true);
      try {
        await supabase.from('students').insert({
          id: studentId,
          user_id: user.id,
          group_id: groupId,
          name,
          email,
          parent_email: parentEmail
        });
      } catch (err) {
        console.error('Error al guardar alumno en Supabase:', err);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const deleteStudent = async (groupId: string, studentId: string) => {
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

    // Supabase double-write
    if (user) {
      setIsSyncing(true);
      try {
        await supabase.from('students').delete().eq('id', studentId);
      } catch (err) {
        console.error('Error al borrar alumno de Supabase:', err);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const importStudents = (groupId: string, text: string) => {
    const lines = text.split(/[\n,;]/);
    const parsedNames: string[] = [];

    lines.forEach(line => {
      let clean = line.replace(/^\s*\d+[.\-)\s]*/, '').trim();
      clean = clean.replace(/\([^)]+\)/g, '').trim();
      
      if (clean.length > 2 && !clean.includes('@')) {
        const formatted = clean.split(/\s+/).map(word => 
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
        parsedNames.push(formatted);
      }
    });

    if (parsedNames.length === 0) return;

    parsedNames.forEach((name) => {
      const nameParts = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(' ');
      const firstName = nameParts[0] || 'alumno';
      const lastName = nameParts[1] || 'apellido';
      const email = `${firstName}.${lastName}@alumno.edu.mx`;
      const parentEmail = `padre.${firstName}@gmail.com`;
      addStudent(groupId, name, email, parentEmail);
    });
  };

  const updateAttendance = async (groupId: string, studentId: string, date: string, status: 'A' | 'F' | 'R' | 'J') => {
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

    // Supabase double-write
    if (user) {
      try {
        await supabase.from('attendance').upsert({
          user_id: user.id,
          group_id: groupId,
          student_id: studentId,
          date,
          status
        });
      } catch (err) {
        console.error('Error al registrar asistencia en Supabase:', err);
      }
    }
  };

  const addCategory = (groupId: string, name: string, weight: number) => {
    const id = `cat_${Date.now()}`;
    const newCategory: GradeCategory = { id, name, weight };
    
    setCategoriesByGroup(prev => ({
      ...prev,
      [groupId]: [...(prev[groupId] || []), newCategory]
    }));

    // Supabase double-write
    if (user) {
      supabase.from('grade_categories').insert({
        id,
        user_id: user.id,
        group_id: groupId,
        name,
        weight
      }).then(({ error }) => {
        if (error) console.error('Error al guardar categoría en Supabase:', error);
      });
    }
    
    return id;
  };

  const updateCategories = async (groupId: string, categories: GradeCategory[]) => {
    setCategoriesByGroup(prev => ({
      ...prev,
      [groupId]: categories
    }));

    // Supabase double-write
    if (user) {
      try {
        // Simple UPSERT for all categories
        await supabase.from('grade_categories').upsert(
          categories.map(c => ({
            id: c.id,
            user_id: user.id,
            group_id: groupId,
            name: c.name,
            weight: c.weight
          }))
        );
      } catch (err) {
        console.error('Error al actualizar categorías en Supabase:', err);
      }
    }
  };

  const deleteCategory = async (groupId: string, categoryId: string) => {
    setCategoriesByGroup(prev => ({
      ...prev,
      [groupId]: (prev[groupId] || []).filter(c => c.id !== categoryId)
    }));

    const cols = columnsByGroup[groupId] || [];
    const colsToDelete = cols.filter(c => c.categoryId === categoryId);
    
    colsToDelete.forEach(col => {
      deleteColumnGrade(groupId, col.id);
    });

    // Supabase double-write
    if (user) {
      try {
        await supabase.from('grade_categories').delete().eq('id', categoryId);
      } catch (err) {
        console.error('Error al borrar categoría en Supabase:', err);
      }
    }
  };

  const addColumnGrade = async (groupId: string, name: string, categoryId: string) => {
    const colId = `col_${Date.now()}`;
    const newCol: ColumnGrade = { id: colId, name, categoryId };

    setColumnsByGroup(prev => ({
      ...prev,
      [groupId]: [...(prev[groupId] || []), newCol]
    }));

    setGradesByGroup(prev => {
      const rows = prev[groupId] || [];
      const updatedRows = rows.map(row => ({
        ...row,
        grades: {
          ...row.grades,
          [colId]: 'P' as const
        }
      }));
      return {
        ...prev,
        [groupId]: updatedRows
      };
    });

    // Supabase double-write
    if (user) {
      try {
        await supabase.from('grade_columns').insert({
          id: colId,
          user_id: user.id,
          group_id: groupId,
          category_id: categoryId,
          name
        });
      } catch (err) {
        console.error('Error al añadir columna de nota en Supabase:', err);
      }
    }
  };

  const deleteColumnGrade = async (groupId: string, columnId: string) => {
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

    // Supabase double-write
    if (user) {
      try {
        await supabase.from('grade_columns').delete().eq('id', columnId);
      } catch (err) {
        console.error('Error al borrar columna de nota en Supabase:', err);
      }
    }
  };

  const updateGrade = async (groupId: string, studentId: string, columnId: string, value: number | 'NP' | 'P' | 'SE') => {
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

    // Supabase double-write
    if (user) {
      try {
        await supabase.from('student_grades').upsert({
          user_id: user.id,
          group_id: groupId,
          student_id: studentId,
          column_id: columnId,
          value: String(value)
        });
      } catch (err) {
        console.error('Error al registrar calificación en Supabase:', err);
      }
    }
  };

  const saveLessonPlan = async (plan: Omit<LessonPlan, 'lastModified' | 'id'> & { id?: string }) => {
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

    // Supabase double-write
    if (user) {
      setIsSyncing(true);
      try {
        await supabase.from('lesson_plans').upsert({
          id: planId,
          user_id: user.id,
          title: plan.title,
          subject: plan.subject,
          grade_level: plan.gradeLevel,
          status: plan.status || 'Borrador',
          steps: plan.steps,
          last_modified: today
        });
      } catch (err) {
        console.error('Error al guardar planeación en Supabase:', err);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const deleteLessonPlan = async (planId: string) => {
    setLessonPlans(prev => prev.filter(p => p.id !== planId));

    // Supabase double-write
    if (user) {
      setIsSyncing(true);
      try {
        await supabase.from('lesson_plans').delete().eq('id', planId);
      } catch (err) {
        console.error('Error al borrar planeación de Supabase:', err);
      } finally {
        setIsSyncing(false);
      }
    }
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
        total += 0;
        count++;
      }
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
    if (dates.length === 0) return 100;

    let attended = 0;
    dates.forEach(d => {
      const state = studentRecords[d];
      if (state === 'A' || state === 'R' || state === 'J') {
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
      setGeminiApiKey,

      // Supabase
      user,
      session,
      isSyncing,
      isSupabaseActive,
      login,
      register,
      logout,
      syncDataFromCloud,
      syncLocalToCloud
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
