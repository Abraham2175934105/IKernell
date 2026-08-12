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
        // Validaciones
        String rawPassword = (trabajador.getPasswordHash() != null && !trabajador.getPasswordHash().isBlank())
                ? trabajador.getPasswordHash()
                : "abrah1234";

        // Persistencia
        trabajador.setPasswordHash(passwordEncoder.encode(rawPassword));
        trabajador.setEstado(true);
        return trabajadorRepository.save(trabajador);
    }

    // Consulta el listado completo de trabajadores
    @Transactional(readOnly = true)
    public List<Trabajador> listarTodosTrabajadores() {
        return trabajadorRepository.findAll();
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

    // Alterna el estado de atención de la solicitud y asocia al coordinador responsable
    public SolicitudContacto toggleEstadoSolicitud(Long idSolicitud, String emailCoordinador) {
        // Validaciones
        SolicitudContacto solicitud = solicitudContactoRepository.findById(idSolicitud)
                .orElseThrow(() -> new ResourceNotFoundException("Solicitud de contacto no encontrada con ID: " + idSolicitud));

        boolean nuevoEstado = !Boolean.TRUE.equals(solicitud.getAtendido());
        solicitud.setAtendido(nuevoEstado);

        if (nuevoEstado && emailCoordinador != null) {
            trabajadorRepository.findByEmail(emailCoordinador).ifPresent(solicitud::setCoordinador);
        } else if (!nuevoEstado) {
            solicitud.setCoordinador(null);
        }

        // Persistencia
        return solicitudContactoRepository.save(solicitud);
    }

    // Registra una nueva solicitud proveniente del portal público
    public SolicitudContacto registrarSolicitudContacto(SolicitudContacto solicitud) {
        // Persistencia
        solicitud.setFechaEnvio(LocalDateTime.now());
        solicitud.setAtendido(false);
        return solicitudContactoRepository.save(solicitud);
    }
}
