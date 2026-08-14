package com.ikernell.service;

import com.ikernell.dto.SemaforoMetricsDto;
import com.ikernell.exception.ResourceNotFoundException;
import com.ikernell.model.*;
import com.ikernell.model.Error;
import com.ikernell.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@Transactional
public class LiderService {

    // Inyección de dependencias
    private final ProyectoRepository proyectoRepository;
    private final EtapaRepository etapaRepository;
    private final ActividadRepository actividadRepository;
    private final ErrorRepository errorRepository;
    private final InterrupcionRepository interrupcionRepository;
    private final TrabajadorRepository trabajadorRepository;
    private final ProyectoDesarrolladorRepository proyectoDesarrolladorRepository;

    public LiderService(ProyectoRepository proyectoRepository,
                        EtapaRepository etapaRepository,
                        ActividadRepository actividadRepository,
                        ErrorRepository errorRepository,
                        InterrupcionRepository interrupcionRepository,
                        TrabajadorRepository trabajadorRepository,
                        ProyectoDesarrolladorRepository proyectoDesarrolladorRepository) {
        this.proyectoRepository = proyectoRepository;
        this.etapaRepository = etapaRepository;
        this.actividadRepository = actividadRepository;
        this.errorRepository = errorRepository;
        this.interrupcionRepository = interrupcionRepository;
        this.trabajadorRepository = trabajadorRepository;
        this.proyectoDesarrolladorRepository = proyectoDesarrolladorRepository;
    }

    // Registra un nuevo proyecto en estado ACTIVO y lo vincula con el líder asignado
    public Proyecto crearProyecto(Proyecto proyecto, Long idLider) {
        // Validaciones
        Trabajador lider = trabajadorRepository.findById(idLider)
                .orElseThrow(() -> new ResourceNotFoundException("Líder no encontrado con ID: " + idLider));
        
        // Persistencia
        proyecto.setLider(lider);
        proyecto.setEstado("ACTIVO");
        return proyectoRepository.save(proyecto);
    }

    // Actualiza los metadatos y fechas estimadas del proyecto
    public Proyecto actualizarProyecto(Long idProyecto, Proyecto datos) {
        // Validaciones
        Proyecto proyecto = proyectoRepository.findById(idProyecto)
                .orElseThrow(() -> new ResourceNotFoundException("Proyecto no encontrado con ID: " + idProyecto));
        
        // Persistencia
        proyecto.setNombre(datos.getNombre());
        proyecto.setDescripcion(datos.getDescripcion());
        proyecto.setFechaInicio(datos.getFechaInicio());
        proyecto.setFechaFinEstimada(datos.getFechaFinEstimada());
        proyecto.setEstado(datos.getEstado());
        return proyectoRepository.save(proyecto);
    }

    // Deshabilita el proyecto para pausar o cerrar su ejecución
    public void inhabilitarProyecto(Long idProyecto) {
        Proyecto proyecto = proyectoRepository.findById(idProyecto)
                .orElseThrow(() -> new ResourceNotFoundException("Proyecto no encontrado con ID: " + idProyecto));
        proyecto.setEstado("INHABILITADO");
        proyectoRepository.save(proyecto);
    }

    // Registra una fase WBS inicializándola en PENDIENTE por defecto
    public Etapa registrarEtapa(Long idProyecto, Etapa etapa) {
        // Validaciones
        Proyecto proyecto = proyectoRepository.findById(idProyecto)
                .orElseThrow(() -> new ResourceNotFoundException("Proyecto no encontrado con ID: " + idProyecto));
        
        // Persistencia
        etapa.setProyecto(proyecto);
        etapa.setEstado("PENDIENTE");
        return etapaRepository.save(etapa);
    }

    // Elimina una fase del desglose WBS
    public void eliminarEtapa(Long idEtapa) {
        if (!etapaRepository.existsById(idEtapa)) {
            throw new ResourceNotFoundException("Etapa no encontrada con ID: " + idEtapa);
        }
        etapaRepository.deleteById(idEtapa);
    }

    // Asigna un desarrollador a la nómina de trabajo del proyecto
    public ProyectoDesarrollador asignarDesarrollador(Long idProyecto, Long idDesarrollador) {
        // Validaciones
        Proyecto proyecto = proyectoRepository.findById(idProyecto)
                .orElseThrow(() -> new ResourceNotFoundException("Proyecto no encontrado con ID: " + idProyecto));
        Trabajador desarrollador = trabajadorRepository.findById(idDesarrollador)
                .orElseThrow(() -> new ResourceNotFoundException("Desarrollador no encontrado con ID: " + idDesarrollador));

        // Persistencia
        ProyectoDesarrollador asignacion = new ProyectoDesarrollador();
        asignacion.setProyecto(proyecto);
        asignacion.setDesarrollador(desarrollador);
        return proyectoDesarrolladorRepository.save(asignacion);
    }

    // Asigna una tarea a un desarrollador estableciendo PENDIENTE como estado inicial
    public Actividad asignarActividad(Long idEtapa, Long idDesarrollador, Actividad actividad) {
        // Validaciones
        Etapa etapa = etapaRepository.findById(idEtapa)
                .orElseThrow(() -> new ResourceNotFoundException("Etapa no encontrada con ID: " + idEtapa));
        Trabajador desarrollador = trabajadorRepository.findById(idDesarrollador)
                .orElseThrow(() -> new ResourceNotFoundException("Desarrollador no encontrado con ID: " + idDesarrollador));

        // Persistencia
        actividad.setEtapa(etapa);
        actividad.setDesarrollador(desarrollador);
        if (actividad.getEstado() == null || actividad.getEstado().isBlank()) {
            actividad.setEstado("PENDIENTE");
        }
        return actividadRepository.save(actividad);
    }

    // Reasigna la actividad a otro desarrollador registrando el motivo en la descripción
    public Actividad reasignarActividad(Long idActividad, Long nuevoDesarrolladorId, String motivo) {
        // Validaciones
        Actividad actividad = actividadRepository.findById(idActividad)
                .orElseThrow(() -> new ResourceNotFoundException("Actividad no encontrada con ID: " + idActividad));
        Trabajador nuevoDesarrollador = trabajadorRepository.findById(nuevoDesarrolladorId)
                .orElseThrow(() -> new ResourceNotFoundException("Desarrollador no encontrado con ID: " + nuevoDesarrolladorId));

        // Persistencia
        actividad.setDesarrollador(nuevoDesarrollador);
        if (motivo != null && !motivo.isBlank()) {
            actividad.setDescripcion(actividad.getDescripcion() + " [Reasignada: " + motivo.trim() + "]");
        }
        return actividadRepository.save(actividad);
    }

    // Consultas de proyectos por líder
    @Transactional(readOnly = true)
    public List<Proyecto> listarProyectosPorLider(Long idLider) {
        Trabajador lider = trabajadorRepository.findById(idLider)
                .orElseThrow(() -> new ResourceNotFoundException("Líder no encontrado con ID: " + idLider));
        return proyectoRepository.findByLider(lider);
    }

    // Listado general de proyectos
    @Transactional(readOnly = true)
    public List<Proyecto> listarTodosLosProyectos() {
        return proyectoRepository.findAll();
    }

    // Consultas paginadas para tablas con alto volumen de proyectos
    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<Proyecto> listarProyectosPorLiderPaginado(Long idLider, org.springframework.data.domain.Pageable pageable) {
        Trabajador lider = trabajadorRepository.findById(idLider)
                .orElseThrow(() -> new ResourceNotFoundException("Líder no encontrado con ID: " + idLider));
        return proyectoRepository.findByLider(lider, pageable);
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<Proyecto> listarTodosProyectosPaginado(org.springframework.data.domain.Pageable pageable) {
        return proyectoRepository.findAll(pageable);
    }

    // Obtiene las etapas WBS y sus actividades asociadas
    @Transactional(readOnly = true)
    public List<Etapa> obtenerEtapasPorProyecto(Long idProyecto) {
        Proyecto proyecto = proyectoRepository.findById(idProyecto)
                .orElseThrow(() -> new ResourceNotFoundException("Proyecto no encontrado con ID: " + idProyecto));
        List<Etapa> etapas = etapaRepository.findByProyecto(proyecto);
        for (Etapa e : etapas) {
            List<Actividad> acts = actividadRepository.findByEtapa(e);
            e.setActividades(acts != null ? acts : new ArrayList<>());
        }
        return etapas;
    }

    // Lista desarrolladores activos disponibles para asignaciones
    @Transactional(readOnly = true)
    public List<Trabajador> listarDesarrolladoresActivos() {
        return trabajadorRepository.findByRolAndEstado(Rol.DESARROLLADOR, true);
    }

    // Consulta errores técnicos reportados en las fases del proyecto
    @Transactional(readOnly = true)
    public List<Error> obtenerErroresPorProyecto(Long idProyecto) {
        Proyecto proyecto = proyectoRepository.findById(idProyecto)
                .orElseThrow(() -> new ResourceNotFoundException("Proyecto no encontrado con ID: " + idProyecto));
        List<Etapa> etapas = etapaRepository.findByProyecto(proyecto);
        List<Error> errores = new ArrayList<>();
        for (Etapa e : etapas) {
            errores.addAll(errorRepository.findByEtapa(e));
        }
        return errores;
    }

    // Consulta todos los errores técnicos globales reportados en la organización
    @Transactional(readOnly = true)
    public List<Error> obtenerTodosLosErrores() {
        return errorRepository.findAll();
    }

    // Consulta interrupciones y contingencias operativas reportadas
    @Transactional(readOnly = true)
    public List<Interrupcion> obtenerInterrupcionesPorProyecto(Long idProyecto) {
        Proyecto proyecto = proyectoRepository.findById(idProyecto)
                .orElseThrow(() -> new ResourceNotFoundException("Proyecto no encontrado con ID: " + idProyecto));
        List<Etapa> etapas = etapaRepository.findByProyecto(proyecto);
        List<Interrupcion> interrupciones = new ArrayList<>();
        for (Etapa e : etapas) {
            interrupciones.addAll(interrupcionRepository.findByEtapa(e));
        }
        return interrupciones;
    }

    // Consulta todas las interrupciones y contingencias globales reportadas en la organización
    @Transactional(readOnly = true)
    public List<Interrupcion> obtenerTodasLasInterrupciones() {
        return interrupcionRepository.findAll();
    }

    // Consulta consolidada global de incidencias (errores e interrupciones)
    @Transactional(readOnly = true)
    public Map<String, Object> obtenerReportesConsolidadosGlobal() {
        Map<String, Object> response = new HashMap<>();
        response.put("errores", errorRepository.findAll());
        response.put("interrupciones", interrupcionRepository.findAll());
        return response;
    }

    // Calcula el semáforo de riesgo ponderando errores críticos y minutos de contingencia
    @Transactional(readOnly = true)
    public SemaforoMetricsDto calcularMetricasSemaforo(Long idProyecto) {
        Proyecto proyecto = proyectoRepository.findById(idProyecto)
                .orElseThrow(() -> new ResourceNotFoundException("Proyecto no encontrado con ID: " + idProyecto));

        List<Etapa> etapas = etapaRepository.findByProyecto(proyecto);

        List<Error> todosErrores = new ArrayList<>();
        List<Interrupcion> todasInterrupciones = new ArrayList<>();

        for (Etapa etapa : etapas) {
            todosErrores.addAll(errorRepository.findByEtapa(etapa));
            todasInterrupciones.addAll(interrupcionRepository.findByEtapa(etapa));
        }

        // Conteo por severidad
        Map<String, Integer> severityCount = new HashMap<>();
        severityCount.put("BAJA", 0);
        severityCount.put("MEDIA", 0);
        severityCount.put("ALTA", 0);
        severityCount.put("CRITICA", 0);

        int erroresCriticosOAltos = 0;
        for (Error err : todosErrores) {
            String sev = err.getSeveridad() != null ? err.getSeveridad().toUpperCase() : "BAJA";
            severityCount.put(sev, severityCount.getOrDefault(sev, 0) + 1);
            if ("CRITICA".equals(sev) || "ALTA".equals(sev)) {
                erroresCriticosOAltos++;
            }
        }

        // Suma de minutos perdidos
        int totalMinutos = 0;
        for (Interrupcion intp : todasInterrupciones) {
            totalMinutos += (intp.getDuracionMinutos() != null ? intp.getDuracionMinutos() : 0);
        }

        double totalHorasPerdidas = Math.round((totalMinutos / 60.0) * 10.0) / 10.0;

        // Evaluación de la matriz de riesgo
        String nivel;
        String titulo;
        String recomendacion;
        String badgeClass;
        String iconClass;

        if (totalHorasPerdidas > 15.0 || erroresCriticosOAltos >= 3) {
            nivel = "ROJO";
            titulo = "ALERTA CRÍTICA DE RIESGO";
            recomendacion = "¡Atención Urgente! Las horas de contingencia (" + totalHorasPerdidas + "h) o errores críticos (" + erroresCriticosOAltos + ") superan el umbral tolerable. Acción recomendada: Reasignar desarrolladores inmediatamente o extender plazo de entrega.";
            badgeClass = "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800/60";
            iconClass = "bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300 shadow-lg";
        } else if (totalHorasPerdidas >= 5.0 || erroresCriticosOAltos >= 1) {
            nivel = "NARANJA";
            titulo = "Riesgo Moderado (Atención Requerida)";
            recomendacion = "Se identifican cuellos de botella moderados (" + totalHorasPerdidas + "h de retraso, " + erroresCriticosOAltos + " errores de alto impacto). Se sugiere balance preventivo de tareas WBS.";
            badgeClass = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60";
            iconClass = "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300";
        } else {
            nivel = "VERDE";
            titulo = "Riesgo Bajo (Proyecto Estable)";
            recomendacion = "El proyecto avanza según la planificación esperada. Las métricas operativas se mantienen en rangos tolerables.";
            badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60";
            iconClass = "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300";
        }

        return new SemaforoMetricsDto(
                proyecto.getIdProyecto(),
                proyecto.getNombre(),
                nivel,
                titulo,
                recomendacion,
                badgeClass,
                iconClass,
                totalHorasPerdidas,
                erroresCriticosOAltos,
                todosErrores.size(),
                todasInterrupciones.size(),
                severityCount
        );
    }

    // Calcula el semáforo de riesgo corporativo global consolidando todos los proyectos
    @Transactional(readOnly = true)
    public SemaforoMetricsDto calcularMetricasSemaforoGlobal() {
        List<Error> todosErrores = errorRepository.findAll();
        List<Interrupcion> todasInterrupciones = interrupcionRepository.findAll();

        Map<String, Integer> severityCount = new HashMap<>();
        severityCount.put("BAJA", 0);
        severityCount.put("MEDIA", 0);
        severityCount.put("ALTA", 0);
        severityCount.put("CRITICA", 0);

        int erroresCriticosOAltos = 0;
        for (Error err : todosErrores) {
            String sev = err.getSeveridad() != null ? err.getSeveridad().toUpperCase() : "BAJA";
            severityCount.put(sev, severityCount.getOrDefault(sev, 0) + 1);
            if ("CRITICA".equals(sev) || "ALTA".equals(sev)) {
                erroresCriticosOAltos++;
            }
        }

        int totalMinutos = 0;
        for (Interrupcion intp : todasInterrupciones) {
            totalMinutos += (intp.getDuracionMinutos() != null ? intp.getDuracionMinutos() : 0);
        }

        double totalHorasPerdidas = Math.round((totalMinutos / 60.0) * 10.0) / 10.0;

        String nivel;
        String titulo;
        String recomendacion;
        String badgeClass;
        String iconClass;

        if (totalHorasPerdidas > 25.0 || erroresCriticosOAltos >= 6) {
            nivel = "ROJO";
            titulo = "ALERTA CRÍTICA CORPORATIVA (Nivel Crítico)";
            recomendacion = "Sobrecarga o incidencias críticas detectadas a nivel organizacional (" + totalHorasPerdidas + "h de contingencia, " + erroresCriticosOAltos + " errores de alto impacto). Se aconseja rebalancear prioridades y recursos entre proyectos activos.";
            badgeClass = "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800/60";
            iconClass = "bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300 shadow-lg";
        } else if (totalHorasPerdidas >= 10.0 || erroresCriticosOAltos >= 3) {
            nivel = "NARANJA";
            titulo = "Riesgo Moderado Organizacional (Nivel Alto / Atención Requerida)";
            recomendacion = "El ecosistema global presenta " + totalHorasPerdidas + "h acumuladas de contingencias y " + erroresCriticosOAltos + " incidencias críticas/altas. Mantener seguimiento preventivo en sprints activos.";
            badgeClass = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60";
            iconClass = "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300";
        } else {
            nivel = "VERDE";
            titulo = "Salud Organizacional Estable (Nivel Óptimo)";
            recomendacion = "Todos los proyectos de la compañía operan con estabilidad y flujo de entrega controlado. Métricas dentro de parámetros ideales.";
            badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60";
            iconClass = "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300";
        }

        return new SemaforoMetricsDto(
                null,
                "🌐 Salud Global Corporativa (Todos los Proyectos)",
                nivel,
                titulo,
                recomendacion,
                badgeClass,
                iconClass,
                totalHorasPerdidas,
                erroresCriticosOAltos,
                todosErrores.size(),
                todasInterrupciones.size(),
                severityCount
        );
    }

    // Bandeja de reportes consolidados (errores e interrupciones) del equipo
    @Transactional(readOnly = true)
    public Map<String, Object> obtenerReportesConsolidadosProyecto(Long idProyecto) {
        Proyecto proyecto = proyectoRepository.findById(idProyecto)
                .orElseThrow(() -> new ResourceNotFoundException("Proyecto no encontrado con ID: " + idProyecto));
        List<Etapa> etapas = etapaRepository.findByProyecto(proyecto);
        List<Error> errores = new ArrayList<>();
        List<Interrupcion> interrupciones = new ArrayList<>();

        for (Etapa e : etapas) {
            errores.addAll(errorRepository.findByEtapa(e));
            interrupciones.addAll(interrupcionRepository.findByEtapa(e));
        }

        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("proyectoId", idProyecto);
        respuesta.put("proyectoNombre", proyecto.getNombre());
        respuesta.put("errores", errores);
        respuesta.put("interrupciones", interrupciones);
        respuesta.put("totalErrores", errores.size());
        respuesta.put("totalInterrupciones", interrupciones.size());
        return respuesta;
    }

    // Actualiza el estado de atención y nota de respuesta para un error técnico
    public Error atenderError(Long idError, String estadoAtencion, String resolucionNota) {
        // Validaciones
        Error error = errorRepository.findById(idError)
                .orElseThrow(() -> new ResourceNotFoundException("Error no encontrado con ID: " + idError));
        
        // Persistencia
        error.setEstadoAtencion(estadoAtencion != null ? estadoAtencion : "EN_REVISION");
        if (resolucionNota != null) {
            error.setResolucionNota(resolucionNota);
        }
        error.setFechaResolucion(LocalDateTime.now());
        return errorRepository.save(error);
    }

    // Actualiza el estado de atención y observaciones para una interrupción operativa
    public Interrupcion atenderInterrupcion(Long idInterrupcion, String estadoAtencion, String resolucionNota) {
        // Validaciones
        Interrupcion interrupcion = interrupcionRepository.findById(idInterrupcion)
                .orElseThrow(() -> new ResourceNotFoundException("Interrupción no encontrada con ID: " + idInterrupcion));
        
        // Persistencia
        interrupcion.setEstadoAtencion(estadoAtencion != null ? estadoAtencion : "EN_REVISION");
        if (resolucionNota != null) {
            interrupcion.setResolucionNota(resolucionNota);
        }
        interrupcion.setFechaResolucion(LocalDateTime.now());
        return interrupcionRepository.save(interrupcion);
    }
}
