package com.ikernell.service;

import com.ikernell.dto.BurnoutMetricsDto;
import com.ikernell.dto.BurnoutProjection;
import com.ikernell.repository.AnaliticaCapacidadRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio de analítica predictiva de capacidad y detección de Burnout Histórico (RF-35).
 * Delegación nativa en PostgreSQL con mapeo seguro y tolerante a fallos.
 */
@Service
@Transactional(readOnly = true)
public class AnaliticaCapacidadService {

    private static final Logger log = LoggerFactory.getLogger(AnaliticaCapacidadService.class);
    private final AnaliticaCapacidadRepository analiticaCapacidadRepository;

    public AnaliticaCapacidadService(AnaliticaCapacidadRepository analiticaCapacidadRepository) {
        this.analiticaCapacidadRepository = analiticaCapacidadRepository;
    }

    /**
     * Obtiene la matriz de desgaste y riesgo de burnout de todos los desarrolladores activos.
     */
    public List<BurnoutMetricsDto> calcularMatrizBurnoutDesarrolladores() {
        try {
            List<BurnoutProjection> proyecciones = analiticaCapacidadRepository.calcularMatrizBurnout21Dias();
            if (proyecciones == null || proyecciones.isEmpty()) {
                return new ArrayList<>();
            }
            return proyecciones.stream()
                    .map(this::mapProjectionToDto)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error al calcular la matriz de burnout en PostgreSQL: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Mapper puro con protección exhaustiva contra nulos e incompatibilidades de tipos numéricos.
     */
    private BurnoutMetricsDto mapProjectionToDto(BurnoutProjection p) {
        BurnoutMetricsDto dto = new BurnoutMetricsDto();
        dto.setIdTrabajador(p.getIdTrabajador() != null ? p.getIdTrabajador() : 0L);
        dto.setNombreCompleto(p.getNombreCompleto() != null ? p.getNombreCompleto() : "Desarrollador");
        dto.setEmail(p.getEmail() != null ? p.getEmail() : "");
        dto.setEspecialidad(p.getEspecialidad() != null ? p.getEspecialidad() : "Ingeniería de Software");
        dto.setTareasActivas(p.getTareasActivas() != null ? p.getTareasActivas() : 0);
        dto.setScoreSemana1(p.getScoreSemana1() != null ? p.getScoreSemana1().doubleValue() : 0.0);
        dto.setScoreSemana2(p.getScoreSemana2() != null ? p.getScoreSemana2().doubleValue() : 0.0);
        dto.setScoreSemana3(p.getScoreSemana3() != null ? p.getScoreSemana3().doubleValue() : 0.0);
        dto.setPromedioCarga(p.getPromedioCarga() != null ? p.getPromedioCarga().doubleValue() : 0.0);
        dto.setEstadoAlerta(p.getEstadoAlerta() != null ? p.getEstadoAlerta() : "BAJA");
        dto.setRecomendacion(p.getRecomendacion() != null ? p.getRecomendacion() : "Carga operativa dentro de parámetros normales.");
        dto.setCapacidadBloqueada(Boolean.TRUE.equals(p.getCapacidadBloqueada()));
        dto.setHistoricoTendencia(List.of(
                dto.getScoreSemana1(),
                dto.getScoreSemana2(),
                dto.getScoreSemana3()
        ));
        return dto;
    }
}
