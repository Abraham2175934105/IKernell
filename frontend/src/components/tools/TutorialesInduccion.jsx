import React, { useState } from 'react';
import { GraduationCap, CheckCircle2, ChevronRight, Play, ShieldAlert, Cpu, ArrowRight, Sparkles } from 'lucide-react';

export const TutorialesInduccion = () => {
  const [selectedTutorial, setSelectedTutorial] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([0]);

  const tutorials = [
    {
      id: 1,
      title: 'Uso y Calibracion del Semaforo Predictivo de Riesgos',
      targetRole: 'LIDER / COORDINADOR',
      duration: '4 min lectura',
      steps: [
        {
          step: 1,
          title: 'Monitoreo de Horas Perdidas y Errores Criticos',
          description: 'El algoritmo analiza continuamente la suma de minutos perdidos por contingencias reportadas por los desarrolladores y la cantidad de errores con severidad ALTA o CRITICA.'
        },
        {
          step: 2,
          title: 'Interpretacion de los Estados Verde, Naranja y Rojo',
          description: 'Verde indica normalidad operativa (<5 hrs y <1 error critico). Naranja senala riesgo moderado (>=5 hrs o >=1 error critico). Rojo dispara la alerta de accion inmediata (>15 hrs o >=3 errores criticos).'
        },
        {
          step: 3,
          title: 'Toma de Decisiones y Reasignacion de Personal',
          description: 'Ante alertas Naranjas o Rojas, el lider debe redistribuir desarrolladores a las etapas con mayor impacto o solicitar una extension formal del cronograma de entrega.'
        }
      ]
    },
    {
      id: 2,
      title: 'Reporte Transaccional de Errores e Interrupciones',
      targetRole: 'DESARROLLADOR',
      duration: '3 min lectura',
      steps: [
        {
          step: 1,
          title: 'Identificacion y Tipificacion del Error',
          description: 'Al detectar un problema en una fase WBS, clasifiquelo segun su tipologia (Logico, Sintaxis, Validacion, Concurrencia) y asigne su grado de severidad real.'
        },
        {
          step: 2,
          title: 'Registro de Contingencias y Tiempos Muertos',
          description: 'Si ocurrio un corte de energia, fallo de red o caida de base de datos, reporte los minutos exactos de inactividad con un comentario descriptivo de la causa.'
        },
        {
          step: 3,
          title: 'Actualizacion del Estado de Actividades',
          description: 'Mantenga sus tareas al dia marcando ASIGNADA, EN PROGRESO o FINALIZADA para reflejar el avance veridico del proyecto.'
        }
      ]
    },
    {
      id: 3,
      title: 'Exportacion Automatizada ETL para la Alianza Brasil',
      targetRole: 'LIDER / ADMINISTRACION',
      duration: '5 min lectura',
      steps: [
        {
          step: 1,
          title: 'Estandarizacion ISO 8601 UTC',
          description: 'El sistema convierte todas las fechas y metricas al estandar internacional UTC delimitado por plecas (|) garantizando compatibilidad con los sistemas del aliado brasilero.'
        },
        {
          step: 2,
          title: 'Ejecucion One-Click y Modo Desatendido',
          description: 'El lider puede generar el informe en tiempo real con un solo clic o confiar en la tarea programada dominical que corre asincronicamente mediante @Scheduled y @Async.'
        },
        {
          step: 3,
          title: 'Transferencia por Canales Seguros',
          description: 'Los paquetes son enrutados a traves de SFTP corporativo cifrado con notificacion simultanea por correo electronico.'
        }
      ]
    }
  ];

  const current = tutorials[selectedTutorial];

  const toggleStepCompleted = (stepIdx) => {
    if (completedSteps.includes(stepIdx)) {
      setCompletedSteps(completedSteps.filter(s => s !== stepIdx));
    } else {
      setCompletedSteps([...completedSteps, stepIdx]);
    }
  };

  return (
    <div className="glass-card p-4 sm:p-6 md:p-8 border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center shadow-md">
            <GraduationCap size={20} />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Tutoriales e Induccion Operativa
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              Guias interactivas paso a paso para dominar las herramientas y protocolos de IKernell
            </p>
          </div>
        </div>

        <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-700">
          3 Modulos de Aprendizaje
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Selector de Tutoriales */}
        <div className="flex flex-col gap-3">
          <span className="text-[0.65rem] font-extrabold uppercase tracking-widest text-zinc-400 mb-1 block">
            Seleccionar Modulo
          </span>
          {tutorials.map((tut, idx) => (
            <button
              key={tut.id}
              type="button"
              onClick={() => {
                setSelectedTutorial(idx);
                setCompletedSteps([0]);
              }}
              className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                selectedTutorial === idx
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 border-zinc-900 dark:border-white shadow-md'
                  : 'bg-zinc-50 dark:bg-zinc-900/50 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
              }`}
            >
              <div className="flex justify-between items-center mb-1.5">
                <span className={`text-[0.6rem] font-black uppercase px-2 py-0.5 rounded ${
                  selectedTutorial === idx 
                    ? 'bg-zinc-700 text-white dark:bg-zinc-200 dark:text-zinc-900' 
                    : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}>
                  {tut.targetRole}
                </span>
                <span className="text-[0.65rem] opacity-70">{tut.duration}</span>
              </div>
              <h4 className="font-bold text-sm leading-snug">{tut.title}</h4>
            </button>
          ))}
        </div>

        {/* Detalle del Tutorial y Pasos */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-500">
                Modulo {current.id} de {tutorials.length}
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                {completedSteps.length} / {current.steps.length} Pasos Completados
              </span>
            </div>

            <h4 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 mb-6">
              {current.title}
            </h4>

            <div className="space-y-4">
              {current.steps.map((st, sIdx) => {
                const isDone = completedSteps.includes(sIdx);
                return (
                  <div
                    key={sIdx}
                    onClick={() => toggleStepCompleted(sIdx)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                      isDone 
                        ? 'bg-white dark:bg-zinc-900 border-emerald-300 dark:border-emerald-800/80 shadow-sm' 
                        : 'bg-white/60 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                    }`}
                  >
                    <button
                      type="button"
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold transition-all ${
                        isDone 
                          ? 'bg-emerald-600 text-white shadow-sm' 
                          : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      {isDone ? <CheckCircle2 size={16} /> : st.step}
                    </button>

                    <div className="flex-1">
                      <h5 className={`font-bold text-sm mb-1 ${isDone ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-700 dark:text-zinc-300'}`}>
                        {st.title}
                      </h5>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                        {st.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center text-xs">
            <span className="text-zinc-500 font-medium">Haz clic en cada paso para marcarlo como completado.</span>
            <button
              type="button"
              onClick={() => setSelectedTutorial((selectedTutorial + 1) % tutorials.length)}
              className="gradient-button text-xs py-2 px-4 font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              Siguiente Modulo <ArrowRight size={14} />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
