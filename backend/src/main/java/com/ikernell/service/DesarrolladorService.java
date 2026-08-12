package com.ikernell.service;

import com.ikernell.dto.ErrorDto;
import com.ikernell.dto.InterrupcionDto;
import com.ikernell.exception.ResourceNotFoundException;
import com.ikernell.model.*;
import com.ikernell.model.Error;
import com.ikernell.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Servicio transaccional para la operativa diaria de los DESARROLLADORES.
 * <p>
 * Principios SOLID aplicados:
 * - SRP: Especializado en reporte transaccional de problemas operativos (Errores y Contingencias) y consulta de WBS.
 * - Inyección por constructor para consistencia arquitectónica y testabilidad sin mocks de reflexión.
 * </p>
 */
@Service
@Transactional
public class DesarrolladorService {

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

    /**
     * RF-22: Registro transaccional de errores detectados en la fase o etapa que se está ejecutando.
     */
    public Error registrarError(ErrorDto errorDto, String emailDesarrollador) {
        Trabajador desarrollador = trabajadorRepository.findByEmail(emailDesarrollador)
                .orElseThrow(() -> new ResourceNotFoundException("Desarrollador no encontrado con email: " + emailDesarrollador));

        Etapa etapa = etapaRepository.findById(errorDto.getIdEtapa())
                .orElseThrow(() -> new ResourceNotFoundException("Fase / Etapa (WBS) no encontrada con ID: " + errorDto.getIdEtapa()));

        Error error = new Error();
        error.setEtapa(etapa);
        error.setDesarrollador(desarrollador);
        error.setTipoError(errorDto.getTipoError());
        error.setSeveridad(errorDto.getSeveridad());
        error.setFechaRegistro(errorDto.getFechaRegistro() != null ? errorDto.getFechaRegistro() : LocalDateTime.now());

        return errorRepository.save(error);
    }

    /**
     * RF-23, RF-24: Registro transaccional de Contingencias e Interrupciones con la duración en minutos.
     * Estos datos alimentan en tiempo real el Semáforo Inteligente (Dashboard de Riesgos) del Líder.
     */
    public Interrupcion registrarInterrupcion(InterrupcionDto interrupcionDto, String emailDesarrollador) {
        Trabajador desarrollador = trabajadorRepository.findByEmail(emailDesarrollador)
                .orElseThrow(() -> new ResourceNotFoundException("Desarrollador no encontrado con email: " + emailDesarrollador));

        Etapa etapa = etapaRepository.findById(interrupcionDto.getIdEtapa())
                .orElseThrow(() -> new ResourceNotFoundException("Fase / Etapa (WBS) no encontrada con ID: " + interrupcionDto.getIdEtapa()));

        Interrupcion interrupcion = new Interrupcion();
        interrupcion.setEtapa(etapa);
        interrupcion.setDesarrollador(desarrollador);
        interrupcion.setTipoInterrupcion(interrupcionDto.getTipoInterrupcion());
        interrupcion.setFechaOcurrencia(interrupcionDto.getFechaOcurrencia() != null ? interrupcionDto.getFechaOcurrencia() : LocalDateTime.now());
        interrupcion.setDuracionMinutos(interrupcionDto.getDuracionMinutos());
        interrupcion.setComentarios(interrupcionDto.getComentarios());

        return interrupcionRepository.save(interrupcion);
    }

    /**
     * RF-21: Consulta de actividades granulares que han sido asignadas al desarrollador autenticado.
     */
    @Transactional(readOnly = true)
    public List<Actividad> obtenerMisActividades(String emailDesarrollador) {
        Trabajador desarrollador = trabajadorRepository.findByEmail(emailDesarrollador)
                .orElseThrow(() -> new ResourceNotFoundException("Desarrollador no encontrado con email: " + emailDesarrollador));
        return actividadRepository.findByDesarrollador(desarrollador);
    }

    /**
     * Consulta paginada de actividades asignadas al desarrollador.
     */
    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<Actividad> obtenerMisActividadesPaginado(String emailDesarrollador, org.springframework.data.domain.Pageable pageable) {
        Trabajador desarrollador = trabajadorRepository.findByEmail(emailDesarrollador)
                .orElseThrow(() -> new ResourceNotFoundException("Desarrollador no encontrado con email: " + emailDesarrollador));
        return actividadRepository.findByDesarrollador(desarrollador, pageable);
    }
}

