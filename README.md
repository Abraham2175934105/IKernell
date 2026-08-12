# IKernell - Plataforma de Gestion y Control de Proyectos de Software

IKernell es una solucion tecnologica empresarial concebida para la administracion integral, el seguimiento operacional y el control predictivo de proyectos de desarrollo de software. El sistema integra el desglose estructurado del trabajo (WBS), la asignacion granular de actividades por etapas, la clasificacion de errores e interrupciones en tiempo real, un motor predictivo de evaluacion de riesgos y la exportacion automatizada de metricas estandarizadas para aliados internacionales.

---

## 1. Stack Tecnologico

El ecosistema de IKernell esta construido bajo estandares modernos de la industria, garantizando modularidad, mantenibilidad y alto rendimiento:

### Backend
- **Lenguaje:** Java 17 LTS.
- **Framework Principal:** Spring Boot 3.4.2.
- **Seguridad y Control de Acceso:** Spring Security 6 con autenticacion sin estado (*stateless*) mediante tokens JWT (JSON Web Tokens) firmados con algoritmo HMAC-SHA256.
- **Persistencia de Datos:** Spring Data JPA sobre Hibernate ORM 6.6.
- **Pool de Conexiones:** HikariCP optimizado para alta concurrencia con dimensionamiento dinamico y control de fugas de conexion.
- **Procesamiento Asincrono y Tareas Programadas:** Spring Task Execution (`@Async` y `@Scheduled`) con pool dedicado `etlTaskExecutor`.
- **Manejo Global de Excepciones:** `@RestControllerAdvice` centralizado para la emision de respuestas semanticas estructuradas (`ApiErrorResponse`).

### Frontend
- **Libreria Principal:** React 18.3.
- **Herramienta de Construccion:** Vite 5.4.
- **Motor de Estilos:** Tailwind CSS y Vanilla CSS con sistema de variables personalizadas (paleta monocromatica de alto contraste en escala de grises y blanco puro).
- **Sistema de Temas:** `ThemeContext` dinámico con persistencia local en cliente (Modo Claro / Modo Oscuro).
- **Motor de Animaciones:** Framer Motion (revelado progresivo por scroll bidireccional, transiciones suaves y microinteracciones de interfaz).
- **Visualizacion de Datos:** Recharts para la representacion analitica de incidentes y niveles de severidad.
- **Iconografia:** Lucide React.
- **Optimizacion de Carga:** Division de codigo (*Code Splitting*) basada en rutas mediante `React.lazy()` y `Suspense`.

### Base de Datos y Ciberseguridad
- **Motor Relacional:** PostgreSQL 14+ con esquema fuertemente tipado, integridad referencial mediante claves foraneas e indices B-Tree.
- **Proteccion de Credenciales:** Algoritmo unidireccional de derivacion de claves BCrypt con factor de costo 10 (RNF-10).
- **Politica de Enmascaramiento de Datos (*Data Masking*):** Todos los identificadores sensibles, claves de acceso y certificados se administran mediante variables de entorno y marcadores de posicion protegidos.

---

## 2. Estructura y Gestion del Repositorio

### Clonacion del Repositorio
Para obtener una copia local del codigo fuente, ejecute:

```bash
git clone https://github.com/Abraham2175934105/IKernell.git
cd IKernell
```

### Estructura Base de Directorios
```text
IKernell/
├── backend/                  # Proyecto API RESTful en Spring Boot (Java 17)
│   ├── src/main/java/        # Controladores, Servicios, Modelos JPA, Seguridad y Repositorios
│   ├── src/main/resources/   # Archivos de configuracion (application.properties)
│   └── pom.xml               # Dependencias del proyecto Maven
├── frontend/                 # Aplicacion SPA en React 18 + Vite
│   ├── src/components/       # Componentes modulares (UI, Dashboard, Public, Auth)
│   ├── src/pages/            # Vistas enrutadas por rol (Coordinador, Lider, Dev, Public)
│   ├── src/context/          # Proveedores de estado global (AuthContext, ThemeContext)
│   ├── src/services/         # Clientes de comunicacion HTTP con la API REST
│   ├── package.json          # Dependencias y scripts de ejecucion Node.js
│   └── pnpm-lock.yaml        # Archivo estricto de bloqueo de versiones (Lockfile)
├── .gitignore                # Politica de exclusion estricta de documentos y secretos
└── README.md                 # Documentacion tecnica de arquitectura y despliegue
```

---

## 3. Arquitectura del Sistema

La solucion adopta un modelo Cliente-Servidor desacoplado en capas (*N-Tier Architecture*) comunicado exclusivamente mediante una API RESTful sobre protocolo HTTP/HTTPS:

```text
+-----------------------------------------------------------------------+
|                    CAPA DE PRESENTACION (FRONTEND)                    |
|          React 18 SPA + Tailwind CSS + Framer Motion + Vite          |
+-----------------------------------------------------------------------+
                                  |
                                  | Peticiones HTTP / JSON (Tokens JWT)
                                  v
+-----------------------------------------------------------------------+
|                     CAPA DE SERVICIOS (BACKEND)                       |
|  Spring Boot REST Controllers -> Services (Logica de Negocio)         |
|  Spring Security (Filtros JWT + RBAC) -> Manejador Global Errores     |
|  Procesos Asincronos (@Async) & Tareas Programadas (@Scheduled)       |
+-----------------------------------------------------------------------+
                                  |
                                  | Mapeo Objeto-Relacional (JPA / Hibernate)
                                  v
+-----------------------------------------------------------------------+
|                     CAPA DE DATOS (PERSISTENCIA)                      |
|             Pool de Conexiones HikariCP -> PostgreSQL 14+            |
+-----------------------------------------------------------------------+
```

---

## 4. Funcionalidades por Rol de Usuario

El sistema implementa un esquema estricto de Control de Acceso Basado en Roles (RBAC), dividiendo la experiencia operativa en cuatro niveles:

### 4.1. Interesado / Usuario Publico
- **Portal Corporativo:** Presentacion institucional de IKernell, objetivos estrategicos y lineamientos tecnicos.
- **Catalogo de Servicios:** Descripcion detallada de soluciones de arquitectura, consultoria y desarrollo a medida.
- **Preguntas Frecuentes (FAQs) con Busqueda Predictiva:** Filtrado en tiempo real con normalizacion de caracteres, inmune a mayusculas, minusculas y tildes, con derivacion a contacto si no existen coincidencias.
- **Formulario de Contacto Corporativo:** Envio de consultas directas hacia el equipo de administracion con instrucciones de llenado formales.

### 4.2. Coordinador
- **Gestion Centralizada de Personal:** Registro, edicion y consulta de trabajadores con asignacion de especialidad, profesion y rol.
- **Inhabilitacion Logica:** Suspension de cuentas de acceso sin vulnerar la integridad referencial ni la trazabilidad de proyectos historicos.
- **Listados Masivos Paginados:** Consultas optimizadas de personal con soporte para paginacion en servidor.

### 4.3. Lider de Proyectos
- **Administracion de Proyectos:** Registro de nuevos proyectos, establecimiento de plazos estimados y control de estados.
- **Estructura de Desglose de Trabajo (WBS):** Division modular del proyecto en etapas y fases secuenciales.
- **Asignacion de Personal:** Vinculacion de desarrolladores a la planilla del proyecto y asignacion granular de actividades por etapa.
- **Monitoreo Predictivo:** Acceso al Semáforo Inteligente y ejecucion de la exportacion ETL para aliados internacionales.

### 4.4. Desarrollador
- **Tablero Operativo de Actividades:** Consulta de asignaciones individuales con control de estado (Asignada, En Progreso, Finalizada).
- **Reporte de Errores Tecnicos:** Registro de incidencias tipificadas por etapa con clasificacion por nivel de severidad (Baja, Media, Alta, Critica).
- **Reporte de Interrupciones y Contingencias:** Notificacion de suspensiones operativas indicando duracion en minutos y justificacion tecnica.

---

## 5. Modulos de Innovacion y Valor Agregado

### 5.1. Semaforo Inteligente (Dashboard Predictivo)
Modulo analitico que evalua continuamente la salud operacional de cada proyecto. Mediante un algoritmo deterministicamente calibrado, cruza las horas acumuladas de interrupciones tecnicas con la concentracion de errores criticos y genera un diagnostico categorizado:

- **Riesgo Bajo (Verde):** El proyecto avanza conforme al cronograma establecido.
- **Riesgo Moderado (Naranja):** Presencia de cuellos de botella moderados; sugiere redistribucion preventiva de actividades.
- **Alerta Critica de Riesgo (Rojo):** Superacion de los umbrales tolerables de contingencias o incidencias severas; recomienda la reasignacion inmediata de recursos o la solicitud formal de extension de plazos.

### 5.2. Automatizacion ETL para la Alianza en Brasil
Modulo transaccional para la transferencia de metricas de ingenieria hacia socios internacionales bajo la norma ISO 8601 UTC:

- **Estandarizacion de Formato:** Generacion de archivos planos estructurados con delimitadores (`|`), encabezados de proyecto, detalle de fases WBS, metricas de errores y contingencias.
- **Modalidad Interactiva (One-Click Export):** Generacion y envio inmediato desde la consola del Lider.
- **Modalidad Desatendida Programada:** Proceso batch ejecutado automaticamente en segundo plano mediante hilos no-bloqueantes (`@Async` y `@Scheduled`).

---

## 6. Guia de Despliegue e Instalacion

### Requisitos Previos del Sistema
- **Java Development Kit (JDK):** Version 17 LTS o superior.
- **Apache Maven:** Version 3.8 o superior.
- **Node.js:** Version 18.0 LTS o superior (requiere gestor de paquetes pnpm instalado globalmente).
- **PostgreSQL:** Version 14 o superior instalado y en ejecucion.

### 6.1. Configuracion de la Base de Datos
Acceda a su motor PostgreSQL y cree la base de datos correspondiente:

```sql
CREATE DATABASE backend_db;
```

Configure las variables de conexion correspondientes en `backend/src/main/resources/application.properties` utilizando las credenciales de su entorno:
- **URL:** `jdbc:postgresql://<HOST_BASE_DATOS>:<PUERTO>/backend_db`
- **Usuario:** `<USUARIO_BASE_DATOS>`
- **Contraseña:** `<CONTRASEÑA_BASE_DATOS>`

### 6.2. Despliegue del Backend (Spring Boot)
Abra una terminal en la raiz del proyecto y ejecute:

```bash
cd backend
mvn clean compile
mvn spring-boot:run
```
El servidor backend iniciara en el puerto configurado: `http://localhost:8080`

### 6.3. Despliegue del Frontend (React + Vite)
En una terminal separada, ejecute:

```bash
cd frontend
pnpm install
pnpm run dev
```
La interfaz web iniciara en: `http://localhost:5173`

---

## 7. Credenciales de Prueba (Entorno de Desarrollo)

Para fines de evaluacion en entornos locales o de desarrollo, los perfiles de prueba se estructuran de la siguiente manera:

| Rol de Usuario | Correo Electronico Corporativo | Estado de Contraseña | Acceso Rapido en Interfaz |
| :--- | :--- | :--- | :--- |
| **Coordinador** | `roberto.coord@ikernell.org` | `<CLAVE_ACCESO_DESARROLLO>` | Boton "Coordinador" en Login |
| **Lider de Proyecto** | `carlos.lider@ikernell.org` | `<CLAVE_ACCESO_DESARROLLO>` | Boton "Líder" en Login |
| **Desarrollador** | `ana.dev@ikernell.org` | `<CLAVE_ACCESO_DESARROLLO>` | Boton "Desarrollador" en Login |

*Nota de Seguridad: En la base de datos, todas las credenciales se almacenan exclusivamente como hashes unidireccionales generados por BCrypt (`<HASH_BCRYPT>`) y las sesiones se validan mediante tokens JWT.*

---

## 8. Estandares de Rendimiento, Resiliencia y Seguridad

- **Optimizacion de Conexiones (HikariCP):** Pool dimensionado con hasta 30 conexiones activas y 10 conexiones en reserva (*idle*) con deteccion de fugas configurada a 20 segundos para pruebas de estres y alta concurrencia.
- **Paginacion Obligatoria:** Endpoints de consulta masiva implementan la interfaz `Pageable` de Spring Data JPA para prevenir fallos por saturacion de memoria (*OutOfMemoryError*).
- **Manejo Resiliente ante Carga:** El interceptor global de excepciones transforma saturaciones de base de datos y desbordamientos de hilos asincronos en codigos HTTP controlados (503 Service Unavailable y 429 Too Many Requests).
- **Politica de Seguridad Documental (RNF-11):** El archivo `.gitignore` previene estrictamente el rastreo y subida involuntaria de documentacion confidencial (`ARCHIVOS SISTEMA/`, archivos ofimaticos y variables `.env`).

---

IKernell Soluciones Software. Documentacion de Arquitectura y Despliegue.
