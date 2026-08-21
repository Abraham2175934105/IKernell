# Documento Oficial de Especificación de Historias de Usuario (HU-26 a HU-30)
## Reto IKernell: Sistema Integral para la Gestión y Control de Proyectos de Software

**Proyecto:** Plataforma de Gestión e Ingeniería de Software IKernell  
**Organización:** IKernell Soluciones Software  
**Metodología:** Scrum / Agile Requirements Engineering  
**Versión del Documento:** 2.1  
**Fecha de Emisión:** Agosto 2026  
**Autor:** Abrahan Boada Suarez / Analista de Requisitos Senior & QA Lead  
**Revisión:** QA / BA Lead | **Aprobador:** Jefe de Proyecto  

---

### HISTORIA DE USUARIO: HU-26

| CAMPO | ESPECIFICACIÓN DETALLADA |
| :--- | :--- |
| **Código** | **HU-26** |
| **Nombre** | **Generación y Transmisión de Lotes ETL Estandarizados (Alianza Brasil)** |
| **Complejidad** | **Alta** |
| **HU Relacionada** | **HU-11, HU-15, HU-18, HU-19** |
| **Módulo** | **Líder de Proyectos (Interoperabilidad Internacional & Exportación de Métricas)** |
| **Descripción** | **Yo como:** Líder de Proyecto o Auditor de Integración<br>**Requiero:** generar y exportar lotes de métricas operacionales del proyecto estandarizados bajo la norma internacional ISO 8601 UTC y sellados con firma criptográfica Hash SHA-256 de integridad<br>**Para:** garantizar la interoperabilidad, trazabilidad e inviolabilidad de los datos técnicos reportados a la casa matriz y aliados estratégicos en Brasil. |
| **Requerimiento** | **RF-36:** Generación y Transmisión de Lotes ETL Estandarizados (Alianza Brasil) (Compilación automatizada de métricas operacionales del proyecto individual, estandarización de fechas en formato ISO 8601 UTC, cálculo de firma digital Hash SHA-256 de integridad, visor de líneas de datos procesadas y descarga del archivo plano de integración). |

#### CRITERIOS DE ACEPTACIÓN
- **Condición 01: Generación del Lote ETL con Fechas ISO 8601 UTC y Sello SHA-256**
  - **Dado:** Que el Líder o Auditor se encuentra en el módulo "Alianza Brasil / ETL" con un proyecto individual específico seleccionado.
  - **Cuando:** Presiona la acción "Generar Lote ETL Brasil".
  - **Entonces:** El sistema debe compilar los registros de actividades, incidencias y contingencias del proyecto, estandarizar todas las marcas de tiempo a formato universal ISO 8601 UTC, calcular su firma digital de integridad Hash SHA-256 y registrar la transacción en la bitácora corporativa de transmisiones.
- **Condición 02: Despliegue de Visor Estructurado y Opción de Descarga del Archivo Plano**
  - **Dado:** Que la compilación del lote concluye satisfactoriamente.
  - **Cuando:** Se presenten los resultados en pantalla.
  - **Entonces:** La plataforma debe desplegar un visor estructurado con las líneas de datos procesadas, mostrar la firma criptográfica Hash SHA-256 con botón de copiado rápido al portapapeles y habilitar la descarga del archivo plano (`.txt` / `.json`) listo para su integración con los sistemas de Brasil.
- **Condición 03: Bloqueo Explícito de Exportación en Vista Global Corporativa**
  - **Dado:** Que el usuario se encuentra en la "Vista Global Corporativa" (`idProyecto = 'GLOBAL'`).
  - **Cuando:** Intente acceder a la generación del lote de exportación ETL.
  - **Entonces:** El sistema debe bloquear los botones de exportación e indicar claramente: "La exportación de métricas ETL para la Alianza Brasil exige seleccionar un proyecto individual específico", ofreciendo accesos directos para la selección de proyectos.
- **Condición 04: Verificación de Inviolabilidad y Validación Criptográfica**
  - **Dado:** Que un lote ETL fue generado con su firma criptográfica Hash SHA-256.
  - **Cuando:** Se audite el archivo plano de exportación.
  - **Entonces:** Cualquier alteración de un solo carácter en las líneas del lote debe invalidar el hash SHA-256, permitiendo detectar inmediatamente intentos de manipulación de datos.

#### ACTIVIDADES DE NEGOCIO / ENTREGABLES (TAREAS)
| No | Descripción Funcional de la Tarea |
| :---: | :--- |
| 1 | Diseñar el motor de compilación ETL estandarizando fechas en norma internacional ISO 8601 UTC. |
| 2 | Implementar la función criptográfica Hash SHA-256 para el sellado de integridad e inviolabilidad del lote. |
| 3 | Configurar el visor estructurado de líneas procesadas con copiado del Hash y descarga del archivo plano. |
| 4 | Desarrollar la restricción de seguridad y mensajes guía al intentar exportar métricas en Vista Global. |

#### CONTROL DE VERSIONES
| Versión | Fecha | Autor | Revisión | Descripción | Aprobador |
| :---: | :---: | :---: | :---: | :--- | :---: |
| 2.1 | 2026-08-21 | Auditor Senior de Negocio | QA / BA Lead | Optimización de motor de exportación ETL, sellos Hash SHA-256 y reglas de Vista Global. | Jefe de Proyecto |

---

### HISTORIA DE USUARIO: HU-27

| CAMPO | ESPECIFICACIÓN DETALLADA |
| :--- | :--- |
| **Código** | **HU-27** |
| **Nombre** | **Canal Corporativo de Comunicación e Interacción Directa** |
| **Complejidad** | **Media** |
| **HU Relacionada** | **HU-18, HU-19** |
| **Módulo** | **Transversal y Colaborativo (Comunicación Interna)** |
| **Descripción** | **Yo como:** Colaborador del Sistema (Coordinador, Líder o Desarrollador)<br>**Requiero:** enviar y recibir mensajes instantáneos en un canal corporativo interno estructurado por roles y etiquetas<br>**Para:** coordinar la atención de requerimientos, resolver dudas operativas de proyectos y mantener una comunicación fluida entre roles. |
| **Requerimiento** | **RF-06:** Canal Corporativo de Comunicación e Interacción Directa (Canal de mensajería corporativa en tiempo real con distintivos por rol (COORDINADOR, LIDER, DESARROLLADOR), estampa de tiempo universal UTC, formateador y parseo directo de etiquetas `#ID` a tareas WBS y solicitudes, e inhabilitación de envíos vacíos). |

#### CRITERIOS DE ACEPTACIÓN
- **Condición 01: Registro e Interacción en Tiempo Real con Distintivos por Rol y Timestamp UTC**
  - **Dado:** Que un usuario autenticado ingresa a la herramienta de mensajería corporativa.
  - **Cuando:** Redacta un mensaje y presiona el botón "Enviar".
  - **Entonces:** El sistema debe registrar y mostrar la interacción de forma inmediata en la pantalla de todos los colaboradores conectados, indicando el nombre del remitente, badge de su rol corporativo, estampa de tiempo universal `UTC` y contenido del mensaje.
- **Condición 02: Resaltado y Referencia Contextual mediante Etiquetas `#ID`**
  - **Dado:** Que el usuario comparte una referencia de tarea WBS, solicitud comercial o incidencia (ej. `#ACT-102`, `#SOL-45`, `#INC-08`).
  - **Cuando:** Escribe la etiqueta `#ID` en la caja de texto y envía el mensaje.
  - **Entonces:** La plataforma debe parsear y resaltar el texto en una insignia monoespaciada con estilo visual distintivo, permitiendo al equipo identificar y consultar el contexto operativo de forma rápida y legible.
- **Condición 03: Inhabilitación de Envío para Contenido Vacío**
  - **Dado:** Que el usuario presiona el botón de envío dejando el campo de texto vacío o con puros espacios.
  - **Cuando:** Se procese el intento de transmisión.
  - **Entonces:** El sistema debe impedir el envío del mensaje, resaltar el borde de la caja de texto y mantener la atención en la entrada del usuario.
- **Condición 04: Carga del Historial Reciente y Desplazamiento Inteligente**
  - **Dado:** Que un colaborador ingresa al canal corporativo.
  - **Cuando:** Se monte el componente del chat.
  - **Entonces:** La interfaz debe cargar cronológicamente las interacciones pasadas y realizar un despliegue automático hacia la parte inferior del contenedor.

#### ACTIVIDADES DE NEGOCIO / ENTREGABLES (TAREAS)
| No | Descripción Funcional de la Tarea |
| :---: | :--- |
| 1 | Diseñar el canal de mensajes corporativos con remitentes, marcas de tiempo UTC e insignias de rol. |
| 2 | Habilitar el resaltado y parseo directo de etiquetas `#ID` para tareas WBS y solicitudes en insignias monoespaciadas. |
| 3 | Sincronizar de forma inmediata las conversaciones entre los miembros conectados del equipo. |
| 4 | Validar la inhabilitación de envíos vacíos y el posicionamiento automático del scroll al último mensaje. |

#### CONTROL DE VERSIONES
| Versión | Fecha | Autor | Revisión | Descripción | Aprobador |
| :---: | :---: | :---: | :---: | :--- | :---: |
| 2.1 | 2026-08-21 | Auditor Senior de Negocio | QA / BA Lead | Optimización de canales de comunicación, parseo #ID y marcas de tiempo UTC. | Jefe de Proyecto |

---

### HISTORIA DE USUARIO: HU-28

| CAMPO | ESPECIFICACIÓN DETALLADA |
| :--- | :--- |
| **Código** | **HU-28** |
| **Nombre** | **Centro de Documentación y Visor Adaptativo de Políticas (A4 / Vista Lectura)** |
| **Complejidad** | **Media** |
| **HU Relacionada** | **HU-01, HU-06** |
| **Módulo** | **Transversal y Colaborativo (Gestión Documental & Calidad)** |
| **Descripción** | **Yo como:** Integrante del Equipo o Administrador<br>**Requiero:** consultar manuales de procesos, normativas corporativas y guías de inducción en una vista de lectura adaptable con opción de impresión<br>**Para:** acceder rápidamente a los procedimientos oficiales de la empresa y disponer de copias impresas o digitales homologadas. |
| **Requerimiento** | **RF-33:** Centro de Documentación y Visor Adaptativo de Políticas (A4 / Vista Lectura) (Visor de documentación institucional con conmutación en caliente entre la "Vista Impresa A4 Membretada" y la "Vista Lectura Cómoda / Consola", mantenimiento de posición de lectura, y generación de descargas oficiales en PDF con marca de agua). |

#### CRITERIOS DE ACEPTACIÓN
- **Condición 01: Conmutación Visual entre Vista Impresa A4 y Vista Lectura Cómoda**
  - **Dado:** Que el usuario consulta la biblioteca corporativa de documentos y normativas.
  - **Cuando:** Selecciona un manual y alterna entre la "Vista Impresa A4 Membretada" y la "Vista Lectura Cómoda / Consola".
  - **Entonces:** La plataforma debe adaptar el formato visual entre la maquetación ejecutiva oficial (márgenes, membrete, numeración) y el modo de lectura ágil sin recargar la página ni perder la posición de lectura del usuario.
- **Condición 02: Generación y Descarga de Documento Oficial en PDF Estructurado**
  - **Dado:** Que se requiere respaldar un archivo localmente o presentarlo en una auditoría externa.
  - **Cuando:** El usuario presiona el botón "Descargar Documento PDF".
  - **Entonces:** El sistema debe emitir la copia oficial en formato PDF estructurado con los logotipos institucionales, membrete de IKernell, marca de agua de validez y paginación.
- **Condición 03: Buscador Integrado y Filtrado por Tipología Documental**
  - **Dado:** Que el usuario explora el centro de documentación.
  - **Cuando:** Ingresa un término en el buscador o selecciona una categoría (Calidad CMMI, Políticas de Seguridad, Guías de Desarrollo).
  - **Entonces:** El visor debe filtrar instantáneamente los manuales disponibles desplegando los resultados coincidentes.
- **Condición 04: Visualización Adaptable a Dispositivos Móviles y Pantallas Anchas**
  - **Dado:** Que el colaborador accede al centro de documentación desde diferentes resoluciones de pantalla.
  - **Cuando:** Cambie el tamaño del navegador.
  - **Entonces:** El visor debe ajustar sus contenedores garantizando la legibilidad completa del texto.

#### ACTIVIDADES DE NEGOCIO / ENTREGABLES (TAREAS)
| No | Descripción Funcional de la Tarea |
| :---: | :--- |
| 1 | Catalogar los manuales de inducción, procedimientos de calidad CMMI y normativas corporativas. |
| 2 | Configurar la conmutación visual en caliente entre la vista de impresión A4 membretada y el modo de lectura ágil. |
| 3 | Integrar la generación de descargas oficiales en formato PDF membretado mediante la librería `jsPDF`. |
| 4 | Implementar la respuesta adaptable de maquetación en el visor documental para múltiples resoluciones. |

#### CONTROL DE VERSIONES
| Versión | Fecha | Autor | Revisión | Descripción | Aprobador |
| :---: | :---: | :---: | :---: | :--- | :---: |
| 2.1 | 2026-08-21 | Auditor Senior de Negocio | QA / BA Lead | Optimización de visor adaptativo A4/Lectura, descargas PDF membretadas y gestión documental. | Jefe de Proyecto |

---

### HISTORIA DE USUARIO: HU-29

| CAMPO | ESPECIFICACIÓN DETALLADA |
| :--- | :--- |
| **Código** | **HU-29** |
| **Nombre** | **Asistente de Búsqueda Inteligente de Plantillas y Componentes de Trabajo** |
| **Complejidad** | **Alta** |
| **HU Relacionada** | **HU-18, HU-20** |
| **Módulo** | **Desarrollador (Productividad & Asistencia Operativa)** |
| **Descripción** | **Yo como:** Desarrollador de Software<br>**Requiero:** consultar y reutilizar plantillas y soluciones previamente aprobadas mediante palabras clave de búsqueda aproximada (trigramas `pg_trgm`)<br>**Para:** acelerar la construcción de componentes repetitivos y asegurar el cumplimiento de los estándares de calidad de la empresa. |
| **Requerimiento** | **RF-25:** Asistente de Búsqueda Inteligente de Plantillas y Componentes de Trabajo (Buscador predictivo por similitud textual con trigramas `pg_trgm`, catálogo interactivo de plantillas y snippets probados por especialidad tecnológica, y copiado rápido al portapapeles en 1 clic con confirmación visual de tooltip/toast). |

#### CRITERIOS DE ACEPTACIÓN
- **Condición 01: Búsqueda Predictiva por Nivel de Coincidencia Textual**
  - **Dado:** Que el usuario escribe un término o palabra clave en el buscador de plantillas (ej. "autenticación", "formulario", "reporte").
  - **Cuando:** El buscador procese el texto ingresado.
  - **Entonces:** El sistema debe presentar de inmediato las plantillas homologadas más relevantes ordenadas por nivel de coincidencia textual, utilizando la coincidencia por trigramas (`pg_trgm`) para tolerar variaciones ortográficas.
- **Condición 02: Copiado Rápido al Portapapeles con Confirmación Visual**
  - **Dado:** Que el usuario ubica la plantilla o componente de código deseado.
  - **Cuando:** Presiona el botón "Copiar Plantilla".
  - **Entonces:** La plataforma debe transferir el contenido al portapapeles del dispositivo con formato limpio y mostrar una confirmación visual instantánea (cambio de ícono a `Check` y notificación toast).
- **Condición 03: Clasificación Temática por Disciplinas Tecnológicas**
  - **Dado:** Que el Desarrollador requiere filtrar los componentes disponibles.
  - **Cuando:** Selecciona una categoría técnica (Frontend React, Backend Spring, Consultas SQL, Estilos CSS).
  - **Entonces:** El asistente debe actualizar el catálogo presentando únicamente las plantillas asociadas a dicha disciplina.
- **Condición 04: Previsualización de Código con Resaltado Sintáctico**
  - **Dado:** Que el desarrollador explora una plantilla antes de reutilizarla.
  - **Cuando:** Visualiza la tarjeta de la plantilla.
  - **Entonces:** El sistema debe mostrar una caja de código formateada con sintaxis monoespaciada legibilidad alta.

#### ACTIVIDADES DE NEGOCIO / ENTREGABLES (TAREAS)
| No | Descripción Funcional de la Tarea |
| :---: | :--- |
| 1 | Construir la interfaz del catálogo de soluciones y plantillas con tarjetas interactivas y copiado directo. |
| 2 | Configurar la motorización de búsqueda predictiva por similitud textual basada en trigramas (`pg_trgm`). |
| 3 | Implementar la clasificación por disciplinas tecnológicas y la confirmación visual de copiado rápido. |
| 4 | Validar la previsualización de código sintáctico formateado en el asistente de productividad. |

#### CONTROL DE VERSIONES
| Versión | Fecha | Autor | Revisión | Descripción | Aprobador |
| :---: | :---: | :---: | :---: | :--- | :---: |
| 2.1 | 2026-08-21 | Auditor Senior de Negocio | QA / BA Lead | Optimización de motor de búsqueda inteligente, trigramas pg_trgm y catálogo de plantillas. | Jefe de Proyecto |

---

### HISTORIA DE USUARIO: HU-30

| CAMPO | ESPECIFICACIÓN DETALLADA |
| :--- | :--- |
| **Código** | **HU-30** |
| **Nombre** | **Exportación e Interoperabilidad Internacional de Reportes de Avance (Sede Brasil)** |
| **Complejidad** | **Alta** |
| **HU Relacionada** | **HU-11, HU-15** |
| **Módulo** | **Módulo Analítico e Innovaciones (Interoperabilidad Internacional)** |
| **Descripción** | **Yo como:** Líder de Proyecto o Coordinador General<br>**Requiero:** generar y exportar archivos estructurados de avance bajo estándares internacionales de tiempo (ISO 8601 UTC) y sellos de seguridad digital Hash SHA-256<br>**Para:** intercambiar información operativa con la sede internacional en Brasil garantizando que los datos no hayan sido alterados. |
| **Requerimiento** | **RF-37:** Exportación e Interoperabilidad Internacional de Reportes de Avance (Sede Brasil) (Compilación consolidada de avances del proyecto, marcas de tiempo UTC, firma de seguridad inmutable Hash SHA-256 para prevenir alteración de datos, vista previa tabular y descarga del paquete plano homologado para la casa matriz en Brasil). |

#### CRITERIOS DE ACEPTACIÓN
- **Condición 01: Compilación de Avances con Estándar UTC y Sello Hash SHA-256**
  - **Dado:** Que el usuario selecciona el proyecto individual y el rango de fechas para el reporte internacional.
  - **Cuando:** Presiona el botón "Generar Lote de Exportación".
  - **Entonces:** La plataforma debe compilar la información de avance, ajustar los formatos de fecha y hora al estándar global ISO 8601 UTC y estampar una firma de seguridad digital Hash SHA-256 inmutable.
- **Condición 02: Vista Previa Consolidada y Certificación de Integridad**
  - **Dado:** Que se completa la generación del lote de exportación.
  - **Cuando:** El usuario valida la vista previa de los datos procesados.
  - **Entonces:** El sistema debe desplegar la tabla de avance consolidado, la certificación de integridad del paquete, la firma Hash SHA-256 con opción de copiado y el botón para descargar el archivo de intercambio internacional.
- **Condición 03: Verificación de Inviolabilidad del Reporte Internacional**
  - **Dado:** Que la casa matriz en Brasil recibe el archivo plano de avance.
  - **Cuando:** Se procese la validación del Hash SHA-256 en el sistema de recepción.
  - **Entonces:** El hash calculado debe coincidir exactamente con el hash del reporte, garantizando que ninguna métrica fue alterada en tránsito.
- **Condición 04: Bloqueo de Exportación ante Ausencia de Proyecto Seleccionado**
  - **Dado:** Que el usuario intenta exportar reportes de avance sin haber elegido un proyecto específico.
  - **Cuando:** Intente generar el lote.
  - **Entonces:** La interfaz debe detener la acción, alertar sobre la necesidad de seleccionar un proyecto individual y guiar al usuario en la pantalla.

#### ACTIVIDADES DE NEGOCIO / ENTREGABLES (TAREAS)
| No | Descripción Funcional de la Tarea |
| :---: | :--- |
| 1 | Establecer el formato estandarizado de exportación con sello de seguridad digital Hash SHA-256. |
| 2 | Diseñar la vista previa de datos consolidada para revisión previa al envío hacia la sede internacional. |
| 3 | Habilitar la descarga del archivo de intercambio internacional verificado y la copia del hash de integridad. |
| 4 | Validar las reglas de seguridad e inviolabilidad de los datos en la transmisión internacional. |

#### CONTROL DE VERSIONES
| Versión | Fecha | Autor | Revisión | Descripción | Aprobador |
| :---: | :---: | :---: | :---: | :--- | :---: |
| 2.1 | 2026-08-21 | Auditor Senior de Negocio | QA / BA Lead | Actualización de motor de exportación internacional, sellos Hash SHA-256 y validación UTC. | Jefe de Proyecto |
