-- ========================================================
-- REGISTRO DOCENTE AI - ESQUEMA DE BASE DE DATOS (SUPABASE)
-- ========================================================
-- Este script crea las tablas relacionales con soporte para
-- Row Level Security (RLS) y disparadores de perfil automatizados.

-- 1. Tabla de Perfiles de Docente
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    school TEXT,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS en perfiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to read their own profile" 
ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Allow users to update their own profile" 
ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Trigger para automatizar la creación del perfil al registrarse en Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, school, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'Docente Registrado'),
    COALESCE(new.raw_user_meta_data->>'school', 'Institución Educativa'),
    new.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. Tabla de Grupos
CREATE TABLE IF NOT EXISTS public.groups (
    id TEXT PRIMARY KEY, -- Usamos el string único del cliente (g_...) o UUID
    user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    grade TEXT NOT NULL,
    schedule TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Manage own groups" ON public.groups FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- 3. Tabla de Estudiantes (Alumnos)
CREATE TABLE IF NOT EXISTS public.students (
    id TEXT PRIMARY KEY, -- Usamos s_... o UUID
    user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    group_id TEXT REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    parent_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Manage own students" ON public.students FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- 4. Tabla de Asistencia (Attendance)
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    group_id TEXT REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
    student_id TEXT REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(2) CHECK (status IN ('A', 'F', 'R', 'J')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (student_id, date) -- Evita duplicados de asistencia el mismo día
);

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Manage own attendance" ON public.attendance FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- 5. Tabla de Categorías de Evaluación (Tareas, Exámenes, etc.)
CREATE TABLE IF NOT EXISTS public.grade_categories (
    id TEXT PRIMARY KEY, -- cat_... o UUID
    user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    group_id TEXT REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    weight NUMERIC(5,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.grade_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Manage own grade categories" ON public.grade_categories FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- 6. Tabla de Columnas de Calificación (Actividades Específicas)
CREATE TABLE IF NOT EXISTS public.grade_columns (
    id TEXT PRIMARY KEY, -- col_... o UUID
    user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    group_id TEXT REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
    category_id TEXT REFERENCES public.grade_categories(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.grade_columns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Manage own grade columns" ON public.grade_columns FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- 7. Tabla de Calificaciones de Estudiantes
CREATE TABLE IF NOT EXISTS public.student_grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    group_id TEXT REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
    student_id TEXT REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    column_id TEXT REFERENCES public.grade_columns(id) ON DELETE CASCADE NOT NULL,
    value TEXT NOT NULL, -- Almacena números (e.g. "9.5") o strings como "NP", "P", "SE"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (student_id, column_id) -- Un alumno solo tiene una nota por actividad/columna
);

ALTER TABLE public.student_grades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Manage own student grades" ON public.student_grades FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- 8. Tabla de Planeaciones Didácticas (Lesson Plans)
CREATE TABLE IF NOT EXISTS public.lesson_plans (
    id TEXT PRIMARY KEY, -- plan_... o UUID
    user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    grade_level TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'Borrador' CHECK (status IN ('Borrador', 'Completa')) NOT NULL,
    steps JSONB NOT NULL, -- Estructura JSON completa con objetivos, secuencias, rúbricas y recursos
    last_modified TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.lesson_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Manage own lesson plans" ON public.lesson_plans FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- ========================================================
-- ÍNDICES PARA OPTIMIZAR EL RENDIMIENTO DE CONSULTAS
-- ========================================================
CREATE INDEX IF NOT EXISTS idx_students_group ON public.students(group_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON public.attendance(student_id, date);
CREATE INDEX IF NOT EXISTS idx_grade_columns_category ON public.grade_columns(category_id);
CREATE INDEX IF NOT EXISTS idx_student_grades_composite ON public.student_grades(student_id, column_id);
CREATE INDEX IF NOT EXISTS idx_groups_user ON public.groups(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_plans_user ON public.lesson_plans(user_id);
