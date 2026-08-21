# Documento Oficial de Especificación de Historias de Usuario (HU-21 a HU-25)
## Reto IKernell: Sistema Integral para la Gestión y Control de Proyectos de Software

**Proyecto:** Plataforma de Gestión e Ingeniería de Software IKernell  
**Organización:** IKernell Soluciones Software  
**Metodología:** Scrum / Agile Requirements Engineering  
**Versión del Documento:** 2.1  
**Fecha de Emisión:** Agosto 2026  
**Autor:** Abrahan Boada Suarez / Analista de Requisitos Senior & QA Lead  
**Revisión:** QA / BA Lead | **Aprobador:** Jefe de Proyecto  

---

### HISTORIA DE USUARIO: HU-21

| CAMPO | ESPECIFICACIÓN DETALLADA |
| :--- | :--- |
| **Código** | **HU-21** |
| **Nombre** | **Biblioteca Digital Corporativa, Visor de Documentos y Exportación PDF** |
| **Complejidad** | **Media** |
| **HU Relacionada** | **N/A** |
| **Módulo** | **Transversal (Gestión del Conocimiento & Documentación)** |
| **Descripción** | **Yo como:** Colaborador Autenticado (Coordinador, Líder o Desarrollador)<br>**Requiero:** consultar la documentación técnica, guías y normativas institucionales en un visor interactivo dual y descargar copias oficiales en PDF estandarizado<br>**Para:** conocer los estándares de ingeniería y procedimientos de la empresa sin saturar el almacenamiento de mi equipo, disponiendo de reportes listos para auditorías. |
| **Requerimiento** | **RF-33:** Biblioteca Digital Corporativa, Visor de Documentos y Exportación PDF (Visor interactivo con soporte de lectura dual: Modo Hoja Ejecutiva A4 con membrete oficial de IKernell y Modo Consola Técnica, buscador con filtrado en tiempo real y motor de generación PDF estandarizado mediante `jsPDF`). |

#### CRITERIOS DE ACEPTACIÓN
- **Condición 01: Visor Interactivo Dual (Modo Hoja A4 Membretada / Modo Consola)**
  - **Dado:** Que el colaborador selecciona un manual técnico, normativa o especificación en la biblioteca digital.
  - **Cuando:** Abre el documento para su lectura.
  - **Entonces:** El sistema debe desplegar el contenido en un visor interactivo con conmutación en vivo entre el **Modo Hoja Ejecutiva A4** (con membrete oficial de IKernell, márgenes de documento e impresión) y el **Modo Consola Técnica** (estilo terminal oscura con resaltado sintáctico), permitiendo alternar la visualización según la preferencia del usuario.
- **Condición 02: Generación y Descarga de Documentos en PDF Estandarizado**
  - **Dado:** Que el usuario requiere una copia física o respaldo local del documento técnico.
  - **Cuando:** Presiona la acción "Descargar PDF".
  - **Entonces:** La plataforma debe generar y descargar automáticamente un archivo en formato PDF estandarizado (`jsPDF`), conservando el membrete corporativo, encabezado, pie de página institucional y paginación correcta.
- **Condición 03: Filtrado de Documentos en Tiempo Real por Categoría y Palabra Clave**
  - **Dado:** Que el usuario busca una guía o especificación particular en la biblioteca.
  - **Cuando:** Escribe cualquier término en el buscador de la biblioteca o selecciona una categoría de filtro.
  - **Entonces:** El sistema debe filtrar en tiempo real el catálogo de documentos disponibles por título, categoría (Arquitectura, Base de Datos, Ciberseguridad, Normativas) o palabras clave del contenido.
- **Condición 04: Copiado Rápido de Contenido desde el Visor de Consola**
  - **Dado:** Que el usuario se encuentra en el Modo Consola Técnica del documento.
  - **Cuando:** Presiona el botón "Copiar Contenido".
  - **Entonces:** El código o texto técnico debe transferirse al portapapeles con formato limpio y emitir un aviso flotante de confirmación.

#### ACTIVIDADES DE NEGOCIO / ENTREGABLES (TAREAS)
| No | Descripción Funcional de la Tarea |
| :---: | :--- |
| 1 | Catalogar e integrar los manuales técnicos, políticas de calidad CMMI y especificaciones del sistema en la base de datos. |
| 2 | Diseñar el visor interactivo con soporte dual para el Modo Hoja A4 membretada y el Modo Consola terminal oscura. |
| 3 | Configurar el motor de generación de PDF estandarizado (`jsPDF`) con conservación de formato corporativo e impresión. |
| 4 | Desarrollar el buscador interactivo en tiempo real con debounce y filtrado por categorías tecnológicas. |

#### CONTROL DE VERSIONES
| Versión | Fecha | Autor | Revisión | Descripción | Aprobador |
| :---: | :---: | :---: | :---: | :--- | :---: |
| 2.1 | 2026-08-21 | Auditor Senior de Negocio | QA / BA Lead | Optimización de visor interactivo dual A4/Consola, descargas PDF reales y búsquedas. | Jefe de Proyecto |

---

### HISTORIA DE USUARIO: HU-22

| CAMPO | ESPECIFICACIÓN DETALLADA |
| :--- | :--- |
| **Código** | **HU-22** |
| **Nombre** | **Canal de Comunicación Instantánea y Coordinación de Equipos (Chat Corporativo)** |
| **Complejidad** | **Media** |
| **HU Relacionada** | **N/A** |
| **Módulo** | **Transversal (Comunicación Interna & Coordinación)** |
| **Descripción** | **Yo como:** Miembro del Equipo de IKernell (Desarrollador, Líder o Coordinador)<br>**Requiero:** enviar y recibir mensajes instantáneos en la sala general y canales temáticos de comunicación corporativa<br>**Para:** coordinar actividades de ingeniería, resolver dudas técnicas en tiempo real y mantener sincronizado al equipo de trabajo de la empresa. |
| **Requerimiento** | **RF-06:** Canal de Comunicación Instantánea y Persistencia de Mensajería Corporativa (Sala de comunicación instantánea con asignación de canal, insignias por rol, estampa de tiempo internacional UTC, parseo automático de etiquetas `#ID` e historial cronológico con desplazamiento automático). |

#### CRITERIOS DE ACEPTACIÓN
- **Condición 01: Envío y Recepción de Mensajes en Tiempo Real con Estampa UTC**
  - **Dado:** Que un colaborador redacta y envía un mensaje en cualquiera de los canales de comunicación corporativa (General, Arquitectura, Soporte Brasil, Alertas Semáforo).
  - **Cuando:** Confirma el envío del texto.
  - **Entonces:** El mensaje debe persistirse en la base de datos y publicarse de inmediato en la pantalla de los miembros conectados, mostrando el nombre del remitente, badge del rol (COORDINADOR, LIDER, DESARROLLADOR), la estampa de tiempo exacta en formato `UTC` y el parseo en vivo de etiquetas `#ID` en insignias de código.
- **Condición 02: Carga Cronológica del Historial y Desplazamiento Automático (Scroll)**
  - **Dado:** Que un colaborador ingresa al chat tras una ausencia o cambia de canal de discusión.
  - **Cuando:** Se abra la ventana de mensajes.
  - **Entonces:** La plataforma debe cargar de forma cronológica el historial de conversación del canal y posicionar automáticamente la vista en el mensaje más reciente para garantizar la continuidad del diálogo.
- **Condición 03: Validación de Contenido No Vacío e Inhabilitación de Envío**
  - **Dado:** Que el usuario presiona el botón de envío sin haber escrito texto o ingresando únicamente espacios en blanco.
  - **Cuando:** Se procese el intento de envío.
  - **Entonces:** El sistema debe detener la acción, inhabilitar el botón y mantener el foco en la caja de texto sin generar registros en el servidor.
- **Condición 04: Visualización del Listado de Personal Activo Conectado**
  - **Dado:** Que un colaborador se encuentra dentro del módulo de Chat Corporativo.
  - **Cuando:** Consulte la columna lateral de la sala.
  - **Entonces:** La plataforma debe presentar el listado de trabajadores registrados con su rol y un indicador de presencia online.

#### ACTIVIDADES DE NEGOCIO / ENTREGABLES (TAREAS)
| No | Descripción Funcional de la Tarea |
| :---: | :--- |
| 1 | Diseñar la interfaz del chat corporativo con soporte para canales temáticos, burbujas de diálogo y badges de rol. |
| 2 | Configurar la estampa de tiempo en estándar internacional `UTC` y el formateador de etiquetas `#ID` en badges monoespaciados. |
| 3 | Implementar la carga cronológica de mensajes persistidos en PostgreSQL y el auto-scroll al mensaje más reciente. |
| 4 | Desarrollar las validaciones de mensajes no vacíos y la lista de presencia de personal activo por rol. |

#### CONTROL DE VERSIONES
| Versión | Fecha | Autor | Revisión | Descripción | Aprobador |
| :---: | :---: | :---: | :---: | :--- | :---: |
| 2.1 | 2026-08-21 | Auditor Senior de Negocio | QA / BA Lead | Optimización de chat corporativo, timestamps UTC, etiquetas #ID y sincronización en tiempo real. | Jefe de Proyecto |

---

### HISTORIA DE USUARIO: HU-23

| CAMPO | ESPECIFICACIÓN DETALLADA |
| :--- | :--- |
| **Código** | **HU-23** |
| **Nombre** | **Programa Digital de Inducción Interactiva y Capacitación de Personal (Onboarding)** |
| **Complejidad** | **Baja** |
| **HU Relacionada** | **N/A** |
| **Módulo** | **Transversal (Capacitación & Gestión del Talento)** |
| **Descripción** | **Yo como:** Nuevo Colaborador de la Empresa<br>**Requiero:** acceder a módulos formativos interactivos y guías paso a paso sobre las herramientas y metodologías del sistema<br>**Para:** conocer la metodología de trabajo de IKernell, reducir mi curva de aprendizaje y familiarizarme rápidamente con mis responsabilidades operativas. |
| **Requerimiento** | **RF-07:** Programa Digital de Inducción Interactiva y Capacitación de Personal (Centro de formación que organiza guías interactivas paso a paso por categorías, registra el porcentaje de cumplimiento en el perfil del usuario y mantiene abiertas las guías completadas para repaso). |

#### CRITERIOS DE ACEPTACIÓN
- **Condición 01: Presentación de Guías Interactivas Paso a Paso**
  - **Dado:** Que el nuevo colaborador ingresa a la sección "Tutoriales e Inducción".
  - **Cuando:** Selecciona una guía formativa (ej. "Metodología WBS", "Reporte de Errores e Incidencias", "Uso del Chat y Herramientas").
  - **Entonces:** El sistema debe presentar una secuencia interactiva de pasos con explicaciones claras, recursos visuales e instrucciones prácticas del procedimiento.
- **Condición 02: Registro del Progreso Formativo y Confirmación de Finalización**
  - **Dado:** Que el colaborador culmina la lectura y ejecución de todos los pasos de un módulo de inducción.
  - **Cuando:** Presiona la acción "Marcar como Completada".
  - **Entonces:** La plataforma debe registrar el cumplimiento de la guía, actualizar el indicador de porcentaje de avance en el perfil del usuario y presentar una constancia visual de finalización.
- **Condición 03: Disponibilidad Permanente de Repaso de Guías Completadas**
  - **Dado:** Que un colaborador experimentado desea consultar o repasar un procedimiento operativo previo.
  - **Cuando:** Vuelva a ingresar a una guía previamente marcada como completada.
  - **Entonces:** El contenido debe estar disponible en todo momento para su consulta y repaso sin restricciones ni bloqueos.
- **Condición 04: Clasificación Temática del Catálogo de Capacitación**
  - **Dado:** Que el usuario explora la biblioteca de inducción.
  - **Cuando:** Filtra por las categorías disponibles (Metodología, Herramientas, Calidad, Seguridad).
  - **Entonces:** El módulo debe reorganizar las tarjetas mostrando los cursos pertenecientes a la temática elegida.

#### ACTIVIDADES DE NEGOCIO / ENTREGABLES (TAREAS)
| No | Descripción Funcional de la Tarea |
| :---: | :--- |
| 1 | Elaborar el material educativo y los guiones paso a paso para los procesos clave de la plataforma IKernell. |
| 2 | Diseñar la experiencia interactiva de aprendizaje (`TutorialesInduccion.jsx`) con indicadores visuales de avance. |
| 3 | Configurar la persistencia del estado de guías completadas y el cálculo del porcentaje de capacitación por usuario. |
| 4 | Validar la consulta permanente de módulos finalizados para soporte de entrenamiento continuo. |

#### CONTROL DE VERSIONES
| Versión | Fecha | Autor | Revisión | Descripción | Aprobador |
| :---: | :---: | :---: | :---: | :--- | :---: |
| 2.1 | 2026-08-21 | Auditor Senior de Negocio | QA / BA Lead | Optimización de contenidos de inducción, barra de progreso e historial de repaso. | Jefe de Proyecto |

---

### HISTORIA DE USUARIO: HU-24

| CAMPO | ESPECIFICACIÓN DETALLADA |
| :--- | :--- |
| **Código** | **HU-24** |
| **Nombre** | **Predictor de Desgaste Laboral y Análisis de Carga Histórica de 21 Días (capacity.pulse)** |
| **Complejidad** | **Alta** |
| **HU Relacionada** | **HU-12, HU-14, HU-16, HU-18, HU-19, HU-25** |
| **Módulo** | **Analítica Predictiva (Salud Laboral & Control de Cargas)** |
| **Descripción** | **Yo como:** Líder de Proyecto o Coordinador General<br>**Requiero:** monitorear una matriz predictiva del nivel de fatiga laboral de los desarrolladores basada en su comportamiento de los últimos 21 días (S1, S2, S3) bajo la norma ISO/IEC 25010, con desglose de carga por proyecto y consolidado global<br>**Para:** identificar oportunamente sobrecargas de trabajo, proteger el bienestar del equipo y rebalancear tareas antes de que se presenten renuncias o caídas de rendimiento. |
| **Requerimiento** | **RF-35:** Predictor de Desgaste Laboral y Análisis de Carga Histórica de 21 Días (capacity.pulse) (Analítica predictiva basada en series temporales de 21 días que evalúa horas trabajadas, incidencias abiertas e interrupciones, clasificada en 4 niveles de severidad: Baja, Media, Alta, Crítica, con comparativo de carga del proyecto actual vs. global corporativa y recomendaciones de redistribución al superar el 80%). |

#### CRITERIOS DE ACEPTACIÓN
- **Condición 01: Clasificación de Riesgo en Series Temporales de 21 Días (ISO/IEC 25010)**
  - **Dado:** Que se consulta el Predictor de Desgaste (`PredictorBurnout.jsx`) de un desarrollador.
  - **Cuando:** El motor analítico procese el histórico de horas trabajadas, incidencias abiertas e interrupciones sufridas en las últimas 3 semanas (S1, S2, S3).
  - **Entonces:** La plataforma debe clasificar el riesgo del colaborador en uno de los 4 niveles de severidad homologados (Baja/Estable, Media/Alerta, Alta/Sobrecarga, Crítica/Extrema), mostrando la gráfica de tendencia evolutiva semanal.
- **Condición 02: Desglose Comparativo (Proyecto Actual vs. Carga Global Corporativa)**
  - **Dado:** Que un desarrollador participa en múltiples proyectos simultáneos de la empresa.
  - **Cuando:** El Líder consulta el detalle de carga del profesional dentro del contexto de un proyecto específico.
  - **Entonces:** La vista debe mostrar con total transparencia cuántas tareas y horas corresponden al proyecto en pantalla, cuántas a otros proyectos de la empresa y el porcentaje consolidado global de capacidad ocupada.
- **Condición 03: Alerta Preventiva y Sugerencia de Balanceo al Superar el 80%**
  - **Dado:** Que un colaborador alcanza un índice de sobrecarga o fatiga superior al 80%.
  - **Cuando:** Se actualicen las métricas del predictor.
  - **Entonces:** El sistema debe encender la alerta en "Nivel Crítico" (con indicador gráfico sin emojis) y sugerir formalmente la redistribución de actividades hacia otros miembros del equipo con disponibilidad.
- **Condición 04: Filtrado por Proyecto o Vista Global Corporativa**
  - **Dado:** Que el Coordinador o Líder ingresa al módulo del Predictor.
  - **Cuando:** Selecciona entre un proyecto individual o la "Vista Global Corporativa".
  - **Entonces:** El sistema debe ajustar los cálculos de la matriz presentando el ranking de desarrolladores ordenados por nivel de riesgo de desgaste.

#### ACTIVIDADES DE NEGOCIO / ENTREGABLES (TAREAS)
| No | Descripción Funcional de la Tarea |
| :---: | :--- |
| 1 | Implementar el modelo analítico de series de 21 días (S1, S2, S3) en backend/frontend bajo norma ISO/IEC 25010. |
| 2 | Diseñar la interfaz máster-detalle del Predictor de Desgaste con matriz de 4 niveles de riesgo y gráficas de tendencia. |
| 3 | Configurar el desglose comparativo de dedicación por proyecto versus la carga global corporativa del empleado. |
| 4 | Desarrollar las alertas tempranas de sobrecarga (> 80%) con recomendaciones operativas de rebalanceo. |

#### CONTROL DE VERSIONES
| Versión | Fecha | Autor | Revisión | Descripción | Aprobador |
| :---: | :---: | :---: | :---: | :--- | :---: |
| 2.1 | 2026-08-21 | Auditor Senior de Negocio | QA / BA Lead | Actualización de métricas de desgaste de 21 días, capacidad pulse e indicadores sin emojis. | Jefe de Proyecto |

---

### HISTORIA DE USUARIO: HU-25

| CAMPO | ESPECIFICACIÓN DETALLADA |
| :--- | :--- |
| **Código** | **HU-25** |
| **Nombre** | **Reasignación de Actividades WBS con Justificación y Bitácora Histórica (`historial_reasignacion`)** |
| **Complejidad** | **Media** |
| **HU Relacionada** | **HU-13, HU-14, HU-16, HU-24** |
| **Módulo** | **Líder de Proyectos (Gestión WBS & Rebalanceo Operativo)** |
| **Descripción** | **Yo como:** Líder de Proyecto<br>**Requiero:** transferir una actividad pendiente o en progreso hacia otro desarrollador disponible, registrando de forma obligatoria la justificación del motivo técnico<br>**Para:** desbloquear cuellos de botella, rebalancear el esfuerzo del equipo y mantener una trazabilidad histórica completa de las decisiones operativas en la bitácora `historial_reasignacion`. |
| **Requerimiento** | **RF-18:** Reasignación de Actividades con Historial y Balanceo de Carga (Modal de transferencia de tareas con campo obligatorio de motivo técnico (mínimo 10 caracteres), actualización en tiempo real de las cargas de trabajo de ambos desarrolladores y persistencia inmutable en la tabla `historial_reasignacion`). |

#### CRITERIOS DE ACEPTACIÓN
- **Condición 01: Transferencia de Tarea con Captura de Motivo Técnico Obligatorio**
  - **Dado:** Que una actividad requiere ser trasladada a un nuevo desarrollador por sobrecarga o prioridad técnica.
  - **Cuando:** El Líder selecciona al nuevo responsable en la lista del equipo, redacta el motivo formal del cambio (mínimo 10 caracteres) y confirma la reasignación.
  - **Entonces:** El sistema debe transferir la tarea a la bandeja del nuevo colaborador, liberar la carga del desarrollador anterior, actualizar las métricas y persistir el registro en la bitácora `historial_reasignacion`.
- **Condición 02: Bloqueo de Transferencia por Ausencia de Motivo o Selector Vacío**
  - **Dado:** Que el Líder intenta confirmar la reasignación de una tarea sin seleccionar al nuevo responsable o dejando vacía la justificación.
  - **Cuando:** Presione el botón de confirmación.
  - **Entonces:** La plataforma debe detener la transferencia, resaltar los campos requeridos e indicar: "Debe seleccionar un desarrollador y justificar el motivo técnico del cambio (mínimo 10 caracteres)."
- **Condición 03: Trazabilidad e Historial Inmutable de Transpasos en la Tarea**
  - **Dado:** Que una actividad ha sido reasignada en una o varias ocasiones durante el proyecto.
  - **Cuando:** El Líder, Desarrollador o Auditor consulten la bitácora de la tarea.
  - **Entonces:** El sistema debe presentar el historial cronológico e inmutable de todos los traspasos realizados, detallando la fecha/hora exacta, usuario que autorizó, desarrollador previo, nuevo asignado y el motivo documentado.
- **Condición 04: Actualización Inmediata del Tablero del Nuevo Desarrollador**
  - **Dado:** Que una actividad fue reasignada a un desarrollador.
  - **Cuando:** El colaborador receptor consulte su tablero operativo.
  - **Entonces:** La tarea debe aparecer reflejada de inmediato en su lista de actividades asignadas sin requerir recargas de página.

#### ACTIVIDADES DE NEGOCIO / ENTREGABLES (TAREAS)
| No | Descripción Funcional de la Tarea |
| :---: | :--- |
| 1 | Diseñar el modal de reasignación de tareas con selector de desarrolladores y campo obligatorio de motivo técnico. |
| 2 | Configurar la API PATCH para transferir la tarea, actualizar la carga horaria y escribir en `historial_reasignacion`. |
| 3 | Desarrollar la vista inmutable del historial de transferencias dentro del detalle de actividades WBS. |
| 4 | Validar las reglas de longitud mínima de justificación y actualización en tiempo real en los tableros del personal. |

#### CONTROL DE VERSIONES
| Versión | Fecha | Autor | Revisión | Descripción | Aprobador |
| :---: | :---: | :---: | :---: | :--- | :---: |
| 2.1 | 2026-08-21 | Auditor Senior de Negocio | QA / BA Lead | Optimización de reasignación con motivo obligatorio y bitácora historial_reasignacion. | Jefe de Proyecto |
