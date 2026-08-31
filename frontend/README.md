# IKernell Frontend - Aplicacion Web SPA

Modulo de presentacion web para la plataforma IKernell Soluciones Software. Desarrollado como una Single Page Application (SPA) modular, reactiva y de alto rendimiento utilizando React 18, Vite y empaquetado exclusivamente mediante el gestor de dependencias pnpm.

---

## 1. Stack Tecnologico y Librerias Principales

* Runtime y Construccion: Node.js (v18+) y Vite 5.4.
* Gestor de Paquetes Exclusivo: pnpm (requerido para garantizar la resolucion rapida y el arbol de dependencias estricto mediante `pnpm-lock.yaml`).
* Libreria de Vistas: React 18.3 y React DOM 18.3.
* Enrutamiento Asincrono: React Router DOM 6.22 (navegacion fluida sin recargas de pagina).
* Sistema de Estilos y Diseno: Tailwind CSS 3.4 con utilidades personalizadas, plugins de tipografia y variables CSS semanticas.
* Soporte de Accesibilidad Visual: Modo Claro y Modo Oscuro nativo con persistencia local y contraste tipografico superior a 4.5:1 (WCAG AA).
* Animaciones y Microinteracciones: Framer Motion para transiciones suaves entre vistas y modales.
* Renderizado 3D y Visuales: Three.js y React Three Fiber para efectos visuales y ambientacion en el portal publico.
* Representacion Grafica y Telemetria: Recharts para graficos de esfuerzo, distribucion de fallas y tendencias de riesgo.
* Notificaciones y Alertas Flotantes: React Hot Toast para confirmaciones y advertencias no intrusivas.
* Procesamiento Documental: React Markdown y jsPDF para lectura en visor dual y generacion de reportes PDF descargables.
* Iconografia: Lucide React (iconos vectoriales SVG limpios y optimizados).

---

## 2. Estructura del Proyecto Frontend

```text
frontend/
├── index.html                  # Plantilla HTML principal de la SPA
├── package.json                # Definicion de scripts y dependencias
├── pnpm-lock.yaml              # Archivo de bloqueo de dependencias pnpm
├── vite.config.js              # Configuracion de Vite y plugins de React
├── tailwind.config.js          # Configuracion de colores, temas y extensiones
├── postcss.config.js           # Configuracion de PostCSS para Tailwind
└── src/
    ├── main.jsx                # Punto de entrada de la aplicacion React
    ├── App.jsx                 # Componente raiz y definicion de proveedores
    ├── index.css               # Estilos globales y variables de tema
    ├── components/             # Componentes visuales reutilizables
    │   ├── common/             # Botones, tarjetas, modales, alertas y barra de navegacion
    │   ├── layout/             # Estructura de cabecera, barra lateral y pie de pagina
    │   └── ui/                 # Elementos atomicos de interfaz y formularios
    ├── pages/                  # Vistas de pagina divididas por modulo funcional
    │   ├── public/             # Portal publico (Inicio, Servicios, FAQ, Noticias, Contacto)
    │   ├── auth/               # Inicio de sesion y cambio obligatorio de contraseña
    │   ├── coordinador/        # Gestion de personal, creacion de proyectos y bandeja comercial
    │   ├── lider/              # Estructuracion WBS, cronogramas y semaforo predictivo
    │   ├── desarrollador/      # Tablero personal Kanban, reporte de horas y errores
    │   └── common/             # Perfil laboral, chat corporativo, biblioteca e induccion
    ├── context/                # Proveedores de estado global (AuthContext, ThemeContext)
    ├── hooks/                  # Hooks personalizados para consumo de API y manejo de eventos
    ├── services/               # Clientes HTTP (Axios) y servicios de integracion con Backend
    ├── router/                 # Configuracion de rutas publicas y rutas protegidas por roles
    └── config/                 # Constantes globales, URLs de API y configuraciones de entorno
```

---

## 3. Requisitos Previos

* Node.js: Version 18.0.0 o superior instalada.
* pnpm: Version 8.0.0 o superior (verificar con `pnpm --version`). Si no esta instalado:
```bash
npm install -g pnpm
```

---

## 4. Instalacion y Comandos de Ejecucion

Todos los comandos deben ejecutarse dentro de la carpeta `frontend/` utilizando `pnpm`:

### Instalacion de Dependencias
```bash
pnpm install
```

### Servidor de Desarrollo
Inicia el entorno de desarrollo local con recarga en caliente instantanea (HMR):
```bash
pnpm dev
```
La aplicacion estara accesible por defecto en: `http://localhost:5173`

### Compilacion para Produccion
Genera los archivos estaticos optimizados y minificados en el directorio `dist/`:
```bash
pnpm build
```

### Previsualizacion de Compilacion
Inicia un servidor local para inspeccionar la compilacion de produccion generada en `dist/`:
```bash
pnpm preview
```

### Analisis de Codigo y Linter
Ejecuta el linter ESLint para validar buenas practicas y estandares de codificacion:
```bash
pnpm lint
```

---

## 5. Variables de Entorno

El frontend se conecta a la API REST del backend mediante variables de entorno configurables en un archivo `.env.local` en la raiz de `frontend/`:

```env
# URL base de los endpoints del Backend Spring Boot
VITE_API_BASE_URL=http://localhost:8080/api

# Tiempo de espera por peticion HTTP (en milisegundos)
VITE_API_TIMEOUT=15000

# Nombre de la aplicacion
VITE_APP_NAME=IKernell Soluciones Software
```

---

## 6. Caracteristicas de Seguridad y Resiliencia en Cliente

1. Enrutamiento Protegido (Guards): Componentes de enrutamiento que interceptan las navegaciones hacia rutas privadas, verificando la validez del token JWT y el rol del usuario (COORDINADOR, LIDER, DESARROLLADOR).
2. Interceptores HTTP: Inyeccion automatica de la cabecera `Authorization: Bearer <token>` en todas las peticiones hacia endpoints protegidos y captura automatica de errores 401/403 para cierre de sesion seguro.
3. Resiliencia Visual (Error Boundaries): Componentes de captura de excepciones que evitan pantallas en blanco ante fallos fortuitos de renderizado, presentando interfaces amigables de recuperacion con un solo clic.
4. Conmutacion de Tema: Soporte dinamico de Modo Claro y Modo Oscuro con almacenamiento en LocalStorage y aplicacion de clases CSS de alto contraste.
