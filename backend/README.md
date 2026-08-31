# IKernell Backend - Servidor de Servicios y API RESTful

Modulo de logica de negocio, persistencia transaccional y seguridad perimetral de la plataforma IKernell Soluciones Software. Construido en Java 17 LTS con el framework Spring Boot 3.4.2, aplicando principios de arquitectura limpia de N-Capas, seguridad sin estado mediante JSON Web Tokens (JWT) y persistencia relacional con PostgreSQL 14+.

---

## 1. Stack Tecnologico y Componentes del Servidor

* Lenguaje de Programacion: Java 17 LTS (OpenJDK / Eclipse Temurin).
* Framework Principal: Spring Boot 3.4.2.
* Herramientas de Construccion Soportadas: Gradle (Wrapper 8.x) y Apache Maven (pom.xml).
* Modulo de Seguridad: Spring Security 6 con filtros perimetrales JwtAuthenticationFilter.
* Autenticacion Criptografica: Tokens JWT (JJWT 0.12.6) firmados mediante algoritmo HMAC-SHA256 con expiracion configurable (24 horas por defecto) y servicio de invalidacion TokenBlacklistService.
* Encriptacion de Contraseñas: Algoritmo BCrypt con factor de sal aleatoria de 12 iteraciones.
* Capa de Persistencia: Spring Data JPA sobre Hibernate ORM 6.6 con ejecucion por lotes (Batch size: 50, order_inserts, order_updates) y deshabilitacion de Open-Session-In-View para evitar fugas de memoria.
* Administrador de Conexiones: HikariCP dimensionado para alta concurrencia (30 conexiones maximas, 10 inactivas minimas y detector de fugas en 15s).
* Tareas Asincronas y Concurrencia: Spring Task Execution (@Async) con pool dedicado de hasta 50 hilos para calculos analiticos de series temporales y pipeline ETL.
* Documentacion de API: OpenAPI 3.0 / Swagger UI para especificacion interactiva de endpoints.
* Servicio de Correo: Spring Mail para envio de notificaciones y rescate de contraseñas.

---

## 2. Estructura del Proyecto Backend

```text
backend/
├── build.gradle                # Configuracion de dependencias y plugins Gradle
├── pom.xml                     # Configuracion de dependencias Maven
├── gradlew / gradlew.bat       # Wrappers de Gradle para Linux y Windows
└── src/
    └── main/
        ├── java/com/ikernell/
        │   ├── IKernellApplication.java         # Clase principal de arranque Spring Boot
        │   ├── config/                          # Configuraciones de CORS, Async y OpenAPI
        │   ├── controller/                      # Controladores REST que exponen endpoints
        │   │   ├── AuthController.java          # Inicio de sesion, primer login y renovacion
        │   │   ├── CoordinadorController.java   # Gestion de personal, proyectos y solicitudes
        │   │   ├── LiderController.java         # Estructura WBS, cronogramas y semaforo
        │   │   ├── DesarrolladorController.java # Tablero Kanban, horas reales y errores
        │   │   ├── AnaliticaCapacidadController.java # Telemetria de riesgo y burnout
        │   │   ├── ChatController.java          # Mensajeria por salas y canal general
        │   │   ├── BibliotecaController.java    # Gestor documental y manuales tecnicos
        │   │   ├── MicroSnippetController.java  # Inyeccion de codigo con busqueda difusa
        │   │   └── PasswordResetController.java # Restablecimiento administrativo de claves
        │   ├── service/                         # Servicios con logica transaccional de negocio
        │   │   ├── CoordinadorService.java      # Alta de personal, proyectos y Soft-Delete
        │   │   ├── LiderService.java            # Desglose WBS y control de 48 horas
        │   │   ├── DesarrolladorService.java    # Registro de avance y holguras horarias
        │   │   ├── AnaliticaCapacidadService.java # Series temporales de 21 dias e indices
        │   │   ├── EtlAutomationService.java    # Pipeline internacional Brasil y SHA-256
        │   │   ├── ChatService.java             # Persistencia de mensajeria interna
        │   │   ├── BibliotecaService.java       # Gestion del conocimiento institucional
        │   │   ├── MicroSnippetService.java     # Busqueda difusa de snippets tecnicos
        │   │   └── EmailService.java            # Envio de correos corporativos
        │   ├── repository/                      # Repositorios JPA con consultas optimizadas
        │   ├── model/                           # Entidades de dominio mapeadas a PostgreSQL
        │   ├── dto/                             # Objetos de transferencia de datos (DTOs)
        │   ├── exception/                       # Manejador global de excepciones (@RestControllerAdvice)
        │   └── security/                        # Filtros JWT, UserDetailsService y SecurityConfig
        └── resources/
            └── application.properties           # Configuracion de propiedades del servidor
```

---

## 3. Requisitos Previos

* Java Development Kit (JDK): Version 17 LTS instalada (OpenJDK o Eclipse Temurin).
* PostgreSQL: Version 14 o superior en ejecucion.
* Base de datos configurada e inicializada mediante `schema_completo_backup_2026.sql`.

---

## 4. Configuracion de Propiedades (`application.properties`)

Las variables de configuracion pueden definirse directamente en `src/main/resources/application.properties` o suministrarse mediante variables de entorno del sistema operativo:

```properties
# Base de Datos PostgreSQL
spring.datasource.url=jdbc:postgresql://localhost:5432/ikernell_db
spring.datasource.username=postgres
spring.datasource.password=tu_password_postgres

# Hibernate y JPA
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.open-in-view=false

# Clave Secreta para Firma Criptografica de Tokens JWT (Minimo 384 bits)
jwt.secret=IkernellSuperSecretKeyForJWTAuthTokenGeneration2026SecureKeyWithAtLeast384BitsLong!
jwt.expiration=86400000

# Puerto del Servidor
server.port=8080
```

---

## 5. Compilacion y Ejecucion del Servidor

Dentro del directorio `backend/`:

### Opcion A: Ejecucion mediante Gradle Wrapper (Recomendado)
```bash
# Otorgar permisos de ejecucion (en entornos Linux / macOS)
chmod +x gradlew

# Compilar el proyecto
./gradlew build -x test

# Iniciar la aplicacion
./gradlew bootRun
```

### Opcion B: Ejecucion mediante Maven
```bash
# Compilar el proyecto
./mvnw clean package -DskipTests

# Iniciar la aplicacion
./mvnw spring-boot:run
```

El servidor quedara escuchando peticiones en: `http://localhost:8080`

---

## 6. Endpoints Principales de la API REST

### Autenticacion y Seguridad
* `POST /api/auth/login`: Autenticacion con credenciales y emision de token JWT.
* `POST /api/auth/primer-login`: Cambio obligatorio de contraseña provisional en primer acceso.
* `POST /api/auth/cambiar-password`: Renovacion voluntaria de contraseña.
* `POST /api/auth/logout`: Invalidacion de token en la lista negra del servidor.

### Modulo de Coordinacion
* `GET /api/coordinador/trabajadores`: Matriz paginada de personal con filtros por cargo y estado.
* `POST /api/coordinador/trabajadores`: Registro de nuevo colaborador con clave temporal.
* `PUT /api/coordinador/trabajadores/{id}/inhabilitar`: Inhabilitacion logica (Soft-Delete).
* `POST /api/coordinador/proyectos`: Creacion y presupuestacion de nuevo proyecto.

### Modulo de Liderazgo y WBS
* `GET /api/lider/proyectos/{id}/wbs`: Obtencion del arbol jerarquico completo de fases y tareas.
* `POST /api/lider/etapas`: Creacion de fase WBS.
* `POST /api/lider/actividades`: Creacion y estimacion horaria de tarea WBS.
* `PUT /api/lider/actividades/{id}/reasignar`: Reasignacion con justificacion obligatoria.
* `GET /api/lider/proyectos/{id}/metricas-semaforo`: Evaluacion del semaforo predictivo de riesgo.

### Modulo de Desarrollador
* `GET /api/desarrollador/actividades/mis-tareas`: Listado de tareas asignadas al usuario autenticado.
* `PUT /api/desarrollador/actividades/{id}/iniciar`: Inicio de ejecucion con estampa de tiempo.
* `PUT /api/desarrollador/actividades/{id}/completar`: Cierre con registro de horas reales.
* `POST /api/desarrollador/errores`: Reporte de incidencias tecnicas vinculadas a la WBS.

### Analitica e Interoperabilidad Internacional
* `GET /api/analitica/capacidad-burnout`: Evaluacion de series temporales de 21 dias (ISO/IEC 25010).
* `POST /api/lider/proyectos/{id}/etl-brasil`: Generacion del lote exportable con sello digital SHA-256.

---

## 7. Pruebas y Calidad de Codigo

Para ejecutar el conjunto de pruebas unitarias y de integracion:
```bash
./gradlew test
```
o con Maven:
```bash
./mvnw test
```
