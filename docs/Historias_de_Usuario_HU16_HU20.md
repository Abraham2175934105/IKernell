# Documento Oficial de Especificación de Historias de Usuario (HU-16 a HU-20)
## Reto IKernell: Sistema Integral para la Gestión y Control de Proyectos de Software

**Proyecto:** Plataforma de Gestión e Ingeniería de Software IKernell  
**Organización:** IKernell Soluciones Software  
**Metodología:** Scrum / Agile Requirements Engineering  
**Versión del Documento:** 2.1  
**Fecha de Emisión:** Agosto 2026  
**Autor:** Abrahan Boada Suarez / Analista de Requisitos Senior & QA Lead  
**Revisión:** QA / BA Lead | **Aprobador:** Jefe de Proyecto  

---

### HISTORIA DE USUARIO: HU-16

| CAMPO | ESPECIFICACIÓN DETALLADA |
| :--- | :--- |
| **Código** | **HU-16** |
| **Nombre** | **Tablero Operativo y Gestión del Flujo Diario de Trabajo del Desarrollador** |
| **Complejidad** | **Media** |
| **HU Relacionada** | **HU-14** |
| **Módulo** | **Desarrollador (Operación Diaria & Flujo de Trabajo)** |
| **Descripción** | **Yo como:** Desarrollador de Software<br>**Requiero:** visualizar y actualizar mis actividades asignadas en un tablero interactivo organizado por estados (`PENDIENTE`, `EN_PROGRESO`, `FINALIZADA`) con selector desplegable<br>**Para:** organizar mis prioridades diarias de programación, registrar el inicio de mis labores y avanzar los compromisos asignados de forma ágil y transparente. |
| **Requerimiento** | **RF-21:** Tablero Operativo y Gestión del Flujo Diario de Trabajo del Desarrollador (Consola personal que despliega las actividades asignadas al desarrollador autenticado, agrupadas por estado, con selector interactivo de cambio de estado y sincronización en tiempo real con el panel del Líder de Proyecto). |

#### CRITERIOS DE ACEPTACIÓN
- **Condición 01: Visualización del Listado Personal de Tareas Asignadas**
  - **Dado:** Que el Desarrollador autenticado ingresa a su espacio de trabajo en la plataforma.
  - **Cuando:** Consulta la pestaña "Mis Actividades" o la consola principal de desarrollo.
  - **Entonces:** El sistema debe presentar el listado completo de actividades que le fueron delegadas por el Líder de Proyecto, identificando con claridad el nombre de la tarea, proyecto asociado, fase WBS correspondiente, horas estimadas de desarrollo y badge del estado actual.
- **Condición 02: Transición de Estado de Pendiente a En Progreso**
  - **Dado:** Que el Desarrollador tiene una tarea en estado "Pendiente" (`PENDIENTE`) y está listo para comenzar su codificación.
  - **Cuando:** Selecciona la opción "En Progreso" (`EN_PROGRESO`) en el selector interactivo de la tarea.
  - **Entonces:** El sistema debe cambiar de inmediato el estado de la actividad, notificar la actualización en tiempo real al panel del Líder de Proyecto y registrar la fecha/hora de inicio de la labor.
- **Condición 03: Distribución Ordenada por Categorías de Estado**
  - **Dado:** Que el Desarrollador gestiona múltiples compromisos de desarrollo de forma simultánea.
  - **Cuando:** Revisa su tablero operativo de trabajo.
  - **Entonces:** Las actividades deben organizarse y filtrarse de forma clara entre los estados "Pendientes", "En Progreso" y "Finalizadas", permitiendo una rápida identificación del estado operativo diario.
- **Condición 04: Regla Estricta de Habilitación y Desbloqueo del Selector de Estado**
  - **Dado:** Que una actividad o incidencia asignada al Desarrollador presenta un estado no conclusivo (`PENDIENTE`, `EN_PROGRESO` o `EN_REVISION`).
  - **Cuando:** El Desarrollador visualice la tarjeta o fila de la tarea.
  - **Entonces:** El selector de estado debe permanecer **100% habilitado y modificable**, bloqueándose únicamente (modo lectura/disabled) cuando la tarea alcance un estado conclusivo final (`FINALIZADA`, `RESUELTO`, `SOLUCIONADO` o `CERRADO`).

#### ACTIVIDADES DE NEGOCIO / ENTREGABLES (TAREAS)
| No | Descripción Funcional de la Tarea |
| :---: | :--- |
| 1 | Diseñar la consola interactiva del Desarrollador con tarjetas de tareas, insignias de estado y selector desplegable. |
| 2 | Configurar la regla de bloqueo de estado en la interfaz para permitir cambios solo cuando el estado sea no conclusivo. |
| 3 | Sincronizar mediante llamadas API la actualización de estados entre el tablero del Desarrollador y el panel del Líder. |
| 4 | Implementar filtros rápidos por proyecto y buscador de actividades para optimizar la navegación operativa diaria. |

#### CONTROL DE VERSIONES
| Versión | Fecha | Autor | Revisión | Descripción | Aprobador |
| :---: | :---: | :---: | :---: | :--- | :---: |
| 2.1 | 2026-08-21 | Auditor Senior de Negocio | QA / BA Lead | Optimización de flujo operativo, sincronización en tiempo real y regla de desbloqueo de estado. | Jefe de Proyecto |

---

### HISTORIA DE USUARIO: HU-17

| CAMPO | ESPECIFICACIÓN DETALLADA |
| :--- | :--- |
| **Código** | **HU-17** |
| **Nombre** | **Registro de Esfuerzo Horario y Reporte de Progreso de Actividades** |
| **Complejidad** | **Media** |
| **HU Relacionada** | **HU-16** |
| **Módulo** | **Desarrollador (Operación Diaria & Trazabilidad de Tiempo)** |
| **Descripción** | **Yo como:** Desarrollador de Software<br>**Requiero:** registrar las horas de trabajo dedicadas y reportar el porcentaje de avance de mis actividades asignadas<br>**Para:** demostrar el esfuerzo real invertido, alimentar las métricas de rendimiento y actualizar el avance global del proyecto ante el Líder y los clientes. |
| **Requerimiento** | **RF-22:** Registro de Esfuerzo Horario y Reporte de Progreso de Actividades (Modal de imputación de tiempo real en horas y porcentaje de avance de 0 a 100%, con recálculo ponderado del avance acumulado del proyecto y transición automática a estado `FINALIZADA` al alcanzar el 100%). |

#### CRITERIOS DE ACEPTACIÓN
- **Condición 01: Imputación Acumulativa de Horas y Porcentaje de Avance**
  - **Dado:** Que el Desarrollador avanza en la ejecución de una actividad en estado "En Progreso".
  - **Cuando:** Abre el modal de reporte de progreso, digita las horas trabajadas en la jornada (ej. 4.5 horas) y especifica el nuevo porcentaje de avance (ej. 70%).
  - **Entonces:** El sistema debe sumar de forma acumulativa el tiempo reportado en la base de datos, actualizar la barra de progreso visible de la tarea y recalcular dinámicamente el avance ponderado de la fase WBS y del proyecto global.
- **Condición 02: Transición Automática a Estado Finalizada al Alcanzar el 100%**
  - **Dado:** Que el Desarrollador concluye completamente el entregable técnico de la tarea.
  - **Cuando:** Establece el porcentaje de avance en el 100% y guarda la actualización.
  - **Entonces:** La plataforma debe cambiar automáticamente el estado de la actividad a "Finalizada" (`FINALIZADA`), registrar la fecha/hora exacta de cierre, liberar la dedicación y trasladar la tarjeta a la categoría de tareas terminadas.
- **Condición 03: Validación Estricta de Horas Positivas y Rangos de Avance (0 a 100%)**
  - **Dado:** Que el usuario intenta ingresar valores negativos o cero en las horas dedicadas, o un porcentaje de avance superior al 100% o menor al avance previo registrado.
  - **Cuando:** Intente presionar el botón de guardado.
  - **Entonces:** El sistema debe detener la transacción, resaltar el campo con error e indicar los valores permitidos (horas mayores a cero y avance de 0 a 100%).
- **Condición 04: Visualización del Historial de Registros de Tiempo por Tarea**
  - **Dado:** Que se han realizado múltiples imputaciones de tiempo sobre una misma actividad.
  - **Cuando:** El Desarrollador o el Líder de Proyecto consulten el detalle de la tarea.
  - **Entonces:** La plataforma debe desplegar el historial ordenado de reportes de esfuerzo con fecha, horas ingresadas, porcentaje reportado y comentarios del desarrollador.

#### ACTIVIDADES DE NEGOCIO / ENTREGABLES (TAREAS)
| No | Descripción Funcional de la Tarea |
| :---: | :--- |
| 1 | Desarrollar el modal corporativo de reporte de avance con deslizador (slider) de porcentaje e ingreso de horas. |
| 2 | Implementar el algoritmo de cálculo ponderado del avance acumulado del proyecto en función del progreso de las actividades. |
| 3 | Configurar el evento de cierre y transición automática a estado `FINALIZADA` al reportar el 100% de cumplimiento. |
| 4 | Validar las reglas de entrada de horas reales y porcentaje de avance para prevenir incongruencias en las métricas. |

#### CONTROL DE VERSIONES
| Versión | Fecha | Autor | Revisión | Descripción | Aprobador |
| :---: | :---: | :---: | :---: | :--- | :---: |
| 2.1 | 2026-08-21 | Auditor Senior de Negocio | QA / BA Lead | Actualización de registro de esfuerzo, validaciones de rango y transiciones automáticas. | Jefe de Proyecto |

---

### HISTORIA DE USUARIO: HU-18

| CAMPO | ESPECIFICACIÓN DETALLADA |
| :--- | :--- |
| **Código** | **HU-18** |
| **Nombre** | **Registro, Documentación y Resolución de Incidencias Técnicas** |
| **Complejidad** | **Media** |
| **HU Relacionada** | **HU-16** |
| **Módulo** | **Desarrollador (Gestión de Calidad & Errores Técnicos)** |
| **Descripción** | **Yo como:** Desarrollador de Software<br>**Requiero:** reportar los errores e impedimentos técnicos que surjan durante el desarrollo, detallando su nivel de gravedad y documentando su solución final<br>**Para:** dejar constancia formal de los obstáculos del código, activar recomendaciones automáticas de solución, actualizar el Semáforo Predictivo de Riesgo y consolidar una base de conocimiento para el equipo. |
| **Requerimiento** | **RF-23:** Registro, Clasificación y Resolución de Errores e Impedimentos Técnicos (Formulario de reporte de fallos con clasificación de severidad: Baja, Media, Alta, Crítica, actualización del Semáforo de Riesgo y cierre con solución documentada). |

#### CRITERIOS DE ACEPTACIÓN
- **Condición 01: Apertura de Incidencia Técnica y Notificación al Semáforo Predictivo**
  - **Dado:** Que el Desarrollador experimenta un fallo, excepción de código o impedimento técnico que detiene su avance en una tarea.
  - **Cuando:** Abre el formulario de reporte de incidencias, selecciona la severidad (Baja, Media, Alta o Crítica), describe el problema e ingresa la traza o comportamiento anómalo.
  - **Entonces:** El sistema debe registrar la incidencia en estado "Registrado" (`REGISTRADO`), vincularla a la actividad y proyecto, y actualizar de inmediato las métricas de salud del Semáforo Predictivo de Riesgo.
- **Condición 02: Resolución de Incidencia con Documentación de la Solución Técnica**
  - **Dado:** Que el Desarrollador o el Líder de Proyecto corrigió el problema técnico reportado.
  - **Cuando:** Abre el modal de atención del caso, describe detalladamente la solución técnica aplicada (causa raíz y corrección) y selecciona el estado "Solucionado" (`SOLUCIONADO` / `RESUELTO`).
  - **Entonces:** La incidencia debe pasar a estado "Solucionado", registrar la fecha/hora de cierre, recalcular las métricas del semáforo y guardar la solución en la base de conocimiento corporativa para futuras consultas.
- **Condición 03: Filtrado y Consulta de Incidencias por Severidad y Estado**
  - **Dado:** Que el Desarrollador, Líder o Coordinador desean revisar los problemas técnicos registrados en el proyecto.
  - **Cuando:** Consultan la tabla de gestión de incidencias.
  - **Entonces:** Deben poder filtrar los reportes por nivel de severidad (Baja, Media, Alta, Crítica) y estado de atención (Registrado, En Revisión, Solucionado), visualizando la causa raíz y la solución documentada.
- **Condición 04: Regla de Desbloqueo y Gestión de Estado en Incidencias**
  - **Dado:** Que una incidencia técnica se encuentra en estado "Registrado" o "En Revisión".
  - **Cuando:** El Líder o Desarrollador abra el modal de atención de la incidencia.
  - **Entonces:** El selector de estado de atención debe encontrarse **totalmente habilitado**, permitiendo conmutar entre `REGISTRADO`, `EN_REVISION` y `SOLUCIONADO`, y bloqueándose en modo lectura únicamente cuando la incidencia ya haya sido marcada como `SOLUCIONADO` o `RESUELTO`.

#### ACTIVIDADES DE NEGOCIO / ENTREGABLES (TAREAS)
| No | Descripción Funcional de la Tarea |
| :---: | :--- |
| 1 | Diseñar la interfaz de reporte y atención de incidencias con selección de severidad e ingreso de traza técnica. |
| 2 | Conectar el registro de errores abiertos con el motor de cálculo del Semáforo Predictivo de Riesgo. |
| 3 | Implementar la regla de desbloqueo de estado en el selector de atención de incidencias para estados no conclusivos. |
| 4 | Desarrollar el flujo de documentación de causa raíz y solución técnica para alimentar el repositorio de conocimiento. |

#### CONTROL DE VERSIONES
| Versión | Fecha | Autor | Revisión | Descripción | Aprobador |
| :---: | :---: | :---: | :---: | :--- | :---: |
| 2.1 | 2026-08-21 | Auditor Senior de Negocio | QA / BA Lead | Actualización de reporte de incidencias, integración con Semáforo Predictivo y reglas de desbloqueo. | Jefe de Proyecto |

---

### HISTORIA DE USUARIO: HU-19

| CAMPO | ESPECIFICACIÓN DETALLADA |
| :--- | :--- |
| **Código** | **HU-19** |
| **Nombre** | **Registro y Justificación de Interrupciones y Bloqueos Operativos** |
| **Complejidad** | **Baja** |
| **HU Relacionada** | **HU-16** |
| **Módulo** | **Desarrollador (Gestión de Tiempos & Sobrecarga)** |
| **Descripción** | **Yo como:** Desarrollador de Software<br>**Requiero:** registrar las interrupciones externas que detienen mi labor indicando el motivo y las horas o minutos perdidos<br>**Para:** justificar de forma transparente los desvíos en el tiempo de entrega, permitir que el Líder identifique bloqueos de infraestructura o coordinación y alimentar la proyección de sobreesfuerzo del proyecto. |
| **Requerimiento** | **RF-24:** Registro y Justificación de Interrupciones y Bloqueos Operativos (Captura de eventos externos de bloqueo con minutos perdidos, badge visual de advertencia por múltiples bloqueos e insumo analítico para la cuantificación de sobreesfuerzo). |

#### CRITERIOS DE ACEPTACIÓN
- **Condición 01: Registro Transaccional de Interrupción u Obstáculo Externo**
  - **Dado:** Que el Desarrollador sufre un evento no atribuible a su trabajo (ej. caída de servidores cloud, fallas de energía/red, reuniones imprevistas de última hora).
  - **Cuando:** Registra la interrupción indicando el motivo, categoría del bloqueo y el tiempo estimado en minutos u horas perdidas.
  - **Entonces:** El sistema debe registrar el evento en la tabla `interrupciones`, vincularlo a la actividad afectada, sumar las horas perdidas al proyecto e incorporar la información en el consolidado de tiempos.
- **Condición 02: Indicador Visual de Advertencia por Múltiples Bloqueos en la Tarea**
  - **Dado:** Que una actividad específica acumula múltiples reportes de interrupción en un período corto.
  - **Cuando:** El Líder de Proyecto o Desarrollador visualice el tablero de control del proyecto.
  - **Entonces:** La tarjeta de la tarea debe mostrar una insignia visual de advertencia indicando que el entregable se encuentra bloqueado por factores externos que exigen gestión administrativa.
- **Condición 03: Discriminación Objetiva entre Tiempo de Codificación e Interrupciones**
  - **Dado:** Que se generan los reportes analíticos de rendimiento y avance del proyecto.
  - **Cuando:** El sistema procese las métricas de esfuerzo.
  - **Entonces:** La plataforma debe diferenciar con total claridad las horas dedicadas al desarrollo efectivo del software de las horas perdidas por interrupciones externas, garantizando una evaluación objetiva.
- **Condición 04: Insumo Analítico para el Cálculo de Contingencias del Semáforo**
  - **Dado:** Que se registran nuevas interrupciones operativas en el proyecto.
  - **Cuando:** El motor del Semáforo Predictivo evalúe la salud del desarrollo.
  - **Entonces:** Las horas perdidas por interrupciones deben sumarse automáticamente al cálculo de sobreesfuerzo proyectado y horas de contingencia necesarias.

#### ACTIVIDADES DE NEGOCIO / ENTREGABLES (TAREAS)
| No | Descripción Funcional de la Tarea |
| :---: | :--- |
| 1 | Diseñar el modal ágil de reporte de interrupciones accesible directamente desde las tarjetas de tareas. |
| 2 | Configurar las categorías de interrupción (Infraestructura Cloud, Energía/Red, Reuniones no planificadas, Dependencias). |
| 3 | Implementar la insignia visual de alerta en las tarjetas de tareas con múltiples bloqueos registrados. |
| 4 | Integrar el sumatorio de horas perdidas por interrupción dentro del motor de cálculo de salud del Semáforo. |

#### CONTROL DE VERSIONES
| Versión | Fecha | Autor | Revisión | Descripción | Aprobador |
| :---: | :---: | :---: | :---: | :--- | :---: |
| 2.1 | 2026-08-21 | Auditor Senior de Negocio | QA / BA Lead | Actualización de registro de interrupciones, insignias de bloqueo y métricas de contingencia. | Jefe de Proyecto |

---

### HISTORIA DE USUARIO: HU-20

| CAMPO | ESPECIFICACIÓN DETALLADA |
| :--- | :--- |
| **Código** | **HU-20** |
| **Nombre** | **Sugerencia Inteligente y Reutilización de Fragmentos de Código Homologados (Snippet.inject)** |
| **Complejidad** | **Alta** |
| **HU Relacionada** | **HU-18** |
| **Módulo** | **Desarrollador (Asistencia Técnica & Productividad)** |
| **Descripción** | **Yo como:** Desarrollador de Software<br>**Requiero:** recibir sugerencias automáticas de fragmentos de código y soluciones probadas basadas en las palabras clave del error que estoy redactando<br>**Para:** resolver incidencias técnicas complejas en menor tiempo, adoptar soluciones homologadas por la empresa y optimizar mi productividad diaria. |
| **Requerimiento** | **RF-25:** Sugerencia Inteligente y Reutilización de Fragmentos de Código Homologados (Snippet.inject) (Motor de búsqueda con coincidencia difusa basada en trigramas `pg_trgm`, despliegue contextual de código probado y botón de copiado rápido en un clic con confirmación visual). |

#### CRITERIOS DE ACEPTACIÓN
- **Condición 01: Búsqueda Predictiva y Despliegue Contextual de Snippets de Código**
  - **Dado:** Que el Desarrollador se encuentra redactando la descripción de una incidencia o buscando solución a un error técnico en la herramienta Snippet.inject.
  - **Cuando:** Escribe cualquier término o traza de error (ej. "NullPointerException", "Connection Timeout", "JWT expired").
  - **Entonces:** El sistema debe consultar el catálogo de código en tiempo real y presentar un panel de recomendaciones con los fragmentos de código, soluciones y guías técnicas más relevantes para resolver el problema.
- **Condición 02: Coincidencia Difusa por Trigramas (Búsqueda Insensible a Variaciones)**
  - **Dado:** Que el Desarrollador escribe términos técnicos con faltas de ortografía, abreviaturas o variaciones.
  - **Cuando:** El motor de búsqueda procese la consulta.
  - **Entonces:** La plataforma debe utilizar la coincidencia por trigramas (`pg_trgm`) para identificar la intención del usuario y ofrecer los fragmentos de código más cercanos y pertinentes sin exigir coincidencia exacta de caracteres.
- **Condición 03: Copiado Rápido al Portapapeles con Formato Limpio y Confirmación Visual**
  - **Dado:** Que el Desarrollador identifica un fragmento de código que resuelve su incidencia.
  - **Cuando:** Presiona el botón "Copiar Snippet" o "Copiar Solución".
  - **Entonces:** El código debe transferirse de inmediato al portapapeles con formato limpio, destacando temporalmente el botón con un ícono de verificación (`Check`) y emitiendo un mensaje flotante (toast) de confirmación.
- **Condición 04: Filtrado de Snippets por Categoría Tecnológica**
  - **Dado:** Que el Desarrollador explora la biblioteca de snippets homologados.
  - **Cuando:** Selecciona una categoría específica (ej. Backend Spring Boot, Frontend React, SQL PostgreSQL, Seguridad JWT).
  - **Entonces:** El sistema debe filtrar los fragmentos mostrando únicamente el código correspondiente a dicha tecnología.

#### ACTIVIDADES DE NEGOCIO / ENTREGABLES (TAREAS)
| No | Descripción Funcional de la Tarea |
| :---: | :--- |
| 1 | Catalogar la biblioteca de fragmentos de código homologados (`SnippetInjectionCard.jsx`) organizados por tecnología. |
| 2 | Configurar la extensión trigrama `pg_trgm` en PostgreSQL para habilitar la búsqueda difusa de soluciones en backend. |
| 3 | Diseñar el panel de sugerencias contextuales con resaltado sintáctico de código e iconografía Lucide. |
| 4 | Desarrollar la función de copiado rápido al portapapeles con confirmación visual de tooltip y toast de notificación. |

#### CONTROL DE VERSIONES
| Versión | Fecha | Autor | Revisión | Descripción | Aprobador |
| :---: | :---: | :---: | :---: | :--- | :---: |
| 2.1 | 2026-08-21 | Auditor Senior de Negocio | QA / BA Lead | Actualización de motor de sugerencias difusas, Snippet.inject y copiado con confirmación. | Jefe de Proyecto |
