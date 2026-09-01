package com.ikernell.service;

import com.ikernell.exception.ResourceNotFoundException;
import com.ikernell.model.Proyecto;
import com.ikernell.model.ProyectoDesarrollador;
import com.ikernell.model.SolicitudContacto;
import com.ikernell.model.Trabajador;
import com.ikernell.repository.ProyectoDesarrolladorRepository;
import com.ikernell.repository.ProyectoRepository;
import com.ikernell.repository.SolicitudContactoRepository;
import com.ikernell.repository.TrabajadorRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ikernell.model.Etapa;
import com.ikernell.model.Actividad;
import com.ikernell.repository.EtapaRepository;
import com.ikernell.repository.ActividadRepository;
import com.ikernell.model.HistorialCambiosCoordinador;
import com.ikernell.repository.HistorialCambiosCoordinadorRepository;

// Servicio de negocio para la administración de personal y atención de consultas públicas
@Service
@Transactional
public class CoordinadorService {

    // Inyección de dependencias
    private final TrabajadorRepository trabajadorRepository;
    private final ProyectoRepository proyectoRepository;
    private final ProyectoDesarrolladorRepository proyectoDesarrolladorRepository;
    private final SolicitudContactoRepository solicitudContactoRepository;
    private final PasswordEncoder passwordEncoder;
    private final HistorialCambiosCoordinadorRepository historialCambiosCoordinadorRepository;
    private final EmailService emailService;
    private final EtapaRepository etapaRepository;
    private final ActividadRepository actividadRepository;

    public CoordinadorService(TrabajadorRepository trabajadorRepository,
            ProyectoRepository proyectoRepository,
            ProyectoDesarrolladorRepository proyectoDesarrolladorRepository,
            SolicitudContactoRepository solicitudContactoRepository,
            PasswordEncoder passwordEncoder,
            HistorialCambiosCoordinadorRepository historialCambiosCoordinadorRepository,
            EmailService emailService,
            EtapaRepository etapaRepository,
            ActividadRepository actividadRepository) {
        this.trabajadorRepository = trabajadorRepository;
        this.proyectoRepository = proyectoRepository;
        this.proyectoDesarrolladorRepository = proyectoDesarrolladorRepository;
        this.solicitudContactoRepository = solicitudContactoRepository;
        this.passwordEncoder = passwordEncoder;
        this.historialCambiosCoordinadorRepository = historialCambiosCoordinadorRepository;
        this.emailService = emailService;
        this.etapaRepository = etapaRepository;
        this.actividadRepository = actividadRepository;
    }

    // Registra un nuevo empleado cifrando la contraseña con BCrypt
    public Trabajador registrarTrabajador(Trabajador trabajador) {
        // 1. Validación de Unicidad de Cédula / Número de Identificación
        if (trabajador.getIdentificacion() != null && !trabajador.getIdentificacion().isBlank()) {
            String cleanId = trabajador.getIdentificacion().trim();
            trabajador.setIdentificacion(cleanId);
            if (trabajadorRepository.findByIdentificacionIgnoreCase(cleanId).isPresent()) {
                throw new IllegalArgumentException("La cédula / número de identificación '" + cleanId + "' ya se encuentra registrada en el sistema.");
            }
        }

        // 2. Validación de Unicidad de Correo Corporativo Único (@ikernell.org)
        if (trabajador.getEmail() != null && !trabajador.getEmail().isBlank()) {
            String cleanEmail = trabajador.getEmail().trim();
            if (!cleanEmail.toLowerCase().endsWith("@ikernell.org")) {
                if (cleanEmail.contains("@")) {
                    cleanEmail = cleanEmail.substring(0, cleanEmail.indexOf("@")) + "@ikernell.org";
                } else {
                    cleanEmail = cleanEmail + "@ikernell.org";
                }
            }

            if (trabajadorRepository.findByEmailIgnoreCase(cleanEmail).isPresent()) {
                throw new IllegalArgumentException("El correo electrónico corporativo '" + cleanEmail + "' ya se encuentra registrado por otro colaborador.");
            }
            trabajador.setEmail(cleanEmail);
        }

        // 3. Validación de Unicidad de Correo Personal / Alternativo
        if (trabajador.getEmailPersonal() != null && !trabajador.getEmailPersonal().isBlank()) {
            String cleanPersonal = trabajador.getEmailPersonal().trim();
            trabajador.setEmailPersonal(cleanPersonal);
            if (trabajadorRepository.findByEmailPersonalIgnoreCase(cleanPersonal).isPresent()) {
                throw new IllegalArgumentException("El correo electrónico personal '" + cleanPersonal + "' ya pertenece a otro colaborador registrado.");
            }
        }

        // Generar contraseña temporal segura SIEMPRE (aleatoria, nunca la del frontend)
        String rawPassword = generarPasswordTemporalSegura();

        // Persistencia
        trabajador.setPasswordHash(passwordEncoder.encode(rawPassword));
        trabajador.setEstado(true);
        trabajador.setPrimerLogin(true);
        Trabajador guardado = trabajadorRepository.save(trabajador);

        // Envío de correo electrónico con copia de prueba
        emailService.enviarCorreoCredencialesTemporales(
                guardado.getEmailPersonal(),
                guardado.getEmail(),
                rawPassword,
                guardado.getNombre() + " " + guardado.getApellido(),
                guardado.getRol() != null ? guardado.getRol().name() : "TRABAJADOR");

        return guardado;
    }

    private String generarPasswordTemporalSegura() {
        String uppers = "ABCDEFGHJKLMNPQRSTUVWXYZ";
        String lowers = "abcdefghijkmnopqrstuvwxyz";
        String numbers = "23456789";
        String symbols = "!@#$%&*";
        java.security.SecureRandom random = new java.security.SecureRandom();

        StringBuilder sb = new StringBuilder();
        sb.append(uppers.charAt(random.nextInt(uppers.length())));
        sb.append(lowers.charAt(random.nextInt(lowers.length())));
        sb.append(numbers.charAt(random.nextInt(numbers.length())));
        sb.append(symbols.charAt(random.nextInt(symbols.length())));

        String allChars = uppers + lowers + numbers + symbols;
        for (int i = 4; i < 12; i++) {
            sb.append(allChars.charAt(random.nextInt(allChars.length())));
        }
        return sb.toString();
    }

    // Consulta el listado completo de trabajadores
    @Transactional(readOnly = true)
    public List<Trabajador> listarTodosTrabajadores() {
        return trabajadorRepository.findAll();
    }

    // Consulta el listado completo de proyectos corporativos con inicialización de WBS
    @Transactional
    public List<Proyecto> listarTodosProyectos() {
        List<Proyecto> proyectos = proyectoRepository.findAll();
        for (Proyecto prj : proyectos) {
            if (prj.getEtapas() != null) {
                org.hibernate.Hibernate.initialize(prj.getEtapas());
                for (Etapa et : prj.getEtapas()) {
                    if (et.getActividades() != null) {
                        org.hibernate.Hibernate.initialize(et.getActividades());
                    }
                }
            }
            // Auto-generación de etapa y tarea inicial si el proyecto no posee fases WBS
            if (prj.getEtapas() == null || prj.getEtapas().isEmpty()) {
                if (etapaRepository != null) {
                    Etapa etapaInicial = new Etapa();
                    etapaInicial.setNombreEtapa("Fase 1: Levantamiento y Análisis de Requerimientos");
                    etapaInicial.setEstado("EN_PROGRESO");
                    etapaInicial.setProyecto(prj);
                    Etapa guardada = etapaRepository.save(etapaInicial);
                    
                    Actividad actInicial = new Actividad();
                    actInicial.setDescripcion("Análisis de Requerimientos y Definición de Alcance WBS");
                    actInicial.setEstado("PENDIENTE");
                    actInicial.setEtapa(guardada);
                    if (prj.getLider() != null) {
                        actInicial.setDesarrollador(prj.getLider());
                    }
                    if (actividadRepository != null) {
                        actividadRepository.save(actInicial);
                    }
                    
                    prj.getEtapas().add(guardada);
                }
            }
        }
        return proyectos;
    }

    // Elimina una fase WBS si no contiene tareas asociadas
    @Transactional
    public void eliminarEtapa(Long idEtapa) {
        if (!etapaRepository.existsById(idEtapa)) {
            throw new ResourceNotFoundException("Etapa no encontrada con ID: " + idEtapa);
        }
        Etapa etapa = etapaRepository.findById(idEtapa).get();
        if (etapa.getProyecto() != null &&
                ("FINALIZADO".equalsIgnoreCase(etapa.getProyecto().getEstado())
                        || "COMPLETADO".equalsIgnoreCase(etapa.getProyecto().getEstado()))) {
            throw new IllegalStateException("El proyecto se encuentra finalizado. No se pueden alterar fases de un proyecto cerrado.");
        }
        if (etapa.getActividades() != null && !etapa.getActividades().isEmpty()) {
            throw new IllegalStateException("No se puede eliminar una etapa que contiene actividades asociadas.");
        }
        etapaRepository.deleteById(idEtapa);
    }

    // Consulta paginada para listas de personal extensas
    @Transactional(readOnly = true)
    public Page<Trabajador> listarTrabajadoresPaginado(Pageable pageable) {
        return trabajadorRepository.findAll(pageable);
    }

    // Busca un empleado por su ID único
    @Transactional(readOnly = true)
    public Trabajador obtenerPorId(Long id) {
        return trabajadorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trabajador no encontrado con ID: " + id));
    }

    // Actualiza datos del perfil y cifra la contraseña si fue modificada
    public Trabajador actualizarTrabajador(Long id, Trabajador datosActualizados) {
        // Validaciones
        Trabajador existente = obtenerPorId(id);

        existente.setNombre(datosActualizados.getNombre());
        existente.setApellido(datosActualizados.getApellido());
        existente.setIdentificacion(datosActualizados.getIdentificacion());
        if (datosActualizados.getFechaNacimiento() != null) {
            existente.setFechaNacimiento(datosActualizados.getFechaNacimiento());
        }
        existente.setDireccion(datosActualizados.getDireccion());
        existente.setProfesion(datosActualizados.getProfesion());
        existente.setEspecialidad(datosActualizados.getEspecialidad());
        existente.setFotoUrl(datosActualizados.getFotoUrl());
        existente.setRol(datosActualizados.getRol());
        existente.setEmail(datosActualizados.getEmail());

        if (datosActualizados.getPasswordHash() != null && !datosActualizados.getPasswordHash().isBlank()) {
            existente.setPasswordHash(passwordEncoder.encode(datosActualizados.getPasswordHash()));
        }

        // Persistencia
        return trabajadorRepository.save(existente);
    }

    // Alterna el estado habilitado/inhabilitado del trabajador
    public Trabajador cambiarEstadoTrabajador(Long id) {
        // Validaciones
        Trabajador trabajador = obtenerPorId(id);

        // Persistencia
        boolean nuevoEstado = !Boolean.TRUE.equals(trabajador.getEstado());
        trabajador.setEstado(nuevoEstado);
        return trabajadorRepository.save(trabajador);
    }

    // Deshabilita el acceso de un trabajador
    public void inhabilitarTrabajador(Long id) {
        Trabajador trabajador = obtenerPorId(id);
        trabajador.setEstado(false);
        trabajadorRepository.save(trabajador);
    }

    // Inhabilita a un Líder y transfiere todos sus proyectos activos a un nuevo
    // Líder asignado
    public Trabajador inhabilitarLiderYReasignarProyectos(Long idLiderInhabilitar, Long idNuevoLiderTarget) {
        Trabajador liderSaliente = obtenerPorId(idLiderInhabilitar);
        Trabajador nuevoLider = obtenerPorId(idNuevoLiderTarget);

        if (!Boolean.TRUE.equals(nuevoLider.getEstado())) {
            throw new IllegalArgumentException("El nuevo líder seleccionado no se encuentra activo en la empresa.");
        }

        // 1. Reasignar todos los proyectos del líder saliente al nuevo líder
        List<Proyecto> proyectosAfectados = proyectoRepository.findByLider(liderSaliente);
        for (Proyecto p : proyectosAfectados) {
            p.setIdLiderAnterior(liderSaliente.getIdTrabajador());
            p.setNombreLiderAnterior(liderSaliente.getNombre() + " " + liderSaliente.getApellido());
            p.setLider(nuevoLider);
            p.setReasignado(true);
            p.setFechaReasignacion(java.time.LocalDateTime.now());
            p.setMotivoReasignacion("Reasignación masiva de portafolio por inhabilitación directiva.");
            p.setLeidoPorLiderAnterior(false);
            proyectoRepository.save(p);
        }

        // 2. Inhabilitar acceso del líder saliente
        liderSaliente.setEstado(false);
        return trabajadorRepository.save(liderSaliente);
    }

    // Reasigna la dirección de un proyecto específico a un nuevo Líder
    @Transactional
    public Proyecto reasignarLiderAProyecto(Long idProyecto, Long idNuevoLiderTarget, String motivo) {
        Proyecto proyecto = proyectoRepository.findById(idProyecto)
                .orElseThrow(() -> new ResourceNotFoundException("Proyecto no encontrado con ID: " + idProyecto));
        Trabajador nuevoLider = obtenerPorId(idNuevoLiderTarget);

        if (!Boolean.TRUE.equals(nuevoLider.getEstado())) {
            throw new IllegalArgumentException("El nuevo líder seleccionado no se encuentra activo en la empresa.");
        }

        if (proyecto.getLider() != null) {
            proyecto.setIdLiderAnterior(proyecto.getLider().getIdTrabajador());
            proyecto.setNombreLiderAnterior(proyecto.getLider().getNombre() + " " + proyecto.getLider().getApellido());
        }

        proyecto.setLider(nuevoLider);
        proyecto.setReasignado(true);
        proyecto.setFechaReasignacion(java.time.LocalDateTime.now());
        proyecto.setMotivoReasignacion(
                motivo != null && !motivo.isBlank() ? motivo : "Reasignación de dirección de proyecto.");
        proyecto.setLeidoPorLiderAnterior(false);

        return proyectoRepository.save(proyecto);
    }

    @Transactional
    public Proyecto confirmarLecturaReasignacion(Long idProyecto) {
        Proyecto proyecto = proyectoRepository.findById(idProyecto)
                .orElseThrow(() -> new ResourceNotFoundException("Proyecto no encontrado con ID: " + idProyecto));
        proyecto.setLeidoPorLiderAnterior(true);
        return proyectoRepository.save(proyecto);
    }

    // Asigna un desarrollador al equipo general de un proyecto
    public ProyectoDesarrollador asignarProyectoADesarrollador(Long idProyecto, Long idDesarrollador) {
        // Validaciones
        Proyecto proyecto = proyectoRepository.findById(idProyecto)
                .orElseThrow(() -> new ResourceNotFoundException("Proyecto no encontrado con ID: " + idProyecto));
        Trabajador desarrollador = obtenerPorId(idDesarrollador);

        // Persistencia
        ProyectoDesarrollador asignacion = new ProyectoDesarrollador();
        asignacion.setProyecto(proyecto);
        asignacion.setDesarrollador(desarrollador);

        return proyectoDesarrolladorRepository.save(asignacion);
    }

    // Listado de solicitudes de contacto ordenadas de la más reciente a la más
    // antigua
    @Transactional(readOnly = true)
    public List<SolicitudContacto> listarSolicitudes() {
        return solicitudContactoRepository.findAllByOrderByFechaEnvioDesc();
    }

    // Gestiona una solicitud con notas de atención detalladas o justificación de
    // reapertura
    public SolicitudContacto gestionarSolicitud(Long idSolicitud, com.ikernell.dto.GestionarSolicitudRequest request,
            String emailCoordinador) {
        SolicitudContacto solicitud = solicitudContactoRepository.findById(idSolicitud)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Solicitud de contacto no encontrada con ID: " + idSolicitud));

        String nuevoEstado = request != null && request.getEstado() != null ? request.getEstado().toUpperCase()
                : "ATENDIDA";
        String coordInfo = "Coordinador";
        if (emailCoordinador != null) {
            var coordOpt = trabajadorRepository.findByEmail(emailCoordinador);
            if (coordOpt.isPresent()) {
                solicitud.setCoordinador(coordOpt.get());
                coordInfo = coordOpt.get().getNombre() + " " + coordOpt.get().getApellido();
            }
        }

        LocalDateTime ahora = LocalDateTime.now();
        StringBuilder auditLog = new StringBuilder();
        if (solicitud.getHistorialAtencion() != null && !solicitud.getHistorialAtencion().isBlank()) {
            auditLog.append(solicitud.getHistorialAtencion()).append("\n");
        }

        if ("ATENDIDA".equals(nuevoEstado)) {
            solicitud.setAtendido(true);
            solicitud.setEstado("ATENDIDA");
            solicitud.setFechaAtencion(ahora);
            if (request != null && request.getNotasAtencion() != null && !request.getNotasAtencion().isBlank()) {
                solicitud.setNotasAtencion(request.getNotasAtencion().trim());
            }
            auditLog.append("[").append(ahora).append("] ATENDIDA por ").append(coordInfo)
                    .append(" | Acciones/Notas: ")
                    .append(solicitud.getNotasAtencion() != null ? solicitud.getNotasAtencion()
                            : "Sin observaciones adicionales");
        } else if ("REABIERTA".equals(nuevoEstado) || "PENDIENTE".equals(nuevoEstado)
                || "EN_PROCESO".equals(nuevoEstado)) {
            solicitud.setAtendido(false);
            solicitud.setEstado(nuevoEstado);
            solicitud.setFechaReapertura(ahora);
            solicitud.setContadorReaperturas(solicitud.getContadorReaperturas() + 1);
            if (request != null && request.getMotivoReapertura() != null && !request.getMotivoReapertura().isBlank()) {
                solicitud.setMotivoReapertura(request.getMotivoReapertura().trim());
            }
            auditLog.append("[").append(ahora).append("] REABIERTA a estado ").append(nuevoEstado).append(" por ")
                    .append(coordInfo)
                    .append(" (Reapertura #").append(solicitud.getContadorReaperturas()).append(")")
                    .append(" | Motivo: ")
                    .append(solicitud.getMotivoReapertura() != null ? solicitud.getMotivoReapertura()
                            : "Reapertura de caso para seguimiento comercial");
        }

        solicitud.setHistorialAtencion(auditLog.toString());
        return solicitudContactoRepository.save(solicitud);
    }

    // Alterna el estado de atención de la solicitud y asocia al coordinador
    // responsable
    public SolicitudContacto toggleEstadoSolicitud(Long idSolicitud, String emailCoordinador) {
        SolicitudContacto solicitud = solicitudContactoRepository.findById(idSolicitud)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Solicitud de contacto no encontrada con ID: " + idSolicitud));

        boolean esAtendida = "ATENDIDA".equalsIgnoreCase(solicitud.getEstado())
                || Boolean.TRUE.equals(solicitud.getAtendido());
        String targetEstado = esAtendida ? "REABIERTA" : "ATENDIDA";
        com.ikernell.dto.GestionarSolicitudRequest req = new com.ikernell.dto.GestionarSolicitudRequest();
        req.setEstado(targetEstado);
        if (esAtendida) {
            req.setMotivoReapertura("Reapertura rápida desde bandeja de solicitudes");
        } else {
            req.setNotasAtencion("Atención rápida registrada por Coordinador");
        }
        return gestionarSolicitud(idSolicitud, req, emailCoordinador);
    }

    // Registra una nueva solicitud proveniente del portal público
    public SolicitudContacto registrarSolicitudContacto(SolicitudContacto solicitud) {
        solicitud.setFechaEnvio(LocalDateTime.now());
        solicitud.setAtendido(false);
        solicitud.setEstado("PENDIENTE");
        solicitud.setContadorReaperturas(0);
        solicitud.setHistorialAtencion(
                "[" + LocalDateTime.now() + "] Solicitud registrada desde el formulario web público.");
        return solicitudContactoRepository.save(solicitud);
    }

    @Transactional
    public HistorialCambiosCoordinador registrarCambioCoordinador(Long idProyecto, Long idCoordinador,
            String nombreCoordinador, String emailCoordinador, String accion, String detalles, String batchId) {
        Proyecto proyecto = proyectoRepository.findById(idProyecto)
                .orElseThrow(() -> new ResourceNotFoundException("Proyecto no encontrado con ID: " + idProyecto));

        HistorialCambiosCoordinador registro = new HistorialCambiosCoordinador(
                proyecto, idCoordinador, nombreCoordinador, emailCoordinador, accion, detalles, LocalDateTime.now(),
                batchId);
        return historialCambiosCoordinadorRepository.save(registro);
    }

    @Transactional(readOnly = true)
    public List<HistorialCambiosCoordinador> obtenerHistorialCambiosProyecto(Long idProyecto) {
        return historialCambiosCoordinadorRepository.findByProyectoIdProyectoOrderByFechaCambioDesc(idProyecto);
    }
}
