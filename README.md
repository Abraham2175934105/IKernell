# IKernell - Plataforma Empresarial de Gestion y Control Predictivo de Software

IKernell es una solucion integral disenada para la planificacion, monitoreo operacional y control predictivo de proyectos de desarrollo de software bajo estandares CMMI e ISO/IEC. La plataforma desacopla la capa de presentacion web (Single Page Application) del nucleo de logica de negocio y persistencia transaccional, incorporando gobernanza WBS, asignacion de personal con control de capacidad horaria, registro de telemetria de fallos, gestion de contingencias operativas, un motor predictivo de evaluacion de riesgos (capacity.pulse), catalogos de inyeccion de codigo con busqueda difusa y canalizaciones batch de exportacion internacional.

---

## 1. Stack Tecnologico

El sistema esta construido sobre un conjunto tecnologico de nivel empresarial que garantiza alta disponibilidad, seguridad sin estado, concurrencia y bajo tiempo de respuesta:

### Backend y Capa de Servicios
* Lenguaje de Programacion: Java 17 LTS.
* Framework Principal: Spring Boot 3.4.2.
* Seguridad Perimetral y Autenticacion: Spring Security 6 con tokens criptograficos JWT (JJWT 0.12.6) firmados con algoritmo HMAC-SHA256, bajo una arquitectura estrictamente sin estado (Stateless REST).
* Persistencia y Acceso a Datos: Spring Data JPA sobre Hibernate ORM 6.6 con ejecucion por lotes (Batch size: 50, order_inserts, order_updates) y prevencion de problemas N+1 mediante JOIN FETCH y EntityGraph.
* Pool de Conexiones: HikariCP dimensionado para alta concurrencia (40 conexiones maximas, 15 inactivas minimas, deteccion de fugas en 15 segundos).
* Procesamiento Concurrente y Asincrono: Spring Task Execution (@Async y @Scheduled) con pool dedicado de hilos para analitica pesada y exportaciones ETL.
* Manejo Global de Excepciones: Controlador de asesoramiento global (@RestControllerAdvice) para la emision de respuestas semanticas estructuradas con trazabilidad de errores.

### Frontend y Capa de Presentacion
* Libreria Base: React 18.3.
* Herramienta de Construccion y Empaquetado: Vite 5.4.
* Gestor de Dependencias Exclusivo: pnpm (requerimiento estricto de ejecucion y bloqueo de paquetes).
* Sistema de Estilos y Diseno: Tailwind CSS y Vanilla CSS estructurado con variables semanticas monocromaticas en escala de grises, alto contraste y acentos en azul corporativo.
* Gestion de Estado y Sesion: React Context API (AuthContext para persistencia segura de tokens y ThemeContext para modo claro y modo oscuro).
* Motor de Animacion y Transiciones: Framer Motion para microinteracciones fluidas y transiciones visuales.
* Visualizacion de Datos y Metricas: Recharts para la representacion grafica de distribuciones de fallos, contingencias y tendencias de fatiga operativa.
* Iconografia Vectorial: Lucide React (iconos SVG optimizados, sin caracteres no estandar ni emojis).
* Procesamiento de Documentos: react-markdown, remark-gfm y generacion de reportes en cliente con jsPDF.

### Base de Datos y Motor Relacional
* Motor de Base de Datos: PostgreSQL 14+ (compatible y verificado en PostgreSQL 18.4).
* Extension de Alto Rendimiento: Modulo oficial pg_trgm habilitado.
* Indexacion Avanzada: Indices GIN (Generalized Inverted Index) con operadores gin_trgm_ops para busquedas difusas ultrarrapidas (sub-50 ms).
* Cifrado de Credenciales: Algoritmo de derivacion de claves BCrypt con factor de costo 10 y generacion de sal aleatoria unidireccional.
* Consultas Complejas: 7 Common Table Expressions (CTEs) nativas en PostgreSQL para el analisis temporal retrospectivo de estabilidad operativa.

---

## 2. Estructura del Repositorio

El proyecto se organiza bajo una estructura modular de carpetas claramente delimitadas:

```text
IKernell/
├── backend/                              # Servidor de aplicaciones y API RESTful (Spring Boot 3 / Java 17)
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/ikernell/
│   │   │   │   ├── config/               # Configuracion de CORS, async pools y Swagger/OpenAPI
│   │   │   │   ├── controller/           # Controladores REST organizados por rol y dominio
│   │   │   │   ├── dto/                  # Objetos de transferencia de datos con validaciones Jakarta
│   │   │   │   ├── exception/            # Excepciones personalizadas y GlobalExceptionHandler
│   │   │   │   ├── model/                # Entidades JPA que mapean el esquema PostgreSQL
│   │   │   │   ├── repository/           # Repositorios Spring Data JPA y consultas personalizadas
│   │   │   │   ├── security/             # Filtro JWT, servicio de tokens y configuracion de Spring Security
│   │   │   │   └── service/              # Capa de logica de negocio transaccional (@Transactional)
│   │   │   └── resources/
│   │   │       ├── application.properties# Parametros del pool HikariCP, JPA, JWT y servidor
│   │   │       └── data.sql              # Semilla de datos iniciales para pruebas
│   │   └── test/                         # Pruebas unitarias y de integracion
│   └── pom.xml                           # Definicion de dependencias y plugins de compilacion Maven
├── frontend/                             # Aplicacion cliente Single Page Application (React 18 / Vite)
│   ├── public/
│   │   └── docs/                         # Documentacion institucional y especificaciones descargables
│   ├── src/
│   │   ├── assets/                       # Imagenes satelitales y recursos estaticos del sistema
│   │   ├── components/
│   │   │   ├── auth/                     # Formularios de autenticacion y recuperacion
│   │   │   ├── common/                   # Componentes reutilizables, modales y botones de accion
│   │   │   ├── dashboard/                # Componentes analiticos, Semaforo Inteligente y Predictor Burnout
│   │   │   ├── layout/                   # Estructura de navegacion y cabeceras de los paneles
│   │   │   └── public/                   # Secciones de la Landing Page corporativa (Hero, FAQs, Casos)
│   │   ├── context/                      # Contextos globales de autenticacion y temas visuales
│   │   ├── hooks/                        # Hooks personalizados para consumo HTTP y utilidades reactivas
│   │   ├── pages/
│   │   │   ├── coordinador/              # Panel de administracion de talento y registro de personal
│   │   │   ├── desarrollador/            # Consola operativa de tareas asignadas, errores e interrupciones
│   │   │   ├── lider/                    # Panel WBS, balance de cargas, dimensionamiento y contingencias
│   │   │   └── public/                   # Vistas publicas de portafolio, biblioteca y contacto
│   │   ├── services/                     # Clientes HTTP parametrizados con Axios e interceptores
│   │   ├── App.jsx                       # Enrutador principal con proteccion de rutas RBAC
│   │   ├── index.css                     # Tokens globales de diseno y directivas Tailwind CSS
│   │   └── main.jsx                      # Punto de entrada de la aplicacion React
│   ├── package.json                      # Manifiesto de dependencias y scripts de ejecucion pnpm
│   ├── pnpm-lock.yaml                    # Bloqueo determinista de versiones de paquetes
│   ├── tailwind.config.js                # Configuracion de extension de paleta y temas
│   └── vite.config.js                    # Configuracion de compilacion y division de modulos Vite
├── schema_completo.sql                   # Definicion completa DDL y DML de la base de datos PostgreSQL
├── .gitignore                            # Politica de exclusion estricta de binarios, secretos y temporales
└── README.md                             # Documentacion tecnica oficial de la arquitectura
```

---

## 3. Arquitectura del Sistema

La arquitectura de IKernell sigue el patron desacoplado N-Tier con comunicacion orientada a servicios RESTful a traves de HTTP/HTTPS:

```text
IKernell Architecture
├── Capa 1: Presentacion (Frontend Client)
│   ├── React 18 Single Page Application (SPA)
│   ├── Axios HTTP Client con Interceptores Bearer JWT
│   ├── Tailwind CSS + Vanilla Tokens (Soporte Dual Claro / Oscuro)
│   └── Framer Motion + Recharts (Telemetria y Dashboards)
│
├── Capa 2: Seguridad y Gateway Perimetral
│   ├── CORS Filter (Origenes autorizados en desarrollo y red local)
│   ├── JwtAuthenticationFilter (Validacion de firma HMAC-SHA256)
│   ├── SecurityContextHolder (Sesiones sin estado / Stateless REST)
│   └── Matriz de Autorizacion RBAC (/coordinador, /lider, /desarrollador)
│
├── Capa 3: Servicios y Negocio (Backend Core)
│   ├── Controladores REST (@RestController) con documentacion OpenAPI
│   ├── Servicios Transaccionales (@Service / @Transactional)
│   ├── Validador de Reglas de Negocio (Regla de 48h, WBS, Fechas)
│   ├── Motor Analitico capacity.pulse y Predictor de Riesgos
│   └── Manejador Global de Errores (@RestControllerAdvice)
│
└── Capa 4: Persistencia y Datos (Database Layer)
    ├── HikariCP Connection Pool (Pool optimizado para concurrencia)
    ├── Hibernate ORM 6.6 / Spring Data JPA (Batching y Anti N+1)
    ├── Motor Relacional PostgreSQL 14+ con integridad referencial
    └── Indices GIN y Extension pg_trgm para coincidencia por trigramas
```

---

## 4. Control de Acceso y Funcionalidades por Rol

El sistema implementa una matriz estricta de Control de Acceso Basado en Roles (RBAC):

### 4.1. Interesado / Usuario Publico
* Portal Institucional: Informacion corporativa sobre la mision, enfoque CMMI e innovaciones de IKernell.
* Catalogo de Servicios: Descripcion detallada de soluciones arquitectonicas, modernizacion cloud y consultoria.
* Centro de Preguntas Frecuentes (FAQs): Motor de filtrado en tiempo real con normalizacion de caracteres.
* Formulario de Contacto: Captura estructurada de requerimientos y cotizaciones hacia la base de datos.
* Biblioteca de Documentos y Visor A4: Acceso publico a normativas tecnicas, politicas de ciberseguridad y diccionarios de datos con visor en hoja A4 y descarga directa.

### 4.2. Coordinador
* Administracion Integral de Personal: Registro, actualizacion y consulta de trabajadores con asignacion de identificacion, profesion, especialidad y rol operativo.
* Inhabilitacion Logica (Soft-Delete): Suspension de cuentas de acceso sin alterar la integridad referencial de proyectos y auditorias previas.
* Gestion de Solicitudes Web: Revision y gestion de mensajes capturados desde el formulario de contacto con marcado de atencion.
* Auditoria de Capacidades: Supervision del inventario global de talentos tecnicos de la organizacion.

### 4.3. Lider de Proyectos
* Creacion y Dimensionamiento Presupuestal (HU-11 / RF-13): Registro de nuevos proyectos con definicion de cliente, fechas limites de cronograma y presupuesto dimensionado.
* Gestion de Estructura de Desglose de Trabajo (WBS): Creacion de fases, etapas y actividades granulares asignadas a desarrolladores.
* Asignacion con Control de Cargas (HU-12 / RF-16): Validacion en servidor que impide asignar a un desarrollador si la suma de sus horas semanales en proyectos activos supera el limite de 48 horas.
* Reasignacion de Actividades con Trazabilidad (HU-14 / RF-19): Transferencia de tareas entre desarrolladores con registro inmutable del motivo, fecha y autor.
* Semaforo Predictivo Live (RF-25): Monitoreo en tiempo real del indice de riesgo ponderando errores criticos y minutos de contingencia.
* Exportacion ETL Brasil (RF-28): Generacion y descarga de lotes operacionales bajo norma ISO 8601 UTC delimitados por pipe con sello criptografico SHA-256.

### 4.4. Desarrollador
* Tablero de Actividades Asignadas: Visualizacion de tareas individuales con cambio de estado de avance (PENDIENTE, EN_PROGRESO, COMPLETADA).
* Reporte de Errores Tecnicos (RF-22): Notificacion de fallos clasificados por nivel de severidad (BAJA, MEDIA, ALTA, CRITICA) en etapas WBS especificas.
* Reporte de Interrupciones y Contingencias (RF-23, RF-24): Notificacion de tiempos muertos en minutos y motivo de bloqueo para retroalimentar el Semáforo Predictivo.
* Inyeccion de Codigo (Snippet.inject): Busqueda difusa de fragmentos de codigo, scripts y soluciones tecnicas con copia directa al portapapeles.

---

## 5. Guia de Despliegue e Instalacion

### Requisitos Previos
* Java Development Kit (JDK): Version 17 LTS o superior.
* Apache Maven: Version 3.8 o superior.
* Node.js: Version 18.0 LTS o superior.
* pnpm: Version 8.0 o superior (gestor de paquetes exclusivo; el uso de otros gestores no esta permitido por la politica de calidad del proyecto).
* PostgreSQL: Version 14 o superior (instalado localmente o accesible por red).

### 5.1. Preparacion de la Base de Datos
1. Acceda a la consola de administracion de PostgreSQL (`psql`) y cree la base de datos:
```sql
CREATE DATABASE backend_db;
\c backend_db;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```
2. Ejecute el script de definicion y siembra de datos disponible en la raiz del proyecto:
```bash
psql -U <USUARIO> -d backend_db -f schema_completo.sql
```
3. Verifique las credenciales de conexion en el archivo `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/backend_db
spring.datasource.username=abrah
spring.datasource.password=abrah1234
```

### 5.2. Compilacion y Ejecucion del Backend (Spring Boot)
1. Navegue al directorio del backend:
```bash
cd backend
```
2. Compile y descargue las dependencias con Maven:
```bash
mvn clean compile
```
3. Inicie la aplicacion:
```bash
mvn spring-boot:run
```
* El servidor iniciara en el puerto configurado: `http://localhost:8080`
* Documentacion interactiva OpenAPI / Swagger: `http://localhost:8080/swagger-ui.html`

### 5.3. Instalacion y Ejecucion del Frontend (React + Vite + pnpm)
1. Navegue al directorio del frontend:
```bash
cd ../frontend
```
2. Instale las dependencias exclusivamente con pnpm:
```bash
pnpm install
```
3. Inicie el servidor de desarrollo Vite:
```bash
pnpm run dev
```
* La interfaz web estara disponible en: `http://localhost:5173`
* Para verificar la construccion para produccion sin errores:
```bash
pnpm run build
```

---

## 6. Credenciales de Acceso para Pruebas

Para validar los flujos de trabajo de cada rol en el entorno local de desarrollo, utilice las siguientes cuentas sembradas en la base de datos:

| Rol de Usuario | Correo Electronico Corporativo | Contrasena de Acceso | Acceso Rapido en Interfaz |
| :--- | :--- | :--- | :--- |
| **Coordinador** | `coordinador@ikernell.com` | `Coord123!` | Boton de perfil en formulario de Login |
| **Lider de Proyecto** | `lider@ikernell.com` | `Lider123!` | Boton de perfil en formulario de Login |
| **Desarrollador** | `diego.torres@ikernell.com` | `Dev123!` | Boton de perfil en formulario de Login |

*Nota de Seguridad: Todas las contrasenas estan resguardadas en la tabla `trabajador` mediante hashes unidireccionales generados con BCrypt.*

---

## 7. Politicas de Seguridad, Calidad y Mantenibilidad

* Control de Acceso Stateless: Ausencia total de sesiones HTTP en memoria de servidor; cada solicitud es validada independientemente mediante tokens JWT.
* Proteccion contra Ataques XSS: Sanitizacion obligatoria en cliente mediante DOMPurify y tipado estricto en entidades JPA.
* Gestion Segura de Secretos: Exclusion de archivos `.env`, credenciales productivas y carpetas de compilacion mediante reglas estrictas en `.gitignore`.
* Prevencion de Fugas de Memoria: Paginacion obligatoria con objetos `Pageable` de Spring Data en consultas masivas de personal y actividades.

---

## 8. Matriz de Requerimientos Funcionales y No Funcionales

El proyecto IKernell satisface la totalidad de los requerimientos de la especificacion tecnica oficial:

| Modulo / Dominio | Codigo RF / RNF | Descripcion de la Funcionalidad | Estado de Implementacion |
| :--- | :--- | :--- | :--- |
| Autenticacion | RNF-08 a RNF-10 | Autenticacion JWT Stateless con cifrado BCrypt y filtrado Spring Security | Implementado (100%) |
| Coordinador | RF-01 a RF-05 | Gestion de talentos, inhabilitacion logica y bandeja de solicitudes comerciales | Implementado (100%) |
| Lider de Proyecto | RF-11 a RF-20 | Dimensionamiento WBS, asignacion max. 48h semanal y reasignacion con auditoria | Implementado (100%) |
| Desarrollador | RF-21 a RF-24 | Tablero personal de actividades, reporte de errores y contingencias | Implementado (100%) |
| Analitica Predictiva | RF-25 a RF-27 | Algoritmo capacity.pulse (Semáforo) y proyeccion Burnout de fatiga 21d | Implementado (100%) |
| Interoperabilidad ETL | RF-28 | Pipeline batch delimitado por pipe ISO 8601 UTC con sello SHA-256 | Implementado (100%) |
| Biblioteca Digital | RF-33 | Visor dual Hoja A4 / Consola tecnica con exportacion PDF directa en cliente | Implementado (100%) |
| Micro-Snippets | RF-36 | Motor Snippet.inject con busqueda difusa por similitud de trigramas (`pg_trgm`) | Implementado (100%) |

---

## 9. Módulos de Innovación Empresarial y Gestión del Conocimiento

### 9.1. Semáforo Predictivo Inteligente (capacity.pulse)
Algoritmo continuo en tiempo real que evalúa la salud operacional de los proyectos combinando la acumulación de minutos de interrupción externa con la gravedad de los errores técnicos registrados:
* Estado Verde (Estable): Flujo operativo continuo sin impedimentos críticos.
* Estado Naranja (Advertencia / Atención): Detección de contingencias acumuladas o errores de severidad media que sugieren redistribución preventiva.
* Estado Rojo (Riesgo Crítico): Superación de umbrales tolerables de contingencia o presencia de errores críticos; emite alerta para intervención del líder.

### 9.2. Pipeline Batch ETL Alianza Estratégica Brasil
Canalización de datos orientada a la interoperabilidad internacional con aliados estratégicos:
* Estándar de Tiempos: Fechas y marcas de tiempo normalizadas bajo norma ISO 8601 UTC (YYYY-MM-DDTHH:mm:ssZ).
* Estructura de Archivo: Registros planos delimitados por barra vertical (|).
* Mecanismos de Ejecución: Modo manual One-Click desde el panel del líder y modo desatendido automático mediante tareas programadas (@Scheduled) en Spring Boot.
* Certificación de Integridad: Firma de contenido mediante hash SHA-256 generado al momento de la emisión.

### 9.3. Gestión del Conocimiento y Productividad Técnica
Módulo integral para la gobernanza de documentación institucional y aceleración de la resolución de contingencias de desarrollo:
* **Biblioteca Digital con Visor Dual A4 (RF-33):** Sistema de documentación técnica interactiva que ofrece conmutación fluida entre la vista formal estilizada en hoja A4 y la consola técnica. Soporta renderizado de Markdown/GFM, cambio dinámico de tema Claro/Oscuro y generación y descarga directa en el cliente de archivos PDF estilizados utilizando jsPDF y html2canvas sin requerir procesamiento adicional en servidor.
* **Motor de Inyección Predictiva Snippet.inject (RF-36):** Motor de aceleración operativa y reutilización de componentes de software basado en la búsqueda difusa por similitud de trigramas (`pg_trgm`) en PostgreSQL. Optimizado mediante índices GIN (`gin_trgm_ops`) para lograr respuestas en sub-50 ms, permitiendo el autocompletado predictivo e inyección directa de plantillas de solución técnica y scripts al portapapeles.

---

IKernell Soluciones Software - Documentacion Tecnica de Arquitectura y Despliegue.
