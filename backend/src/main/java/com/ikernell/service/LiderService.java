package com.ikernell.service;

import com.ikernell.exception.ResourceNotFoundException;
import com.ikernell.model.*;
import com.ikernell.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Servicio de negocio para la gestión de proyectos, estructura WBS (Etapas) y asignaciones granulares del LÍDER DE PROYECTO.
 * <p>
 * Refactorizado bajo pautas SOLID:
 * - SRP: Aísla las operaciones de planificación y asignación de actividades WBS.
 * - Inyección limpia mediante constructor y tipificación clara de errores para @RestControllerAdvice.
 * </p>
 */
@Service
@Transactional
public class LiderService {

    private final ProyectoRepository proyectoRepository;
    private final EtapaRepository etapaRepository;
    private final ActividadRepository actividadRepository;
    private final TrabajadorRepository trabajadorRepository;
    private final ProyectoDesarrolladorRepository proyectoDesarrolladorRepository;

    public LiderService(ProyectoRepository proyectoRepository,
                        EtapaRepository etapaRepository,
                        ActividadRepository actividadRepository,
                        TrabajadorRepository trabajadorRepository,
                        ProyectoDesarrolladorRepository proyectoDesarrolladorRepository) {
        this.proyectoRepository = proyectoRepository;
        this.etapaRepository = etapaRepository;
        this.actividadRepository = actividadRepository;
        this.trabajadorRepository = trabajadorRepository;
        this.proyectoDesarrolladorRepository = proyectoDesarrolladorRepository;
    }

    /**
     * RF-14: Creación de un proyecto asignando un líder responsable.
     */
    public Proyecto crearProyecto(Proyecto proyecto, Long idLider) {
        Trabajador lider = trabajadorRepository.findById(idLider)
                .orElseThrow(() -> new ResourceNotFoundException("Líder no encontrado con ID: " + idLider));
        proyecto.setLider(lider);
        return proyectoRepository.save(proyecto);
    }

    /**
     * RF-14: Modificación de los atributos principales de un proyecto.
     */
    public Proyecto actualizarProyecto(Long idProyecto, Proyecto datos) {
        Proyecto proyecto = proyectoRepository.findById(idProyecto)
                .orElseThrow(() -> new ResourceNotFoundException("Proyecto no encontrado con ID: " + idProyecto));
        
        proyecto.setNombre(datos.getNombre());
        proyecto.setDescripcion(datos.getDescripcion());
        proyecto.setFechaInicio(datos.getFechaInicio());
        proyecto.setFechaFinEstimada(datos.getFechaFinEstimada());
        proyecto.setEstado(datos.getEstado());
        return proyectoRepository.save(proyecto);
    }

    /**
     * Inhabilitación lógica del proyecto (cambio de estado).
     */
    public void inhabilitarProyecto(Long idProyecto) {
        Proyecto proyecto = proyectoRepository.findById(idProyecto)
                .orElseThrow(() -> new ResourceNotFoundException("Proyecto no encontrado con ID: " + idProyecto));
        proyecto.setEstado("INHABILITADO");
        proyectoRepository.save(proyecto);
    }

    /**
     * RF-15: Registro de etapas que forman el WBS de un proyecto.
     */
    public Etapa registrarEtapa(Long idProyecto, Etapa etapa) {
        Proyecto proyecto = proyectoRepository.findById(idProyecto)
                .orElseThrow(() -> new ResourceNotFoundException("Proyecto no encontrado con ID: " + idProyecto));
        etapa.setProyecto(proyecto);
        return etapaRepository.save(etapa);
    }

    /**
     * RF-15: Eliminación de etapa del WBS (siempre que no tenga dependencias operativas).
     */
    public void eliminarEtapa(Long idEtapa) {
        if (!etapaRepository.existsById(idEtapa)) {
            throw new ResourceNotFoundException("Etapa no encontrada con ID: " + idEtapa);
        }
        etapaRepository.deleteById(idEtapa);
    }

    /**
     * RF-16: Asociación de un desarrollador específico a la planilla del proyecto.
     */
    public ProyectoDesarrollador asignarDesarrollador(Long idProyecto, Long idDesarrollador) {
        Proyecto proyecto = proyectoRepository.findById(idProyecto)
                .orElseThrow(() -> new ResourceNotFoundException("Proyecto no encontrado con ID: " + idProyecto));
        Trabajador desarrollador = trabajadorRepository.findById(idDesarrollador)
                .orElseThrow(() -> new ResourceNotFoundException("Desarrollador no encontrado con ID: " + idDesarrollador));

        ProyectoDesarrollador asignacion = new ProyectoDesarrollador();
        asignacion.setProyecto(proyecto);
        asignacion.setDesarrollador(desarrollador);
        return proyectoDesarrolladorRepository.save(asignacion);
    }

    /**
     * RF-17: Asignación de actividades operativas específicas dentro de una etapa para un desarrollador.
     */
    public Actividad asignarActividad(Long idEtapa, Long idDesarrollador, Actividad actividad) {
        Etapa etapa = etapaRepository.findById(idEtapa)
                .orElseThrow(() -> new ResourceNotFoundException("Etapa no encontrada con ID: " + idEtapa));
        Trabajador desarrollador = trabajadorRepository.findById(idDesarrollador)
                .orElseThrow(() -> new ResourceNotFoundException("Desarrollador no encontrado con ID: " + idDesarrollador));

        actividad.setEtapa(etapa);
        actividad.setDesarrollador(desarrollador);
        return actividadRepository.save(actividad);
    }

    /**
     * Listado de los proyectos liderados por un trabajador concreto.
     */
    @Transactional(readOnly = true)
    public List<Proyecto> listarProyectosPorLider(Long idLider) {
        Trabajador lider = trabajadorRepository.findById(idLider)
                .orElseThrow(() -> new ResourceNotFoundException("Líder no encontrado con ID: " + idLider));
        return proyectoRepository.findByLider(lider);
    }
}
