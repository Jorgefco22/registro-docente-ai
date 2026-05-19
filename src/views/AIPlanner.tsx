import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigation } from '../context/NavigationContext';
import { 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  RefreshCw, 
  BookOpen,
  Printer,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import type { LessonPlan } from '../data/demoData';

const aiSimulations = {
  objectives: {
    improve: "Desarrollar en el discente la facultad de analizar, estructurar y resolver problemas complejos de orden aritmético, fomentando la comprensión lógica-matemática y su aplicación contextual en su vida diaria.",
    formal: "Constituye un objetivo primordial instruir al estudiantado en los principios fundamentales del pensamiento lógico-estructurado, habilitándolos para formular ecuaciones y resolver discrepancias numéricas con rigurosidad académica.",
    simple: "Que los alumnos puedan resolver sumas y restas con números enteros y decimales en problemas simples como ir de compras.",
    secundary: "Diseñado para secundaria: Estimular el razonamiento matemático abstracto a través de la resolución y formulación de problemas algebraicos simples e incentivar el trabajo en equipo.",
    preparatory: "Diseñado para preparatoria: Consolidar el rigor algebraico y analítico del alumno para modelar comportamientos reales mediante funciones matemáticas elementales."
  },
  sequence: {
    improve: "Inicio: Sesión socrática introductoria de 10 minutos para explorar ideas previas.\n\nDesarrollo: Exposición guiada mediante diapositivas interactivas, seguida de la resolución cooperativa de un taller práctico con problemas estructurados.\n\nCierre: Dinámica de metacognición grupal ('boleto de salida') donde compartan la mayor dificultad experimentada.",
    formal: "Inicio: Se procederá a efectuar una evaluación diagnóstica verbal de conocimientos previos.\n\nDesarrollo: Disertación de la teoría metodológica respectiva y subsiguiente realización de experimentos empíricos supervisados por el docente.\n\nCierre: Presentación formal de conclusiones individuales ante el pleno del aula.",
    simple: "Inicio: Plática rápida de 5 minutos sobre dónde vemos el tema en la casa.\n\nDesarrollo: Resolver en parejas 3 ejercicios sencillos del libro de texto.\n\nCierre: Un alumno explica la respuesta en el pizarrón.",
    activity: "🧩 ACTIVIDAD AI SUGERIDA (Rally Matemático):\n1. Dividir al grupo en equipos de 4 integrantes.\n2. Colocar 5 estaciones de retos en el patio, cada una con un problema práctico diferente.\n3. Cada equipo debe resolver el reto físico y matemático para poder avanzar a la siguiente estación.\n4. El primer equipo en completar la ruta con respuestas correctas gana puntos extra para su proyecto."
  },
  evaluation: {
    improve: "Evidencias: Portafolio de ejercicios y bitácora de autoaprendizaje.\n\nInstrumento: Rúbrica analítica ponderada enfocada en proceso de razonamiento y pulcritud de solución.",
    rubric: "📋 RÚBRICA AI RECOMENDADA (Escala de valoración):\n• Excelente (10-9): Muestra un dominio conceptual completo, justifica detalladamente los pasos lógicos y llega a la solución correcta.\n• Bueno (8-7): Resuelve la mayoría de los ejercicios de forma lógica, con detalles menores de simplificación.\n• Regular (6): Identifica las variables principales pero tiene inconsistencias en la ejecución aritmética.\n• Insuficiente (5 o menor): No identifica el método adecuado para la solución del problema."
  },
  resources: {
    improve: "Recursos: Pizarrón magnético, hojas impresas de evaluación formativa, proyector de video.\n\nAdecuaciones: Para alumnos con TDAH o ritmos de aprendizaje distintos, segmentar las actividades largas en bloques cortos de 10 minutos con pausas visuales activas.",
    simple: "Recursos: Libro de texto y cuadernos.\n\nAdecuaciones: Apoyo directo al alumno con explicaciones personalizadas en su banca."
  }
};

export const AIPlanner: React.FC = () => {
  const { activePlanId, goBack, navigateTo } = useNavigation();
  const { lessonPlans, saveLessonPlan, geminiApiKey } = useApp();

  const [activeStep, setActiveStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationType, setGenerationType] = useState('');
  const [activeInputFocus, setActiveInputFocus] = useState<string>('objectives');
  const [apiError, setApiError] = useState<string | null>(null);

  // Plan State Variables
  const initialPlan = activePlanId ? lessonPlans.find(p => p.id === activePlanId) : null;

  const [title, setTitle] = useState(initialPlan ? initialPlan.title : 'Nueva Planeación Semanal');
  const [subject, setSubject] = useState(initialPlan ? initialPlan.steps.general.subject : 'Matemáticas');
  const [gradeLevel, setGradeLevel] = useState(initialPlan ? initialPlan.steps.general.gradeLevel : '1º de Secundaria');
  
  const [objectives, setObjectives] = useState(initialPlan ? initialPlan.steps.objectives.objectives : 'Que el alumno aprenda a identificar fracciones equivalentes.');
  const [expectedLearning, setExpectedLearning] = useState(initialPlan ? initialPlan.steps.objectives.expectedLearning : 'Compara y ordena fracciones y números decimales en situaciones cotidianas.');

  const [seqStart, setSeqStart] = useState(initialPlan ? initialPlan.steps.sequence.start : 'Presentar una tira de cartelera dividida en tercios y otra en sextos.');
  const [seqDev, setSeqDev] = useState(initialPlan ? initialPlan.steps.sequence.development : 'Realizar actividades del libro en equipos sobre áreas fraccionadas.');
  const [seqClose, setSeqClose] = useState(initialPlan ? initialPlan.steps.sequence.close : 'Responder un examen rápido interactivo de 3 preguntas.');

  const [evidence, setEvidence] = useState(initialPlan ? initialPlan.steps.evaluation.evidence : 'Respuestas del cuadernillo de trabajo.');
  const [rubrics, setRubrics] = useState(initialPlan ? initialPlan.steps.evaluation.rubric : 'Manejo de conceptos básicos de equivalencias.');
  const [instruments, setInstruments] = useState(initialPlan ? initialPlan.steps.evaluation.instruments : 'Lista de cotejo');

  const [resources, setResources] = useState(initialPlan ? initialPlan.steps.resources.resources : 'Plastilina didáctica, cartulinas, libro del alumno.');
  const [adjustments, setAdjustments] = useState(initialPlan ? initialPlan.steps.resources.adjustments : 'Apoyar visualmente a los alumnos de lento aprendizaje.');
  const [observations, setObservations] = useState(initialPlan ? initialPlan.steps.resources.observations : 'Se requiere repasar denominadores en la siguiente clase.');

  const [status, setStatus] = useState<'Completa' | 'Borrador'>(initialPlan ? initialPlan.status : 'Borrador');

  // Automatically select primary field on step change to align Copilot context
  React.useEffect(() => {
    if (activeStep === 2) {
      setActiveInputFocus('objectives');
    } else if (activeStep === 3) {
      setActiveInputFocus('development');
    } else if (activeStep === 4) {
      setActiveInputFocus('rubrics');
    } else if (activeStep === 5) {
      setActiveInputFocus('adjustments');
    }
    setApiError(null);
  }, [activeStep]);

  // Keep track of which textarea is active to apply the AI rewrite
  const handleFocus = (field: string) => {
    setActiveInputFocus(field);
  };

  const getFieldValue = (field: string): string => {
    switch (field) {
      case 'objectives': return objectives;
      case 'expectedLearning': return expectedLearning;
      case 'start': return seqStart;
      case 'development': return seqDev;
      case 'close': return seqClose;
      case 'evidence': return evidence;
      case 'rubrics': return rubrics;
      case 'instruments': return instruments;
      case 'resources': return resources;
      case 'adjustments': return adjustments;
      case 'observations': return observations;
      default: return '';
    }
  };

  const setFieldValue = (field: string, value: string) => {
    let cleanVal = value.trim();
    // Clean code formatting blocks if AI returns Markdown fenced blocks
    if (cleanVal.startsWith('```')) {
      const firstNewLine = cleanVal.indexOf('\n');
      if (firstNewLine !== -1) {
        cleanVal = cleanVal.substring(firstNewLine + 1).trim();
      }
      if (cleanVal.endsWith('```')) {
        cleanVal = cleanVal.substring(0, cleanVal.length - 3).trim();
      }
    }
    // Trim simple double quotes
    if (cleanVal.startsWith('"') && cleanVal.endsWith('"')) {
      cleanVal = cleanVal.slice(1, -1).trim();
    }
    
    switch (field) {
      case 'objectives': setObjectives(cleanVal); break;
      case 'expectedLearning': setExpectedLearning(cleanVal); break;
      case 'start': setSeqStart(cleanVal); break;
      case 'development': setSeqDev(cleanVal); break;
      case 'close': setSeqClose(cleanVal); break;
      case 'evidence': setEvidence(cleanVal); break;
      case 'rubrics': setRubrics(cleanVal); break;
      case 'instruments': setInstruments(cleanVal); break;
      case 'resources': setResources(cleanVal); break;
      case 'adjustments': setAdjustments(cleanVal); break;
      case 'observations': setObservations(cleanVal); break;
    }
  };

  const getSystemPrompt = (subjectStr: string, gradeStr: string) => {
    return `Eres un Asistente de Inteligencia Artificial experto en diseño curricular y pedagogía oficial.
Estás redactando una sección para la planeación didáctica de la asignatura "${subjectStr}" de nivel "${gradeStr}".

REGLAS ABSOLUTAS:
1. Tu respuesta DEBE contener ÚNICAMENTE el texto pedagógico generado o mejorado listo para insertarse en el campo de texto.
2. NO incluyas introducciones como "Aquí tienes...", explicaciones, saludos ni notas ("Espero que te sea de ayuda").
3. Escribe directamente el contenido final en idioma español.
4. Mantén un vocabulario formal, estructurado, profesional y apegado a la didáctica escolar actual.`;
  };

  const getUserPrompt = (step: number, action: string, currentValue: string) => {
    let instruction = '';
    if (step === 2) {
      if (action === 'improve') instruction = 'Enriquece y perfecciona la redacción de estos objetivos o competencias, empleando verbos de la taxonomía de Bloom y un enfoque pedagógico constructivista.';
      else if (action === 'formal') instruction = 'Transforma este propósito de clase para hacerlo sumamente académico, formal y técnico, adecuado para un plan de estudio oficial.';
      else if (action === 'simple') instruction = 'Reescribe este objetivo didáctico para que sea simple, directo y sumamente comprensible para los estudiantes y sus tutores.';
      else if (action === 'secundary') instruction = 'Adapta y redacta esta competencia escolar para el nivel de Educación Secundaria (alumnos de 12 a 15 años).';
      else if (action === 'preparatory') instruction = 'Adapta y redacta esta competencia escolar para el nivel de Bachillerato / Preparatoria (alumnos de 15 a 18 años).';
    } else if (step === 3) {
      if (action === 'improve') instruction = 'Amplía y perfecciona la descripción de estas actividades de clase, sugiriendo metodologías activas y estimaciones de tiempo.';
      else if (action === 'formal') instruction = 'Reescribe esta secuencia de actividades con un tono altamente técnico y formal de planeación de aula.';
      else if (action === 'simple') instruction = 'Reescribe estas actividades para que sean muy pragmáticas y directas, claras de ejecutar.';
      else if (action === 'activity') instruction = 'Diseña una actividad interactiva didáctica y dinámica (por ejemplo: un rally, gamificación con puntajes, o técnica de rompecabezas cooperativo) adaptada al tema actual para involucrar a los alumnos de forma divertida.';
    } else if (step === 4) {
      if (action === 'improve') instruction = 'Mejora la redacción de estas evidencias e instrumentos de evaluación escolar para hacerlos medibles, claros y de alta calidad técnica.';
      else if (action === 'rubric') instruction = 'Genera una rúbrica analítica detallada de evaluación. Incluye una escala con niveles (Excelente, Bueno, Regular, Insuficiente) y criterios claros basados en el tema de la planeación.';
    } else if (step === 5) {
      if (action === 'improve') instruction = 'Enriquece los recursos escolares y sugiere adecuaciones curriculares inclusivas de alta calidad (ej. técnicas específicas para alumnos con TDAH, ritmos de aprendizaje lentos o rezago).';
      else if (action === 'simple') instruction = 'Haz que la lista de recursos y adecuaciones escolares sea muy pragmática, simple y directa.';
    }

    if (!instruction) instruction = 'Perfecciona y enriquece pedagógicamente la redacción del siguiente texto.';

    return `${instruction}

Texto actual de referencia a transformar:
"${currentValue}"`;
  };

  // Trigger Gemini AI Generative Copilot or simulation fallback
  const triggerAICopilot = async (action: 'improve' | 'formal' | 'simple' | 'secundary' | 'preparatory' | 'activity' | 'rubric') => {
    setIsGenerating(true);
    setApiError(null);
    const label = action === 'improve' ? 'Enriqueciendo redacción' : 
                  action === 'formal' ? 'Formalizando vocabulario' :
                  action === 'simple' ? 'Simplificando contenido' :
                  action === 'activity' ? 'Estructurando actividad lúdica' :
                  action === 'rubric' ? 'Generando rúbrica analítica' :
                  'Adaptando nivel educativo';
    setGenerationType(label);

    if (geminiApiKey) {
      try {
        const sys = getSystemPrompt(subject, gradeLevel);
        const usr = getUserPrompt(activeStep, action, getFieldValue(activeInputFocus));

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [{ text: `${sys}\n\n${usr}` }]
                }
              ],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1000
              }
            })
          }
        );

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error?.message || `Error del servidor (HTTP ${response.status})`);
        }

        const data = await response.json();
        const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!textResult) {
          throw new Error('No se recibió texto de respuesta de la IA de Gemini.');
        }

        setFieldValue(activeInputFocus, textResult);
      } catch (error: any) {
        console.error('Error al llamar a la API de Gemini:', error);
        setApiError(error.message || 'Error de conexión desconocido.');
      } finally {
        setIsGenerating(false);
      }
      return;
    }

    // Fallback: Simulation mode
    setTimeout(() => {
      setIsGenerating(false);
      
      // Determine what section the user is editing and what simulation applies
      if (activeStep === 2) {
        // Objectives section
        if (action === 'improve') setObjectives(aiSimulations.objectives.improve);
        else if (action === 'formal') setObjectives(aiSimulations.objectives.formal);
        else if (action === 'simple') setObjectives(aiSimulations.objectives.simple);
        else if (action === 'secundary') setExpectedLearning(aiSimulations.objectives.secundary);
        else if (action === 'preparatory') setExpectedLearning(aiSimulations.objectives.preparatory);
      } 
      else if (activeStep === 3) {
        // Sequence section
        if (action === 'improve') {
          setSeqStart("Inicio: Sesión socrática introductoria de 10 minutos para explorar ideas previas mediante la visualización de fracciones en objetos reales.");
          setSeqDev("Desarrollo: Exposición guiada mediante diapositivas interactivas. Los estudiantes resolverán cooperativamente un taller práctico en equipos, manipulando tiras fraccionarias para corroborar equivalencias numéricas complejos.");
          setSeqClose("Cierre: Dinámica de metacognición grupal ('boleto de salida') donde compartan de forma anónima la mayor dificultad experimentada en el taller.");
        }
        else if (action === 'formal') {
          setSeqStart(aiSimulations.sequence.formal);
        }
        else if (action === 'simple') {
          setSeqDev(aiSimulations.sequence.simple);
        }
        else if (action === 'activity') {
          setSeqDev(aiSimulations.sequence.activity);
        }
      }
      else if (activeStep === 4) {
        // Evaluation section
        if (action === 'improve') setEvidence(aiSimulations.evaluation.improve);
        else if (action === 'rubric') setRubrics(aiSimulations.evaluation.rubric);
      }
      else if (activeStep === 5) {
        // Resources section
        if (action === 'improve') setResources(aiSimulations.resources.improve);
        else if (action === 'simple') setAdjustments(aiSimulations.resources.simple);
      }
    }, 1200);
  };

  const handleSave = () => {
    const plan: Omit<LessonPlan, 'lastModified' | 'id'> & { id?: string } = {
      id: activePlanId || undefined,
      title: title.trim() || 'Planeación sin título',
      subject,
      gradeLevel,
      status,
      steps: {
        general: { subject, topic: title, gradeLevel },
        objectives: { objectives, expectedLearning },
        sequence: { start: seqStart, development: seqDev, close: seqClose },
        evaluation: { evidence, rubric: rubrics, instruments },
        resources: { resources, adjustments, observations }
      }
    };

    saveLessonPlan(plan);
    goBack();
  };

  const handlePrint = () => {
    window.print();
  };

  const stepsList = [
    { nr: 1, label: 'Datos Generales' },
    { nr: 2, label: 'Objetivos' },
    { nr: 3, label: 'Secuencia' },
    { nr: 4, label: 'Evaluación' },
    { nr: 5, label: 'Recursos' },
    { nr: 6, label: 'Previsualizar' }
  ];

  return (
    <div className="view-container">
      {/* Header */}
      <div className="view-header no-print">
        <button onClick={goBack} className="btn-back-square">
          <ArrowLeft size={18} />
        </button>
        <div>
          <span className="view-pretitle">Asistente Copiloto AI</span>
          <h1 className="view-title">
            {activePlanId ? 'Editar Planeación Didáctica' : 'Redactar Nueva Planeación'}
          </h1>
        </div>
      </div>

      {/* Step Indicators Top Bar */}
      <div className="planner-steps-bar no-print">
        {stepsList.map(step => (
          <React.Fragment key={step.nr}>
            <button 
              onClick={() => setActiveStep(step.nr)}
              className={`planner-step-indicator ${activeStep === step.nr ? 'active' : ''} ${activeStep > step.nr ? 'completed' : ''}`}
            >
              <div className="indicator-circle">
                {activeStep > step.nr ? <Check size={12} /> : step.nr}
              </div>
              <span>{step.label}</span>
            </button>
            {step.nr < 6 && <ChevronRight size={14} className="step-arrow" />}
          </React.Fragment>
        ))}
      </div>

      {/* Dynamic Step Content Grid */}
      <div className="ai-planner-grid">
        {/* Main Work Area */}
        <div className={`ai-planner-workcard ${activeStep === 6 ? 'full-width print-only' : ''}`}>
          
          {/* STEP 1: GENERAL DATA */}
          {activeStep === 1 && (
            <div className="planner-step-form">
              <h3>Apartado 1: Datos de la Asignatura</h3>
              
              <div className="form-field">
                <label>Título del Bloque / Planeación</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej. Fracciones equivalentes y suma de fracciones"
                />
              </div>

              <div className="form-row-grid">
                <div className="form-field">
                  <label>Asignatura</label>
                  <select value={subject} onChange={(e) => setSubject(e.target.value)}>
                    <option value="Matemáticas">Matemáticas</option>
                    <option value="Física">Física</option>
                    <option value="Química">Química</option>
                    <option value="Español">Español</option>
                    <option value="Historia">Historia</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Nivel Académico</label>
                  <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}>
                    <option value="1º de Secundaria">1º de Secundaria</option>
                    <option value="2º de Secundaria">2º de Secundaria</option>
                    <option value="3º de Secundaria">3º de Secundaria</option>
                    <option value="1º de Preparatoria">1º de Preparatoria</option>
                    <option value="2º de Preparatoria">2º de Preparatoria</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: OBJECTIVES */}
          {activeStep === 2 && (
            <div className="planner-step-form">
              <h3>Apartado 2: Propósito Pedagógico</h3>
              
              <div className="form-field">
                <label>Objetivos Generales de la Clase</label>
                <textarea 
                  rows={4}
                  value={objectives}
                  onChange={(e) => setObjectives(e.target.value)}
                  onFocus={() => handleFocus('objectives')}
                  placeholder="Redacta la meta formativa..."
                ></textarea>
              </div>

              <div className="form-field">
                <label>Aprendizajes Esperados / Competencias</label>
                <textarea 
                  rows={4}
                  value={expectedLearning}
                  onChange={(e) => setExpectedLearning(e.target.value)}
                  onFocus={() => handleFocus('expectedLearning')}
                  placeholder="¿Qué habilidades debe adquirir el alumno?"
                ></textarea>
              </div>
            </div>
          )}

          {/* STEP 3: SEQUENCE */}
          {activeStep === 3 && (
            <div className="planner-step-form">
              <h3>Apartado 3: Secuencia Didáctica (Inicio, Desarrollo y Cierre)</h3>
              
              <div className="form-field">
                <label>Actividades de Inicio (Apertura)</label>
                <textarea 
                  rows={3}
                  value={seqStart}
                  onChange={(e) => setSeqStart(e.target.value)}
                  onFocus={() => handleFocus('start')}
                  placeholder="Ej. Introducción lúdica, rescate de ideas previas..."
                ></textarea>
              </div>

              <div className="form-field">
                <label>Actividades de Desarrollo (Núcleo)</label>
                <textarea 
                  rows={5}
                  value={seqDev}
                  onChange={(e) => setSeqDev(e.target.value)}
                  onFocus={() => handleFocus('development')}
                  placeholder="Ej. Explicación teórica, ejercicios colaborativos, prácticas..."
                ></textarea>
              </div>

              <div className="form-field">
                <label>Actividades de Cierre (Metacognición / Conclusiones)</label>
                <textarea 
                  rows={3}
                  value={seqClose}
                  onChange={(e) => setSeqClose(e.target.value)}
                  onFocus={() => handleFocus('close')}
                  placeholder="Ej. Preguntas reflexivas rápidas, resumen escolar..."
                ></textarea>
              </div>
            </div>
          )}

          {/* STEP 4: EVALUATION */}
          {activeStep === 4 && (
            <div className="planner-step-form">
              <h3>Apartado 4: Criterios e Instrumentos de Evaluación</h3>
              
              <div className="form-field">
                <label>Evidencias de Aprendizaje (Entregables)</label>
                <textarea 
                  rows={3}
                  value={evidence}
                  onChange={(e) => setEvidence(e.target.value)}
                  onFocus={() => handleFocus('evidence')}
                  placeholder="Ej. Portafolio de ejercicios, ensayo corto, mapa mental..."
                ></textarea>
              </div>

              <div className="form-row-grid">
                <div className="form-field" style={{ flex: 1.5 }}>
                  <label>Rúbrica o Escalas de Valoración</label>
                  <textarea 
                    rows={4}
                    value={rubrics}
                    onChange={(e) => setRubrics(e.target.value)}
                    onFocus={() => handleFocus('rubrics')}
                    placeholder="Describe los criterios de calificación..."
                  ></textarea>
                </div>

                <div className="form-field" style={{ flex: 1 }}>
                  <label>Instrumentos de Evaluación</label>
                  <input 
                    type="text" 
                    value={instruments}
                    onChange={(e) => setInstruments(e.target.value)}
                    placeholder="Ej. Examen escrito, Rúbrica, Lista de cotejo"
                  />
                  <span className="field-hint">Separados por comas</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: RESOURCES */}
          {activeStep === 5 && (
            <div className="planner-step-form">
              <h3>Apartado 5: Recursos y Adecuaciones Especiales</h3>
              
              <div className="form-field">
                <label>Recursos Didácticos (Materiales / Tecnología)</label>
                <textarea 
                  rows={3}
                  value={resources}
                  onChange={(e) => setResources(e.target.value)}
                  onFocus={() => handleFocus('resources')}
                  placeholder="Ej. Proyector, tijeras, cartulina escolar, software educativo..."
                ></textarea>
              </div>

              <div className="form-field">
                <label>Adecuaciones Curriculares (Inclusión / Rezago)</label>
                <textarea 
                  rows={3}
                  value={adjustments}
                  onChange={(e) => setAdjustments(e.target.value)}
                  onFocus={() => handleFocus('adjustments')}
                  placeholder="¿Cómo adaptas esta planeación para alumnos con barreras de aprendizaje?"
                ></textarea>
              </div>

              <div className="form-field">
                <label>Observaciones Adicionales</label>
                <textarea 
                  rows={2}
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  onFocus={() => handleFocus('observations')}
                  placeholder="Detalles logísticos o incidentes previstos..."
                ></textarea>
              </div>
            </div>
          )}

          {/* STEP 6: FULL PREVIEW & PRINT READY */}
          {activeStep === 6 && (
            <div className="full-document-preview">
              {/* Institutional Header */}
              <div className="document-institutional-header">
                <div className="logo-placeholder"><BookOpen /></div>
                <div className="inst-title">
                  <h2>SECTOR EDUCATIVO NACIONAL</h2>
                  <h4>FORMATO DE PLANEACIÓN DIDÁCTICA OFICIAL</h4>
                </div>
              </div>

              <div className="document-metadata-grid">
                <div className="cell"><span>Asignatura:</span> <strong>{subject}</strong></div>
                <div className="cell"><span>Grado/Grupo:</span> <strong>{gradeLevel}</strong></div>
                <div className="cell"><span>Tema Principal:</span> <strong>{title}</strong></div>
                <div className="cell"><span>Fecha Emisión:</span> <strong>{new Date().toLocaleDateString()}</strong></div>
              </div>

              <div className="document-block">
                <h3>1. PROPÓSITOS Y APRENDIZAJES</h3>
                <div className="block-content">
                  <p><strong>Objetivos Generales:</strong></p>
                  <p className="indent-p">{objectives || 'Sin definir'}</p>
                  <p><strong>Aprendizajes Esperados:</strong></p>
                  <p className="indent-p">{expectedLearning || 'Sin definir'}</p>
                </div>
              </div>

              <div className="document-block">
                <h3>2. SECUENCIA DIDÁCTICA</h3>
                <div className="block-content">
                  <div className="seq-subblock">
                    <strong>Fase de Apertura (Inicio):</strong>
                    <p>{seqStart || 'Sin definir'}</p>
                  </div>
                  <div className="seq-subblock">
                    <strong>Fase de Núcleo (Desarrollo):</strong>
                    <p>{seqDev || 'Sin definir'}</p>
                  </div>
                  <div className="seq-subblock">
                    <strong>Fase de Cierre (Evaluación):</strong>
                    <p>{seqClose || 'Sin definir'}</p>
                  </div>
                </div>
              </div>

              <div className="document-block">
                <h3>3. EVALUACIÓN Y ACOMPAÑAMIENTO</h3>
                <div className="block-content">
                  <p><strong>Evidencias Entregables:</strong> {evidence || 'Sin definir'}</p>
                  <p><strong>Instrumentos de Evaluación:</strong> {instruments || 'Sin definir'}</p>
                  <p><strong>Criterios / Rúbricas:</strong></p>
                  <pre className="pre-display-rubric">{rubrics || 'Sin definir'}</pre>
                </div>
              </div>

              <div className="document-block">
                <h3>4. RECURSOS Y ADECUACIONES INCLUSIVAS</h3>
                <div className="block-content">
                  <p><strong>Recursos Didácticos:</strong> {resources || 'Sin definir'}</p>
                  <p><strong>Adecuaciones Curriculares:</strong> {adjustments || 'Sin definir'}</p>
                  {observations && <p><strong>Observaciones:</strong> {observations}</p>}
                </div>
              </div>

              {/* Signatures Area */}
              <div className="document-signatures-row">
                <div className="signature-box">
                  <div className="line"></div>
                  <span>Prof. Mario Reyes</span>
                  <span>Docente Titular</span>
                </div>
                <div className="signature-box">
                  <div className="line"></div>
                  <span>Dirección Académica</span>
                  <span>Sello de Aprobado</span>
                </div>
              </div>

              {/* Control Buttons Row inside step 6 */}
              <div className="preview-action-buttons no-print">
                <select 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value as 'Completa' | 'Borrador')}
                  className="status-selector"
                >
                  <option value="Borrador">Guardar como Borrador</option>
                  <option value="Completa">Guardar como Completa</option>
                </select>

                <button onClick={handlePrint} className="btn btn-secondary">
                  <Printer size={16} />
                  <span>Imprimir / Exportar PDF</span>
                </button>

                <button onClick={handleSave} className="btn btn-primary">
                  <Check size={16} />
                  <span>Guardar en el Historial</span>
                </button>
              </div>
            </div>
          )}

          {/* Stepper Buttons footer */}
          {activeStep < 6 && (
            <div className="planner-navigation-row no-print">
              <button 
                disabled={activeStep === 1}
                onClick={() => setActiveStep(prev => prev - 1)}
                className="btn btn-secondary"
              >
                Anterior
              </button>
              
              <button 
                onClick={() => setActiveStep(prev => prev + 1)}
                className="btn btn-primary"
              >
                <span>Siguiente Paso</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* AI Copilot floating panel (hidden on Preview step) */}
        {activeStep < 6 && (
          <aside className="ai-copilot-aside no-print">
            <div className="copilot-card">
              <div className="copilot-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Sparkles className="spark-spin" style={{ color: geminiApiKey ? '#8e2de2' : '#55a6ff' }} />
                  <h3>Copiloto AI</h3>
                </div>
                {geminiApiKey ? (
                  <span style={{ 
                    fontSize: '9px', 
                    padding: '3px 8px', 
                    borderRadius: '12px', 
                    background: 'rgba(52, 199, 89, 0.15)', 
                    color: '#34c759', 
                    fontWeight: '600',
                    border: '1px solid rgba(52, 199, 89, 0.3)'
                  }}>
                    CONECTADO
                  </span>
                ) : (
                  <span style={{ 
                    fontSize: '9px', 
                    padding: '3px 8px', 
                    borderRadius: '12px', 
                    background: 'rgba(255, 149, 0, 0.15)', 
                    color: '#ff9500', 
                    fontWeight: '600',
                    border: '1px solid rgba(255, 149, 0, 0.3)'
                  }}>
                    SIMULADO
                  </span>
                )}
              </div>
              
              <p className="copilot-desc">
                Haz foco en cualquier cuadro de texto de la izquierda y pídele a la IA perfeccionar tu redacción de forma estructurada.
                {activeInputFocus && (
                  <span className="copilot-active-field-badge" style={{ display: 'block', marginTop: '6px', fontSize: '11px', color: '#55a6ff' }}>
                    Foco activo: <strong>{activeInputFocus}</strong>
                  </span>
                )}
              </p>

              {/* Demo Mode Banner inside Copilot Panel */}
              {!geminiApiKey && (
                <div style={{
                  background: 'rgba(142, 45, 226, 0.08)',
                  border: '1px dashed rgba(142, 45, 226, 0.25)',
                  borderRadius: '12px',
                  padding: '12px',
                  marginBottom: '16px',
                  fontSize: '0.75rem',
                  lineHeight: '1.4'
                }}>
                  <div style={{ fontWeight: '700', color: '#a855f7', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                    <Sparkles size={12} /> Modo Demostración
                  </div>
                  <p style={{ opacity: 0.85, marginBottom: '10px' }}>
                    Estás viendo respuestas demo simuladas. Agrega tu clave gratis de Google para activar el copiloto en tiempo real.
                  </p>
                  <button 
                    onClick={() => navigateTo('settings')}
                    style={{
                      background: 'linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '10px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      width: '100%',
                      textAlign: 'center',
                      boxShadow: '0 4px 10px rgba(142, 45, 226, 0.2)'
                    }}
                  >
                    Configurar Gemini Real
                  </button>
                </div>
              )}

              {/* Error Banner */}
              {apiError && (
                <div style={{
                  padding: '12px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 59, 48, 0.12)',
                  border: '1px solid rgba(255, 59, 48, 0.25)',
                  color: '#ff3b30',
                  fontSize: '0.75rem',
                  marginBottom: '16px',
                  lineHeight: '1.4'
                }}>
                  <strong>⚠️ Error en Gemini:</strong> {apiError}
                  <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                    <button onClick={() => navigateTo('settings')} style={{ background: '#ff3b30', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Revisar Key</button>
                    <button onClick={() => setApiError(null)} style={{ background: 'transparent', color: '#ff3b30', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', border: '1px solid #ff3b30', cursor: 'pointer', fontWeight: '600' }}>Descartar</button>
                  </div>
                </div>
              )}

              {/* Loader visual */}
              {isGenerating ? (
                <div className="copilot-loader">
                  <RefreshCw size={24} className="spin" style={{ color: '#55a6ff' }} />
                  <h4>{generationType}...</h4>
                  <p>{geminiApiKey ? 'Generando respuesta en tiempo real con Gemini AI...' : 'Simulando generación de contenido pedagógico...'}</p>
                </div>
              ) : (
                <div className="copilot-buttons-list">
                  <span className="group-label">🪄 Transformar Redacción</span>
                  <button 
                    onClick={() => triggerAICopilot('improve')}
                    className="copilot-btn"
                  >
                    <span>Enriquecer redacción</span>
                  </button>

                  <button 
                    onClick={() => triggerAICopilot('formal')}
                    className="copilot-btn"
                  >
                    <span>Hacerlo más formal y académico</span>
                  </button>

                  <button 
                    onClick={() => triggerAICopilot('simple')}
                    className="copilot-btn"
                  >
                    <span>Simplificar redacción básica</span>
                  </button>

                  {/* Contextual actions based on current step */}
                  {activeStep === 2 && (
                    <>
                      <span className="group-label">🏫 Adaptación de Grado</span>
                      <button onClick={() => triggerAICopilot('secundary')} className="copilot-btn">
                        <span>Adaptar a Secundaria</span>
                      </button>
                      <button onClick={() => triggerAICopilot('preparatory')} className="copilot-btn">
                        <span>Adaptar a Preparatoria</span>
                      </button>
                    </>
                  )}

                  {activeStep === 3 && (
                    <>
                      <span className="group-label">🧩 Estructurar Contenido</span>
                      <button onClick={() => triggerAICopilot('activity')} className="copilot-btn text-primary">
                        <span>Crear Actividad Dinámica</span>
                      </button>
                    </>
                  )}

                  {activeStep === 4 && (
                    <>
                      <span className="group-label">📋 Instrumentos</span>
                      <button onClick={() => triggerAICopilot('rubric')} className="copilot-btn text-primary">
                        <span>Generar Rúbrica Evaluativa</span>
                      </button>
                    </>
                  )}
                </div>
              )}

              <div className="copilot-hint-box">
                <HelpCircle size={14} />
                <span>Edita directamente el texto de la izquierda si deseas hacer ajustes personales finos.</span>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
