package com.ikernell.service;

import com.ikernell.dto.SemaforoMetricsDto;
import com.ikernell.exception.BusinessLogicException;
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

    // Registra un nuevo proyecto en estado ACTIVO y lo vincula con el líder asignado (HU-11 / RF-13 / RF-14)
    public Proyecto crearProyecto(Proyecto proyecto, Long idLider) {
        // Validación Condición 02 de la HU-11: Validar campos obligatorios y coherencia de fechas
        if (proyecto.getNombre() == null || proyecto.getNombre().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre del proyecto es obligatorio.");
        }
        if (proyecto.getFechaInicio() == null) {
            throw new IllegalArgumentException("La fecha de inicio del proyecto es obligatoria.");
        }
        if (proyecto.getFechaFinEstimada() == null) {
            throw new IllegalArgumentException("La fecha de finalización estimada del proyecto es obligatoria.");
        }
        if (proyecto.getFechaFinEstimada().isBefore(proyecto.getFechaInicio())) {
            throw new IllegalArgumentException("La fecha de finalización estimada (" + proyecto.getFechaFinEstimada() 
                    + ") no puede ser anterior a la fecha de inicio (" + proyecto.getFechaInicio() + ").");
        }
        if (proyecto.getPresupuesto() != null && proyecto.getPresupuesto().compareTo(java.math.BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("El presupuesto del proyecto no puede ser un valor negativo.");
        }

        // Resolución del líder responsable
        Trabajador lider = null;
        if (idLider != null) {
            lider = trabajadorRepository.findById(idLider)
                    .orElseThrow(() -> new ResourceNotFoundException("Líder no encontrado con ID: " + idLider));
        } else if (proyecto.getLider() != null && proyecto.getLider().getIdTrabajador() != null) {
            lider = trabajadorRepository.findById(proyecto.getLider().getIdTrabajador())
                    .orElseThrow(() -> new ResourceNotFoundException("Líder no encontrado con ID: " + proyecto.getLider().getIdTrabajador()));
        } else {
            List<Trabajador> lideres = trabajadorRepository.findByRolAndEstado(Rol.LIDER, true);
            if (lideres.isEmpty()) {
                lideres = trabajadorRepository.findByRolAndEstado(Rol.COORDINADOR, true);
            }
            lider = lideres.stream().findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("No se encontró ningún Líder o Coordinador activo para asociar al proyecto."));
        }
        
        // Persistencia (HU-11: Estado inicial EN_PLANIFICACION o ACTIVO)
        proyecto.setLider(lider);
        if (proyecto.getEstado() == null || proyecto.getEstado().isBlank()) {
            proyecto.setEstado("EN_PLANIFICACION");
        }
        return proyectoRepository.save(proyecto);
    }

    // Actualiza los metadatos y fechas estimadas del proyecto
    public Proyecto actualizarProyecto(Long idProyecto, Proyecto datos) {
        // Validaciones
        Proyecto proyecto = proyectoRepository.findById(idProyecto)
                .orElseThrow(() -> new ResourceNotFoundException("Proyecto no encontrado con ID: " + idProyecto));
        
        if (datos.getFechaFinEstimada() != null && datos.getFechaInicio() != null) {
            if (datos.getFechaFinEstimada().isBefore(datos.getFechaInicio())) {
                throw new IllegalArgumentException("La fecha de finalización estimada no puede ser anterior a la fecha de inicio.");
            }
        }
        
        // Persistencia
        if (datos.getNombre() != null) proyecto.setNombre(datos.getNombre());
        if (datos.getCliente() != null) proyecto.setCliente(datos.getCliente());
        if (datos.getDescripcion() != null) proyecto.setDescripcion(datos.getDescripcion());
        if (datos.getPresupuesto() != null) proyecto.setPresupuesto(datos.getPresupuesto());
        if (datos.getFechaInicio() != null) proyecto.setFechaInicio(datos.getFechaInicio());
        if (datos.getFechaFinEstimada() != null) proyecto.setFechaFinEstimada(datos.getFechaFinEstimada());
        if (datos.getEstado() != null) proyecto.setEstado(datos.getEstado());
        return proyectoRepository.save(proyecto);
    }

    // Finaliza formalmente un proyecto de software, congela su estructura WBS y libera la carga horaria de los desarrolladores asignados (RF-20)
    @Transactional
    public Proyecto finalizarProyecto(Long idProyecto) {
        Proyecto proyecto = proyectoRepository.findById(idProyecto)
                .orElseThrow(() -> new ResourceNotFoundException("Proyecto no encontrado con ID: " + idProyecto));

        if ("FINALIZADO".equalsIgnoreCase(proyecto.getEstado()) || "COMPLETADO".equalsIgnoreCase(proyecto.getEstado())) {
            throw new IllegalStateException("El proyecto ya se encuentra finalizado.");
        }

        // 1. Marcar estado del proyecto como FINALIZADO
        proyecto.setEstado("FINALIZADO");

        // 2. Marcar todas las fases WBS y sus actividades como FINALIZADA (Congelamiento WBS)
        List<Etapa> etapas = etapaRepository.findByProyecto(proyecto);
        for (Etapa etapa : etapas) {
            etapa.setEstado("FINALIZADA");
            if (etapa.getActividades() != null) {
                for (Actividad act : etapa.getActividades()) {
                    if (!"FINALIZADA".equalsIgnoreCase(act.getEstado()) && !"COMPLETADA".equalsIgnoreCase(act.getEstado())) {
                        act.setEstado("FINALIZADA");
                        actividadRepository.save(act);
                    }
                }
            }
            etapaRepository.save(etapa);
        }

        // 3. Liberar carga de los desarrolladores asignados eliminando las relaciones en proyecto_desarrollador
        List<ProyectoDesarrollador> asignaciones = proyectoDesarrolladorRepository.findByProyecto(proyecto);
        if (!asignaciones.isEmpty()) {
            proyectoDesarrolladorRepository.deleteAll(asignaciones);
        }

        // 4. Guardar y retornar proyecto finalizado (datos históricos preservados para auditoría y ETL Brasil)
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
        
        if ("FINALIZADO".equalsIgnoreCase(proyecto.getEstado()) || "COMPLETADO".equalsIgnoreCase(proyecto.getEstado())) {
            throw new IllegalStateException("El proyecto se encuentra finalizado. No se pueden registrar nuevas etapas en un proyecto cerrado.");
        }
        
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
        Etapa etapa = etapaRepository.findById(idEtapa).get();
        if (etapa.getProyecto() != null && 
            ("FINALIZADO".equalsIgnoreCase(etapa.getProyecto().getEstado()) || "COMPLETADO".equalsIgnoreCase(etapa.getProyecto().getEstado()))) {
            throw new IllegalStateException("El proyecto se encuentra finalizado. No se pueden alterar fases de un proyecto cerrado.");
        }
        etapaRepository.deleteById(idEtapa);
    }

    // Asigna un desarrollador a la nómina de trabajo del proyecto con control de cargas de 48h (HU-12 / RF-16)
    public ProyectoDesarrollador asignarDesarrollador(Long idProyecto, Long idDesarrollador, Integer horasSemanales) {
        if (horasSemanales == null || horasSemanales <= 0) {
            horasSemanales = 40;
        }
        if (horasSemanales > 48) {
            throw new IllegalArgumentException("La asignación semanal (" + horasSemanales + "h) no puede exceder el límite legal máximo de 48 horas semanales.");
        }

        // Validaciones de existencia
        Proyecto proyecto = proyectoRepository.findById(idProyecto)
                .orElseThrow(() -> new ResourceNotFoundException("Proyecto no encontrado con ID: " + idProyecto));
        
        if ("FINALIZADO".equalsIgnoreCase(proyecto.getEstado()) || "COMPLETADO".equalsIgnoreCase(proyecto.getEstado())) {
            throw new IllegalStateException("El proyecto se encuentra finalizado. No se pueden asignar desarrolladores a un proyecto cerrado.");
        }
        Trabajador desarrollador = trabajadorRepository.findById(idDesarrollador)
                .orElseThrow(() -> new ResourceNotFoundException("Desarrollador no encontrado con ID: " + idDesarrollador));

        // Condición Crítica HU-12: Regla de las 48 horas semanales acumuladas
        int horasOtrasAsignaciones = proyectoDesarrolladorRepository
                .calcularHorasAsignadasExcluyendoProyecto(desarrollador, idProyecto);

        int horasTotalesProyectadas = horasOtrasAsignaciones + horasSemanales;
        if (horasTotalesProyectadas > 48) {
            throw new IllegalArgumentException("Sobreasignación de capacidad: El desarrollador " + desarrollador.getNombre() 
                    + " " + desarrollador.getApellido() + " ya tiene " + horasOtrasAsignaciones 
                    + "h asignadas en otros proyectos activos. Asignar " + horasSemanales 
                    + "h superaría el límite máximo de 48 horas semanales (Total: " + horasTotalesProyectadas + "h).");
        }

        // Persistencia (Actualizar asignación existente o registrar nueva)
        ProyectoDesarrollador asignacion = proyectoDesarrolladorRepository
                .findByProyectoAndDesarrollador(proyecto, desarrollador)
                .orElse(new ProyectoDesarrollador());

        asignacion.setProyecto(proyecto);
        asignacion.setDesarrollador(desarrollador);
        asignacion.setHorasSemanales(horasSemanales);
        return proyectoDesarrolladorRepository.save(asignacion);
    }

    public ProyectoDesarrollador asignarDesarrollador(Long idProyecto, Long idDesarrollador) {
        return asignarDesarrollador(idProyecto, idDesarrollador, 40);
    }

    // Asigna una tarea a un desarrollador estableciendo PENDIENTE como estado inicial
    public Actividad asignarActividad(Long idEtapa, Long idDesarrollador, Actividad actividad) {
        // Validaciones
        Etapa etapa = etapaRepository.findById(idEtapa)
                .orElseThrow(() -> new ResourceNotFoundException("Etapa no encontrada con ID: " + idEtapa));
        
        if (etapa.getProyecto() != null && 
            ("FINALIZADO".equalsIgnoreCase(etapa.getProyecto().getEstado()) || "COMPLETADO".equalsIgnoreCase(etapa.getProyecto().getEstado()))) {
            throw new IllegalStateException("El proyecto se encuentra finalizado. No se pueden registrar actividades en un proyecto cerrado.");
        }
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

    // Reasigna la actividad a otro desarrollador registrando el motivo en la descripción (HU-25)
    public Actividad reasignarActividad(Long idActividad, Long nuevoDesarrolladorId, String motivo) {
        // Validaciones
        Actividad actividad = actividadRepository.findById(idActividad)
                .orElseThrow(() -> new ResourceNotFoundException("Actividad no encontrada con ID: " + idActividad));

        // Validación Defensiva HU-25: Proteger trazabilidad histórica y cálculo de horas reales
        if ("FINALIZADA".equalsIgnoreCase(actividad.getEstado()) || "COMPLETADA".equalsIgnoreCase(actividad.getEstado())) {
            throw new IllegalStateException("No se puede reasignar una actividad que ya ha sido finalizada.");
        }

        if (actividad.getEtapa() != null && actividad.getEtapa().getProyecto() != null &&
            ("FINALIZADO".equalsIgnoreCase(actividad.getEtapa().getProyecto().getEstado()) || "COMPLETADO".equalsIgnoreCase(actividad.getEtapa().getProyecto().getEstado()))) {
            throw new IllegalStateException("No se puede reasignar actividades en un proyecto finalizado.");
        }

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

    // Listado general de proyectos optimizado con FETCH del Líder
    @Transactional(readOnly = true)
    public List<Proyecto> listarTodosLosProyectos() {
        return proyectoRepository.findAllWithLider();
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

    // Obtiene las etapas WBS y sus actividades asociadas en 1 sola consulta optimizada (Anti N+1)
    @Transactional(readOnly = true)
    public List<Etapa> obtenerEtapasPorProyecto(Long idProyecto) {
        Proyecto proyecto = proyectoRepository.findById(idProyecto)
                .orElseThrow(() -> new ResourceNotFoundException("Proyecto no encontrado con ID: " + idProyecto));
        return etapaRepository.findByProyectoWithActividades(proyecto);
    }

    // Lista desarrolladores activos disponibles para asignaciones
    @Transactional(readOnly = true)
    public List<Trabajador> listarDesarrolladoresActivos() {
        return trabajadorRepository.findByRolAndEstado(Rol.DESARROLLADOR, true);
    }

    // Lista desarrolladores con su balance de horas semanales y estado de capacidad (HU-12 / RF-16) - Optimizado (Anti N+1)
    @Transactional(readOnly = true)
    public List<com.ikernell.dto.DesarrolladorCargaDTO> listarDesarrolladoresConCarga() {
        List<Trabajador> devs = trabajadorRepository.findByRolAndEstado(Rol.DESARROLLADOR, true);
        List<com.ikernell.dto.DesarrolladorCargaDTO> resultado = new ArrayList<>();

        // Consulta agregada única para traer las horas asignadas de todos los desarrolladores de 1 sola vez
        List<Object[]> resumenHoras = proyectoDesarrolladorRepository.obtenerHorasTotalesPorDesarrollador();
        Map<Long, Integer> mapHoras = new HashMap<>();
        for (Object[] row : resumenHoras) {
            if (row[0] != null && row[1] != null) {
                mapHoras.put(((Number) row[0]).longValue(), ((Number) row[1]).intValue());
            }
        }

        for (Trabajador dev : devs) {
            int horasAsignadas = mapHoras.getOrDefault(dev.getIdTrabajador(), 0);
            int limiteMaximo = 48;
            int horasDisponibles = Math.max(0, limiteMaximo - horasAsignadas);
            double porcentaje = Math.round(((double) horasAsignadas / limiteMaximo) * 1000.0) / 10.0;

            String nivel;
            if (horasAsignadas >= 48) {
                nivel = "COMPLETA";
            } else if (horasAsignadas >= 36) {
                nivel = "ALTA";
            } else if (horasAsignadas >= 20) {
                nivel = "MODERADA";
            } else {
                nivel = "DISPONIBLE";
            }

            resultado.add(new com.ikernell.dto.DesarrolladorCargaDTO(
                dev.getIdTrabajador(),
                dev.getNombre(),
                dev.getApellido(),
                dev.getEspecialidad(),
                dev.getProfesion(),
                dev.getEmail(),
                horasAsignadas,
                horasDisponibles,
                limiteMaximo,
                porcentaje,
                nivel
            ));
        }

        return resultado;
    }

    // Lista las asignaciones de desarrolladores vinculados a un proyecto específico
    @Transactional(readOnly = true)
    public List<ProyectoDesarrollador> obtenerDesarrolladoresPorProyecto(Long idProyecto) {
        Proyecto proyecto = proyectoRepository.findById(idProyecto)
                .orElseThrow(() -> new ResourceNotFoundException("Proyecto no encontrado con ID: " + idProyecto));
        return proyectoDesarrolladorRepository.findByProyectoWithDesarrollador(proyecto);
    }

    // Consulta errores técnicos reportados en las fases del proyecto en 1 sola consulta (Anti N+1)
    @Transactional(readOnly = true)
    public List<Error> obtenerErroresPorProyecto(Long idProyecto) {
        Proyecto proyecto = proyectoRepository.findById(idProyecto)
                .orElseThrow(() -> new ResourceNotFoundException("Proyecto no encontrado con ID: " + idProyecto));
        return errorRepository.findByProyectoWithDetails(proyecto);
    }

    // Consulta todos los errores técnicos globales reportados en la organización con JOIN FETCH
    @Transactional(readOnly = true)
    public List<Error> obtenerTodosLosErrores() {
        return errorRepository.findAllWithDetails();
    }

    // Consulta interrupciones y contingencias operativas reportadas en 1 sola consulta (Anti N+1)
    @Transactional(readOnly = true)
    public List<Interrupcion> obtenerInterrupcionesPorProyecto(Long idProyecto) {
        Proyecto proyecto = proyectoRepository.findById(idProyecto)
                .orElseThrow(() -> new ResourceNotFoundException("Proyecto no encontrado con ID: " + idProyecto));
        return interrupcionRepository.findByProyectoWithDetails(proyecto);
    }

    // Consulta todas las interrupciones operativas con JOIN FETCH
    @Transactional(readOnly = true)
    public List<Interrupcion> obtenerTodasLasInterrupciones() {
        return interrupcionRepository.findAllWithDetails();
    }

    // Consulta consolidada global de incidencias (errores e interrupciones)
    @Transactional(readOnly = true)
    public Map<String, Object> obtenerReportesConsolidadosGlobal() {
        Map<String, Object> response = new HashMap<>();
        response.put("errores", errorRepository.findAll());
        response.put("interrupciones", interrupcionRepository.findAll());
        return response;
    }

    // Calcula el semáforo de riesgo ponderando errores críticos y minutos de contingencia (Anti N+1)
    @Transactional(readOnly = true)
    public SemaforoMetricsDto calcularMetricasSemaforo(Long idProyecto) {
        Proyecto proyecto = proyectoRepository.findById(idProyecto)
                .orElseThrow(() -> new ResourceNotFoundException("Proyecto no encontrado con ID: " + idProyecto));

        // Consulta directa optimizada mediante JOIN FETCH
        List<Error> todosErrores = errorRepository.findByProyectoWithDetails(proyecto);
        List<Interrupcion> todasInterrupciones = interrupcionRepository.findByProyectoWithDetails(proyecto);

        // Conteo por severidad con normalización insensible a mayúsculas/minúsculas y acentos
        Map<String, Integer> severityCount = new HashMap<>();
        severityCount.put("BAJA", 0);
        severityCount.put("MEDIA", 0);
        severityCount.put("ALTA", 0);
        severityCount.put("CRITICA", 0);

        int erroresCriticosOAltos = 0;
        for (Error err : todosErrores) {
            String raw = err.getSeveridad() != null ? err.getSeveridad().trim().toUpperCase() : "BAJA";
            String sev = "BAJA";
            if (raw.contains("CRITIC") || raw.contains("CRÍTICA")) {
                sev = "CRITICA";
            } else if (raw.contains("ALT")) {
                sev = "ALTA";
            } else if (raw.contains("MED")) {
                sev = "MEDIA";
            }
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
            String raw = err.getSeveridad() != null ? err.getSeveridad().trim().toUpperCase() : "BAJA";
            String sev = "BAJA";
            if (raw.contains("CRITIC") || raw.contains("CRÍTICA")) {
                sev = "CRITICA";
            } else if (raw.contains("ALT")) {
                sev = "ALTA";
            } else if (raw.contains("MED")) {
                sev = "MEDIA";
            }
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

    // Actualiza el estado de atención y nota de respuesta para un error técnico (RF-24)
    public Error atenderError(Long idError, String estadoAtencion, String resolucionNota) {
        // Validaciones
        Error error = errorRepository.findById(idError)
                .orElseThrow(() -> new ResourceNotFoundException("Error no encontrado con ID: " + idError));
        
        // Validación Defensiva RF-24: Proteger trazabilidad y auditoría de incidencias ya resueltas
        if ("SOLUCIONADO".equalsIgnoreCase(error.getEstadoAtencion()) || "RESUELTO".equalsIgnoreCase(error.getEstadoAtencion())) {
            throw new BusinessLogicException("No se puede modificar una incidencia que ya ha sido marcada como resuelta.");
        }

        // Persistencia
        error.setEstadoAtencion(estadoAtencion != null ? estadoAtencion : "EN_REVISION");
        if (resolucionNota != null) {
            error.setResolucionNota(resolucionNota);
        }
        if ("SOLUCIONADO".equalsIgnoreCase(estadoAtencion) || "RESUELTO".equalsIgnoreCase(estadoAtencion)) {
            error.setFechaResolucion(LocalDateTime.now());
        }
        return errorRepository.save(error);
    }

    // Actualiza el estado de atención y observaciones para una interrupción operativa (RF-24)
    public Interrupcion atenderInterrupcion(Long idInterrupcion, String estadoAtencion, String resolucionNota) {
        // Validaciones
        Interrupcion interrupcion = interrupcionRepository.findById(idInterrupcion)
                .orElseThrow(() -> new ResourceNotFoundException("Interrupción no encontrada con ID: " + idInterrupcion));
        
        // Validación Defensiva RF-24: Proteger trazabilidad y auditoría de contingencias ya resueltas
        if ("SOLUCIONADO".equalsIgnoreCase(interrupcion.getEstadoAtencion()) || "RESUELTO".equalsIgnoreCase(interrupcion.getEstadoAtencion())) {
            throw new BusinessLogicException("No se puede modificar una incidencia que ya ha sido marcada como resuelta.");
        }

        // Persistencia
        interrupcion.setEstadoAtencion(estadoAtencion != null ? estadoAtencion : "EN_REVISION");
        if (resolucionNota != null) {
            interrupcion.setResolucionNota(resolucionNota);
        }
        if ("SOLUCIONADO".equalsIgnoreCase(estadoAtencion) || "RESUELTO".equalsIgnoreCase(estadoAtencion)) {
            interrupcion.setFechaResolucion(LocalDateTime.now());
        }
        return interrupcionRepository.save(interrupcion);
    }
}
