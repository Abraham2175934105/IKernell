# IKernell - Plataforma Empresarial de Gestion y Control Predictivo de Software

IKernell es una plataforma integral de ingenieria y gestion de proyectos de software desarrollada bajo estandares internacionales de calidad ISO/IEC 25010 y modelos de madurez de procesos CMMI Nivel 2 y 3. La solucion implementa una arquitectura desacoplada por capas (Single Page Application en React 18 y API RESTful en Java 17 con Spring Boot 3.4) respaldada por una base de datos relacional PostgreSQL 14+.

El sistema optimiza la gobernanza operativa a traves de la Estructura de Desglose de Trabajo (WBS), control de capacidad horaria semanal (limite de 48 horas), monitoreo predictivo de riesgos mediante un semaforo tricolor, evaluacion de desgaste cognitivo en series temporales de 21 dias, trazabilidad inmutable de incidentes tecnicos y un pipeline de interoperabilidad internacional con certificacion criptografica SHA-256 para la alianza con Brasil.

---

## 1. Arquitectura del Sistema y Stack Tecnologico

La plataforma esta estructurada bajo un modelo de N-Capas con desacoplamiento total entre el cliente web y el servidor de servicios empresariales.

### Capa de Presentacion (Frontend)
* Entorno de ejecucion: Node.js 18+ con gestor de paquetes pnpm.
* Libreria principal: React 18.3.
* Herramienta de construccion: Vite 5.4.
* Estilos y maquetacion: Tailwind CSS con sistema de variables CSS y soporte nativo de Modo Claro y Modo Oscuro (WCAG AA 4.5:1).
* Iconografia: Lucide React (iconos vectoriales limpios sin caracteres especiales).
* Graficos y telemetria: Recharts para distribucion de esfuerzo, fallas y tendencias de riesgo.
* Gestion de estado: Context API (AuthContext para sesiones JWT y ThemeContext para conmutacion de interfaz).

### Capa de Negocio y Servicios (Backend)
* Entorno de ejecucion: Java 17 LTS.
* Framework base: Spring Boot 3.4.2.
* Seguridad y autorizacion: Spring Security 6 con tokens criptograficos JWT (HMAC-SHA256) sin estado (Stateless Session).
* Acceso a datos: Spring Data JPA sobre Hibernate ORM 6.6 con consultas optimizadas anti N+1 (JOIN FETCH) y soporte de borrado logico (Soft-Delete).
* Manejo de conexiones: HikariCP optimizado para alta concurrencia (40 conexiones maximas, deteccion de fugas en 15s).
* Validacion y excepciones: Manejador centralizado (@RestControllerAdvice) con respuestas semanticas uniformes en formato JSON.

### Capa de Persistencia (Base de Datos)
* Motor de base de datos: PostgreSQL 14+.
* Extensiones activas: pg_trgm (busqueda difusa y coincidencia por trigramas) y uuid-ossp.
* Optimizacion: Indices B-Tree en claves foraneas e indices GIN en campos de texto descriptivo.
* Vistas de telemetria: Calculo de semaforo de riesgo, control de 48 horas semanales y exportacion estandarizada ISO 8601 UTC-3.

---

## 2. Modulos Funcionales de la Plataforma

1. Portal Publico e Interesados: Presentacion institucional, catalogo interactivo de servicios, politicas de calidad CMMI, galeria de noticias con visor de lectura, centro de preguntas frecuentes con buscador reactivo y formulario de contacto.
2. Autenticacion y Seguridad: Inicio de sesion protegido, emision de pases digitales JWT (24h de validez), renovacion obligatoria de contraseñas temporales en primer login, control de acceso basado en roles (RBAC) y cierre de sesion con purga de memoria.
3. Perfil de Usuario: Ficha laboral protegida, actualizacion de contacto y cambio voluntario de credenciales con medidor de fortaleza.
4. Administracion de Personal (Coordinador): Registro de colaboradores con claves temporales, matriz paginada en bloques de 8 registros, inhabilitacion y reactivacion sin perdida de historial (Soft-Delete) y bandeja comercial.
5. Gestion de Proyectos WBS: Creacion, presupuestacion, asignacion de lider tecnico, estructuracion jerarquica de fases y monitoreo de cronogramas.
6. Control de Actividades WBS: Asignacion de tareas, justificacion obligatoria en reasignaciones, tablero operativo del desarrollador, transicion de estados con marcas de tiempo automaticas y calculo de holguras horarias.
7. Gestion de Incidentes y Calidad: Registro de fallos vinculados a la WBS, clasificacion de severidad, horas de interrupcion, diagnostico de causa raiz, solucion documentada y calculo de metricas MTTR.
8. Motor Analitico y Semaforo: Evaluacion de riesgo operacional en ventanas de 21 dias (Verde, Amarillo, Rojo), predictor de fatiga laboral (burnout) y sugerencias prescriptivas de mitigacion.
9. Integracion ETL para Brasil: Normalizacion UTF-8, estandarizacion horaria a Brasilia (UTC-3), formato universal ISO 8601 y sellado digital criptografico SHA-256.
10. Herramientas Colaborativas: Chat corporativo por salas de proyecto, biblioteca digital de manuales tecnicos y programa de induccion interactiva con medalla de aprobacion.

---

## 3. Estructura del Repositorio

```text
IKernell-main/
├── README.md                           # Documentacion principal del proyecto
├── schema_completo_backup_2026.sql     # Script DDL + DML completo de PostgreSQL
├── frontend/                           # Aplicacion cliente SPA (React + Vite + pnpm)
│   ├── README.md                       # Documentacion tecnica del Frontend
│   ├── package.json                    # Dependencias y scripts de Node.js
│   ├── pnpm-lock.yaml                  # Archivo de bloqueo estricto de pnpm
│   ├── vite.config.js                  # Configuracion del empaquetador Vite
│   ├── tailwind.config.js              # Configuracion del sistema de estilos
│   └── src/                            # Codigo fuente de la interfaz
└── backend/                            # Servidor de servicios API REST (Spring Boot)
    ├── README.md                       # Documentacion tecnica del Backend
    ├── pom.xml                         # Configuracion de dependencias Maven
    ├── build.gradle                    # Configuracion de construccion Gradle
    └── src/                            # Codigo fuente Java y recursos
```

---

## 4. Requisitos Previos de Instalacion

* Node.js: Version 18.0.0 o superior (LTS recomendado).
* pnpm: Version 8.0.0 o superior (instalable globalmente via `npm install -g pnpm`).
* Java Development Kit (JDK): Version 17 LTS (OpenJDK o Eclipse Temurin).
* PostgreSQL: Version 14 o superior.
* Git: Version 2.30 o superior.

---

## 5. Guia de Despliegue y Puesta en Marcha

### Paso 1: Clonar el Repositorio
```bash
git clone https://github.com/usuario/IKernell.git
cd IKernell-main
```

### Paso 2: Configuracion de la Base de Datos PostgreSQL
1. Crear la base de datos en PostgreSQL:
```sql
CREATE DATABASE ikernell_db WITH ENCODING = 'UTF8';
```

2. Ejecutar el script consolidado de estructura y datos iniciales:
```bash
psql -U postgres -d ikernell_db -f schema_completo_backup_2026.sql
```

### Paso 3: Inicializacion del Backend (Java Spring Boot)
1. Navegar al directorio de backend:
```bash
cd backend
```

2. Configurar las credenciales de base de datos en `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/ikernell_db
spring.datasource.username=postgres
spring.datasource.password=tu_password
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
jwt.secret=ClaveSecretaEmpresarialSuperSeguraParaFirmaDigitalHmacSha256_2026
```

3. Compilar y ejecutar el servidor:
```bash
# Con Gradle:
./gradlew bootRun

# O con Maven:
./mvnw spring-boot:run
```
El servidor backend quedara disponible en: `http://localhost:8080`

### Paso 4: Inicializacion del Frontend (React + Vite con pnpm)
1. Abrir una nueva terminal y navegar al directorio del frontend:
```bash
cd frontend
```

2. Instalar dependencias utilizando estrictamente pnpm:
```bash
pnpm install
```

3. Iniciar el servidor de desarrollo:
```bash
pnpm dev
```
La aplicacion cliente quedara disponible en: `http://localhost:5173`

---

## 6. Credenciales Oficiales de Prueba (Seeding Inicial)

Todos los usuarios cuentan con la clave provisional estandar: `Admin123!` o `Dev123!`.

| Identificacion | Nombre Completo | Correo Institucional | Rol Oficial | Estado |
| :--- | :--- | :--- | :--- | :--- |
| 101010101 | Abrahan Boada Suarez | coordinador@ikernell.com | COORDINADOR | Habilitado |
| 102020202 | Carlos Mendoza Pardo | lider1@ikernell.com | LIDER | Habilitado |
| 103030303 | Diana Restrepo Gomez | lider2@ikernell.com | LIDER | Habilitado |
| 104040404 | Andres Felipe Castro | dev1@ikernell.com | DESARROLLADOR | Habilitado |
| 105050505 | Valentina Lopez Rivera | dev2@ikernell.com | DESARROLLADOR | Habilitado |
| 106060606 | Julian Martinez Silva | dev3@ikernell.com | DESARROLLADOR | Habilitado |
| 107070707 | Mariana Duarte Orozco | dev4@ikernell.com | DESARROLLADOR | Habilitado |
| 108080808 | Esteban Rios Salazar | dev5@ikernell.com | DESARROLLADOR | 1er Login Pendiente |

---

## 7. Estandares de Calidad y Cumplimiento Normativo

* ISO/IEC 25010: Cumplimiento de las 8 caracteristicas de calidad de producto de software (adecuacion funcional, eficiencia de desempeno, compatibilidad, usabilidad, fiabilidad, seguridad, mantenibilidad y portabilidad).
* CMMI Nivel 2 y 3: Implementacion de areas de proceso clave (PP, PMC, PPQA, REQM, RSKM, CM).
* Criptografia y Seguridad: Algoritmos de cifrado unidireccional con sal aleatoria de 12 iteraciones para contraseñas, tokens JWT stateless de 24h y sello de integridad SHA-256 para transferencias internacionales.
* Accesibilidad: Cumplimiento de ratios de contraste tipografico 4.5:1 bajo pautas WCAG.
