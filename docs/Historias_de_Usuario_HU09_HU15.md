# Documento Oficial de Especificación de Historias de Usuario (HU-09 a HU-15)
## Reto IKernell: Sistema Integral para la Gestión y Control de Proyectos de Software

**Proyecto:** Plataforma de Gestión e Ingeniería de Software IKernell  
**Organización:** IKernell Soluciones Software  
**Metodología:** Scrum / Agile Requirements Engineering  
**Versión del Documento:** 2.1  
**Fecha de Emisión:** Agosto 2026  
**Autor:** Abrahan Boada Suarez / Analista de Requisitos Senior & QA Lead  
**Revisión:** QA / BA Lead | **Aprobador:** Jefe de Proyecto  

---

### HISTORIA DE USUARIO: HU-09

| CAMPO | ESPECIFICACIÓN DETALLADA |
| :--- | :--- |
| **Código** | **HU-09** |
| **Nombre** | **Control de Estado Operativo y Suspensión de Acceso de Personal** |
| **Complejidad** | **Media** |
| **HU Relacionada** | **HU-08** |
| **Módulo** | **Coordinador (Administración de Personal & Talento)** |
| **Descripción** | **Yo como:** Coordinador General<br>**Requiero:** suspender o reactivar el estado de acceso de los colaboradores mediante un control de estado lógico (Soft-Delete)<br>**Para:** bloquear el acceso a personal que culminó su contrato o se encuentra en receso laboral, preservando intacto el historial de actividades, proyectos e incidencias en los que haya participado, garantizando la preservación total de la información. |
| **Requerimiento** | **RF-10:** Inhabilitación Lógica de Personal (Soft-Delete) y Trazabilidad Histórica (Actualización del atributo `estado` de `true` a `false` vía PATCH `/api/coordinador/trabajadores/{id}/estado`, revocando el token de inicio de sesión de forma inmediata).<br>**RF-11:** Custodia Criptográfica y Auditoría de Seguridad de Cuentas (Prohibición estricta de borrados físicos `DELETE` en PostgreSQL y garantía de conservación de la autoría en reportes de calidad). |

#### CRITERIOS DE ACEPTACIÓN
- **Condición 01: Inhabilitación Lógica y Revocación Inmediata de Sesión**
  - **Dado:** Que un colaborador se encuentra en estado "Habilitado" (`estado = true`) en la tabla principal de personal.
  - **Cuando:** El Coordinador General presiona la acción "Inhabilitar" y confirma la suspensión del usuario.
  - **Entonces:** El sistema debe cambiar de inmediato el estado del trabajador a "Inhabilitado" (`estado = false`), desplegar una notificación de confirmación, inhabilitar su acceso en la base de datos y rechazar cualquier intento de autenticación posterior con sus credenciales.
- **Condición 02: Reactivación de Acceso y Reincorporación de Personal**
  - **Dado:** Que un empleado se encuentra suspendido o en estado "Inhabilitado".
  - **Cuando:** El Coordinador General presiona la acción "Habilitar".
  - **Entonces:** El sistema debe restaurar de inmediato el estado del trabajador a "Habilitado" (`estado = true`), permitiéndole ingresar nuevamente a la plataforma mediante su correo y contraseña corporativa, reincorporándolo a las listas de asignación activa sin pérdida de registros previos.
- **Condición 03: Preservación Total de la Trazabilidad e Histórico de Actividades**
  - **Dado:** Que un colaborador inhabilitado administrativamente registra autoría en tareas pasadas, etapas WBS, reportes de error o incidencias técnicas.
  - **Cuando:** Cualquier usuario con permisos consulte el historial del proyecto, auditorías de calidad o la bitácora de contingencias.
  - **Entonces:** Toda la información histórica, horas trabajadas, comentarios y autoría del empleado inhabilitado deben permanecer 100% visibles, asociadas a su nombre y legibles para fines de auditoría.
- **Condición 04: Exclusión de Selección en Nuevos Proyectos**
  - **Dado:** Que un usuario se encuentra en estado "Inhabilitado".
  - **Cuando:** Un Líder de Proyecto intente asignarlo a un nuevo equipo de trabajo o delegarle actividades.
  - **Entonces:** La plataforma debe omitir al colaborador inactivo del listado de selección de personal disponible, impidiendo su sobreasignación accidental.

#### ACTIVIDADES DE NEGOCIO / ENTREGABLES (TAREAS)
| No | Descripción Funcional de la Tarea |
| :---: | :--- |
| 1 | Implementar el conmutador de estado operativo (Switch Habilitado / Inhabilitado) con confirmación modal en la tabla de personal. |
| 2 | Configurar la validación en el servicio de autenticación (Spring Security) para rechazar tokens e ingresos de usuarios con `estado = false`. |
| 3 | Asegurar que las consultas JPA y endpoints de reportes mantengan la trazabilidad e historial de colaboradores inactivos. |
| 4 | Filtrar el selector de asignación de equipos en los módulos del Líder para presentar únicamente personal en estado habilitado. |

#### CONTROL DE VERSIONES
| Versión | Fecha | Autor | Revisión | Descripción | Aprobador |
| :---: | :---: | :---: | :---: | :--- | :---: |
| 2.1 | 2026-08-21 | Auditor Senior de Negocio | QA / BA Lead | Actualización de control de estado lógico, preservación de historial y revocación de JWT. | Jefe de Proyecto |

---

### HISTORIA DE USUARIO: HU-10

| CAMPO | ESPECIFICACIÓN DETALLADA |
| :--- | :--- |
| **Código** | **HU-10** |
| **Nombre** | **Bandeja Centralizada y Gestión del Ciclo de Vida de Solicitudes Web** |
| **Complejidad** | **Media** |
| **HU Relacionada** | **HU-04** |
| **Módulo** | **Coordinador (Atención Comercial & Gestión de Casos)** |
| **Descripción** | **Yo como:** Coordinador General<br>**Requiero:** gestionar la bandeja de solicitudes web de contacto y cotización, registrando notas de atención y administrando el estado del caso (Pendiente, Atendida, Reabierta)<br>**Para:** brindar una atención comercial oportuna a los prospectos corporativos, documentar los acuerdos alcanzados y mantener un historial completo de cada oportunidad de negocio. |
| **Requerimiento** | **RF-12:** Bandeja Centralizada de Oportunidades y Solicitudes Web (Despliegue cronológico de mensajes radicados desde el portal público con estado inicial `atendido = FALSE`).<br>**RF-13:** Gestión de Notas de Atención, Historial de Reaperturas y Transición de Estados (Permite registrar notas comerciales, marcar la solicitud como "Atendida" o ejecutar la "Reapertura de Caso" con justificación obligatoria e historial incremental). |

#### CRITERIOS DE ACEPTACIÓN
- **Condición 01: Despliegue Cronológico y Filtrado Dinámico de Oportunidades**
  - **Dado:** Que existen solicitudes comerciales enviadas por prospectos desde el formulario del portal público.
  - **Cuando:** El Coordinador General ingresa a la pestaña "Solicitudes Web" en su panel administrativo.
  - **Entonces:** El sistema debe presentar las tarjetas de cada caso ordenadas de forma cronológica descendente, mostrando los datos de contacto, requerimiento, estado visual mediante badges cromáticos y botones de filtro rápido (Todas, Pendientes, Atendidas, Reabiertas).
- **Condición 02: Registro de Atención Comercial y Transición a Estado Atendida**
  - **Dado:** Que el Coordinador se comunicó con el cliente potencial (vía telefónica o correo corporativo).
  - **Cuando:** Abre el panel de atención del caso, selecciona el estado "Atendida" e ingresa la nota con los acuerdos alcanzados.
  - **Entonces:** El sistema debe persistir la atención en la base de datos (`atendido = true`), actualizar la tarjeta con fecha/hora de respuesta e incorporar la nota en el historial permanente del caso.
- **Condición 03: Reapertura del Caso con Justificación Obligatoria e Historial Incremental**
  - **Dado:** Que un cliente atendido previamente se comunica requiriendo ampliación o ajustes a su propuesta comercial.
  - **Cuando:** El Coordinador presiona la opción "Reapertura de Caso", ingresa la causa justificada (mínimo 10 caracteres) y guarda la transacción.
  - **Entonces:** La solicitud debe pasar a estado "Reabierta", incrementar el contador de reaperturas del caso, registrar la fecha/hora actual y conservar el historial acumulado de notas anteriores sin sobreescribir datos.
- **Condición 04: Validación de Notas Obligatorias al Marcar Atención o Reapertura**
  - **Dado:** Que el Coordinador intenta marcar un caso como "Atendida" o "Reabierta" sin escribir la nota explicativa.
  - **Cuando:** Presiona el botón de confirmación.
  - **Entonces:** El sistema debe detener la transacción, resaltar el área de texto e indicar: "Debe ingresar una nota de respuesta o justificación de la gestión comercial."

#### ACTIVIDADES DE NEGOCIO / ENTREGABLES (TAREAS)
| No | Descripción Funcional de la Tarea |
| :---: | :--- |
| 1 | Diseñar la bandeja de solicitudes con tarjetas estructuradas, badges semánticos de estado y botonera de filtrado rápido. |
| 2 | Desarrollar el modal de gestión comercial para el registro de notas de atención y actualización de estado en la BD. |
| 3 | Implementar la función de reapertura de casos con contador incremental y almacenamiento del historial de notas. |
| 4 | Validar la actualización en tiempo real de los indicadores de solicitudes pendientes y atendidas en el encabezado. |

#### CONTROL DE VERSIONES
| Versión | Fecha | Autor | Revisión | Descripción | Aprobador |
| :---: | :---: | :---: | :---: | :--- | :---: |
| 2.1 | 2026-08-21 | Auditor Senior de Negocio | QA / BA Lead | Gestión integral del caso, historial incremental de notas y control de reaperturas. | Jefe de Proyecto |

---

### HISTORIA DE USUARIO: HU-11

| CAMPO | ESPECIFICACIÓN DETALLADA |
| :--- | :--- |
| **Código** | **HU-11** |
| **Nombre** | **Creación, Dimensionamiento Presupuestal y Cronograma de Proyectos** |
| **Complejidad** | **Media** |
| **HU Relacionada** | **N/A** |
| **Módulo** | **Líder de Proyectos (Planificación & Gestión)** |
| **Descripción** | **Yo como:** Líder de Proyecto<br>**Requiero:** registrar nuevos proyectos de software definiendo el cliente, presupuesto financiero, fechas de cronograma y alcance general<br>**Para:** formalizar el inicio de la planificación operativa, establecer los límites de tiempo y costos, y asumir la dirección técnica del desarrollo de software. |
| **Requerimiento** | **RF-14:** Creación, Dimensionamiento Presupuestal y Cronograma de Proyectos (Formulario de alta de proyectos con presupuesto en USD, validaciones de cronograma y vinculación automática al Líder de Proyecto autenticado). |

#### CRITERIOS DE ACEPTACIÓN
- **Condición 01: Alta de Proyecto con Dimensionamiento Válido y Estado Inicial**
  - **Dado:** Que el Líder de Proyecto diligencia los campos obligatorios (Nombre del proyecto, Cliente corporativo, Descripción de alcance u objetivos, Presupuesto financiero positivo en USD, Fecha de Inicio y Fecha Estimada de Entrega).
  - **Cuando:** Presiona el botón "Crear Proyecto".
  - **Entonces:** El sistema debe guardar el proyecto en estado "En Planificación" (o "ACTIVO"), asociarlo automáticamente al ID del Líder autenticado, mostrar un aviso de éxito en pantalla e incorporarlo de inmediato al selector de proyectos activos.
- **Condición 02: Validación Estricta de Coherencia Cronológica de Entrega**
  - **Dado:** Que el Líder intenta ingresar una fecha estimada de entrega que sea anterior o igual a la fecha de inicio del proyecto.
  - **Cuando:** Intente guardar la configuración del proyecto.
  - **Entonces:** La plataforma debe bloquear la transacción, resaltar el campo de fecha de entrega y desplegar el mensaje de error: "La fecha estimada de entrega no puede ser anterior a la fecha de inicio del proyecto."
- **Condición 03: Validación de Presupuesto Financiero Positivo**
  - **Dado:** Que el usuario ingresa un valor presupuestal igual a cero, negativo o no numérico.
  - **Cuando:** Intente enviar el formulario de creación.
  - **Entonces:** El sistema debe impedir el guardado, exigiendo el ingreso de un monto presupuestal financiero positivo y justificado en moneda estándar.
- **Condición 04: Visualización del Cronograma Calculado y Días Restantes**
  - **Dado:** Que un proyecto fue creado exitosamente con sus fechas iniciales.
  - **Cuando:** Se consulte la tarjeta principal del proyecto en el dashboard.
  - **Entonces:** El sistema debe mostrar el rango cronológico en formato legible y calcular automáticamente los días restantes para la entrega o el estado de finalización del hito.

#### ACTIVIDADES DE NEGOCIO / ENTREGABLES (TAREAS)
| No | Descripción Funcional de la Tarea |
| :---: | :--- |
| 1 | Diseñar el formulario de alta de proyectos con campos para presupuesto en USD, selector de cliente y fechas de cronograma. |
| 2 | Implementar las reglas de validación en tiempo real para la coherencia de fechas (inicio < fin) y valores financieros mayores a cero. |
| 3 | Configurar la asignación automática del proyecto al Líder autenticado mediante la extracción de credenciales del JWT. |
| 4 | Desarrollar el cálculo automático de días restantes de cronograma y duración estimada en semanas/días. |

#### CONTROL DE VERSIONES
| Versión | Fecha | Autor | Revisión | Descripción | Aprobador |
| :---: | :---: | :---: | :---: | :--- | :---: |
| 2.1 | 2026-08-21 | Auditor Senior de Negocio | QA / BA Lead | Optimización de parámetros de planificación, validación financiera y cronogramas. | Jefe de Proyecto |

---

### HISTORIA DE USUARIO: HU-12

| CAMPO | ESPECIFICACIÓN DETALLADA |
| :--- | :--- |
| **Código** | **HU-12** |
| **Nombre** | **Conformación de Equipos de Proyecto y Control de Cargas de Trabajo** |
| **Complejidad** | **Media** |
| **HU Relacionada** | **HU-11** |
| **Módulo** | **Líder de Proyectos (Gestión de Recursos & Capacidad)** |
| **Descripción** | **Yo como:** Líder de Proyecto<br>**Requiero:** vincular desarrolladores habilitados al equipo de trabajo de un proyecto asignándoles su dedicación horaria semanal<br>**Para:** asegurar la capacidad técnica necesaria para el cumplimiento de entregables, evitando la sobreasignación laboral y el desgaste del personal de desarrollo. |
| **Requerimiento** | **RF-15:** Conformación de Equipos y Control de Carga Horaria Laboral (Asignación horaria por proyecto, cálculo de disponibilidad disponible y prevención de sobrecarga horaria superior a 48 horas semanales por trabajador). |

#### CRITERIOS DE ACEPTACIÓN
- **Condición 01: Asignación Exitosa de Desarrollador dentro del Límite de Disponibilidad**
  - **Dado:** Que un desarrollador activo cuenta con horas libres dentro de su jornada laboral semanal.
  - **Cuando:** El Líder de Proyecto lo selecciona y le asigna una carga horaria semanal que no exceda su capacidad disponible (ej. 20 horas).
  - **Entonces:** El sistema debe vincular al colaborador al proyecto, actualizar su porcentaje de carga de trabajo y habilitar la visualización del proyecto en su consola personal.
- **Condición 02: Bloqueo y Alerta por Sobreasignación Horaria (> 48 Horas Semanales)**
  - **Dado:** Que un desarrollador ya tiene horas comprometidas en otros proyectos de la empresa.
  - **Cuando:** El Líder intente asignarle una dedicación horaria que supere el tope máximo permitido de 48 horas semanales agregadas.
  - **Entonces:** La plataforma debe emitir una alerta de sobrecarga laboral indicando las horas ya comprometidas y bloqueando la asignación hasta que el Líder ajuste la dedicación.
- **Condición 03: Liberación Automática de Capacidad Semanal al Desvincular Desarrollador**
  - **Dado:** Que un proyecto concluye una etapa o reduce su requerimiento de personal.
  - **Cuando:** El Líder reduce las horas asignadas o retira a un desarrollador del equipo del proyecto.
  - **Entonces:** El sistema debe liberar automáticamente su capacidad semanal, reflejando su disponibilidad actualizada para otros proyectos de la empresa.
- **Condición 04: Visualización de Competencias Tecnológicas del Desarrollador**
  - **Dado:** Que el Líder explora el catálogo de desarrolladores para conformar su equipo.
  - **Cuando:** Observa las tarjetas o filas de selección de personal.
  - **Entonces:** El sistema debe presentar las insignias de especialidad técnica (Backend, Frontend, Full-Stack) y su lista de competencias para facilitar la asignación estratégica según la demanda del proyecto.

#### ACTIVIDADES DE NEGOCIO / ENTREGABLES (TAREAS)
| No | Descripción Funcional de la Tarea |
| :---: | :--- |
| 1 | Desarrollar el selector interactivo de miembros de equipo con visualización de perfil, especialidad y disponibilidad horaria. |
| 2 | Implementar el algoritmo de cálculo de horas semanales agregadas por colaborador a través de múltiples proyectos. |
| 3 | Configurar la regla de bloqueo y alerta por sobreasignación cuando la carga acumulada supere el límite de 48 horas. |
| 4 | Desarrollar la actualización dinámica del tablero del Desarrollador al ser vinculado o desvinculado de un proyecto. |

#### CONTROL DE VERSIONES
| Versión | Fecha | Autor | Revisión | Descripción | Aprobador |
| :---: | :---: | :---: | :---: | :--- | :---: |
| 2.1 | 2026-08-21 | Auditor Senior de Negocio | QA / BA Lead | Ajuste en control de capacidad, prevención de sobrecarga horaria y disponibilidad. | Jefe de Proyecto |

---

### HISTORIA DE USUARIO: HU-13

| CAMPO | ESPECIFICACIÓN DETALLADA |
| :--- | :--- |
| **Código** | **HU-13** |
| **Nombre** | **Estructuración y Secuenciamiento de Fases WBS del Proyecto** |
| **Complejidad** | **Media** |
| **HU Relacionada** | **HU-11** |
| **Módulo** | **Líder de Proyectos (Estructura de Desglose de Trabajo - WBS)** |
| **Descripción** | **Yo como:** Líder de Proyecto<br>**Requiero:** desglosar el proyecto en etapas cronológicas y secuenciales de ingeniería<br>**Para:** organizar el ciclo de desarrollo en fases claras, controlar los hitos de entrega y estructurar los paquetes de trabajo del equipo. |
| **Requerimiento** | **RF-16:** Estructuración, Secuenciamiento y Bloqueo de Contexto de Fases WBS (Creación de etapas de ingeniería, reordenamiento dinámico, cálculo de porcentaje de avance global del proyecto y restricción de edición cuando la vista se encuentra en "Vista Global Corporativa"). |

#### CRITERIOS DE ACEPTACIÓN
- **Condición 01: Creación Exitosa de Fase WBS con Avance Inicial en Cero**
  - **Dado:** Que un proyecto específico se encuentra seleccionado en la consola del Líder.
  - **Cuando:** El Líder crea una nueva fase WBS (ej. "Análisis & Diseño", "Arquitectura & Sprint 1", "Pruebas QA y Despliegue").
  - **Entonces:** La etapa debe agregarse de forma ordenada a la estructura WBS del proyecto, asignándole una posición secuencial y un porcentaje de avance inicial del 0%.
- **Condición 02: Reordenamiento Dinámico de Precedencia de Etapas**
  - **Dado:** Que el Líder requiere ajustar la secuencia de entrega de los hitos del proyecto.
  - **Cuando:** Modifica la posición u orden de una etapa en la estructura del plan de trabajo.
  - **Entonces:** El sistema debe reajustar automáticamente la numeración de orden y la precedencia de todas las fases del proyecto sin alterar sus tareas internas.
- **Condición 03: Protección e Integridad para la Eliminación de Fases con Trabajo Registrado**
  - **Dado:** Que una etapa WBS contiene actividades asignadas o con avance registrado por los desarrolladores.
  - **Cuando:** El Líder intenta eliminar la fase de la estructura.
  - **Entonces:** El sistema debe bloquear la eliminación directa y solicitar confirmación expresa advirtiendo sobre las tareas vinculadas para impedir pérdidas accidentales de información.
- **Condición 04: Bloqueo Explícito de Edición WBS en Vista Global Corporativa**
  - **Dado:** Que el Líder o Coordinador tiene seleccionada la "Vista Global Corporativa" (`idProyecto = 'GLOBAL'`) en el selector de proyectos.
  - **Cuando:** Intente acceder a la creación de fases WBS o desglose de actividades.
  - **Entonces:** La interfaz debe bloquear los botones de edición WBS y mostrar un aviso informativo indicando: "La gestión de fases WBS exige el contexto de un proyecto individual específico", ofreciendo botones para seleccionar un proyecto concreto.

#### ACTIVIDADES DE NEGOCIO / ENTREGABLES (TAREAS)
| No | Descripción Funcional de la Tarea |
| :---: | :--- |
| 1 | Diseñar el organizador visual de fases WBS con soporte para creación, edición de nombres y secuenciamiento. |
| 2 | Desarrollar el algoritmo de avance ponderado del proyecto en función del progreso de las etapas y sus actividades. |
| 3 | Configurar las salvaguardas de confirmación para impedir la eliminación accidental de fases con actividades asociadas. |
| 4 | Implementar el bloqueo de seguridad y avisos guía cuando el usuario navegue en Modo "Vista Global Corporativa". |

#### CONTROL DE VERSIONES
| Versión | Fecha | Autor | Revisión | Descripción | Aprobador |
| :---: | :---: | :---: | :---: | :--- | :---: |
| 2.1 | 2026-08-21 | Auditor Senior de Negocio | QA / BA Lead | Actualización de estructura WBS, ordenamiento dinámico y bloqueo en Vista Global. | Jefe de Proyecto |

---

### HISTORIA DE USUARIO: HU-14

| CAMPO | ESPECIFICACIÓN DETALLADA |
| :--- | :--- |
| **Código** | **HU-14** |
| **Nombre** | **Creación, Estimación y Delegación Granular de Actividades** |
| **Complejidad** | **Media** |
| **HU Relacionada** | **HU-13** |
| **Módulo** | **Líder de Proyectos (Delegación Operativa & Tareas)** |
| **Descripción** | **Yo como:** Líder de Proyecto<br>**Requiero:** crear actividades específicas dentro de cada fase WBS, estimar sus horas de esfuerzo y asignarlas a los desarrolladores del equipo<br>**Para:** distribuir el trabajo diario de forma transparente, controlar los tiempos de ejecución y alimentar el cálculo de avance real del proyecto. |
| **Requerimiento** | **RF-17:** Creación, Estimación Horaria Granular y Delegación de Actividades (Registro de tareas dentro de fases WBS con estimación en horas positivas y asignación a un desarrollador del equipo).<br>**RF-18:** Reasignación de Actividades con Historial y Balanceo de Carga (Transferencia instantánea de tareas pendientes entre desarrolladores con preservación del esfuerzo estimado e historial de motivos). |

#### CRITERIOS DE ACEPTACIÓN
- **Condición 01: Registro de Actividad Granular y Delegación a Desarrollador**
  - **Dado:** Que una etapa WBS se encuentra definida en el proyecto.
  - **Cuando:** El Líder crea una actividad ingresando nombre, descripción técnica, estimación horaria mayor a cero y selecciona un desarrollador asignado.
  - **Entonces:** La tarea debe quedar registrada en estado "Pendiente", reflejarse en la fase WBS del proyecto e incorporar la actividad de forma inmediata en la lista de trabajo del desarrollador.
- **Condición 02: Reasignación Transparente de Tareas entre Desarrolladores**
  - **Dado:** Que un desarrollador presenta incapacidad, sobrecarga o cambio de prioridad operativa.
  - **Cuando:** El Líder selecciona una actividad pendiente, elige a un nuevo desarrollador y registra la justificación de reasignación.
  - **Entonces:** La tarea debe trasladarse instantáneamente a la bandeja del nuevo colaborador, actualizar los balances de esfuerzo de ambos profesionales y guardar el registro en la bitácora `historial_reasignacion`.
- **Condición 03: Validación de Estimación Horaria Positiva**
  - **Dado:** Que el Líder ingresa un valor no numérico, cero o negativo en las horas estimadas de la actividad.
  - **Cuando:** Intente guardar la tarea.
  - **Entonces:** El sistema debe bloquear el registro, resaltar el campo de horas e instruir al usuario para ingresar un valor de estimación válido mayor a cero.
- **Condición 04: Visualización del Estado y Porcentaje de Progreso de la Tarea**
  - **Dado:** Que una actividad se encuentra en ejecución por parte del desarrollador.
  - **Cuando:** El Líder o Desarrollador consulte el tablero del proyecto.
  - **Entonces:** La plataforma debe mostrar el estado actual (`PENDIENTE`, `EN_PROGRESO`, `FINALIZADA`), los tiempos invertidos y la insignia del desarrollador responsable.

#### ACTIVIDADES DE NEGOCIO / ENTREGABLES (TAREAS)
| No | Descripción Funcional de la Tarea |
| :---: | :--- |
| 1 | Diseñar el modal de registro y edición de actividades granulares con selector de responsables y estimación horaria. |
| 2 | Conectar la asignación de tareas con la consola del Desarrollador para su actualización en tiempo real. |
| 3 | Desarrollar la función de reasignación con captura de motivo en el historial y actualización de cargas. |
| 4 | Validar las reglas de entrada para impedir registros de tareas con estimaciones horarias cero o negativas. |

#### CONTROL DE VERSIONES
| Versión | Fecha | Autor | Revisión | Descripción | Aprobador |
| :---: | :---: | :---: | :---: | :--- | :---: |
| 2.1 | 2026-08-21 | Auditor Senior de Negocio | QA / BA Lead | Optimización de criterios de delegación, estimación horaria y bitácora de reasignación. | Jefe de Proyecto |

---

### HISTORIA DE USUARIO: HU-15

| CAMPO | ESPECIFICACIÓN DETALLADA |
| :--- | :--- |
| **Código** | **HU-15** |
| **Nombre** | **Semáforo Predictivo de Salud del Proyecto y Diagnóstico de Riesgo Organizacional** |
| **Complejidad** | **Alta** |
| **HU Relacionada** | **HU-11, HU-13, HU-18, HU-19** |
| **Módulo** | **Líder de Proyectos (Analítica Predictiva & Control de Riesgos)** |
| **Descripción** | **Yo como:** Líder de Proyecto o Coordinador General<br>**Requiero:** visualizar un semáforo predictivo inteligente en tiempo real con doble alcance (Proyecto Individual o Consolidado Corporativo Global), estructurado en 4 niveles de severidad<br>**Para:** anticipar desviaciones de cronograma, cuantificar el impacto de incidencias e interrupciones, e implementar acciones correctivas antes de comprometer la entrega final. |
| **Requerimiento** | **RF-19:** Motor del Semáforo Predictivo con Doble Alcance (Cálculo de salud en tiempo real para Proyecto Individual o Consolidado Corporativo Global categorizado en 4 niveles de riesgo: Verde/Estable, Amarillo/Moderado, Naranja/Alto y Rojo/Crítico).<br>**RF-20:** Cuantificación de Horas Perdidas y Proyección de Sobreesfuerzo (Mapeo de errores abiertos, tiempo perdido por interrupciones y cálculo proyectado de horas de contingencia). |

#### CRITERIOS DE ACEPTACIÓN
- **Condición 01: Evaluación de Salud Predictiva para Proyecto Individual**
  - **Dado:** Que el Líder de Proyecto selecciona un proyecto específico en el selector de la plataforma.
  - **Cuando:** Consulte la pestaña o módulo del Semáforo Predictivo.
  - **Entonces:** El sistema debe calcular y presentar el nivel de riesgo del proyecto (Verde/Estable, Amarillo/Moderado, Naranja/Alto o Rojo/Crítico), detallando el conteo de errores abiertos, horas perdidas por interrupciones y el cálculo de horas de contingencia estimadas.
- **Condición 02: Consolidación y Diagnóstico de la Vista Global Corporativa**
  - **Dado:** Que el Coordinador General o Líder selecciona la opción "Vista Global Corporativa" (`idProyecto = 'GLOBAL'`).
  - **Cuando:** El motor analítico procese la información.
  - **Entonces:** La plataforma debe agregar y consolidar las métricas de todos los proyectos activos de la empresa, mostrando el diagnóstico de riesgo organizacional global e identificando los proyectos que concentran las desviaciones críticas.
- **Condición 03: Alerta por Superación de Umbral Crítico de Riesgo**
  - **Dado:** Que un proyecto o la organización acumula una tasa elevada de incidencias no solucionadas o desviaciones graves de tiempo.
  - **Cuando:** El índice de riesgo sobrepase el umbral crítico de tolerancia.
  - **Entonces:** El semáforo debe encender el indicador "Nivel Crítico" (punto rojo pulsante CSS sin emojis), desplegando recomendaciones preventivas claras y el cálculo del sobreesfuerzo requerido para reestabilizar la operación.
- **Condición 04: Visualización Gráfica sin Emojis mediante Iconografía Corporativa y Puntos CSS**
  - **Dado:** Que el usuario consulta cualquier nivel del semáforo.
  - **Cuando:** Se renderice el panel analítico.
  - **Entonces:** Todos los indicadores de estado deben presentarse mediante puntos CSS animados de alto contraste (`bg-emerald-500`, `bg-amber-500`, `bg-red-500`) e iconos vectoriales de `lucide-react`, erradicando totalmente el uso de emojis.

#### ACTIVIDADES DE NEGOCIO / ENTREGABLES (TAREAS)
| No | Descripción Funcional de la Tarea |
| :---: | :--- |
| 1 | Desarrollar el panel del Semáforo Predictivo con soporte para doble alcance (Proyecto Individual y Consolidado Global). |
| 2 | Integrar las 4 categorías de severidad y el cálculo proyectado de horas de contingencia por incidencias acumuladas. |
| 3 | Diseñar la interfaz visual corporativa con puntos CSS animados e iconografía vectorial sin emojis. |
| 4 | Desarrollar las alertas tempranas y recomendaciones operativas automáticas para guiar la toma de decisiones. |

#### CONTROL DE VERSIONES
| Versión | Fecha | Autor | Revisión | Descripción | Aprobador |
| :---: | :---: | :---: | :---: | :--- | :---: |
| 2.1 | 2026-08-21 | Auditor Senior de Negocio | QA / BA Lead | Optimización de indicadores analíticos, doble alcance predictivo e iconografía sin emojis. | Jefe de Proyecto |
