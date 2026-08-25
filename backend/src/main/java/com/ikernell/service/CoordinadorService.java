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

import java.time.LocalDateTime;
import java.util.List;

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

    public CoordinadorService(TrabajadorRepository trabajadorRepository,
                              ProyectoRepository proyectoRepository,
                              ProyectoDesarrolladorRepository proyectoDesarrolladorRepository,
                              SolicitudContactoRepository solicitudContactoRepository,
                              PasswordEncoder passwordEncoder) {
        this.trabajadorRepository = trabajadorRepository;
        this.proyectoRepository = proyectoRepository;
        this.proyectoDesarrolladorRepository = proyectoDesarrolladorRepository;
        this.solicitudContactoRepository = solicitudContactoRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Registra un nuevo empleado cifrando la contraseña con BCrypt
    public Trabajador registrarTrabajador(Trabajador trabajador) {
        // Auto-completado de dominio corporativo si falta @ikernell.org
        if (trabajador.getEmail() != null) {
            String cleanEmail = trabajador.getEmail().trim();
            if (!cleanEmail.toLowerCase().endsWith("@ikernell.org")) {
                if (cleanEmail.contains("@")) {
                    cleanEmail = cleanEmail.substring(0, cleanEmail.indexOf("@")) + "@ikernell.org";
                } else {
                    cleanEmail = cleanEmail + "@ikernell.org";
                }
            }
            trabajador.setEmail(cleanEmail);
        }

        if (trabajador.getEmailPersonal() != null) {
            trabajador.setEmailPersonal(trabajador.getEmailPersonal().trim());
        }

        // Validaciones
        String rawPassword = (trabajador.getPasswordHash() != null && !trabajador.getPasswordHash().isBlank())
                ? trabajador.getPasswordHash()
                : "abrah1234";

        // Persistencia
        trabajador.setPasswordHash(passwordEncoder.encode(rawPassword));
        trabajador.setEstado(true);
        trabajador.setPrimerLogin(true);
        return trabajadorRepository.save(trabajador);
    }

    // Consulta el listado completo de trabajadores
    @Transactional(readOnly = true)
    public List<Trabajador> listarTodosTrabajadores() {
        return trabajadorRepository.findAll();
    }

    // Consulta el listado completo de proyectos corporativos
    @Transactional(readOnly = true)
    public List<Proyecto> listarTodosProyectos() {
        return proyectoRepository.findAll();
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

    // Inhabilita a un Líder y transfiere todos sus proyectos activos a un nuevo Líder asignado
    public Trabajador inhabilitarLiderYReasignarProyectos(Long idLiderInhabilitar, Long idNuevoLiderTarget) {
        Trabajador liderSaliente = obtenerPorId(idLiderInhabilitar);
        Trabajador nuevoLider = obtenerPorId(idNuevoLiderTarget);

        if (!Boolean.TRUE.equals(nuevoLider.getEstado())) {
            throw new IllegalArgumentException("El nuevo líder seleccionado no se encuentra activo en la empresa.");
        }

        // 1. Reasignar todos los proyectos del líder saliente al nuevo líder
        List<Proyecto> proyectosAfectados = proyectoRepository.findByLider(liderSaliente);
        for (Proyecto p : proyectosAfectados) {
            p.setLider(nuevoLider);
            p.setReasignado(true);
            proyectoRepository.save(p);
        }

        // 2. Inhabilitar acceso del líder saliente
        liderSaliente.setEstado(false);
        return trabajadorRepository.save(liderSaliente);
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

    // Listado de solicitudes de contacto ordenadas de la más reciente a la más antigua
    @Transactional(readOnly = true)
    public List<SolicitudContacto> listarSolicitudes() {
        return solicitudContactoRepository.findAllByOrderByFechaEnvioDesc();
    }

    // Gestiona una solicitud con notas de atención detalladas o justificación de reapertura
    public SolicitudContacto gestionarSolicitud(Long idSolicitud, com.ikernell.dto.GestionarSolicitudRequest request, String emailCoordinador) {
        SolicitudContacto solicitud = solicitudContactoRepository.findById(idSolicitud)
                .orElseThrow(() -> new ResourceNotFoundException("Solicitud de contacto no encontrada con ID: " + idSolicitud));

        String nuevoEstado = request != null && request.getEstado() != null ? request.getEstado().toUpperCase() : "ATENDIDA";
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
                    .append(" | Acciones/Notas: ").append(solicitud.getNotasAtencion() != null ? solicitud.getNotasAtencion() : "Sin observaciones adicionales");
        } else if ("REABIERTA".equals(nuevoEstado) || "PENDIENTE".equals(nuevoEstado) || "EN_PROCESO".equals(nuevoEstado)) {
            solicitud.setAtendido(false);
            solicitud.setEstado(nuevoEstado);
            solicitud.setFechaReapertura(ahora);
            solicitud.setContadorReaperturas(solicitud.getContadorReaperturas() + 1);
            if (request != null && request.getMotivoReapertura() != null && !request.getMotivoReapertura().isBlank()) {
                solicitud.setMotivoReapertura(request.getMotivoReapertura().trim());
            }
            auditLog.append("[").append(ahora).append("] REABIERTA a estado ").append(nuevoEstado).append(" por ").append(coordInfo)
                    .append(" (Reapertura #").append(solicitud.getContadorReaperturas()).append(")")
                    .append(" | Motivo: ").append(solicitud.getMotivoReapertura() != null ? solicitud.getMotivoReapertura() : "Reapertura de caso para seguimiento comercial");
        }

        solicitud.setHistorialAtencion(auditLog.toString());
        return solicitudContactoRepository.save(solicitud);
    }

    // Alterna el estado de atención de la solicitud y asocia al coordinador responsable
    public SolicitudContacto toggleEstadoSolicitud(Long idSolicitud, String emailCoordinador) {
        SolicitudContacto solicitud = solicitudContactoRepository.findById(idSolicitud)
                .orElseThrow(() -> new ResourceNotFoundException("Solicitud de contacto no encontrada con ID: " + idSolicitud));

        boolean esAtendida = "ATENDIDA".equalsIgnoreCase(solicitud.getEstado()) || Boolean.TRUE.equals(solicitud.getAtendido());
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
        solicitud.setHistorialAtencion("[" + LocalDateTime.now() + "] Solicitud registrada desde el formulario web público.");
        return solicitudContactoRepository.save(solicitud);
    }
}
