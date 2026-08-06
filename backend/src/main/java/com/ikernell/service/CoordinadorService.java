package com.ikernell.service;

import com.ikernell.exception.ResourceNotFoundException;
import com.ikernell.model.Proyecto;
import com.ikernell.model.ProyectoDesarrollador;
import com.ikernell.model.Trabajador;
import com.ikernell.repository.ProyectoDesarrolladorRepository;
import com.ikernell.repository.ProyectoRepository;
import com.ikernell.repository.TrabajadorRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Servicio de lógica de negocio para las operaciones del rol COORDINADOR.
 * <p>
 * Principios SOLID aplicados:
 * - SRP (Single Responsibility): Enfocado exclusivamente en la gestión del personal y sus asignaciones iniciales.
 * - DIP (Dependency Inversion): Depende de abstracciones (repositorios e interfaces como PasswordEncoder), 
 *   inyectadas por constructor para garantizar la inmutabilidad de dependencias y facilitar pruebas unitarias.
 * </p>
 */
@Service
@Transactional
public class CoordinadorService {

    private final TrabajadorRepository trabajadorRepository;
    private final ProyectoRepository proyectoRepository;
    private final ProyectoDesarrolladorRepository proyectoDesarrolladorRepository;
    private final PasswordEncoder passwordEncoder;

    public CoordinadorService(TrabajadorRepository trabajadorRepository,
                              ProyectoRepository proyectoRepository,
                              ProyectoDesarrolladorRepository proyectoDesarrolladorRepository,
                              PasswordEncoder passwordEncoder) {
        this.trabajadorRepository = trabajadorRepository;
        this.proyectoRepository = proyectoRepository;
        this.proyectoDesarrolladorRepository = proyectoDesarrolladorRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * RF-08, RF-09: Registro de personal asegurando encriptación BCrypt para contraseñas.
     * @param trabajador Entidad con la información del nuevo trabajador.
     * @return Trabajador registrado con estado activo y contraseña cifrada.
     */
    public Trabajador registrarTrabajador(Trabajador trabajador) {
        if (trabajador.getPasswordHash() != null) {
            trabajador.setPasswordHash(passwordEncoder.encode(trabajador.getPasswordHash()));
        }
        trabajador.setEstado(true);
        return trabajadorRepository.save(trabajador);
    }

    /**
     * RF-10: Búsqueda y listado general del personal.
     */
    @Transactional(readOnly = true)
    public List<Trabajador> listarTodosTrabajadores() {
        return trabajadorRepository.findAll();
    }

    /**
     * Obtiene un trabajador por su identificador único.
     * @throws ResourceNotFoundException si el trabajador no existe en base de datos.
     */
    @Transactional(readOnly = true)
    public Trabajador obtenerPorId(Long id) {
        return trabajadorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trabajador no encontrado con ID: " + id));
    }

    /**
     * RF-10: Edición del perfil de un trabajador existente.
     * @param id Identificador del trabajador a editar.
     * @param datosActualizados Nuevos datos a persistir.
     */
    public Trabajador actualizarTrabajador(Long id, Trabajador datosActualizados) {
        Trabajador existente = obtenerPorId(id);

        existente.setNombre(datosActualizados.getNombre());
        existente.setApellido(datosActualizados.getApellido());
        existente.setIdentificacion(datosActualizados.getIdentificacion());
        existente.setFechaNacimiento(datosActualizados.getFechaNacimiento());
        existente.setDireccion(datosActualizados.getDireccion());
        existente.setProfesion(datosActualizados.getProfesion());
        existente.setEspecialidad(datosActualizados.getEspecialidad());
        existente.setFotoUrl(datosActualizados.getFotoUrl());
        existente.setRol(datosActualizados.getRol());
        existente.setEmail(datosActualizados.getEmail());

        if (datosActualizados.getPasswordHash() != null && !datosActualizados.getPasswordHash().isBlank()) {
            existente.setPasswordHash(passwordEncoder.encode(datosActualizados.getPasswordHash()));
        }

        return trabajadorRepository.save(existente);
    }

    /**
     * RF-11: Inhabilitación lógica del trabajador sin destruir el historial referencial.
     * @param id ID del trabajador a inhabilitar.
     */
    public void inhabilitarTrabajador(Long id) {
        Trabajador trabajador = obtenerPorId(id);
        trabajador.setEstado(false);
        trabajadorRepository.save(trabajador);
    }

    /**
     * RF-12: Asignación operativa inicial del desarrollador hacia el proyecto general.
     */
    public ProyectoDesarrollador asignarProyectoADesarrollador(Long idProyecto, Long idDesarrollador) {
        Proyecto proyecto = proyectoRepository.findById(idProyecto)
                .orElseThrow(() -> new ResourceNotFoundException("Proyecto no encontrado con ID: " + idProyecto));
        Trabajador desarrollador = obtenerPorId(idDesarrollador);

        ProyectoDesarrollador asignacion = new ProyectoDesarrollador();
        asignacion.setProyecto(proyecto);
        asignacion.setDesarrollador(desarrollador);

        return proyectoDesarrolladorRepository.save(asignacion);
    }
}
