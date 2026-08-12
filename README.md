# 🏢 IKernell — Plataforma Integral de Soluciones de Software

![IKernell Banner](https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=80)

Bienvenido al repositorio oficial de **IKernell Soluciones Software**. Esta plataforma empresarial de alto rendimiento ha sido diseñada y desarrollada siguiendo rigurosos estándares de arquitectura de software desacoplada, seguridad perimetral sin estado (*stateless*), diseño corporativo minimalista responsivo y algoritmos avanzados de predicción de riesgos y automatización de datos.

---

## 🚀 Arquitectura y Tecnologías

El sistema implementa una arquitectura desacoplada en capas (N-Tier) compuesta por:

### ⚙️ Backend (API RESTful Transaccional)
- **Lenguaje:** Java 17 LTS
- **Framework:** Spring Boot 3.4.2
- **Seguridad:** Spring Security 6 + JWT (*JSON Web Tokens* firmados con HMAC-SHA256)
- **Persistencia:** Spring Data JPA + Hibernate ORM 6.6
- **Base de Datos:** PostgreSQL 15+ (con soporte para transacciones ACID, índices B-Tree y restricciones relacionales ON DELETE CASCADE)
- **Pool de Conexiones:** HikariCP calibrado para alta concurrencia (*Stress Testing*) con 30 conexiones activas y 10 conexiones *idle*.
- **Procesamiento Asíncrono:** Spring Task Execution (`@Async` y `@Scheduled`) con pool dedicado `etlTaskExecutor` para procesos batch pesados.
- **Manejo Centralizado de Excepciones:** `@RestControllerAdvice` con respuestas JSON estructuradas semánticamente (`ApiErrorResponse`).

### 🎨 Frontend (Single Page Application - SPA)
- **Librería Core:** React 18.3
- **Herramienta de Construcción:** Vite 5.4
- **Estilos & Diseño:** Tailwind CSS + Vanilla CSS con paleta estricta monocromática de alto contraste (Gris Zinc y Blanco Puro).
- **Sistema de Temas:** `ThemeContext` dinámico con persistencia en `localStorage` (Modo Claro / Modo Oscuro).
- **Animaciones:** Framer Motion (Scroll Reveals bidireccionales, transiciones de acordeón y animaciones fluidas de 0.3s a 0.5s).
- **Visualización de Datos:** Recharts (Gráficos circulares de severidad de incidencias).
- **Iconografía:** Lucide React.
- **Rendimiento:** *Code Splitting* por rutas con `React.lazy()` y `Suspense`, produciendo 20 submódulos independientes (*chunks*).
- **Optimización de Renderizado:** `React.memo`, `useMemo` y `useCallback` en componentes computacionalmente intensivos.

---

## 📋 Módulos y Funcionalidades del Sistema

### 1. Módulo Público Institucional (RF-01 a RF-06)
- **Hero Section:** Propuesta de valor corporativa con llamadas a la acción (*CTAs*) y métricas de impacto.
- **Catálogo de Servicios:** Tarjetas interactivas que detallan el stack empresarial, consultoría y arquitectura.
- **Estrategia & Alianza Brasil:** Información sobre la alianza internacional de desarrollo con Brasil y transferencia de métricas.
- **Búsqueda Predictiva en FAQs:** Filtrado en tiempo real insensible a mayúsculas, minúsculas y tildes, con estado elegante de contacto si no hay coincidencias.
- **Formulario de Contacto:** Formulario con validación y *placeholders* formales e instructivos directos a la administración.
- **Noticias & Casos de Éxito:** Novedades sobre innovación tecnológica y desarrollo continuo.

### 2. Autenticación y Control de Acceso Basado en Roles (RBAC - RF-07, RNF-08 a RNF-10)
- Autenticación segura mediante correo corporativo y contraseña protegida con hash unidireccional BCrypt.
- Emisión de tokens JWT con claims de rol para autorización estricta en endpoints y rutas de React (`ProtectedRoute`).
- **Roles Soportados:**
  - `COORDINADOR`: Gestión global de talento humano y supervisión de proyectos.
  - `LIDER`: Creación de proyectos, gestión de etapas WBS, asignación de desarrolladores y monitoreo predictivo.
  - `DESARROLLADOR`: Visualización de tablero de tareas, reporte de errores y registro de interrupciones operativas.

### 3. Módulo Coordinador (RF-08 a RF-13)
- Registro y alta de trabajadores con validación de especialidad y credenciales cifradas.
- Inhabilitación lógica de usuarios para restringir el acceso sin destruir la trazabilidad histórica de actividades.
- Consultas paginadas de personal para soportar miles de registros sin saturación de memoria.

### 4. Módulo Líder de Proyecto (RF-14 a RF-18)
- Creación y actualización de proyectos corporativos (fechas estimadas, descripción y estado).
- Desglose Estructural del Trabajo (**WBS**) mediante etapas y fases de desarrollo.
- Asignación de desarrolladores a la planilla del proyecto y asignación de actividades granulares por etapa.
- Inhabilitación lógica de proyectos finalizados o suspendidos.

### 5. Módulo Desarrollador (RF-19 a RF-24)
- Tablero interactivo de actividades operativas asignadas con selector de estado.
- Formulario de reporte de errores tipificados con clasificación por grado de severidad (Baja, Media, Alta, Crítica).
- Registro de contingencias e interrupciones operativas registrando duración en minutos y justificación técnica.

### 6. Innovación 1: Semáforo Predictivo Inteligente (RF-25 a RF-27)
- Algoritmo en tiempo real que analiza la acumulación de horas perdidas por contingencias y la criticidad de errores concurrentes.
- **Niveles de Riesgo Calculados:**
  - 🟢 **Verde (Riesgo Bajo):** Proyecto estable, avance conforme al cronograma.
  - 🟡 **Naranja (Riesgo Moderado):** Cuellos de botella incipientes; sugiere balance preventivo de cargas.
  - 🔴 **Rojo (Alerta Crítica):** Superación de umbrales tolerables; genera recomendación automática de reasignación de personal o solicitud de extensión de plazos.

### 7. Innovación 2: Automatización ETL Alianza Brasil (RF-28 a RF-30)
- Generación de reportes de métricas en formato plano estandarizado con delimitador `|` y estampas de tiempo en formato internacional **ISO 8601 UTC**.
- Modalidad interactiva (*One-Click Export*) desde el panel del Líder.
- Modalidad desatendida programada semanalmente mediante `@Scheduled` y `@Async`.
- Simulación de transferencia segura por canales cifrados (SFTP y correo corporativo).

---

## 🔑 Credenciales de Prueba Corporativas

El sistema cuenta con usuarios pre-configurados en la base de datos para pruebas inmediatas:

| Rol | Correo Corporativo | Contraseña | Acceso Directo |
| :--- | :--- | :--- | :--- |
| **Coordinador** | `roberto.coord@ikernell.org` | `abrah1234` | Botón "Coordinador" en Login |
| **Líder** | `carlos.lider@ikernell.org` | `abrah1234` | Botón "Líder" en Login |
| **Desarrollador** | `ana.dev@ikernell.org` | `abrah1234` | Botón "Desarrollador" en Login |

---

## 📦 Instrucciones de Ejecución Local

### Prerrequisitos
- **Java Development Kit (JDK):** Versión 17 o superior
- **Apache Maven:** 3.8+
- **Node.js:** 18.0+ y npm 9+
- **PostgreSQL:** 14+ activo en el puerto `5432` con una base de datos creada llamada `backend_db`

### 1. Iniciar el Backend (Spring Boot)
```bash
cd backend
mvn clean compile
mvn spring-boot:run
```
El servidor backend iniciará en: `http://localhost:8080`

### 2. Iniciar el Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
La aplicación web estará disponible en: `http://localhost:5173`

### 3. Compilación de Producción del Frontend
```bash
cd frontend
npm run build
```

---

## 🔒 Políticas de Seguridad y Privacidad (RNF-11)
El archivo `.gitignore` se encuentra estrictamente configurado para prevenir la fuga o subida involuntaria de documentación confidencial (`ARCHIVOS SISTEMA/`, archivos Word `.docx`, hojas de cálculo `.xlsx`, documentos PDF `.pdf` y credenciales `.env`), garantizando el cumplimiento de las normativas de confidencialidad institucional de **IKernell**.

---

© 2026 IKernell Soluciones Software. Todos los derechos reservados.
