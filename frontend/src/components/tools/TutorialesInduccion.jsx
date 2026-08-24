import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  GraduationCap, CheckCircle2, ChevronRight, ChevronDown, Play, ShieldAlert, Cpu, ArrowRight, Sparkles,
  BookOpen, AlertTriangle, Shield, Clock, Users, Zap, Globe, FileText, Terminal,
  Lightbulb, Info, CheckSquare, ArrowDown, Activity, Database, BarChart3, Lock,
  Settings, Layers, GitBranch, Target, Eye, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Datos Exhaustivos de los Módulos Formativos ───────────────────────────────

const TUTORIALS = [
  {
    id: 1,
    title: 'Flujo WBS, Planificación y Estimación de Esfuerzo',
    targetRole: 'LIDER / COORDINADOR',
    duration: '12-15 min lectura',
    icon: Layers,
    accentColor: 'indigo',
    summary: 'Guía exhaustiva para la creación, desglose y seguimiento de la Estructura de Desglose de Trabajo (WBS) dentro de IKernell, incluyendo la asignación de actividades a desarrolladores, la calibración de estimaciones de esfuerzo por fase y el monitoreo del avance porcentual en tiempo real.',
    steps: [
      {
        step: 1,
        title: 'Contexto y Fundamento de Negocio',
        icon: Target,
        description: 'La Estructura de Desglose de Trabajo (WBS por sus siglas en inglés: Work Breakdown Structure) constituye la columna vertebral de toda gestión de proyectos de software en IKernell. Su correcta implementación garantiza que cada entregable esté vinculado a una fase medible, que cada desarrollador conozca exactamente qué le corresponde y que el coordinador pueda identificar desviaciones del cronograma antes de que se conviertan en riesgos críticos.',
        notes: [
          { type: 'important', text: 'Sin una WBS correctamente definida, el Semáforo Predictivo de Riesgos (módulo 3) no podrá calcular las métricas de desviación en tiempo real. La WBS alimenta directamente al motor de telemetría.' },
          { type: 'tip', text: 'Defina la WBS antes de la primera sesión de sprint. Los equipos que planifican con WBS reducen en un 35% el re-trabajo y las entregas fuera de plazo según la metodología PMBOK adaptada.' }
        ]
      },
      {
        step: 2,
        title: 'Pre-requisitos y Roles Autorizados',
        icon: Shield,
        description: 'Para crear o modificar una WBS, el usuario debe poseer el rol de LIDER o COORDINADOR en la plataforma. Los desarrolladores pueden visualizar la WBS asignada pero no editarla. Verifique que su sesión JWT esté activa (token válido visible en la barra superior del dashboard) y que el proyecto seleccionado en el selector de contexto sea el correcto.',
        notes: [
          { type: 'warning', text: 'Si su sesión expira durante la edición de una WBS, los cambios no guardados se perderán. El sistema no implementa auto-guardado parcial. Guarde frecuentemente con el botón "Guardar Progreso".' }
        ]
      },
      {
        step: 3,
        title: 'Paso 1: Acceder al Módulo de Planificación WBS',
        icon: Terminal,
        description: 'Desde el Dashboard de Líder, localice la sección "Gestión de Proyectos y WBS" en la barra lateral izquierda. Haga clic en "Planificación WBS" para abrir el editor visual de desglose. Se presentará una vista tipo árbol (tree view) con las fases principales del proyecto listadas verticalmente. Si es la primera vez que accede, el sistema mostrará un asistente de configuración rápida.'
      },
      {
        step: 4,
        title: 'Paso 2: Crear Fases y Sub-fases del Proyecto',
        icon: GitBranch,
        description: 'Haga clic en el botón "+ Nueva Fase" ubicado en la esquina superior derecha del editor WBS. Complete los campos obligatorios: (a) Nombre de la Fase (ej. "Diseño de Base de Datos"), (b) Fecha de Inicio Estimada, (c) Fecha de Fin Estimada, (d) Peso Porcentual dentro del proyecto total (la suma de todas las fases debe ser 100%). Para crear sub-fases, haga clic en el icono de expansión ("+" o "ChevronRight") a la izquierda de cualquier fase existente y repita el proceso.',
        notes: [
          { type: 'tip', text: 'Use la convención de nomenclatura: FASE-XX para fases principales y FASE-XX.YY para sub-fases. Ejemplo: FASE-01 = "Análisis de Requisitos", FASE-01.01 = "Levantamiento de Historias de Usuario".' }
        ]
      },
      {
        step: 5,
        title: 'Paso 3: Asignar Actividades a Desarrolladores',
        icon: Users,
        description: 'Dentro de cada fase, haga clic en "Agregar Actividad". Especifique: (a) Título descriptivo de la tarea, (b) Desarrollador asignado (seleccionable desde el directorio de personal activo), (c) Horas estimadas de esfuerzo, (d) Nivel de prioridad (Alta, Media, Baja), (e) Dependencias con otras actividades si las hay. El sistema validará automáticamente que no existan conflictos de asignación (un desarrollador con más de 40 horas semanales asignadas recibirá una advertencia visual naranja).'
      },
      {
        step: 6,
        title: 'Paso 4: Calibrar Estimaciones y Validar Cronograma',
        icon: BarChart3,
        description: 'Una vez definida la WBS completa, navegue a la pestaña "Vista Gantt" para visualizar la línea temporal del proyecto. El sistema coloreará automáticamente en rojo las fases cuya duración exceda el 120% del promedio histórico de proyectos similares. Ajuste las fechas arrastrando los extremos de las barras del Gantt o editando directamente los campos de fecha. Verifique que la "Ruta Crítica" (resaltada en rojo grueso) no contenga holguras negativas.',
        notes: [
          { type: 'important', text: 'La ruta crítica determina la duración mínima del proyecto. Cualquier retraso en una actividad de la ruta crítica se traduce directamente en un retraso del proyecto completo.' },
          { type: 'tip', text: 'Reserve un 15-20% de buffer en las estimaciones de fases que involucren integraciones con servicios externos (APIs de terceros, ETL Brasil, etc.).' }
        ]
      },
      {
        step: 7,
        title: 'Paso 5: Monitorear Avance en Tiempo Real',
        icon: Activity,
        description: 'El panel "Dashboard de Avance WBS" muestra en tiempo real el porcentaje de completitud por fase, por desarrollador y global del proyecto. Los indicadores visuales son: (a) Barra de progreso verde = dentro del cronograma, (b) Barra naranja = desvío del 10-25%, (c) Barra roja = desvío superior al 25%. El coordinador debe revisar este panel al menos una vez al día durante sprints activos y tomar acciones correctivas cuando cualquier fase marque naranja o rojo.'
      },
      {
        step: 8,
        title: 'Casos de Contingencia y Buenas Prácticas',
        icon: Lightbulb,
        description: 'Si una fase se bloquea por dependencia externa, marque el estado como "BLOQUEADA" y agregue un comentario con la causa raíz. El sistema notificará automáticamente al coordinador. Si un desarrollador debe ser reasignado, use la función "Transferir Actividad" (no elimine y recree, ya que se perdería el historial de avance). Realice revisiones de WBS semanales con el equipo completo para recalibrar estimaciones basándose en la velocidad real observada.',
        notes: [
          { type: 'warning', text: 'Nunca elimine fases o actividades que ya tengan registro de horas o avance. Use el estado "CANCELADA" para preservar la trazabilidad histórica requerida por auditoría.' }
        ]
      }
    ]
  },
  {
    id: 2,
    title: 'Gestión de Errores, Interrupciones y Contingencias Técnicas',
    targetRole: 'DESARROLLADOR',
    duration: '10-12 min lectura',
    icon: AlertTriangle,
    accentColor: 'rose',
    summary: 'Procedimiento operativo estándar para la identificación, clasificación, reporte y seguimiento de errores técnicos (bugs), interrupciones del servicio (cortes de energía, caídas de red, fallos de base de datos) y contingencias imprevistas que impactan la productividad del desarrollador y la calidad del entregable.',
    steps: [
      {
        step: 1,
        title: 'Contexto y Fundamento de Negocio',
        icon: Target,
        description: 'Todo proyecto de software enfrenta errores técnicos e interrupciones imprevistas durante su ciclo de vida. La diferencia entre un equipo de alto rendimiento y uno promedio radica en la velocidad y precisión con la que se documentan, clasifican y resuelven estos incidentes. En IKernell, cada error reportado alimenta directamente tres subsistemas críticos: (1) el Semáforo Predictivo de Riesgos, que ajusta el nivel de alerta del proyecto; (2) el motor de Estimación de Burnout, que evalúa la carga cognitiva del desarrollador; y (3) los informes ETL de la Alianza Brasil, que requieren trazabilidad completa de incidentes según la normativa ISO 8601.',
        notes: [
          { type: 'important', text: 'Los errores no reportados representan una deuda técnica invisible. Un error CRITICO no documentado puede provocar la replanificación completa de un sprint, afectando los compromisos contractuales con la Alianza Brasil.' }
        ]
      },
      {
        step: 2,
        title: 'Pre-requisitos y Roles Autorizados',
        icon: Shield,
        description: 'Todos los desarrolladores activos con sesión JWT vigente pueden reportar errores e interrupciones. Los líderes y coordinadores pueden adicionalmente modificar el estado y la severidad de los reportes. Antes de reportar un error, asegúrese de: (a) estar asignado a la actividad WBS afectada, (b) haber guardado su progreso de código actual (commit parcial o stash en Git), y (c) tener identificada la fase WBS y la actividad específica donde ocurrió el incidente.',
        notes: [
          { type: 'tip', text: 'Active las notificaciones en tiempo real del dashboard para recibir alertas cuando su error cambie de estado (de "Registrado" a "En Análisis" o "Solucionado").' }
        ]
      },
      {
        step: 3,
        title: 'Paso 1: Identificación y Tipificación del Error',
        icon: Eye,
        description: 'Al detectar un problema durante el desarrollo, navegue a su Dashboard de Desarrollador y localice la pestaña "Reportar Error Técnico". El primer campo a completar es la Tipología del Error. Seleccione entre: (a) Error Lógico: el código compila pero produce resultados incorrectos (ej. cálculo erróneo de estimaciones, filtro que devuelve datos equivocados); (b) Error de Sintaxis: el código no compila o el transpilador/parser de Babel reporta un fallo de JSX/AST; (c) Error de Validación: las reglas de negocio no se aplican correctamente (ej. un campo obligatorio acepta valores nulos); (d) Error de Concurrencia: condiciones de carrera, deadlocks o datos corruptos por accesos simultáneos; (e) Error de Integración: fallos en la comunicación entre microservicios, APIs REST o endpoints Spring Boot.'
      },
      {
        step: 4,
        title: 'Paso 2: Asignación de Severidad Real',
        icon: AlertTriangle,
        description: 'Seleccione el nivel de severidad/impacto que refleje fielmente la gravedad del incidente: (a) CRITICA — El sistema está completamente inoperante, la base de datos está corrupta, o existe pérdida de datos irrecuperable. Requiere acción inmediata del líder y posible escalamiento al coordinador. (b) ALTA — Una funcionalidad principal no opera correctamente pero existen workarounds temporales. Ejemplo: el módulo de exportación ETL genera archivos con formato incorrecto. (c) MEDIA — Un componente secundario falla sin impactar el flujo principal. Ejemplo: un gráfico de Recharts no renderiza correctamente en modo oscuro. (d) BAJA — Problemas cosméticos, errores tipográficos en la interfaz o mejoras menores de usabilidad que no afectan la funcionalidad.',
        notes: [
          { type: 'warning', text: 'No infle ni minimice la severidad. La sobreestimación genera fatiga de alertas en los líderes (efecto "cry wolf"). La subestimación oculta riesgos que pueden escalar a crisis.' },
          { type: 'tip', text: 'Si tiene duda entre dos niveles, seleccione el mayor y agregue un comentario explicando su razonamiento. El líder puede reclasificar posteriormente.' }
        ]
      },
      {
        step: 5,
        title: 'Paso 3: Documentación Descriptiva del Incidente',
        icon: FileText,
        description: 'En el campo "Descripción Detallada", proporcione información suficiente para que cualquier miembro del equipo pueda reproducir el error. Incluya: (a) Qué estaba haciendo exactamente cuando ocurrió el error (acción del usuario o del sistema). (b) Qué resultado esperaba obtener. (c) Qué resultado obtuvo realmente (incluya mensajes de error completos, stack traces o capturas de pantalla). (d) Con qué frecuencia ocurre (siempre, intermitente, solo bajo ciertas condiciones). (e) Entorno técnico: navegador y versión, sistema operativo, rama de Git activa, últimos commits aplicados.'
      },
      {
        step: 6,
        title: 'Paso 4: Vinculación con Fase WBS y Actividad',
        icon: GitBranch,
        description: 'Seleccione la fase WBS y la actividad específica a la que pertenece el error. Este vínculo es obligatorio porque permite al motor de telemetría calcular el impacto exacto del error en el cronograma del proyecto. Use los selectores desplegables que muestran únicamente las fases y actividades que tiene asignadas. Si el error afecta una actividad de otro desarrollador, seleccione "Actividad de Otro Miembro" y especifique el nombre en los comentarios.'
      },
      {
        step: 7,
        title: 'Paso 5: Reporte de Interrupciones y Tiempos Muertos',
        icon: Clock,
        description: 'Si el error fue causado o agravado por una interrupción del servicio (corte de energía eléctrica, fallo de la conexión a internet, caída del servidor de base de datos PostgreSQL, indisponibilidad de un servicio externo), reporte adicionalmente la interrupción en la pestaña "Interrupciones / Bloqueos". Complete: (a) Tipo de Interrupción (Energía, Red, Base de Datos, Servicio Externo, Otro), (b) Hora Exacta de Inicio (el sistema pre-llena con la hora UTC actual, ajuste si es necesario), (c) Duración en Minutos (tiempo exacto de inactividad productiva), (d) Comentario de Causa Raíz. Estos minutos perdidos son sumados por el Semáforo Predictivo para ajustar las métricas de riesgo del proyecto.',
        notes: [
          { type: 'important', text: 'Reporte TODOS los tiempos muertos, incluso los de 5-10 minutos. Las microinterrupciones acumuladas pueden representar varias horas semanales de productividad perdida que el motor predictivo necesita contabilizar.' }
        ]
      },
      {
        step: 8,
        title: 'Paso 6: Seguimiento del Ciclo de Vida del Error',
        icon: RefreshCw,
        description: 'Una vez registrado, su error pasa por el siguiente flujo de estados: REGISTRADO (recién creado, pendiente de revisión por el líder) -> EN ANALISIS (el líder ha tomado conocimiento y está evaluando la solución) -> EN CORRECCION (se ha asignado a un desarrollador para su resolución) -> SOLUCIONADO (la corrección ha sido aplicada y verificada) -> CERRADO (validado en producción). Puede consultar el estado de todos sus reportes en la pestaña "Historial de Mis Reportes" de su dashboard, donde además puede filtrar por tipo, severidad y estado.'
      },
      {
        step: 9,
        title: 'Paso 7: Actualización del Estado de Actividades',
        icon: CheckSquare,
        description: 'Mantenga actualizado el estado de sus actividades WBS: (a) ASIGNADA — la actividad le fue asignada pero aún no ha iniciado su desarrollo. (b) EN PROGRESO — está trabajando activamente en la actividad. (c) EN REVISION — completó el desarrollo y está en espera de revisión de código (code review) por parte del líder. (d) FINALIZADA — la actividad ha sido completada y aprobada. Esta actualización es crítica para que el Dashboard del Líder refleje el avance real del proyecto y el Semáforo Predictivo calcule las métricas de velocidad del equipo.'
      },
      {
        step: 10,
        title: 'Casos de Contingencia y Buenas Prácticas',
        icon: Lightbulb,
        description: 'Si el error se reproduce solo en un entorno específico (ej. solo en producción, no en desarrollo local), documente las diferencias de configuración. Si necesita escalamiento urgente fuera de horario laboral, use el canal #alertas-wbs del Chat Corporativo con la etiqueta #Urgente seguida del ID del error (ej. "#Urgente #ERR-045"). Si descubre que un error reportado por otro desarrollador es un duplicado del suyo, agregue un comentario con la referencia cruzada en lugar de crear un nuevo reporte.',
        notes: [
          { type: 'tip', text: 'Establezca el hábito de revisar sus errores abiertos al inicio y al final de cada jornada. Los errores "envejecidos" (más de 5 días sin actualización) son señalados automáticamente por el sistema como riesgo.' }
        ]
      }
    ]
  },
  {
    id: 3,
    title: 'Uso y Calibración del Semáforo Predictivo de Riesgos',
    targetRole: 'LIDER / COORDINADOR',
    duration: '12-14 min lectura',
    icon: Activity,
    accentColor: 'amber',
    summary: 'Manual completo de operación del motor de telemetría predictiva que analiza en tiempo real las métricas de productividad, horas perdidas por contingencias y densidad de errores críticos para calcular el nivel de riesgo del proyecto y emitir alertas automatizadas de acción preventiva.',
    steps: [
      {
        step: 1,
        title: 'Contexto y Fundamento de Negocio',
        icon: Target,
        description: 'El Semáforo Predictivo de Riesgos es el subsistema de inteligencia operativa más crítico de IKernell. A diferencia de los semáforos reactivos tradicionales que solo señalan problemas cuando ya ocurrieron, este motor utiliza algoritmos predictivos que correlacionan múltiples variables en tiempo real: horas estimadas vs. horas reales consumidas, densidad de errores por fase WBS, frecuencia y duración de interrupciones técnicas, velocidad del equipo (story points completados por sprint), y patrones históricos de proyectos similares. El resultado es un indicador visual de tres estados (Verde, Naranja, Rojo) que anticipa riesgos con suficiente antelación para ejecutar acciones correctivas antes de que se materialicen.',
        notes: [
          { type: 'important', text: 'El Semáforo Predictivo depende directamente de la calidad de los datos ingresados por los desarrolladores (errores, interrupciones, estados de actividades). Datos incompletos o tardíos degradan la precisión predictiva del algoritmo.' }
        ]
      },
      {
        step: 2,
        title: 'Pre-requisitos y Roles Autorizados',
        icon: Shield,
        description: 'El acceso completo al Semáforo Predictivo está reservado para usuarios con rol LIDER o COORDINADOR. Los desarrolladores pueden visualizar el estado del semáforo (Verde/Naranja/Rojo) en la barra superior de su dashboard, pero no acceden a las métricas detalladas ni a las acciones de mitigación. Para utilizar este módulo necesita: (a) tener al menos un proyecto con WBS activa, (b) que existan actividades asignadas a desarrolladores con al menos 48 horas de antigüedad (el algoritmo necesita datos históricos mínimos), (c) sesión JWT vigente con permisos de lectura sobre el módulo de telemetría.'
      },
      {
        step: 3,
        title: 'Paso 1: Acceder al Panel de Telemetría',
        icon: Terminal,
        description: 'Desde el Dashboard de Líder, localice el módulo "Predictor de Burnout y Semáforo de Riesgos" en la sección principal. El panel presenta: (a) Un indicador circular central grande con el color del semáforo actual y el porcentaje de riesgo numérico. (b) Un gráfico temporal (Recharts AreaChart) que muestra la evolución del riesgo en los últimos 14 días. (c) Un desglose de las variables que componen el cálculo del riesgo. (d) Una lista de acciones recomendadas por el motor predictivo.'
      },
      {
        step: 4,
        title: 'Paso 2: Interpretación del Estado VERDE (Normalidad Operativa)',
        icon: CheckCircle2,
        description: 'El semáforo marca VERDE cuando todas las métricas se encuentran dentro de los umbrales de tolerancia configurados. Condiciones específicas: (a) Las horas perdidas acumuladas por interrupciones son inferiores a 5 horas en la ventana de análisis (últimos 7 días). (b) El número de errores con severidad ALTA o CRITICA es menor a 1. (c) La velocidad del equipo (porcentaje de actividades completadas vs. planificadas) es igual o superior al 85%. (d) No hay actividades en la ruta crítica con retraso mayor a 1 día. Acción requerida: ninguna inmediata. Mantenga la cadencia de revisión diaria para detectar tendencias antes de que escalen.'
      },
      {
        step: 5,
        title: 'Paso 3: Interpretación del Estado NARANJA (Riesgo Moderado)',
        icon: AlertTriangle,
        description: 'El semáforo transita a NARANJA cuando se detecta una o más de las siguientes condiciones: (a) Las horas perdidas acumuladas igualan o superan las 5 horas pero no exceden 15 horas. (b) Se han registrado 1 o 2 errores de severidad ALTA o CRITICA sin resolver. (c) La velocidad del equipo ha descendido al rango 60-84%. (d) Existen actividades de la ruta crítica con retraso de 2-4 días. Acción requerida inmediata: el líder debe convocar una reunión breve (15 min) con los desarrolladores afectados, identificar las causas raíz de los cuellos de botella y considerar la redistribución temporal de carga de trabajo entre los miembros del equipo.',
        notes: [
          { type: 'warning', text: 'No ignore el estado NARANJA. Los datos históricos de IKernell muestran que el 73% de los proyectos que permanecen en NARANJA por más de 3 días consecutivos sin acción correctiva transitan inevitablemente a ROJO.' }
        ]
      },
      {
        step: 6,
        title: 'Paso 4: Interpretación del Estado ROJO (Alerta Crítica)',
        icon: ShieldAlert,
        description: 'El semáforo dispara la alerta ROJA cuando las métricas superan los umbrales de tolerancia máxima: (a) Las horas perdidas acumuladas superan las 15 horas en la ventana de 7 días. (b) Se han acumulado 3 o más errores de severidad CRITICA sin resolver. (c) La velocidad del equipo es inferior al 60%. (d) La ruta crítica presenta retrasos superiores a 4 días. Acción requerida inmediata y obligatoria: el líder debe escalar al coordinador, solicitar reasignación de personal de otros proyectos si están disponibles, negociar extensión formal del cronograma con el cliente/stakeholder, y documentar un plan de contingencia en el sistema.',
        notes: [
          { type: 'caution', text: 'Un estado ROJO sostenido por más de 5 días debe generar una solicitud formal de "Revisión de Alcance" del proyecto. Las métricas de alerta ROJA se incluyen automáticamente en los reportes ETL enviados a la Alianza Brasil.' }
        ]
      },
      {
        step: 7,
        title: 'Paso 5: Toma de Decisiones y Reasignación de Personal',
        icon: Users,
        description: 'Desde el panel del Semáforo, haga clic en "Acciones de Mitigación" para acceder al asistente de redistribución. El sistema sugerirá automáticamente: (a) Desarrolladores con menor carga actual que podrían asumir actividades del desarrollador sobrecargado. (b) Actividades que pueden posponerse sin impactar la ruta crítica (holgura positiva). (c) Dependencias externas que pueden ser paralelizadas. Para ejecutar una reasignación, seleccione la actividad, el desarrollador destino, y confirme. El sistema actualizará automáticamente la WBS, el Gantt y las notificaciones al equipo.'
      },
      {
        step: 8,
        title: 'Paso 6: Configuración de Umbrales Personalizados',
        icon: Settings,
        description: 'Los umbrales predeterminados pueden ajustarse según la naturaleza del proyecto. Navegue a "Configuración del Semáforo" (icono de engranaje) para modificar: (a) Horas perdidas máximas para transición Verde->Naranja y Naranja->Rojo. (b) Cantidad de errores críticos tolerados por nivel. (c) Porcentaje mínimo de velocidad del equipo para cada estado. (d) Ventana temporal de análisis (7, 14 o 30 días). Los cambios aplican inmediatamente y el semáforo se recalcula en el siguiente ciclo de evaluación (cada 15 minutos).'
      },
      {
        step: 9,
        title: 'Paso 7: Lectura de Gráficos de Tendencia Temporal',
        icon: BarChart3,
        description: 'El gráfico de tendencia (AreaChart de Recharts) muestra la evolución diaria del índice de riesgo compuesto. Cada punto en la línea representa el valor del riesgo calculado a las 23:59 UTC del día correspondiente. Use esta información para: (a) Identificar patrones recurrentes (ej. riesgos que aumentan los lunes por acumulación de incidentes del fin de semana). (b) Evaluar la efectividad de las acciones correctivas tomadas (la línea debería descender después de una intervención). (c) Comparar sprints históricos para identificar las fases WBS que consistentemente generan más riesgo.'
      },
      {
        step: 10,
        title: 'Casos de Contingencia y Buenas Prácticas',
        icon: Lightbulb,
        description: 'Si el semáforo permanece en VERDE pero usted percibe problemas no cuantificados (ej. baja moral del equipo, deuda técnica creciente, dependencias no documentadas), confíe en su juicio profesional y tome medidas preventivas independientemente del color. Si el semáforo oscila frecuentemente entre NARANJA y VERDE (efecto "ping-pong"), considere ajustar los umbrales para reflejar la variabilidad natural del proyecto. Documente en el Chat Corporativo (#alertas-wbs) toda decisión de mitigación tomada para preservar la trazabilidad institucional.',
        notes: [
          { type: 'tip', text: 'Programe una revisión semanal del semáforo con el equipo completo (viernes 16:00). La transparencia en las métricas de riesgo genera confianza y responsabilidad compartida.' }
        ]
      }
    ]
  },
  {
    id: 4,
    title: 'Normativa ETL y Protocolo Alianza Brasil ISO 8601',
    targetRole: 'LIDER / ADMINISTRACION',
    duration: '10-12 min lectura',
    icon: Globe,
    accentColor: 'emerald',
    summary: 'Guía completa del proceso de Extracción, Transformación y Carga (ETL) que normaliza las métricas de productividad, errores y contingencias del proyecto al formato estándar internacional ISO 8601 UTC, delimitado por plecas (|), para su transferencia automatizada al aliado estratégico brasileño a través de canales SFTP cifrados.',
    steps: [
      {
        step: 1,
        title: 'Contexto y Fundamento de Negocio',
        icon: Target,
        description: 'La Alianza Brasil es un convenio interinstitucional que requiere el intercambio periódico de métricas de gestión de proyectos de software en un formato normalizado e interoperable. IKernell implementa un pipeline ETL que extrae datos de las tablas PostgreSQL del proyecto (actividades WBS, errores técnicos, interrupciones, métricas de productividad), los transforma al estándar ISO 8601 con timestamps en UTC y delimitadores de pleca (|), y los exporta en archivos .txt y .csv listos para su transferencia. Este proceso garantiza la compatibilidad con los sistemas de información del aliado brasileño que operan en zona horaria BRT (UTC-3).',
        notes: [
          { type: 'important', text: 'El cumplimiento de la normativa ETL es contractualmente obligatorio. La falta de envío del reporte semanal puede generar penalizaciones y afectar la calificación del equipo en la evaluación del convenio bilateral.' }
        ]
      },
      {
        step: 2,
        title: 'Pre-requisitos y Roles Autorizados',
        icon: Shield,
        description: 'Solo los usuarios con rol LIDER o superior pueden ejecutar la generación manual de informes ETL. El proceso automatizado (ejecución dominical) se ejecuta mediante las anotaciones Spring Boot @Scheduled y @Async sin intervención humana. Pre-requisitos técnicos: (a) El proyecto debe tener al menos una fase WBS con actividades reportadas. (b) El módulo de exportación debe estar habilitado en la configuración del proyecto. (c) Las credenciales SFTP del aliado deben estar configuradas en el panel de administración.'
      },
      {
        step: 3,
        title: 'Paso 1: Acceder al Módulo de Exportación ETL',
        icon: Terminal,
        description: 'Desde el Dashboard de Líder, localice la sección "Exportación y Reportes" en la barra lateral. Haga clic en "Generador ETL Alianza Brasil". El módulo presentará: (a) un resumen de los últimos 5 reportes generados con su estado de envío, (b) un botón "Generar Reporte Ahora" para ejecución manual, (c) la configuración del próximo envío automatizado (fecha y hora programada), y (d) un previsualizador del formato de salida.'
      },
      {
        step: 4,
        title: 'Paso 2: Estandarización ISO 8601 UTC',
        icon: Clock,
        description: 'El sistema convierte automáticamente todas las fechas y marcas temporales del proyecto al estándar ISO 8601 en zona UTC. Formato resultante: "2026-08-24T19:15:00Z". Las métricas numéricas se normalizan con dos decimales y punto como separador decimal (estándar internacional). Los campos de texto se sanitizan eliminando caracteres especiales que puedan conflictuar con el delimitador de pleca (|). Los campos nulos se representan como "N/A" según el acuerdo contractual vigente.'
      },
      {
        step: 5,
        title: 'Paso 3: Estructura del Archivo de Salida',
        icon: FileText,
        description: 'El archivo generado contiene las siguientes columnas delimitadas por pleca (|): ID_PROYECTO | NOMBRE_FASE | ID_ACTIVIDAD | DESARROLLADOR_ASIGNADO | FECHA_INICIO_UTC | FECHA_FIN_UTC | HORAS_ESTIMADAS | HORAS_REALES | ESTADO | ERRORES_CRITICOS | HORAS_INTERRUPCION | INDICE_RIESGO | VELOCIDAD_EQUIPO. La primera línea del archivo es un header descriptivo. Las líneas subsecuentes contienen los datos. El archivo se nombra con el patrón: ETL_IKERNELL_{ID_PROYECTO}_{YYYY-MM-DD}.txt'
      },
      {
        step: 6,
        title: 'Paso 4: Ejecución One-Click y Validación Pre-envío',
        icon: Zap,
        description: 'Al hacer clic en "Generar Reporte Ahora", el sistema ejecuta el pipeline ETL completo en segundo plano (proceso asíncrono @Async de Spring Boot). El tiempo promedio de generación es de 3-8 segundos dependiendo del volumen de datos. Una vez completado, se presenta una vista previa del archivo con las primeras 20 líneas para verificación humana. Revise que: (a) las fechas estén en UTC (sufijo "Z"), (b) no haya campos vacíos inesperados, (c) el conteo de registros coincida con el esperado. Si todo es correcto, haga clic en "Confirmar y Enviar".',
        notes: [
          { type: 'tip', text: 'Si necesita re-generar un reporte del mismo período (ej. porque se corrigieron datos después del envío), el sistema marcará la nueva versión con un sufijo "_v2", "_v3", etc., preservando las versiones anteriores para auditoría.' }
        ]
      },
      {
        step: 7,
        title: 'Paso 5: Modo Desatendido y Ejecución Programada',
        icon: RefreshCw,
        description: 'El sistema ejecuta automáticamente el pipeline ETL cada domingo a las 23:00 UTC mediante la anotación Spring Boot @Scheduled(cron = "0 0 23 * * SUN"). Este proceso: (a) Genera el archivo de reporte con datos de la semana completa (lunes 00:00 UTC a domingo 22:59 UTC). (b) Transfiere el archivo al servidor SFTP del aliado brasileño a través de un canal cifrado SSH-2. (c) Envía una notificación por correo electrónico al líder del proyecto y al coordinador con el resultado del envío (éxito o fallo). (d) Registra la operación en la tabla de auditoría del sistema. No se requiere intervención humana para este proceso.'
      },
      {
        step: 8,
        title: 'Paso 6: Transferencia por Canales Seguros SFTP',
        icon: Lock,
        description: 'Los archivos se transmiten a través del protocolo SFTP (SSH File Transfer Protocol) con cifrado AES-256. La configuración del servidor destino se gestiona desde el panel de administración (sección "Integraciones Externas") e incluye: (a) hostname/IP del servidor SFTP brasileño, (b) puerto (default 22), (c) credenciales de autenticación (usuario + clave privada SSH), (d) directorio remoto de destino. El sistema implementa reintentos automáticos (3 intentos con backoff exponencial de 30s, 60s, 120s) en caso de fallo de conexión.'
      },
      {
        step: 9,
        title: 'Paso 7: Monitoreo de Histórico de Envíos',
        icon: Database,
        description: 'La tabla "Historial de Exportaciones ETL" registra cada envío con: (a) Fecha y hora de generación. (b) Número de registros exportados. (c) Tamaño del archivo en KB. (d) Estado del envío (COMPLETADO, FALLIDO, PENDIENTE_REINTENTO). (e) Hash MD5 del archivo para verificación de integridad. (f) Respuesta del servidor SFTP (código de confirmación). Use este historial para demostrar cumplimiento contractual ante auditorías del convenio.'
      },
      {
        step: 10,
        title: 'Casos de Contingencia y Buenas Prácticas',
        icon: Lightbulb,
        description: 'Si la transferencia SFTP falla los 3 reintentos automáticos, el sistema genera una alerta ROJA en el dashboard del coordinador y envía un correo urgente al equipo de soporte TI. En este caso: (a) Verifique la conectividad de red con el servidor brasileño. (b) Confirme que las credenciales SSH no hayan expirado (rotan cada 90 días según política del aliado). (c) Genere el reporte manualmente y descárguelo localmente como respaldo. (d) Notifique al contacto técnico del aliado brasileño a través del canal oficial. Buena práctica: genere un reporte de prueba cada lunes para verificar la integridad del pipeline antes del envío automatizado del domingo.',
        notes: [
          { type: 'warning', text: 'Nunca modifique manualmente los archivos ETL generados. Cualquier alteración post-generación invalida el hash MD5 y será rechazada por el sistema de validación del aliado brasileño.' }
        ]
      }
    ]
  }
];

// ─── Color helpers para los acentos de módulo ──────────────────────────────────

const ACCENT_MAP = {
  indigo:  { bg: 'bg-indigo-500', bgLight: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-800', progressBar: 'bg-indigo-500' },
  rose:    { bg: 'bg-rose-500', bgLight: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800', progressBar: 'bg-rose-500' },
  amber:   { bg: 'bg-amber-500', bgLight: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800', progressBar: 'bg-amber-500' },
  emerald: { bg: 'bg-emerald-500', bgLight: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800', progressBar: 'bg-emerald-500' },
};

const getAccent = (color) => ACCENT_MAP[color] || ACCENT_MAP.indigo;

// ─── Variantes de animación ────────────────────────────────────────────────────

const accordionVariants = {
  collapsed: { height: 0, opacity: 0 },
  expanded: { height: 'auto', opacity: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }
};

const stepItemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.05, type: 'spring', stiffness: 400, damping: 28 }
  })
};

// ─── Componente de Nota Destacada ──────────────────────────────────────────────

const NoteBlock = ({ type, text }) => {
  const styles = {
    important: { bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-300 dark:border-blue-700', text: 'text-blue-800 dark:text-blue-200', icon: Info, iconColor: 'text-blue-500' },
    warning:   { bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-300 dark:border-amber-700', text: 'text-amber-800 dark:text-amber-200', icon: AlertTriangle, iconColor: 'text-amber-500' },
    tip:       { bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-300 dark:border-emerald-700', text: 'text-emerald-800 dark:text-emerald-200', icon: Lightbulb, iconColor: 'text-emerald-500' },
    caution:   { bg: 'bg-rose-50 dark:bg-rose-950/30', border: 'border-rose-300 dark:border-rose-700', text: 'text-rose-800 dark:text-rose-200', icon: ShieldAlert, iconColor: 'text-rose-500' }
  };
  const s = styles[type] || styles.important;
  const Icon = s.icon;

  return (
    <div className={`mt-3 p-3 rounded-xl border-l-4 ${s.bg} ${s.border} ${s.text} flex items-start gap-2.5 text-xs leading-relaxed`}>
      <Icon size={15} className={`${s.iconColor} flex-shrink-0 mt-0.5`} />
      <span className="font-medium">{text}</span>
    </div>
  );
};

// ─── Componente Principal ──────────────────────────────────────────────────────

export const TutorialesInduccion = () => {
  const [selectedTutorial, setSelectedTutorial] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [expandedSteps, setExpandedSteps] = useState([0]); // Acordeones abiertos

  const current = TUTORIALS[selectedTutorial];
  const accent = getAccent(current.accentColor);
  const TutorialIcon = current.icon || GraduationCap;

  // Progreso de lectura del módulo actual
  const progressPercent = useMemo(() => {
    if (!current.steps.length) return 0;
    return Math.round((completedSteps.length / current.steps.length) * 100);
  }, [completedSteps, current.steps.length]);

  const toggleStepCompleted = (stepIdx) => {
    setCompletedSteps(prev =>
      prev.includes(stepIdx) ? prev.filter(s => s !== stepIdx) : [...prev, stepIdx]
    );
  };

  const toggleStepExpanded = (stepIdx) => {
    setExpandedSteps(prev =>
      prev.includes(stepIdx) ? prev.filter(s => s !== stepIdx) : [...prev, stepIdx]
    );
  };

  const handleSelectTutorial = (idx) => {
    setSelectedTutorial(idx);
    setCompletedSteps([]);
    setExpandedSteps([0]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="glass-card p-4 sm:p-6 md:p-8 border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none"
    >
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ rotate: [0, -8, 8, 0], transition: { duration: 0.5 } }}
            className="w-10 h-10 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center shadow-md"
          >
            <GraduationCap size={20} />
          </motion.div>
          <div>
            <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Tutoriales e Inducción Operativa
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              Manuales exhaustivos paso a paso para dominar los protocolos de IKernell (RF-34 / CU-08)
            </p>
          </div>
        </div>

        <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 inline-flex items-center gap-1.5">
          <BookOpen size={13} />
          {TUTORIALS.length} Módulos de Aprendizaje
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Selector de Tutoriales (Col 1-4) */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <span className="text-[0.65rem] font-extrabold uppercase tracking-widest text-zinc-400 mb-1 block">
            Seleccionar Módulo Formativo
          </span>
          {TUTORIALS.map((tut, idx) => {
            const tutAccent = getAccent(tut.accentColor);
            const TIcon = tut.icon || GraduationCap;
            const isSelected = selectedTutorial === idx;

            return (
              <motion.button
                key={tut.id}
                type="button"
                onClick={() => handleSelectTutorial(idx)}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.06, type: 'spring', stiffness: 400, damping: 25 }}
                whileHover={{ x: 3, transition: { duration: 0.15 } }}
                className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 border-zinc-900 dark:border-white shadow-md'
                    : 'bg-zinc-50 dark:bg-zinc-900/50 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-[0.6rem] font-black uppercase px-2 py-0.5 rounded ${
                    isSelected 
                      ? 'bg-zinc-700 text-white dark:bg-zinc-200 dark:text-zinc-900' 
                      : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}>
                    {tut.targetRole}
                  </span>
                  <span className="text-[0.65rem] opacity-70 flex items-center gap-1">
                    <Clock size={10} /> {tut.duration}
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className={`p-1.5 rounded-lg flex-shrink-0 ${
                    isSelected ? 'bg-white/15 dark:bg-zinc-900/15' : 'bg-zinc-100 dark:bg-zinc-800'
                  }`}>
                    <TIcon size={16} />
                  </div>
                  <h4 className="font-bold text-sm leading-snug">{tut.title}</h4>
                </div>
                <p className={`text-[0.68rem] mt-2 leading-relaxed ${
                  isSelected ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-500 dark:text-zinc-400'
                }`}>
                  {tut.summary.substring(0, 120)}...
                </p>
              </motion.button>
            );
          })}
        </div>

        {/* Detalle del Tutorial y Pasos (Col 5-12) */}
        <div className="lg:col-span-8 flex flex-col min-h-0">
          
          <motion.div 
            key={current.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6 rounded-2xl bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 flex flex-col"
          >
            {/* Header del módulo */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                <TutorialIcon size={14} className={accent.text} />
                Módulo {current.id} de {TUTORIALS.length}
              </span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border inline-flex items-center gap-1.5 ${accent.bgLight} ${accent.text} ${accent.border}`}>
                <CheckCircle2 size={12} />
                {completedSteps.length} / {current.steps.length} Pasos Completados
              </span>
            </div>

            {/* Barra de Progreso de Lectura */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[0.65rem] font-extrabold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Progreso de Lectura
                </span>
                <span className={`text-[0.7rem] font-black ${accent.text}`}>
                  {progressPercent}%
                </span>
              </div>
              <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${accent.progressBar}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>

            <h4 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 mb-2">
              {current.title}
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6">
              {current.summary}
            </p>

            {/* Steps como Acordeones */}
            <div className="space-y-2.5 max-h-[calc(100vh-480px)] overflow-y-auto pr-1">
              {current.steps.map((st, sIdx) => {
                const isDone = completedSteps.includes(sIdx);
                const isExpanded = expandedSteps.includes(sIdx);
                const StepIcon = st.icon || ChevronRight;

                return (
                  <motion.div
                    key={`${current.id}-step-${sIdx}`}
                    custom={sIdx}
                    variants={stepItemVariants}
                    initial="hidden"
                    animate="visible"
                    className={`rounded-xl border transition-all overflow-hidden ${
                      isDone 
                        ? `bg-white dark:bg-zinc-900 ${accent.border} shadow-sm` 
                        : 'bg-white/60 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800'
                    }`}
                  >
                    {/* Cabecera clickeable del acordeón */}
                    <button
                      type="button"
                      onClick={() => toggleStepExpanded(sIdx)}
                      className="w-full text-left p-4 flex items-center gap-3.5 cursor-pointer hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggleStepCompleted(sIdx); }}
                        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all cursor-pointer ${
                          isDone 
                            ? `${accent.bg} text-white shadow-sm` 
                            : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700'
                        }`}
                      >
                        {isDone ? <CheckCircle2 size={16} /> : st.step}
                      </button>

                      <div className="flex-1 min-w-0 flex items-center gap-2">
                        <StepIcon size={14} className={isDone ? accent.text : 'text-zinc-400'} />
                        <h5 className={`font-bold text-sm truncate ${isDone ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-700 dark:text-zinc-300'}`}>
                          {st.title}
                        </h5>
                      </div>

                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.25 }}
                        className="flex-shrink-0"
                      >
                        <ChevronDown size={16} className="text-zinc-400" />
                      </motion.div>
                    </button>

                    {/* Contenido expandible del acordeón */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          key="content"
                          variants={accordionVariants}
                          initial="collapsed"
                          animate="expanded"
                          exit="collapsed"
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 pt-0 ml-[2.75rem]">
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                              {st.description}
                            </p>
                            {st.notes && st.notes.map((note, nIdx) => (
                              <NoteBlock key={nIdx} type={note.type} text={note.text} />
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>

            {/* Footer del módulo */}
            <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
              <div className="flex items-center gap-2 text-zinc-500">
                <Sparkles size={13} className={accent.text} />
                <span className="font-medium">Haz clic en cada paso para expandirlo y en el número para marcarlo como completado.</span>
              </div>
              <motion.button
                type="button"
                onClick={() => handleSelectTutorial((selectedTutorial + 1) % TUTORIALS.length)}
                whileHover={{ scale: 1.04, x: 3 }}
                whileTap={{ scale: 0.96 }}
                className="gradient-button text-xs py-2 px-4 font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                Siguiente Módulo <ArrowRight size={14} />
              </motion.button>
            </div>

          </motion.div>

        </div>

      </div>

    </motion.div>
  );
};
