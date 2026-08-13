# IKernell - Plataforma de Gestión y Control de Proyectos de Software

**IKernell** es una solución tecnológica empresarial concebida para la administración integral, el seguimiento operacional y el control predictivo de proyectos de desarrollo de software. El sistema integra el desglose estructurado del trabajo (WBS), la asignación granular de actividades por etapas, la clasificación de errores e interrupciones en tiempo real, un motor predictivo de evaluación de riesgos, biblioteca digital centralizada y la exportación automatizada de métricas estandarizadas para aliados internacionales.

---

## 1. Stack Tecnológico

El ecosistema de IKernell está construido bajo estándares modernos de la industria, garantizando modularidad, mantenibilidad y alto rendimiento:

### Backend
* **Lenguaje:** Java 17 LTS.
* **Framework Principal:** Spring Boot 3.4.2.
* **Seguridad y Control de Acceso:** Spring Security 6 con autenticación sin estado (*stateless*) mediante tokens JWT (JSON Web Tokens) firmados con algoritmo HMAC-SHA256.
* **Persistencia de Datos:** Spring Data JPA sobre Hibernate ORM 6.6.
* **Pool de Conexiones:** HikariCP optimizado para alta concurrencia con dimensionamiento dinámico y control de fugas de conexión.
* **Procesamiento Asíncrono y Tareas Programadas:** Spring Task Execution (`@Async` y `@Scheduled`) con pool dedicado `etlTaskExecutor`.
* **Manejo Global de Excepciones:** `@RestControllerAdvice` centralizado para la emisión de respuestas semánticas estructuradas (`ApiErrorResponse`).

### Frontend
* **Librería Principal:** React 18.3.
* **Herramienta de Construcción:** Vite 5.4.
* **Gestor de Paquetes Estricto:** `pnpm`.
* **Motor de Estilos:** Tailwind CSS y Vanilla CSS con sistema de variables personalizadas (paleta monocromática de alto contraste en escala de grises y blanco puro con acentos en azul corporativo).
* **Sistema de Temas:** `ThemeContext` dinámico con persistencia local en cliente (Modo Claro / Modo Oscuro).
* **Motor de Animaciones:** Framer Motion (revelado progresivo por scroll bidireccional, transiciones suaves y microinteracciones de interfaz).
* **Visualización de Datos:** Recharts para la representación analítica de incidentes y niveles de severidad.
* **Iconografía:** Lucide React.
* **Procesamiento de Documentos:** `react-markdown`, `remark-gfm` y motor de generación client-side `jsPDF`.
* **Optimización de Carga:** División de código (*Code Splitting*) basada en rutas mediante `React.lazy()` y `Suspense`.

### Base de Datos y Ciberseguridad
* **Motor Relacional:** PostgreSQL 14+ con esquema fuertemente tipado, integridad referencial mediante claves foráneas e índices B-Tree.
* **Búsqueda Semántica y Difusa:** Extensión `pg_trgm` con índices **GIN** para coincidencias difusas por trigramas en respuestas menores a 50 ms.
* **Protección de Credenciales:** Algoritmo unidireccional de derivación de claves BCrypt con factor de costo 10 (RNF-10).
* **Política de Enmascaramiento de Datos (Data Masking):** Todos los identificadores sensibles, claves de acceso y certificados se administran mediante variables de entorno y marcadores de posición protegidos.

---

## 2. Estructura y Gestión del Repositorio

### Clonación del Repositorio
Para obtener una copia local del código fuente, ejecute:

```bash
git clone https://github.com/Abraham2175934105/IKernell.git
cd IKernell
```

### Estructura Base de Directorios

```text
IKernell/
├── backend/                  # Proyecto API RESTful en Spring Boot (Java 17)
│   ├── src/main/java/        # Controladores, Servicios, Modelos JPA, Seguridad y Repositorios
│   ├── src/main/resources/   # Archivos de configuración (application.properties)
│   └── pom.xml               # Dependencias del proyecto Maven
├── frontend/                 # Aplicación SPA en React 18 + Vite
│   ├── src/components/       # Componentes modulares (UI, Dashboard, Public, Auth, Biblioteca)
│   ├── src/pages/            # Vistas enrutadas por rol (Coordinador, Líder, Dev, Public)
│   ├── src/context/          # Proveedores de estado global (AuthContext, ThemeContext)
│   ├── src/services/         # Clientes de comunicación HTTP con la API REST
│   ├── package.json          # Dependencias y scripts de ejecución Node.js
│   └── pnpm-lock.yaml        # Archivo estricto de bloqueo de versiones (Lockfile)
├── .gitignore                # Política de exclusión estricta de documentos y secretos
└── README.md                 # Documentación técnica de arquitectura y despliegue
```

---

## 3. Arquitectura del Sistema

La solución adopta un modelo Cliente-Servidor desacoplado en capas (*N-Tier Architecture*) comunicado exclusivamente mediante una API RESTful sobre protocolo HTTP/HTTPS:

```text
+-----------------------------------------------------------------------+
|                    CAPA DE PRESENTACIÓN (FRONTEND)                    |
|          React 18 SPA + Tailwind CSS + Framer Motion + Vite          |
+-----------------------------------------------------------------------+
                                  |
                                  | Peticiones HTTP / JSON (Tokens JWT)
                                  v
+-----------------------------------------------------------------------+
|                     CAPA DE SERVICIOS (BACKEND)                       |
|  Spring Boot REST Controllers -> Services (Lógica de Negocio)         |
|  Spring Security (Filtros JWT + RBAC) -> Manejador Global Errores     |
|  Procesos Asíncronos (@Async) & Tareas Programadas (@Scheduled)       |
+-----------------------------------------------------------------------+
                                  |
                                  | Mapeo Objeto-Relacional (JPA / Hibernate)
                                  v
+-----------------------------------------------------------------------+
|                     CAPA DE DATOS (PERSISTENCIA)                      |
|             Pool de Conexiones HikariCP -> PostgreSQL 14+            |
|             Índices GIN & Módulo pg_trgm (Búsqueda Difusa)            |
+-----------------------------------------------------------------------+
```

---

## 4. Funcionalidades por Rol de Usuario

El sistema implementa un esquema estricto de Control de Acceso Basado en Roles (RBAC):

### 4.1. Interesado / Usuario Público

* **Portal Corporativo:** Presentación institucional de IKernell, objetivos estratégicos y lineamientos técnicos.
* **Catálogo de Servicios:** Descripción detallada de soluciones de arquitectura, consultoría y desarrollo a medida.
* **Preguntas Frecuentes (FAQs) con Búsqueda Predictiva:** Filtrado en tiempo real con normalización de caracteres.
* **Formulario de Contacto Corporativo:** Envío de consultas directas hacia el equipo de administración.

### 4.2. Coordinador

* **Gestión Centralizada de Personal:** Registro, edición y consulta de trabajadores con asignación de especialidad, profesión y rol.
* **Inhabilitación Lógica:** Suspensión de cuentas de acceso (*soft-delete*) sin vulnerar la integridad referencial.
* **Listados Masivos Paginados:** Consultas optimizadas con soporte para paginación en servidor.

### 4.3. Líder de Proyectos

* **Administración de Proyectos:** Registro de nuevos proyectos, plazos estimados y control de estados.
* **Estructura de Desglose de Trabajo (WBS):** División modular del proyecto en etapas y fases secuenciales.
* **Asignación de Personal:** Vinculación de desarrolladores y asignación granular de actividades por etapa.
* **Monitoreo Predictivo:** Acceso al Semáforo Inteligente y ejecución de la exportación ETL para aliados internacionales.

### 4.4. Desarrollador

* **Tablero Operativo de Actividades:** Consulta y actualización de estado de actividades individuales.
* **Reporte de Errores Técnicos:** Registro de incidencias por etapa con clasificación por nivel de severidad.
* **Reporte de Interrupciones:** Notificación de tiempos muertos con justificación técnica.
* **Centro de Gestión del Conocimiento:** Búsqueda e inyección rápida de fragmentos de código (*Snippets*).

---

## 5. Módulos de Innovación y Valor Agregado

### 5.1. Semáforo Inteligente (Dashboard Predictivo)

Módulo analítico que evalúa continuamente la salud operacional cruzando horas acumuladas de interrupciones con errores críticos:

* **Riesgo Bajo (Verde):** El proyecto avanza conforme al cronograma.
* **Riesgo Moderado (Naranja):** Cuellos de botella moderados; sugiere redistribución preventiva.
* **Alerta Crítica de Riesgo (Rojo):** Superación de umbrales tolerables; requiere reasignación inmediata o extensión de plazos.

### 5.2. Automatización ETL para la Alianza en Brasil

Módulo transaccional para la transferencia de métricas bajo la norma ISO 8601 UTC en archivos planos delimitados por pipe (`|`). Soporta ejecución **One-Click** interactiva y ejecución **batch desatendida** programada (`@Scheduled`).

### 5.3. Gestión del Conocimiento: Biblioteca Digital & Motor `Snippet.inject`

Centralización de la documentación arquitectónica e investigación técnica:

* **Visor Dual Interactive:** Modo Hoja A4 institucional y Modo Terminal de código fuente con renderizado dinámico (`react-markdown` y `Tailwind Typography`).
* **Motor `Snippet.inject`:** Búsqueda difusa de fragmentos de código y soluciones homologadas mediante algoritmos de trigramas (`pg_trgm` e índices GIN en PostgreSQL) con tiempos de respuesta inferiores a **50 ms** (con control *Debounce* de 200ms en React).
* **Exportación Client-Side:** Generación inmediata de reportes PDF maquetados utilizando `jsPDF`.

---

## 6. Guía de Despliegue e Instalación

### Requisitos Previos del Sistema

* **Java Development Kit (JDK):** Versión 17 LTS o superior.
* **Apache Maven:** Versión 3.8 o superior.
* **Node.js:** Versión 18.0 LTS o superior (requiere gestor de paquetes **`pnpm`** instalado globalmente).
* **PostgreSQL:** Versión 14 o superior con extensión `pg_trgm` activada.

### 6.1. Configuración de la Base de Datos

Cree la base de datos e instale la extensión de búsqueda difusa:

```sql
CREATE DATABASE backend_db;
\c backend_db;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

Configure las variables en `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://<HOST>:<PUERTO>/backend_db
spring.datasource.username=<USUARIO>
spring.datasource.password=<CONTRASEÑA>
```

### 6.2. Despliegue del Backend (Spring Boot)

```bash
cd backend
mvn clean compile
mvn spring-boot:run
```

*Servidor API:* `http://localhost:8080`

### 6.3. Despliegue del Frontend (React + Vite + pnpm)

```bash
cd frontend
pnpm install
pnpm run dev
```

*Interfaz Web:* `http://localhost:5173`

---

## 7. Credenciales de Prueba (Entorno de Desarrollo)

| Rol de Usuario | Correo Electrónico Corporativo | Estado de Contraseña | Acceso Rápido en Interfaz |
| --- | --- | --- | --- |
| **Coordinador** | `roberto.coord@ikernell.org` | `<CLAVE_ACCESO_DESARROLLO>` | Botón "Coordinador" en Login |
| **Líder de Proyecto** | `carlos.lider@ikernell.org` | `<CLAVE_ACCESO_DESARROLLO>` | Botón "Líder" en Login |
| **Desarrollador** | `ana.dev@ikernell.org` | `<CLAVE_ACCESO_DESARROLLO>` | Botón "Desarrollador" en Login |

*Nota de Seguridad: Las credenciales en base de datos están encriptadas mediante BCrypt y autenticadas con JWT.*

---

## 8. Estándares de Rendimiento, Resiliencia y Seguridad

* **Optimización de Conexiones (HikariCP):** Pool dimensionado para alta concurrencia con detección de fugas en 20 segundos.
* **Paginación Obligatoria:** Endpoints con `Pageable` para mitigar errores de memoria.
* **Resiliencia HTTP:** Interceptor global `@RestControllerAdvice` que emite estados `503` y `429` ante contingencias.
* **Política de Seguridad Documental (RNF-11):** Configuración estricta en `.gitignore` para ignorar carpetas confidenciales (`/Documents/`, `.env`, carpetas de compilación).

---

## 9. Últimas Innovaciones UI/UX

### 9.1. Refactorización Global de Temas & Contraste Dinámico

* **Arquitectura de Color Dual:** Tokens dinámicos de Tailwind CSS (`text-zinc-900 dark:text-zinc-100`, `bg-white dark:bg-zinc-900`).
* **Identidad Visual Corporativa:** Acento Azul Corporativo (`blue-600` / `blue-500`) en elementos interactivos clave.
* **Simetría y Maquetación:** Grilla responsiva unificada `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`.

### 9.2. Motor de Transición Planetaria Día/Noche (*Earth Switch*)

* **Zero Layout Shift:** Activo satelital de alta resolución único en `Hero.jsx`.
* **Inyección de Luz CSS:** Mezcla de capas dinámicas mediante `mix-blend-color-dodge` (`bg-sky-400/65`).
* **Transición Cinematográfica:** Opacidad fluida de 700ms sin impacto en el rendimiento de red.

---

*IKernell Soluciones Software • Documentación de Arquitectura y Despliegue.*
