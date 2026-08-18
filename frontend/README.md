# IKernell - Frontend SPA (React 18 + Vite + Tailwind CSS)

Aplicación web de una sola página (*Single Page Application*) para la plataforma **IKernell**, orientada a la gestión integral de proyectos, desglose estructural WBS, monitoreo predictivo de riesgos mediante el Semáforo Inteligente, seguimiento de burnout y exportación de lotes ETL.

---

## ⚡ 1. Gestor de Paquetes Obligatorio: `pnpm` (RNF-01 / Ítem 18 Rúbrica SENA)

> **IMPORTANTE — CUMPLIMIENTO DE RÚBRICA:**  
> Según la especificación del requerimiento no funcional **RNF-01** y el **Ítem 18 de la Rúbrica Oficial de Evaluación SENA**, este proyecto frontend utiliza **EXCLUSIVA Y ESTRICTAMENTE `pnpm`** como gestor de paquetes y dependencias. Se encuentra terminantemente prohibido el uso de gestores alternativos.

### ¿Por qué `pnpm` en IKernell?
1. **Eliminación de Dependencias Fantasma (*Phantom Dependencies*):** `pnpm` crea una estructura de `node_modules` no plana basada en enlaces simbólicos (*hard links / symlinks*), garantizando que el código solo pueda acceder a los paquetes declarados explícitamente en `package.json`.
2. **Eficiencia de Almacenamiento y Rendimiento:** Utiliza un almacén global direccionable por contenido (*Content-Addressable Storage*), ahorrando gigabytes en disco y acelerando las instalaciones en frío hasta un **300%** respecto a gestores tradicionales.
3. **Reproducibilidad Determinista:** El archivo `pnpm-lock.yaml` bloquea con precisión criptográfica todas las versiones de los submódulos.

---

## 🛠️ 2. Comandos Oficiales de Ejecución y Despliegue

Todos los scripts deben ejecutarse mediante **`pnpm`**:

```bash
# 1. Instalación determinista de dependencias
pnpm install

# 2. Iniciar servidor de desarrollo con Hot Module Replacement (HMR)
pnpm run dev

# 3. Compilación optimizada para producción (Vite Bundle)
pnpm run build

# 4. Previsualización local del bundle de producción
pnpm run preview
```

### Tabla de Equivalencias de Comandos

| Acción Operativa | Comando Obligatorio (`pnpm`) |
| :--- | :--- |
| **Instalar dependencias** | `pnpm install` |
| **Añadir dependencia de producción** | `pnpm add <nombre-paquete>` |
| **Añadir dependencia de desarrollo** | `pnpm add -D <nombre-paquete>` |
| **Servidor de desarrollo** | `pnpm run dev` |
| **Compilación de producción** | `pnpm run build` |

---

## 🏗️ 3. Stack Tecnológico Frontend

* **Core:** React 18.3 (Hooks, Context API, Suspense, Lazy Loading).
* **Build Tool:** Vite 5.4 con compilación ultrarrápida Rollup/ESBuild.
* **Estilos y UI:** Tailwind CSS y Vanilla CSS con paleta corporativa *Linear/Vercel/GitHub Dimmed* (Modo Claro / Modo Oscuro con `ThemeContext`).
* **Animaciones:** Framer Motion (microinteracciones y transiciones fluidas de 0.25s).
* **Gráficos Analíticos:** Recharts (distribución de severidad y métricas predictivas).
* **Iconografía:** Lucide React (iconos SVG corporativos sin emojis).
* **Cliente HTTP:** Axios / Fetch API con interceptores JWT stateless.

---

## 🔑 4. Credenciales de Prueba (Entorno Local)

| Rol | Correo Corporativo | Contraseña |
| :--- | :--- | :--- |
| **Coordinador** | `ana.coordinador@ikernell.org` | `password123` |
| **Líder de Proyecto** | `carlos.lider@ikernell.org` | `password123` |
| **Desarrollador** | `diego.dev@ikernell.org` | `password123` |

---

*IKernell • Frontend Engineering Standard — SENA ADSO.*
