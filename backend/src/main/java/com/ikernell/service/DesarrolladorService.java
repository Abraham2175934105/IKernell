package com.ikernell.service;

import com.ikernell.dto.ErrorDto;
import com.ikernell.dto.InterrupcionDto;
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
public class DesarrolladorService {

    private static final Set<String> ESTADOS_VALIDOS = Set.of("PENDIENTE", "EN_PROGRESO", "FINALIZADA");

    // Inyección de dependencias
    private final ErrorRepository errorRepository;
    private final InterrupcionRepository interrupcionRepository;
    private final EtapaRepository etapaRepository;
    private final TrabajadorRepository trabajadorRepository;
    private final ActividadRepository actividadRepository;

    public DesarrolladorService(ErrorRepository errorRepository,
                                InterrupcionRepository interrupcionRepository,
                                EtapaRepository etapaRepository,
                                TrabajadorRepository trabajadorRepository,
                                ActividadRepository actividadRepository) {
        this.errorRepository = errorRepository;
        this.interrupcionRepository = interrupcionRepository;
        this.etapaRepository = etapaRepository;
        this.trabajadorRepository = trabajadorRepository;
        this.actividadRepository = actividadRepository;
    }

    // Registra un error técnico asociándolo a la etapa WBS y al desarrollador autenticado
    public Error registrarError(ErrorDto errorDto, String emailDesarrollador) {
        // Validaciones
        Trabajador desarrollador = trabajadorRepository.findByEmail(emailDesarrollador)
                .orElseThrow(() -> new ResourceNotFoundException("Desarrollador no encontrado con email: " + emailDesarrollador));

        Etapa etapa = etapaRepository.findById(errorDto.getIdEtapa())
                .orElseThrow(() -> new ResourceNotFoundException("Fase / Etapa (WBS) no encontrada con ID: " + errorDto.getIdEtapa()));

        // Persistencia
        Error error = new Error();
        error.setEtapa(etapa);
        error.setDesarrollador(desarrollador);
        error.setTipoError(errorDto.getTipoError());
        error.setSeveridad(errorDto.getSeveridad());
        error.setDescripcion(errorDto.getDescripcion());
        error.setFechaRegistro(errorDto.getFechaRegistro() != null ? errorDto.getFechaRegistro() : LocalDateTime.now());

        return errorRepository.save(error);
    }

    // Registra contingencias o tiempos muertos que impactan las métricas del proyecto
    public Interrupcion registrarInterrupcion(InterrupcionDto interrupcionDto, String emailDesarrollador) {
        // Validaciones
        Trabajador desarrollador = trabajadorRepository.findByEmail(emailDesarrollador)
                .orElseThrow(() -> new ResourceNotFoundException("Desarrollador no encontrado con email: " + emailDesarrollador));

        Etapa etapa = etapaRepository.findById(interrupcionDto.getIdEtapa())
                .orElseThrow(() -> new ResourceNotFoundException("Fase / Etapa (WBS) no encontrada con ID: " + interrupcionDto.getIdEtapa()));

        // Persistencia
        Interrupcion interrupcion = new Interrupcion();
        interrupcion.setEtapa(etapa);
        interrupcion.setDesarrollador(desarrollador);
        interrupcion.setTipoInterrupcion(interrupcionDto.getTipoInterrupcion());
        interrupcion.setFechaOcurrencia(interrupcionDto.getFechaOcurrencia() != null ? interrupcionDto.getFechaOcurrencia() : LocalDateTime.now());
        interrupcion.setDuracionMinutos(interrupcionDto.getDuracionMinutos());
        interrupcion.setComentarios(interrupcionDto.getComentarios());

        return interrupcionRepository.save(interrupcion);
    }

    // Consulta el tablero de tareas asignadas al usuario en sesión
    @Transactional(readOnly = true)
    public List<Actividad> obtenerMisActividades(String emailDesarrollador) {
        Trabajador desarrollador = trabajadorRepository.findByEmail(emailDesarrollador)
                .orElseThrow(() -> new ResourceNotFoundException("Desarrollador no encontrado con email: " + emailDesarrollador));
        return actividadRepository.findByDesarrollador(desarrollador);
    }

    // Consulta paginada de actividades para vistas extensas
    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<Actividad> obtenerMisActividadesPaginado(String emailDesarrollador, org.springframework.data.domain.Pageable pageable) {
        Trabajador desarrollador = trabajadorRepository.findByEmail(emailDesarrollador)
                .orElseThrow(() -> new ResourceNotFoundException("Desarrollador no encontrado con email: " + emailDesarrollador));
        return actividadRepository.findByDesarrollador(desarrollador, pageable);
    }

    // Cambia el estado de la tarea verificando permisos de propiedad sobre la actividad
    public Actividad cambiarEstadoActividad(Long idActividad, String nuevoEstado, String emailDesarrollador) {
        // Validaciones
        if (!ESTADOS_VALIDOS.contains(nuevoEstado)) {
            throw new BusinessLogicException("Estado inválido: '" + nuevoEstado + "'. Estados permitidos: " + ESTADOS_VALIDOS);
        }

        Trabajador desarrollador = trabajadorRepository.findByEmail(emailDesarrollador)
                .orElseThrow(() -> new ResourceNotFoundException("Desarrollador no encontrado con email: " + emailDesarrollador));

        Actividad actividad = actividadRepository.findById(idActividad)
                .orElseThrow(() -> new ResourceNotFoundException("Actividad no encontrada con ID: " + idActividad));

        // Verificamos que solo el desarrollador asignado pueda actualizar su propia tarea
        if (!actividad.getDesarrollador().getIdTrabajador().equals(desarrollador.getIdTrabajador())) {
            throw new BusinessLogicException("No tiene permisos para modificar esta actividad. Solo el desarrollador asignado puede cambiar su estado.");
        }

        // Persistencia
        actividad.setEstado(nuevoEstado);
        return actividadRepository.save(actividad);
    }

    // Listado de etapas para alimentar los selectores en el frontend
    @Transactional(readOnly = true)
    public List<Etapa> obtenerEtapasDisponibles() {
        return etapaRepository.findAll();
    }

    // Historial unificado de errores e interrupciones del desarrollador
    @Transactional(readOnly = true)
    public Map<String, Object> obtenerMisReportes(String emailDesarrollador) {
        Trabajador desarrollador = trabajadorRepository.findByEmail(emailDesarrollador)
                .orElseThrow(() -> new ResourceNotFoundException("Desarrollador no encontrado con email: " + emailDesarrollador));
        List<Error> errores = errorRepository.findByDesarrollador(desarrollador);
        List<Interrupcion> interrupciones = interrupcionRepository.findByDesarrollador(desarrollador);

        Map<String, Object> resultado = new HashMap<>();
        resultado.put("errores", errores != null ? errores : new ArrayList<>());
        resultado.put("interrupciones", interrupciones != null ? interrupciones : new ArrayList<>());
        resultado.put("totalErrores", errores != null ? errores.size() : 0);
        resultado.put("totalInterrupciones", interrupciones != null ? interrupciones.size() : 0);
        return resultado;
    }
}
