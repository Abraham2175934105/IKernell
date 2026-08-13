package com.ikernell.service;

import com.ikernell.dto.BurnoutMetricsDto;
import com.ikernell.dto.BurnoutProjection;
import com.ikernell.repository.AnaliticaCapacidadRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio de analítica predictiva de capacidad y detección de Burnout Histórico (RF-35).
 *
 * REFACTORIZACIÓN ARQUITECTÓNICA:
 * ────────────────────────────────────────────────────────────────────────────
 * ANTES: Cargaba TODAS las filas de actividad, error e interrupción en memoria
 *        (findAll()) y calculaba las ventanas temporales con Java Streams.
 *        Esto saturaba la RAM del servidor con O(n) por cada tabla cruzada.
 *
 * AHORA: Delegación total al motor transaccional PostgreSQL.
 *        Una única consulta CTE con generate_series() cruza las 3 tablas,
 *        calcula ventanas de 21 días, pondera scores y clasifica alertas.
 *        El servicio Java es un mapper limpio: Projection → DTO.
 * ────────────────────────────────────────────────────────────────────────────
 */
@Service
@Transactional(readOnly = true)
public class AnaliticaCapacidadService {

    private final AnaliticaCapacidadRepository analiticaCapacidadRepository;

    public AnaliticaCapacidadService(AnaliticaCapacidadRepository analiticaCapacidadRepository) {
        this.analiticaCapacidadRepository = analiticaCapacidadRepository;
    }

    /**
     * Obtiene la matriz de desgaste y riesgo de burnout de todos los desarrolladores activos.
     * Toda la lógica analítica se ejecuta en PostgreSQL; este método solo mapea la proyección.
     */
    public List<BurnoutMetricsDto> calcularMatrizBurnoutDesarrolladores() {

        List<BurnoutProjection> proyecciones = analiticaCapacidadRepository.calcularMatrizBurnout21Dias();

        return proyecciones.stream()
                .map(this::mapProjectionToDto)
                .collect(Collectors.toList());
    }

    /**
     * Mapper puro: BurnoutProjection (interfaz de BD) → BurnoutMetricsDto (contrato REST).
     * Sin lógica de negocio. Sin cálculos. Sin condicionales.
     */
    private BurnoutMetricsDto mapProjectionToDto(BurnoutProjection p) {
        BurnoutMetricsDto dto = new BurnoutMetricsDto();
        dto.setIdTrabajador(p.getIdTrabajador());
        dto.setNombreCompleto(p.getNombreCompleto());
        dto.setEmail(p.getEmail());
        dto.setEspecialidad(p.getEspecialidad());
        dto.setTareasActivas(p.getTareasActivas() != null ? p.getTareasActivas() : 0);
        dto.setScoreSemana1(p.getScoreSemana1() != null ? p.getScoreSemana1() : 0.0);
        dto.setScoreSemana2(p.getScoreSemana2() != null ? p.getScoreSemana2() : 0.0);
        dto.setScoreSemana3(p.getScoreSemana3() != null ? p.getScoreSemana3() : 0.0);
        dto.setPromedioCarga(p.getPromedioCarga() != null ? p.getPromedioCarga() : 0.0);
        dto.setEstadoAlerta(p.getEstadoAlerta());
        dto.setRecomendacion(p.getRecomendacion());
        dto.setCapacidadBloqueada(p.getCapacidadBloqueada() != null && p.getCapacidadBloqueada());
        dto.setHistoricoTendencia(List.of(
                dto.getScoreSemana1(),
                dto.getScoreSemana2(),
                dto.getScoreSemana3()
        ));
        return dto;
    }
}
