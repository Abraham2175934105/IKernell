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

### Base de Datos y Seguridad de Datos
- **Motor Relacional:** PostgreSQL 14+ con esquema fuertemente tipado, integridad referencial mediante claves foraneas e indices B-Tree.
- **Proteccion de Credenciales:** Algoritmo unidireccional de derivacion de claves BCrypt con factor de costo 10 (RNF-10).

---

## 2. Arquitectura del Sistema

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
|             Pool de Conexiones HikariCP -> PostgreSQL 15+            |
+-----------------------------------------------------------------------+
```

---

## 3. Funcionalidades por Rol de Usuario

El sistema implementa un esquema estricto de Control de Acceso Basado en Roles (RBAC), dividiendo la experiencia operativa en cuatro niveles:

### 3.1. Interesado / Usuario Publico
- **Portal Corporativo:** Presentacion institucional de IKernell, objetivos estrategicos y lineamientos tecnicos.
- **Catalogo de Servicios:** Descripcion detallada de soluciones de arquitectura, consultoria y desarrollo a medida.
- **Preguntas Frecuentes (FAQs) con Busqueda Predictiva:** Filtrado en tiempo real con normalizacion de caracteres, inmune a mayusculas, minusculas y tildes, con derivacion a contacto si no existen coincidencias.
- **Formulario de Contacto Corporativo:** Envio de consultas directas hacia el equipo de administracion con instrucciones de llenado formales.

### 3.2. Coordinador
- **Gestion Centralizada de Personal:** Registro, edicion y consulta de trabajadores con asignacion de especialidad, profesion y rol.
- **Inhabilitacion Logica:** Suspension de cuentas de acceso sin vulnerar la integridad referencial ni la trazabilidad de proyectos historicos.
- **Listados Masivos Paginados:** Consultas optimizadas de personal con soporte para paginacion en servidor.

### 3.3. Lider de Proyectos
- **Administracion de Proyectos:** Registro de nuevos proyectos, establecimiento de plazos estimados y control de estados.
- **Estructura de Desglose de Trabajo (WBS):** Division modular del proyecto en etapas y fases secuenciales.
- **Asignacion de Personal:** Vinculacion de desarrolladores a la planilla del proyecto y asignacion granular de actividades por etapa.
- **Monitoreo Predictivo:** Acceso al Semáforo Inteligente y ejecucion de la exportacion ETL para aliados internacionales.

### 3.4. Desarrollador
- **Tablero Operativo de Actividades:** Consulta de asignaciones individuales con control de estado (Asignada, En Progreso, Finalizada).
- **Reporte de Errores Tecnicos:** Registro de incidencias tipificadas por etapa con clasificacion por nivel de severidad (Baja, Media, Alta, Critica).
- **Reporte de Interrupciones y Contingencias:** Notificacion de suspensiones operativas indicando duracion en minutos y justificacion tecnica.

---

## 4. Modulos de Innovacion y Valor Agregado

### 4.1. Semaforo Inteligente (Dashboard Predictivo)
Modulo analitico que evalua continuamente la salud operacional de cada proyecto. Mediante un algoritmo deterministicamente calibrado, cruza las horas acumuladas de interrupciones tecnicas con la concentracion de errores criticos y genera un diagnostico categorizado:

- **Riesgo Bajo (Verde):** El proyecto avanza conforme al cronograma establecido.
- **Riesgo Moderado (Naranja):** Presencia de cuellos de botella moderados; sugiere redistribucion preventiva de actividades.
- **Alerta Critica de Riesgo (Rojo):** Superacion de los umbrales tolerables de contingencias o incidencias severas; recomienda la reasignacion inmediata de recursos o la solicitud formal de extension de plazos.

### 4.2. Automatizacion ETL para la Alianza en Brasil
Modulo transaccional para la transferencia de metricas de ingenieria hacia socios internacionales bajo la norma ISO 8601 UTC:

- **Estandarizacion de Formato:** Generacion de archivos planos estructurados con delimitadores (`|`), encabezados de proyecto, detalle de fases WBS, metricas de errores y contingencias.
- **Modalidad Interactiva (One-Click Export):** Generacion y envio inmediato desde la consola del Lider.
- **Modalidad Desatendida Programada:** Proceso batch ejecutado automaticamente en segundo plano mediante hilos no-bloqueantes (`@Async` y `@Scheduled`).

---

## 5. Guia de Despliegue e Instalacion

### Requisitos Previos del Sistema
- **Java Development Kit (JDK):** Version 17 LTS o superior.
- **Apache Maven:** Version 3.8 o superior.
- **Node.js:** Version 18.0 LTS o superior (incluyendo gestor de paquetes `npm`).
- **PostgreSQL:** Version 14 o superior instalado y en ejecucion en el puerto local `5432`.

### 5.1. Configuracion de la Base de Datos
Acceda a su cliente de PostgreSQL y verifique la existencia de la base de datos:

```sql
CREATE DATABASE backend_db;
```

Los parametros de conexion por defecto se encuentran en `backend/src/main/resources/application.properties`:
- **URL:** `jdbc:postgresql://localhost:5432/backend_db`
- **Usuario:** `abrah`
- **Contraseña:** `abrah1234`

### 5.2. Despliegue del Backend (Spring Boot)
Abra una terminal en la raiz del proyecto y ejecute:

```bash
cd backend
mvn clean compile
mvn spring-boot:run
```
El servidor backend estara disponible en: `http://localhost:8080`

### 5.3. Despliegue del Frontend (React + Vite)
En una terminal separada, ejecute:

```bash
cd frontend
npm install
npm run dev
```
La interfaz web se desplegara en: `http://localhost:5173`

---

## 6. Credenciales de Prueba (Entorno de Desarrollo)

Para fines de evaluacion funcional, el sistema dispone de los siguientes usuarios configurados en el repositorio de datos:

| Rol de Usuario | Correo Electronico Corporativo | Contraseña de Acceso | Acceso Rapido en Interfaz |
| :--- | :--- | :--- | :--- |
| **Coordinador** | `roberto.coord@ikernell.org` | `abrah1234` | Boton "Coordinador" en Login |
| **Lider de Proyecto** | `carlos.lider@ikernell.org` | `abrah1234` | Boton "Líder" en Login |
| **Desarrollador** | `ana.dev@ikernell.org` | `abrah1234` | Boton "Desarrollador" en Login |

*Nota: Todas las contraseñas almacenadas se encuentran procesadas mediante hash BCrypt y la sesion se mantiene mediante tokens JWT firmados.*

---

## 7. Estandares de Rendimiento, Resiliencia y Seguridad

- **Optimizacion de Conexiones (HikariCP):** Pool dimensionado con hasta 30 conexiones activas y 10 conexiones en reserva (*idle*) con deteccion de fugas configurada a 20 segundos para pruebas de estres y alta concurrencia.
- **Paginacion Obligatoria:** Endpoints de consulta masiva implementan la interfaz `Pageable` de Spring Data JPA para prevenir fallos por saturacion de memoria (*OutOfMemoryError*).
- **Manejo Resiliente ante Carga:** El interceptor global de excepciones transforma saturaciones de base de datos y desbordamientos de hilos asincronos en codigos HTTP controlados (503 Service Unavailable y 429 Too Many Requests).
- **Politica de Seguridad Documental (RNF-11):** El archivo `.gitignore` previene estrictamente el rastreo y subida involuntaria de documentacion confidencial (`ARCHIVOS SISTEMA/`, archivos ofimaticos y variables `.env`).

---

IKernell Soluciones Software. Documentacion de Arquitectura y Despliegue.
