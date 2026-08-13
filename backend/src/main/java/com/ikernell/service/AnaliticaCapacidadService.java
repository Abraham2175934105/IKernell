package com.ikernell.service;

import com.ikernell.dto.BurnoutMetricsDto;
import com.ikernell.model.Rol;
import com.ikernell.model.Trabajador;
import com.ikernell.repository.ActividadRepository;
import com.ikernell.repository.ErrorRepository;
import com.ikernell.repository.InterrupcionRepository;
import com.ikernell.repository.TrabajadorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Servicio de analítica predictiva de capacidad y detección de Burnout Histórico (RF-35).
 * Analiza series temporales de 21 días (3 semanas: S1, S2, S3) cruzando WBS, incidencias y tiempos muertos.
 */
@Service
@Transactional(readOnly = true)
public class AnaliticaCapacidadService {

    private final TrabajadorRepository trabajadorRepository;
    private final ActividadRepository actividadRepository;
    private final ErrorRepository errorRepository;
    private final InterrupcionRepository interrupcionRepository;

    public AnaliticaCapacidadService(TrabajadorRepository trabajadorRepository,
                                     ActividadRepository actividadRepository,
                                     ErrorRepository errorRepository,
                                     InterrupcionRepository interrupcionRepository) {
        this.trabajadorRepository = trabajadorRepository;
        this.actividadRepository = actividadRepository;
        this.errorRepository = errorRepository;
        this.interrupcionRepository = interrupcionRepository;
    }

    /**
     * Calcula la matriz de desgaste y riesgo de burnout para todos los desarrolladores activos.
     */
    public List<BurnoutMetricsDto> calcularMatrizBurnoutDesarrolladores() {
        List<Trabajador> desarrolladores = trabajadorRepository.findByRolAndEstado(Rol.DESARROLLADOR, true);
        List<BurnoutMetricsDto> resultado = new ArrayList<>();

        LocalDateTime ahora = LocalDateTime.now();
        LocalDateTime sieteDiasAtras = ahora.minusDays(7);
        LocalDateTime catorceDiasAtras = ahora.minusDays(14);
        LocalDateTime veintiunDiasAtras = ahora.minusDays(21);

        for (Trabajador dev : desarrolladores) {
            Long devId = dev.getIdTrabajador();

            // 1. Tareas activas en la WBS
            int tareasActivas = (int) actividadRepository.findAll().stream()
                    .filter(a -> a.getDesarrollador() != null && a.getDesarrollador().getIdTrabajador().equals(devId))
                    .filter(a -> "EN_PROGRESO".equalsIgnoreCase(a.getEstado()) || "PENDIENTE".equalsIgnoreCase(a.getEstado()))
                    .count();

            // 2. Errores por ventanas temporales
            long erroresS3 = errorRepository.findAll().stream()
                    .filter(e -> e.getDesarrollador() != null && e.getDesarrollador().getIdTrabajador().equals(devId))
                    .filter(e -> e.getFechaRegistro() != null && e.getFechaRegistro().isAfter(sieteDiasAtras))
                    .count();

            long erroresS2 = errorRepository.findAll().stream()
                    .filter(e -> e.getDesarrollador() != null && e.getDesarrollador().getIdTrabajador().equals(devId))
                    .filter(e -> e.getFechaRegistro() != null && e.getFechaRegistro().isAfter(catorceDiasAtras) && e.getFechaRegistro().isBefore(sieteDiasAtras))
                    .count();

            long erroresS1 = errorRepository.findAll().stream()
                    .filter(e -> e.getDesarrollador() != null && e.getDesarrollador().getIdTrabajador().equals(devId))
                    .filter(e -> e.getFechaRegistro() != null && e.getFechaRegistro().isAfter(veintiunDiasAtras) && e.getFechaRegistro().isBefore(catorceDiasAtras))
                    .count();

            // 3. Horas de interrupción/contingencia por ventanas temporales
            double horasInterrupcionS3 = interrupcionRepository.findAll().stream()
                    .filter(i -> i.getDesarrollador() != null && i.getDesarrollador().getIdTrabajador().equals(devId))
                    .filter(i -> i.getFechaOcurrencia() != null && i.getFechaOcurrencia().isAfter(sieteDiasAtras))
                    .mapToDouble(i -> i.getDuracionMinutos() != null ? i.getDuracionMinutos() / 60.0 : 0.0)
                    .sum();

            double horasInterrupcionS2 = interrupcionRepository.findAll().stream()
                    .filter(i -> i.getDesarrollador() != null && i.getDesarrollador().getIdTrabajador().equals(devId))
                    .filter(i -> i.getFechaOcurrencia() != null && i.getFechaOcurrencia().isAfter(catorceDiasAtras) && i.getFechaOcurrencia().isBefore(sieteDiasAtras))
                    .mapToDouble(i -> i.getDuracionMinutos() != null ? i.getDuracionMinutos() / 60.0 : 0.0)
                    .sum();

            double horasInterrupcionS1 = interrupcionRepository.findAll().stream()
                    .filter(i -> i.getDesarrollador() != null && i.getDesarrollador().getIdTrabajador().equals(devId))
                    .filter(i -> i.getFechaOcurrencia() != null && i.getFechaOcurrencia().isAfter(veintiunDiasAtras) && i.getFechaOcurrencia().isBefore(catorceDiasAtras))
                    .mapToDouble(i -> i.getDuracionMinutos() != null ? i.getDuracionMinutos() / 60.0 : 0.0)
                    .sum();

            // 4. Cálculo ponderado de puntuación de estrés (0 - 100)
            double baseWbs = Math.min(60.0, tareasActivas * 18.0);
            double scoreS1 = Math.min(100.0, Math.round(baseWbs + (erroresS1 * 12.0) + (horasInterrupcionS1 * 8.0)));
            double scoreS2 = Math.min(100.0, Math.round(baseWbs + (erroresS2 * 12.0) + (horasInterrupcionS2 * 8.0)));
            double scoreS3 = Math.min(100.0, Math.round(baseWbs + (erroresS3 * 15.0) + (horasInterrupcionS3 * 10.0)));

            double promedio = Math.round(((scoreS1 + scoreS2 + scoreS3) / 3.0) * 10.0) / 10.0;

            // 5. Determinación del estado predictivo
            String estadoAlerta;
            String recomendacion;
            boolean bloqueo = false;

            if (scoreS1 >= 65.0 && scoreS2 >= 65.0 && scoreS3 >= 65.0) {
                estadoAlerta = "RIESGO_BURNOUT_INMINENTE";
                recomendacion = "ALERTA CRÍTICA: Desgaste acumulado durante 3 semanas consecutivas. Se recomienda redistribuir tareas WBS inmediatamente y restringir nuevas asignaciones.";
                bloqueo = true;
            } else if (scoreS3 >= 80.0) {
                estadoAlerta = "SOBRECARGA_AGUDA";
                recomendacion = "Sobrecarga elevada en los últimos 7 días. Monitorear resolución de contingencias.";
            } else if ((scoreS3 - scoreS1) >= 25.0) {
                estadoAlerta = "TENDENCIA_DE_ESTRES_ACELERADA";
                recomendacion = "Incremento acelerado en el volumen de errores e interrupciones respecto a la línea base.";
            } else {
                estadoAlerta = "ESTABLE";
                recomendacion = "Carga operativa equilibrada dentro de los parámetros de rendimiento óptimo.";
            }

            BurnoutMetricsDto dto = new BurnoutMetricsDto();
            dto.setIdTrabajador(devId);
            dto.setNombreCompleto(dev.getNombre() + " " + dev.getApellido());
            dto.setEmail(dev.getEmail());
            dto.setEspecialidad(dev.getEspecialidad() != null ? dev.getEspecialidad() : "Ingeniería de Software");
            dto.setTareasActivas(tareasActivas);
            dto.setScoreSemana1(scoreS1);
            dto.setScoreSemana2(scoreS2);
            dto.setScoreSemana3(scoreS3);
            dto.setPromedioCarga(promedio);
            dto.setEstadoAlerta(estadoAlerta);
            dto.setRecomendacion(recomendacion);
            dto.setCapacidadBloqueada(bloqueo);
            dto.setHistoricoTendencia(List.of(scoreS1, scoreS2, scoreS3));

            resultado.add(dto);
        }

        return resultado;
    }
}
