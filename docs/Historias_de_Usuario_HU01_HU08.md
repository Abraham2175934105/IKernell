# Documento Oficial de Especificación de Historias de Usuario (HU-01 a HU-08)
## Reto IKernell: Sistema Integral para la Gestión y Control de Proyectos de Software

**Proyecto:** Plataforma de Gestión e Ingeniería de Software IKernell  
**Organización:** IKernell Soluciones Software  
**Metodología:** Scrum / Agile Requirements Engineering  
**Versión del Documento:** 2.1  
**Fecha de Emisión:** Agosto 2026  
**Autor:** Abrahan Boada Suarez / Analista de Requisitos Senior & QA Lead  
**Revisión:** QA / BA Lead | **Aprobador:** Jefe de Proyecto  

---

### HISTORIA DE USUARIO: HU-01

| CAMPO | ESPECIFICACIÓN DETALLADA |
| :--- | :--- |
| **Código** | **HU-01** |
| **Nombre** | **Acceso y Exploración del Portal Institucional de Servicios** |
| **Complejidad** | **Baja** |
| **HU Relacionada** | **N/A** |
| **Módulo** | **Público (Portal Corporativo e Interesados)** |
| **Descripción** | **Yo como:** Visitante o Cliente Potencial<br>**Requiero:** acceder libremente a la página principal del portal corporativo de IKernell sin restricciones de autenticación<br>**Para:** conocer la identidad institucional, la propuesta de valor estratégica, el portafolio de servicios tecnológicos y la oferta comercial de la empresa. |
| **Requerimiento** | **RF-01:** Acceso Libre y Perimetralidad Pública del Portal Corporativo (Permite peticiones GET anónimas en rutas públicas sin cabecera Authorization Bearer).<br>**RF-02:** Visualización Institucional y Ambientación Visual Adaptativa (Despliegue de Misión, Visión, Políticas de Calidad y Alianzas). |

#### CRITERIOS DE ACEPTACIÓN
- **Condición 01: Carga Inicial de la Pagina Principal sin Credenciales**
  - **Dado:** Que un usuario visitante o cliente potencial ingresa a la dirección URL principal de IKernell desde cualquier navegador web moderno.
  - **Cuando:** El navegador complete la recepción y renderizado de los recursos de la página.
  - **Entonces:** La plataforma debe presentar el panel de bienvenida institucional (Hero), la propuesta de valor y los menús de navegación pública sin desplegar avisos de login, modal de autenticación ni redirecciones forzadas.
- **Condición 02: Desplazamiento Suave entre Secciones del Portal (Smooth Scrolling)**
  - **Dado:** Que el visitante explora la barra de navegación superior en la cabecera del portal.
  - **Cuando:** Selecciona las opciones "Portafolio", "Servicios" o "Estrategia".
  - **Entonces:** El sistema debe desplazar la pantalla de manera fluida y suave hasta la sección anclada correspondiente, manteniendo enfocada la opción seleccionada en el menú.
- **Condición 03: Adaptabilidad Responsiva en Diferentes Resoluciones y Dispositivos**
  - **Dado:** Que el usuario visualiza el portal desde un teléfono inteligente, tableta, laptop o monitor de alta resolución.
  - **Cuando:** Redimensiona la ventana o navega por los diferentes bloques de contenido.
  - **Entonces:** La tipografía, imágenes, cuadrículas de servicios y menús de navegación deben reorganizarse proporcionalmente sin sobreposición de textos, desbordamientos horizontales ni cortes de contenido.
- **Condición 04: Exploración Libre e Ininterrumpida de Información Estratégica**
  - **Dado:** Que el visitante navega libremente por las secciones públicas institucionales (Misión, Visión, Políticas de Calidad).
  - **Cuando:** Interactúa con los botones e insignias informativas de la página.
  - **Entonces:** El sistema debe permitir la consulta integral de toda la información corporativa sin solicitar credenciales ni activar bloqueos de seguridad por falta de token de sesión.

#### ACTIVIDADES DE NEGOCIO / ENTREGABLES (TAREAS)
| No | Descripción Funcional de la Tarea |
| :---: | :--- |
| 1 | Estructurar la disposición visual corporativa de la página principal (Encabezado responsivo, Sección Hero, Propuesta de Valor). |
| 2 | Redactar e integrar los contenidos institucionales oficiales (Misión, Visión, Políticas de Calidad CMMI y Alianzas Tecnológicas). |
| 3 | Configurar la navegación suave entre anclajes de página (smooth scrolling) y validar la botonera de interacción. |
| 4 | Realizar pruebas de rendimiento y adaptabilidad responsiva en resoluciones móviles, tablets y pantallas de escritorio. |

#### CONTROL DE VERSIONES
| Versión | Fecha | Autor | Revisión | Descripción | Aprobador |
| :---: | :---: | :---: | :---: | :--- | :---: |
| 2.1 | 2026-08-21 | Abrahan Boada Suarez / Analista Senior | QA / BA Lead | Optimización de criterios de aceptación Gherkin y validación de acceso público. | Jefe de Proyecto |

---

### HISTORIA DE USUARIO: HU-02

| CAMPO | ESPECIFICACIÓN DETALLADA |
| :--- | :--- |
| **Código** | **HU-02** |
| **Nombre** | **Ambientación Visual Adaptativa (Modo Día / Modo Noche)** |
| **Complejidad** | **Media** |
| **HU Relacionada** | **HU-01** |
| **Módulo** | **Público (Experiencia de Usuario & Accesibilidad)** |
| **Descripción** | **Yo como:** Visitante del portal web corporativo<br>**Requiero:** alternar manualmente o recibir de forma automática una ambientación visual de alto contraste en Modo Claro o Modo Oscuro<br>**Para:** disfrutar de una lectura cómoda, descansar la vista según las condiciones de iluminación ambiental y experimentar una interfaz moderna. |
| **Requerimiento** | **RF-01:** Acceso Libre y Perimetralidad Pública del Portal Corporativo (Navegación fluida de la interfaz en cualquier tema).<br>**RF-02:** Visualización Institucional y Ambientación Visual Adaptativa (Conmutación gradual entre temas claros y oscuros).<br>**RF-03:** Centro de Autoservicio y Búsqueda Inteligente de Preguntas Frecuentes (FAQ) (Preservación del contraste visual en todos los componentes). |

#### CRITERIOS DE ACEPTACIÓN
- **Condición 01: Conmutación Manual de Tema Visual sin Recarga de Página**
  - **Dado:** Que el usuario interactúa con cualquier sección del portal corporativo.
  - **Cuando:** Presiona el conmutador visual de tema (ícono Sol / Luna) ubicado en la cabecera.
  - **Entonces:** La interfaz completa debe transformar sus fondos, colores de texto, bordes e ilustraciones entre tonalidades claras y oscuras de forma gradual, sin recargar la página ni perder la posición de lectura.
- **Condición 02: Detección Automática de Horario Nocturno en Primera Visita**
  - **Dado:** Que un nuevo usuario ingresa por primera vez al sitio web institucional desde un navegador limpio.
  - **Cuando:** El sistema consulte la hora local del dispositivo del visitante y determine que se encuentra en horario nocturno (entre las 18:00 y las 06:00 horas).
  - **Entonces:** La plataforma debe inicializarse de forma predeterminada en Modo Oscuro para proteger la ergonomía visual del usuario.
- **Condición 03: Persistencia de la Preferencia del Usuario en Sesiones Posteriores**
  - **Dado:** Que un visitante seleccionó manualmente su modo de visualización preferido (Modo Claro u Oscuro).
  - **Cuando:** Vuelva a ingresar al portal en días o sesiones posteriores desde el mismo navegador.
  - **Entonces:** El portal debe recordar y aplicar automáticamente la preferencia seleccionada previamente guardada en el navegador.
- **Condición 04: Garantía de Alto Contraste y Accesibilidad Visual**
  - **Dado:** Que la plataforma conmuta a Modo Oscuro o Modo Claro.
  - **Cuando:** El usuario lee textos, tablas, tarjetas de servicio o formularios.
  - **Entonces:** La relación de contraste cromático entre el texto y el fondo debe cumplir con los estándares de accesibilidad, evitando colores opacos o ilegibles.

#### ACTIVIDADES DE NEGOCIO / ENTREGABLES (TAREAS)
| No | Descripción Funcional de la Tarea |
| :---: | :--- |
| 1 | Definir la paleta cromática corporativa accesible para Modo Claro (fondos puros) y Modo Oscuro (tonos grafito/noche). |
| 2 | Diseñar las transiciones visuales CSS y efectos de iluminación suaves al conmutar el interruptor de tema. |
| 3 | Implementar la lógica JavaScript de detección de zona horaria local y persistencia en LocalStorage. |
| 4 | Validar la legibilidad y contraste visual de todos los componentes, tarjetas y botones en ambos modos. |

#### CONTROL DE VERSIONES
| Versión | Fecha | Autor | Revisión | Descripción | Aprobador |
| :---: | :---: | :---: | :---: | :--- | :---: |
| 2.1 | 2026-08-21 | Auditor Senior de Negocio | QA / BA Lead | Actualización de criterios Gherkin y automatización de detección horaria. | Jefe de Proyecto |

---

### HISTORIA DE USUARIO: HU-03

| CAMPO | ESPECIFICACIÓN DETALLADA |
| :--- | :--- |
| **Código** | **HU-03** |
| **Nombre** | **Exploración Interactiva del Portafolio de Servicios Tecnológicos** |
| **Complejidad** | **Baja** |
| **HU Relacionada** | **HU-01** |
| **Módulo** | **Público (Portafolio Comercial)** |
| **Descripción** | **Yo como:** Cliente Empresarial o Interesado<br>**Requiero:** explorar las diferentes áreas de servicio y especialidades de desarrollo de IKernell<br>**Para:** evaluar la capacidad técnica, la cobertura metodológica y seleccionar la solución tecnológica que mejor responda a las necesidades de mi organización. |
| **Requerimiento** | **RF-01:** Acceso Libre y Perimetralidad Pública del Portal Corporativo.<br>**RF-02:** Visualización Institucional y Ambientación Visual Adaptativa (Presentación del portafolio comercial de servicios tecnológicos). |

#### CRITERIOS DE ACEPTACIÓN
- **Condición 01: Identificación Clara de la Oferta Comercial de Servicios**
  - **Dado:** Que el cliente empresarial se ubica en la sección de servicios del portal.
  - **Cuando:** Visualiza la cuadrícula de ofertas comerciales.
  - **Entonces:** Debe poder identificar con total claridad el nombre del servicio, una descripción sintetizada de su propuesta de valor, sus características clave y un ícono corporativo representativo.
- **Condición 02: Resaltado Visual Dinámico al Enfocar Tarjetas (Hover Effect)**
  - **Dado:** Que el usuario desplaza el cursor o enfoca una tarjeta de servicio específica.
  - **Cuando:** Interactúa con el elemento gráfico.
  - **Entonces:** La tarjeta debe destacarse de inmediato mediante el realce de sus bordes, elevación con sombra suave y cambio de tono cromático, confirmando la selección activa de manera clara.
- **Condición 03: Despliegue de Detalles Técnicos y Stack Tecnológico del Servicio**
  - **Dado:** Que el usuario desea profundizar en los estándares y tecnologías de una disciplina.
  - **Cuando:** Selecciona la tarjeta o hace clic en la acción "Ver detalles del servicio".
  - **Entonces:** El sistema debe presentar una ventana informativa con el desglose del stack tecnológico, certificaciones de calidad aplicables y un botón directo para cotizar el servicio seleccionado.
- **Condición 04: Enlace Directo desde el Servicio hacia la Cotización Comercial**
  - **Dado:** Que un cliente encuentra la solución tecnológica requerida en el portafolio.
  - **Cuando:** Presiona el botón "Cotizar este Servicio".
  - **Entonces:** La plataforma debe redirigirlo o desplazarlo automáticamente al formulario de radicación de solicitudes, preseleccionando la categoría de servicio correspondiente.

#### ACTIVIDADES DE NEGOCIO / ENTREGABLES (TAREAS)
| No | Descripción Funcional de la Tarea |
| :---: | :--- |
| 1 | Redactar las fichas comerciales, propuesta de valor y alcances de cada uno de los servicios tecnológicos de IKernell. |
| 2 | Configurar la interacción visual dinámica (efecto hover, micro-animaciones) en la cuadrícula de tarjetas. |
| 3 | Implementar la ventana emergente modal con la ficha técnica detallada del stack tecnológico por servicio. |
| 4 | Integrar los enlaces directos y preselección de categoría desde las tarjetas hacia el formulario de radicación web. |

#### CONTROL DE VERSIONES
| Versión | Fecha | Autor | Revisión | Descripción | Aprobador |
| :---: | :---: | :---: | :---: | :--- | :---: |
| 2.1 | 2026-08-21 | Auditor Senior de Negocio | QA / BA Lead | Optimización de detalles de portafolio y enlaces directos a cotización. | Jefe de Proyecto |

---

### HISTORIA DE USUARIO: HU-04

| CAMPO | ESPECIFICACIÓN DETALLADA |
| :--- | :--- |
| **Código** | **HU-04** |
| **Nombre** | **Registro y Radicación Web de Solicitudes de Contacto y Cotizaciones** |
| **Complejidad** | **Media** |
| **HU Relacionada** | **HU-01** |
| **Módulo** | **Público (Canal de Contacto y Captura de Oportunidades)** |
| **Descripción** | **Yo como:** Cliente Potencial o Representante de Empresa<br>**Requiero:** diligenciar y enviar un formulario de contacto con mis datos corporativos y requerimiento de proyecto<br>**Para:** solicitar información técnica, cotizaciones comerciales o asesoría personalizada, recibiendo una confirmación inmediata de radicación. |
| **Requerimiento** | **RF-04:** Radicación Web y Captura Transaccional de Oportunidades de Contacto (Persistencia transaccional en tabla solicitud_contacto con estado atendido = FALSE).<br>**RF-14:** Creación, Dimensionamiento Presupuestal y Cronograma de Proyectos (Insumo para la preparación de propuestas comerciales). |

#### CRITERIOS DE ACEPTACIÓN
- **Condición 01: Radicación Exitosa con Campos Obligatorios Coherentes**
  - **Dado:** Que el cliente interesado diligencia todos los campos obligatorios del formulario con datos válidos (Nombre completo, Correo corporativo, Teléfono de contacto y Mensaje detallado).
  - **Cuando:** Presiona el botón "Enviar Solicitud".
  - **Entonces:** El sistema debe registrar la solicitud en la base de datos con estado "Pendiente" (atendido = false), limpiar los campos del formulario y presentar un aviso de confirmación de radicación exitosa indicando que un asesor comercial se comunicará a la brevedad.
- **Condición 02: Bloqueo Transaccional por Inconsistencia de Datos o Campos Vacíos**
  - **Dado:** Que el usuario introduce un formato de correo electrónico inválido (ej. sin arroba o sin dominio) o deja campos obligatorios vacíos.
  - **Cuando:** Intente enviar el formulario de contacto.
  - **Entonces:** El sistema debe bloquear la transacción, resaltar en color de advertencia los campos con errores y desplegar mensajes de guía claros debajo de cada casilla indicando la corrección requerida.
- **Condición 03: Prevención de Envíos Duplicados e Inhabilitación Temporal del Botón**
  - **Dado:** Que el usuario acaba de hacer clic en el botón de envío del formulario.
  - **Cuando:** La solicitud HTTP se encuentre en proceso de envío y almacenamiento en el servidor.
  - **Entonces:** El botón de envío debe inhabilitarse visualmente mostrando un indicador de carga en movimiento (spinner) para impedir múltiples clics accidentales o registros duplicados.
- **Condición 04: Disponibilidad Inmediata en la Bandeja del Coordinador**
  - **Dado:** Que la solicitud de contacto fue procesada y guardada correctamente.
  - **Cuando:** El Coordinador General consulte la pestaña "Solicitudes Web" en su panel administrativo.
  - **Entonces:** La nueva solicitud debe aparecer reflejada de forma inmediata en la parte superior de la bandeja de entrada para su atención comercial.

#### ACTIVIDADES DE NEGOCIO / ENTREGABLES (TAREAS)
| No | Descripción Funcional de la Tarea |
| :---: | :--- |
| 1 | Diseñar la interfaz accesible del formulario de radicación comercial con campos estructurados y mensajes de estado. |
| 2 | Establecer las reglas de validación en tiempo real (expresiones regulares para email, longitud de nombres y teléfono). |
| 3 | Conectar el formulario web mediante petición HTTP POST hacia el endpoint del backend (/api/auth/contacto). |
| 4 | Validar la inhabilitación del botón de envío y la recepción inmediata del registro en la bandeja del Coordinador. |

#### CONTROL DE VERSIONES
| Versión | Fecha | Autor | Revisión | Descripción | Aprobador |
| :---: | :---: | :---: | :---: | :--- | :---: |
| 2.0 | 2026-08-18 | Auditor Senior de Negocio | QA / BA Lead | Enfoque de negocio, control de leads y prevención de duplicados. | Jefe de Proyecto |

---

### HISTORIA DE USUARIO: HU-05

| CAMPO | ESPECIFICACIÓN DETALLADA |
| :--- | :--- |
| **Código** | **HU-05** |
| **Nombre** | **Centro de Autoservicio y Búsqueda Inteligente de Preguntas Frecuentes (FAQ)** |
| **Complejidad** | **Baja** |
| **HU Relacionada** | **HU-01** |
| **Módulo** | **Público (Atención al Usuario & Soporte Informativo)** |
| **Descripción** | **Yo como:** Visitante, Cliente o Evaluador del Sistema<br>**Requiero:** consultar y buscar preguntas frecuentes mediante palabras clave y visualización desplegable<br>**Para:** resolver inquietudes operativas, técnicas y contractuales de forma inmediata, optimizando mi tiempo y reduciendo consultas repetitivas al equipo de soporte. |
| **Requerimiento** | **RF-03:** Centro de Autoservicio y Búsqueda Inteligente de Preguntas Frecuentes (FAQ) (Búsqueda en tiempo real e interactividad tipo acordeón). |

#### CRITERIOS DE ACEPTACIÓN
- **Condición 01: Filtrado de Preguntas Frecuentes en Tiempo Real por Palabra Clave**
  - **Dado:** Que el usuario se ubica en el campo de búsqueda del módulo de Preguntas Frecuentes.
  - **Cuando:** Escribe cualquier palabra clave o término (ej. "seguridad", "facturación", "tiempos", "garantías").
  - **Entonces:** La plataforma debe actualizar instantáneamente la lista, mostrando únicamente aquellas preguntas o respuestas que contengan las palabras digitadas, evaluando la coincidencia sin importar mayúsculas ni acentos.
- **Condición 02: Despliegue Interactivo de Respuestas Tipo Acordeón**
  - **Dado:** Que el usuario localiza una pregunta de su interés en el catálogo de FAQs.
  - **Cuando:** Hace clic sobre el título de la pregunta.
  - **Entonces:** La respuesta detallada debe desplegarse suavemente hacia abajo con tipografía clara y bien estructurada, manteniendo ordenada el resto de la pantalla.
- **Condición 03: Manejo de Estado Vacío sin Coincidencias de Búsqueda**
  - **Dado:** Que el usuario ingresa un término de búsqueda que no coincide con ninguna pregunta registrada.
  - **Cuando:** Finalice de escribir el texto.
  - **Entonces:** El sistema debe presentar un cuadro informativo amigable con el mensaje: "No se encontraron preguntas relacionadas con su búsqueda", ofreciendo un botón directo al formulario de contacto.
- **Condición 04: Navegación por Categorías de Inquietudes**
  - **Dado:** Que el cliente desea explorar preguntas organizadas por área temática.
  - **Cuando:** Selecciona las pestañas "Metodología", "Seguridad" o "Contratación".
  - **Entonces:** El módulo debe filtrar las preguntas pertenecientes a esa categoría específica.

#### ACTIVIDADES DE NEGOCIO / ENTREGABLES (TAREAS)
| No | Descripción Funcional de la Tarea |
| :---: | :--- |
| 1 | Catalogar y redactar el banco oficial de preguntas y respuestas sobre metodologías, seguridad y contratación. |
| 2 | Diseñar la barra de búsqueda interactiva con filtrado textual inmediato y normalización de acentos. |
| 3 | Implementar la animación visual de apertura y cierre tipo acordeón para las respuestas de las preguntas. |
| 4 | Configurar los estados de consulta vacía e integrar el enlace sugerido hacia el formulario de radicación comercial. |

#### CONTROL DE VERSIONES
| Versión | Fecha | Autor | Revisión | Descripción | Aprobador |
| :---: | :---: | :---: | :---: | :--- | :---: |
| 2.0 | 2026-08-18 | Auditor Senior de Negocio | QA / BA Lead | Enfoque de autoservicio, búsqueda útil e interactividad. | Jefe de Proyecto |

---

### HISTORIA DE USUARIO: HU-06

| CAMPO | ESPECIFICACIÓN DETALLADA |
| :--- | :--- |
| **Código** | **HU-06** |
| **Nombre** | **Autenticación Segura y Control de Acceso por Roles (RBAC & JWT)** |
| **Complejidad** | **Alta** |
| **HU Relacionada** | **N/A** |
| **Módulo** | **Seguridad y Control de Acceso** |
| **Descripción** | **Yo como:** Colaborador Registrado (Coordinador, Líder o Desarrollador)<br>**Requiero:** iniciar sesión en el portal privado mediante mi correo electrónico corporativo y contraseña protegida<br>**Para:** acceder a mi panel de trabajo correspondiente según mi perfil de permisos, garantizando la seguridad y confidencialidad de la información corporativa. |
| **Requerimiento** | **RF-05:** Autenticación Stateless y Emisión de Token JWT (Validación contra Spring Security y retorno de AuthResponse).<br>**RF-06:** Canal de Comunicación Instantánea y Persistencia de Mensajería Corporativa (Acceso restringido a personal autenticado). |

#### CRITERIOS DE ACEPTACIÓN
- **Condición 01: Autenticación Exitosa y Redirección Específica por Rol (RBAC)**
  - **Dado:** Que un colaborador ingresa su correo corporativo y contraseña válidos en la pantalla de inicio de sesión.
  - **Cuando:** Presiona el botón "Iniciar Sesión".
  - **Entonces:** El sistema debe autenticar las credenciales contra el servidor, emitir el token de sesión seguro JWT y redirigir inmediatamente al usuario a su panel correspondiente:<br>• **Coordinador** ➔ Panel de Coordinación General (`/coordinador`)<br>• **Líder de Proyecto** ➔ Panel de Líder de Proyecto (`/lider`)<br>• **Desarrollador** ➔ Panel Operativo de Desarrollo (`/desarrollador`)
- **Condición 02: Rechazo Transaccional por Credenciales Inválidas**
  - **Dado:** Que el usuario introduce un correo electrónico inexistente o una contraseña equivocada.
  - **Cuando:** Intenta autenticarse en la plataforma.
  - **Entonces:** El sistema debe denegar el acceso de inmediato, mantener al usuario en la pantalla de ingreso y mostrar una notificación visual clara: "Credenciales inválidas. Verifique su correo corporativo o contraseña."
- **Condición 03: Bloqueo de Acceso para Cuentas de Personal Inhabilitado**
  - **Dado:** Que un colaborador cuya cuenta se encuentra en estado inhabilitado administrativamente (estado = false) intenta iniciar sesión con credenciales correctas.
  - **Cuando:** Se procese la verificación en el servidor.
  - **Entonces:** La plataforma debe bloquear el inicio de sesión y emitir una alerta explicativa: "Su cuenta se encuentra inactiva. Comuníquese con la Coordinación General para reactivar su acceso."
- **Condición 04: Cierre de Sesión Seguro y Destrucción del Token de Sesión**
  - **Dado:** Que un usuario autenticado presiona la opción "Cerrar Sesión" en la barra superior.
  - **Cuando:** Se confirme la acción.
  - **Entonces:** El sistema debe eliminar los tokens guardados en el navegador, limpiar el contexto de autenticación y redirigir al usuario al portal público.

#### ACTIVIDADES DE NEGOCIO / ENTREGABLES (TAREAS)
| No | Descripción Funcional de la Tarea |
| :---: | :--- |
| 1 | Diseñar la interfaz corporativa de inicio de sesión con campos protegidos para correo y contraseña. |
| 2 | Configurar el cliente HTTP (Axios) para inyectar automáticamente la cabecera `Authorization: Bearer <token>` en peticiones protegidas. |
| 3 | Implementar la lógica de derivación y protección de rutas en el enrutador de React según el rol (Coordinador, Líder, Desarrollador). |
| 4 | Validar los mensajes de error visuales para credenciales incorrectas, cuentas suspendidas y cierre de sesión. |

#### CONTROL DE VERSIONES
| Versión | Fecha | Autor | Revisión | Descripción | Aprobador |
| :---: | :---: | :---: | :---: | :--- | :---: |
| 2.0 | 2026-08-18 | Auditor Senior de Negocio | QA / BA Lead | Reingeniería enfocada en roles RBAC, seguridad JWT y control de acceso. | Jefe de Proyecto |

---

### HISTORIA DE USUARIO: HU-07

| CAMPO | ESPECIFICACIÓN DETALLADA |
| :--- | :--- |
| **Código** | **HU-07** |
| **Nombre** | **Custodia Criptográfica y Protección de Contraseñas de Colaboradores (BCrypt)** |
| **Complejidad** | **Media** |
| **HU Relacionada** | **HU-06** |
| **Módulo** | **Seguridad y Control de Acceso (Custodia Criptográfica)** |
| **Descripción** | **Yo como:** Responsable de Seguridad de la Información<br>**Requiero:** que el sistema aplique protección criptográfica irreversible a todas las contraseñas de los usuarios<br>**Para:** salvaguardar la privacidad de las credenciales de acceso y evitar cualquier exposición de claves ante incidentes de seguridad o consultas a la base de datos. |
| **Requerimiento** | **RF-09:** Custodia Criptográfica BCrypt y Tipificación Contractual de Personal (Generación de sal aleatoria y factor de costo 12 en PostgreSQL). |

#### CRITERIOS DE ACEPTACIÓN
- **Condición 01: Transformación Irreversible de la Contraseña al Registrar o Cambiar Clave**
  - **Dado:** Que el Coordinador crea un nuevo colaborador o un usuario solicita la actualización de su contraseña.
  - **Cuando:** El sistema procese y persista el registro en la base de datos.
  - **Entonces:** La contraseña en texto plano debe ser cifrada mediante el algoritmo BCrypt con sal aleatoria antes de guardarse en la columna `password`, impidiendo que pueda ser descifrada por administradores o auditores.
- **Condición 02: Comprobación Matemática Segura durante el Inicio de Sesión**
  - **Dado:** Que un usuario ingresa su contraseña en el formulario de inicio de sesión.
  - **Cuando:** El servidor valida la autenticidad de las credenciales.
  - **Entonces:** La comprobación debe realizarse mediante la verificación matemática de equivalencia del algoritmo BCrypt, sin exponer la contraseña en texto legible en memoria ni en logs del servidor.
- **Condición 03: Ausencia Total de Claves en Vistas y Reportes Administrativos**
  - **Dado:** Que un administrador o auditor consulta la lista de trabajadores o exporta reportes de personal.
  - **Cuando:** Se retorne la información desde la base de datos.
  - **Entonces:** La propiedad `password` debe ser omitida de los objetos JSON de respuesta, asegurando que ninguna pantalla o archivo contenga las claves de los empleados.
- **Condición 04: Resistencia contra Ataques de Diccionario y Fuerza Bruta**
  - **Dado:** Que se procesa el almacenamiento del hash en la base de datos.
  - **Cuando:** Se genere la sal criptográfica.
  - **Entonces:** Cada contraseña cifrada debe incluir una sal única e irrepetible, garantizando que dos usuarios con la misma clave generen hashes completamente diferentes en la base de datos.

#### ACTIVIDADES DE NEGOCIO / ENTREGABLES (TAREAS)
| No | Descripción Funcional de la Tarea |
| :---: | :--- |
| 1 | Establecer las políticas de seguridad para la codificación irreversible de credenciales mediante BCrypt (costo 12). |
| 2 | Configurar Spring Security y los servicios JPA para procesar de forma transparente la protección de la contraseña al guardar. |
| 3 | Auditar las consultas SQL, vistas de React y DTOs de respuesta para garantizar que las claves no sean expuestas en ningún endpoint. |
| 4 | Ejecutar pruebas de penetración y verificación de hashes en PostgreSQL para asegurar el cumplimiento normativo. |

#### CONTROL DE VERSIONES
| Versión | Fecha | Autor | Revisión | Descripción | Aprobador |
| :---: | :---: | :---: | :---: | :--- | :---: |
| 2.1 | 2026-08-21 | Auditor Senior de Negocio | QA / BA Lead | Enfoque en protección de datos, normas de ciberseguridad y auditoría. | Jefe de Proyecto |

---

### HISTORIA DE USUARIO: HU-08

| CAMPO | ESPECIFICACIÓN DETALLADA |
| :--- | :--- |
| **Código** | **HU-08** |
| **Nombre** | **Registro y Gestión del Perfil Profesional y Competencias del Personal** |
| **Complejidad** | **Media** |
| **HU Relacionada** | **HU-06** |
| **Módulo** | **Módulo del Coordinador (Administración de Personal & Talento)** |
| **Descripción** | **Yo como:** Coordinador General<br>**Requiero:** registrar nuevos colaboradores en la plataforma asignándoles rol, datos de contacto, perfil profesional, modalidad contractual y su catálogo de habilidades técnicas<br>**Para:** habilitar sus cuentas corporativas de acceso y disponer de un inventario actualizado de competencias para la asignación estratégica de proyectos de software. |
| **Requerimiento** | **RF-08:** Registro y Gestión del Perfil Profesional y Competencias del Personal (Formulario de alta con sugerencias según rol).<br>**RF-09:** Custodia Criptográfica BCrypt y Tipificación Contractual de Personal (Asignación obligatoria de tipificación contractual: Planta, Contratista, Freelance). |

#### CRITERIOS DE ACEPTACIÓN
- **Condición 01: Alta de Colaborador con Datos Obligatorios y Estado Habilitado**
  - **Dado:** Que el Coordinador General diligencia todos los datos obligatorios del formulario de registro (Cédula/Documento, Nombres, Apellidos, Correo corporativo válido, Rol, Profesión, Especialidad, Tipo de Trabajador y Competencias Técnicas).
  - **Cuando:** Presiona el botón "Guardar Colaborador".
  - **Entonces:** El sistema debe registrar al empleado en la base de datos con estado "Habilitado" (estado = true), generarle las credenciales iniciales, mostrar un aviso de confirmación e incorporarlo de inmediato en la tabla de personal activo.
- **Condición 02: Sugerencia Dinámica de Competencias Tecnológicas según el Rol**
  - **Dado:** Que el Coordinador selecciona el rol del colaborador en la lista desplegable del formulario.
  - **Cuando:** Elige entre "Desarrollador", "Líder de Proyecto" o "Coordinador".
  - **Entonces:** El formulario debe desplegar automáticamente un catálogo sugerido de competencias afines (ej. lenguajes y frameworks para desarrolladores, metodologías ágiles y gestión de riesgos para líderes, o administración y finanzas para coordinadores).
- **Condición 03: Validación en Tiempo Real para Impedir Registros Duplicados**
  - **Dado:** Que se intenta registrar a un colaborador cuyo número de documento de identidad o correo electrónico ya pertenece a otro trabajador registrado.
  - **Cuando:** Se presione el botón de guardado.
  - **Entonces:** El sistema debe rechazar la transacción, resaltar en color rojo el campo duplicado y alertar: "Ya existe un colaborador registrado con este número de identificación o correo electrónico."
- **Condición 04: Visualización Compacta e Interactiva de Competencias en la Tabla**
  - **Dado:** Que el Coordinador consulta la tabla principal de personal registrado.
  - **Cuando:** Visualiza la columna de competencias de un colaborador con múltiples habilidades asignadas.
  - **Entonces:** La interfaz debe presentar una insignia compacta de competencias que, al pasar el cursor o hacer clic, despliegue un menú flotante con la lista ordenada de todas sus tecnologías sin expandir la altura de la fila.

#### ACTIVIDADES DE NEGOCIO / ENTREGABLES (TAREAS)
| No | Descripción Funcional de la Tarea |
| :---: | :--- |
| 1 | Diseñar el formulario de alta de personal con campos estructurados para datos personales, rol, profesión, tipificación contractual y habilidades. |
| 2 | Implementar el catálogo interactivo de sugerencias de stack tecnológico y competencias según el cargo seleccionado. |
| 3 | Configurar las reglas de validación en tiempo real en frontend y backend para evitar registros duplicados por cédula o correo. |
| 4 | Desarrollar el componente interactivo de insignias flotantes para la lectura limpia de competencias en la tabla de personal. |

#### CONTROL DE VERSIONES
| Versión | Fecha | Autor | Revisión | Descripción | Aprobador |
| :---: | :---: | :---: | :---: | :--- | :---: |
| 2.1 | 2026-08-21 | Auditor Senior de Negocio | QA / BA Lead | Incorporación de tipificación contractual, sugerencias de stack y validación duplicados. | Jefe de Proyecto |
