export interface Student {
  id: string;
  name: string;
  email: string;
  parentEmail: string;
}

export interface AttendanceRecord {
  [date: string]: 'A' | 'F' | 'R' | 'J'; // A = Asistencia, F = Falta, R = Retardo, J = Justificado
}

export interface GradeCategory {
  id: string;
  name: string;
  weight: number; // e.g. 30 for 30%
}

export interface ColumnGrade {
  id: string;
  name: string;
  categoryId: string; // Belongs to a Category (e.g. 'Tareas')
}

export interface StudentGrade {
  studentId: string;
  grades: {
    [columnId: string]: number | 'NP' | 'P' | 'SE'; // score, No Presentó, Pendiente, Sin Entregar
  };
}

export interface LessonPlan {
  id: string;
  title: string;
  subject: string;
  gradeLevel: string;
  lastModified: string;
  status: 'Completa' | 'Borrador';
  steps: {
    general: { subject: string; topic: string; gradeLevel: string };
    objectives: { objectives: string; expectedLearning: string };
    sequence: { start: string; development: string; close: string };
    evaluation: { evidence: string; rubric: string; instruments: string };
    resources: { resources: string; adjustments: string; observations: string };
  };
}

export interface Group {
  id: string;
  name: string;
  subject: string;
  grade: string;
  schedule: string;
  studentsCount: number;
  average: number;
  attendanceRate: number;
}

export const initialGroups: Group[] = [
  {
    id: 'g1',
    name: 'Matemáticas I - Grupo A',
    subject: 'Matemáticas',
    grade: '1º de Secundaria',
    schedule: 'Lun, Mié, Vie - 07:00 a 08:30',
    studentsCount: 8,
    average: 8.4,
    attendanceRate: 92
  },
  {
    id: 'g2',
    name: 'Física General - Grupo B',
    subject: 'Física',
    grade: '3º de Secundaria',
    schedule: 'Mar, Jue - 08:30 a 10:00',
    studentsCount: 7,
    average: 7.2,
    attendanceRate: 78 // Under 80% -> displays alert/warning
  },
  {
    id: 'g3',
    name: 'Química Orgánica - Grupo C',
    subject: 'Química',
    grade: '2º de Preparatoria',
    schedule: 'Lun, Mié - 10:30 a 12:00',
    studentsCount: 6,
    average: 8.9,
    attendanceRate: 96
  }
];

export const initialStudentsByGroup: { [groupId: string]: Student[] } = {
  g1: [
    { id: 's101', name: 'Sofía Martínez Rivas', email: 'sofia.martinez@alumno.edu.mx', parentEmail: 'padre.sofia@gmail.com' },
    { id: 's102', name: 'Santiago López Ortega', email: 'santiago.lopez@alumno.edu.mx', parentEmail: 'padre.santiago@gmail.com' },
    { id: 's103', name: 'Valentina Gómez Castro', email: 'valentina.gomez@alumno.edu.mx', parentEmail: 'padre.valentina@gmail.com' },
    { id: 's104', name: 'Mateo Hernández Ruiz', email: 'mateo.hernandez@alumno.edu.mx', parentEmail: 'padre.mateo@gmail.com' },
    { id: 's105', name: 'Isabella Flores Garza', email: 'isabella.flores@alumno.edu.mx', parentEmail: 'padre.isabella@gmail.com' },
    { id: 's106', name: 'Sebastián Cruz Díaz', email: 'sebastian.cruz@alumno.edu.mx', parentEmail: 'padre.sebastian@gmail.com' },
    { id: 's107', name: 'Camila Peña Sánchez', email: 'camila.pena@alumno.edu.mx', parentEmail: 'padre.camila@gmail.com' },
    { id: 's108', name: 'Diego Torres Romero', email: 'diego.torres@alumno.edu.mx', parentEmail: 'padre.diego@gmail.com' }
  ],
  g2: [
    { id: 's201', name: 'Alejandro Morales Vera', email: 'alejandro.morales@alumno.edu.mx', parentEmail: 'padre.alejandro@gmail.com' },
    { id: 's202', name: 'Mariana Peralta Rosas', email: 'mariana.peralta@alumno.edu.mx', parentEmail: 'padre.mariana@gmail.com' },
    { id: 's203', name: 'Emilio Navarro Domínguez', email: 'emilio.navarro@alumno.edu.mx', parentEmail: 'padre.emilio@gmail.com' },
    { id: 's204', name: 'Regina Ortiz Mendoza', email: 'regina.ortiz@alumno.edu.mx', parentEmail: 'padre.regina@gmail.com' },
    { id: 's205', name: 'Joaquín Fuentes Vidal', email: 'joaquin.fuentes@alumno.edu.mx', parentEmail: 'padre.joaquin@gmail.com' },
    { id: 's206', name: 'Lucía Aguilar Solís', email: 'lucia.aguilar@alumno.edu.mx', parentEmail: 'padre.lucia@gmail.com' },
    { id: 's207', name: 'Daniel Chávez Reyes', email: 'daniel.chavez@alumno.edu.mx', parentEmail: 'padre.daniel@gmail.com' }
  ],
  g3: [
    { id: 's301', name: 'Andrea Silva Delgado', email: 'andrea.silva@alumno.edu.mx', parentEmail: 'padre.andrea@gmail.com' },
    { id: 's302', name: 'Leonardo Espinoza Cruz', email: 'leonardo.espinoza@alumno.edu.mx', parentEmail: 'padre.leonardo@gmail.com' },
    { id: 's303', name: 'Ximena Salgado Lara', email: 'ximena.salgado@alumno.edu.mx', parentEmail: 'padre.ximena@gmail.com' },
    { id: 's304', name: 'Bruno Vázquez Meza', email: 'bruno.vazquez@alumno.edu.mx', parentEmail: 'padre.bruno@gmail.com' },
    { id: 's305', name: 'Natalia Cordero Luna', email: 'natalia.cordero@alumno.edu.mx', parentEmail: 'padre.natalia@gmail.com' },
    { id: 's306', name: 'Patricio Medina Juárez', email: 'patricio.medina@alumno.edu.mx', parentEmail: 'padre.patricio@gmail.com' }
  ]
};

export const initialAttendanceByGroup: { [groupId: string]: { [studentId: string]: AttendanceRecord } } = {
  g1: {
    s101: { '2026-05-18': 'A', '2026-05-15': 'A', '2026-05-13': 'A', '2026-05-11': 'A' },
    s102: { '2026-05-18': 'A', '2026-05-15': 'A', '2026-05-13': 'A', '2026-05-11': 'R' },
    s103: { '2026-05-18': 'A', '2026-05-15': 'A', '2026-05-13': 'F', '2026-05-11': 'A' },
    s104: { '2026-05-18': 'A', '2026-05-15': 'A', '2026-05-13': 'A', '2026-05-11': 'A' },
    s105: { '2026-05-18': 'F', '2026-05-15': 'A', '2026-05-13': 'A', '2026-05-11': 'A' },
    s106: { '2026-05-18': 'A', '2026-05-15': 'A', '2026-05-13': 'A', '2026-05-11': 'A' },
    s107: { '2026-05-18': 'A', '2026-05-15': 'J', '2026-05-13': 'A', '2026-05-11': 'A' },
    s108: { '2026-05-18': 'A', '2026-05-15': 'A', '2026-05-13': 'A', '2026-05-11': 'A' }
  },
  g2: {
    s201: { '2026-05-19': 'A', '2026-05-14': 'A', '2026-05-12': 'F' },
    s202: { '2026-05-19': 'F', '2026-05-14': 'F', '2026-05-12': 'A' }, // Under 80% attendance
    s203: { '2026-05-19': 'A', '2026-05-14': 'A', '2026-05-12': 'A' },
    s204: { '2026-05-19': 'A', '2026-05-14': 'F', '2026-05-12': 'R' }, // Under 80% attendance
    s205: { '2026-05-19': 'A', '2026-05-14': 'A', '2026-05-12': 'A' },
    s206: { '2026-05-19': 'A', '2026-05-14': 'A', '2026-05-12': 'A' },
    s207: { '2026-05-19': 'F', '2026-05-14': 'A', '2026-05-12': 'A' }
  },
  g3: {
    s301: { '2026-05-18': 'A', '2026-05-13': 'A' },
    s302: { '2026-05-18': 'A', '2026-05-13': 'A' },
    s303: { '2026-05-18': 'A', '2026-05-13': 'A' },
    s304: { '2026-05-18': 'A', '2026-05-13': 'A' },
    s305: { '2026-05-18': 'A', '2026-05-13': 'A' },
    s306: { '2026-05-18': 'A', '2026-05-13': 'A' }
  }
};

export const initialCategoriesByGroup: { [groupId: string]: GradeCategory[] } = {
  g1: [
    { id: 'cat1', name: 'Tareas', weight: 30 },
    { id: 'cat2', name: 'Exámenes', weight: 40 },
    { id: 'cat3', name: 'Proyecto Final', weight: 30 }
  ],
  g2: [
    { id: 'cat4', name: 'Prácticas de Lab', weight: 40 },
    { id: 'cat5', name: 'Examen de Unidad', weight: 40 },
    { id: 'cat6', name: 'Participación', weight: 20 }
  ],
  g3: [
    { id: 'cat7', name: 'Ejercicios', weight: 20 },
    { id: 'cat8', name: 'Proyecto Síntesis', weight: 50 },
    { id: 'cat9', name: 'Examen Parcial', weight: 30 }
  ]
};

export const initialColumnsByGroup: { [groupId: string]: ColumnGrade[] } = {
  g1: [
    { id: 'col1', name: 'Tarea 1: Fracciones', categoryId: 'cat1' },
    { id: 'col2', name: 'Tarea 2: Ecuaciones', categoryId: 'cat1' },
    { id: 'col3', name: 'Parcial 1', categoryId: 'cat2' },
    { id: 'col4', name: 'Parcial 2', categoryId: 'cat2' },
    { id: 'col5', name: 'Proyecto: Geometría', categoryId: 'cat3' }
  ],
  g2: [
    { id: 'col6', name: 'Práctica 1: Péndulo', categoryId: 'cat4' },
    { id: 'col7', name: 'Práctica 2: Palanca', categoryId: 'cat4' },
    { id: 'col8', name: 'Examen Fricción', categoryId: 'cat5' },
    { id: 'col9', name: 'Interés Científico', categoryId: 'cat6' }
  ],
  g3: [
    { id: 'col10', name: 'Ej. Alcanos', categoryId: 'cat7' },
    { id: 'col11', name: 'Ej. Alcoholes', categoryId: 'cat7' },
    { id: 'col12', name: 'Reporte Reacciones', categoryId: 'cat8' },
    { id: 'col13', name: 'Examen Orgánica I', categoryId: 'cat9' }
  ]
};

export const initialGradesByGroup: { [groupId: string]: StudentGrade[] } = {
  g1: [
    { studentId: 's101', grades: { col1: 10, col2: 9, col3: 8, col4: 9, col5: 10 } },
    { studentId: 's102', grades: { col1: 8, col2: 8, col3: 7, col4: 8, col5: 9 } },
    { studentId: 's103', grades: { col1: 9, col2: 10, col3: 5, col4: 6, col5: 8 } }, // Score under 6.0 (Parcial 1)
    { studentId: 's104', grades: { col1: 7, col2: 8, col3: 9, col4: 8, col5: 8 } },
    { studentId: 's105', grades: { col1: 5, col2: 6, col3: 5, col4: 6, col5: 'SE' } }, // Student in risk!
    { studentId: 's106', grades: { col1: 9, col2: 9, col3: 8, col4: 9, col5: 10 } },
    { studentId: 's107', grades: { col1: 10, col2: 10, col3: 9, col4: 10, col5: 9 } },
    { studentId: 's108', grades: { col1: 8, col2: 7, col3: 8, col4: 7, col5: 8 } }
  ],
  g2: [
    { studentId: 's201', grades: { col6: 8, col7: 9, col8: 8, col9: 10 } },
    { studentId: 's202', grades: { col6: 6, col7: 'SE', col8: 5, col9: 7 } }, // Student in risk!
    { studentId: 's203', grades: { col6: 9, col7: 10, col8: 9, col9: 9 } },
    { studentId: 's204', grades: { col6: 5, col7: 6, col8: 'NP', col9: 6 } }, // Student in risk!
    { studentId: 's205', grades: { col6: 8, col7: 8, col8: 8, col9: 8 } },
    { studentId: 's206', grades: { col6: 9, col7: 9, col8: 9, col9: 9 } },
    { studentId: 's207', grades: { col6: 7, col7: 8, col8: 6, col9: 8 } }
  ],
  g3: [
    { studentId: 's301', grades: { col10: 10, col11: 10, col12: 9, col13: 9 } },
    { studentId: 's302', grades: { col10: 9, col11: 8, col12: 8, col13: 8 } },
    { studentId: 's303', grades: { col10: 10, col11: 9, col12: 10, col13: 9 } },
    { studentId: 's304', grades: { col10: 8, col11: 7, col12: 8, col13: 8 } },
    { studentId: 's305', grades: { col10: 9, col11: 9, col12: 9, col13: 10 } },
    { studentId: 's306', grades: { col10: 10, col11: 10, col12: 10, col13: 10 } }
  ]
};

export const initialLessonPlans: LessonPlan[] = [
  {
    id: 'p1',
    title: 'Fracciones y sus aplicaciones reales',
    subject: 'Matemáticas',
    gradeLevel: '1º de Secundaria',
    lastModified: '2026-05-18',
    status: 'Completa',
    steps: {
      general: { subject: 'Matemáticas', topic: 'Fracciones', gradeLevel: '1º de Secundaria' },
      objectives: {
        objectives: 'Que los alumnos resuelvan problemas matemáticos que involucren sumas y restas de fracciones de distintos denominadores.',
        expectedLearning: 'Resuelve problemas de suma y resta con números enteros, fracciones y decimales positivos y negativos.'
      },
      sequence: {
        start: 'Iniciar la clase mostrando una pizza de cartón dividida en rebanadas y preguntar cómo repartirla de manera equitativa.',
        development: 'Explicar de forma interactiva el concepto de mínimo común múltiplo. Resolver ejercicios guiados en el pizarrón con participación grupal.',
        close: 'Realizar una breve dinámica de juego de roles (Tiendita de Fracciones) donde compren ingredientes con fracciones.'
      },
      evaluation: {
        evidence: 'Hoja de trabajo individual resuelta.',
        rubric: 'Excelente: Todo correcto y procedimiento claro. Suficiente: Mayoría correcta con algunos fallos de simplificación. Insuficiente: No logra sumar denominadores distintos.',
        instruments: 'Rúbrica analítica, Lista de cotejo'
      },
      resources: {
        resources: 'Pizza didáctica de cartón, Hojas de problemas impresos, Proyector.',
        adjustments: 'Para alumnos con rezago, proveer material concreto físico para representar las fracciones y simplificar denominadores (ej. usar solo medios, cuartos y octavos).',
        observations: 'El grupo se muestra muy receptivo con el uso del material táctil.'
      }
    }
  },
  {
    id: 'p2',
    title: 'Leyes de Newton en la vida cotidiana',
    subject: 'Física',
    gradeLevel: '3º de Secundaria',
    lastModified: '2026-05-19',
    status: 'Borrador',
    steps: {
      general: { subject: 'Física', topic: 'Leyes de Newton', gradeLevel: '3º de Secundaria' },
      objectives: {
        objectives: 'Comprender y modelar las tres Leyes de Newton por medio de experimentos caseros de bajo costo.',
        expectedLearning: 'Identifica y describe la fuerza como la causa del cambio de movimiento de los cuerpos a partir de las Leyes de Newton.'
      },
      sequence: {
        start: 'Mostrar un coche de juguete estático y preguntar cómo hacer que se mueva e identificar qué fuerzas actúan.',
        development: 'Escribir las fórmulas F=ma. Hacer un experimento rápido empujando coches de distintos pesos usando un globo inflado.',
        close: 'Hacer una ronda de preguntas rápidas relacionando la inercia con usar el cinturón de seguridad en el auto.'
      },
      evaluation: {
        evidence: 'Reporte escrito del experimento de los coches de globo.',
        rubric: 'Excelente: Integra los tres principios y describe las variables. Suficiente: Registra observaciones básicas. Insuficiente: Solo describe el juego sin enlazar los conceptos físicos.',
        instruments: 'Escala estimativa'
      },
      resources: {
        resources: 'Coches de juguete, globos, popotes, cinta, báscula de cocina.',
        adjustments: 'Asegurar participación activa de alumnos tímidos asignándoles el rol de registrar datos.',
        observations: 'Requiere más tiempo de desarrollo del planeado.'
      }
    }
  }
];
