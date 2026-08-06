package com.ikernell.service;

import com.ikernell.dto.EtlReportResponse;
import com.ikernell.exception.ResourceNotFoundException;
import com.ikernell.model.Etapa;
import com.ikernell.model.Error;
import com.ikernell.model.Interrupcion;
import com.ikernell.model.Proyecto;
import com.ikernell.repository.EtapaRepository;
import com.ikernell.repository.ProyectoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * Servicio transaccional que implementa la Innovación 2 (Automatización ETL para Alianza Brasil).
 * <p>
 * Optimización de Alto Rendimiento:
 * - @Async("etlTaskExecutor"): El proceso ETL pesado se ejecuta en un hilo separado del pool
 *   configurado en AsyncConfig, liberando el hilo HTTP principal del controlador REST.
 * - CompletableFuture: Permite al controlador devolver una respuesta inmediata o esperar
 *   el resultado de forma no-bloqueante.
 * </p>
 * Cumple con RF-28 (Batch ETL), RF-29 (Estandarización Internacional ISO) y RF-30 (Envío SFTP/Email).
 */
@Service
@Transactional
public class EtlAutomationService {

    private static final Logger log = LoggerFactory.getLogger(EtlAutomationService.class);
    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'");

    private final ProyectoRepository proyectoRepository;
    private final EtapaRepository etapaRepository;

    public EtlAutomationService(ProyectoRepository proyectoRepository, EtapaRepository etapaRepository) {
        this.proyectoRepository = proyectoRepository;
        this.etapaRepository = etapaRepository;
    }

    /**
     * Ejecuta el proceso ETL de manera interactiva a petición del Líder (One-Click ETL).
     * Este método es síncrono para devolver resultado al controlador REST.
     */
    public EtlReportResponse generarYEnviarReporteBrasil(Long idProyecto) {
        Proyecto proyecto = proyectoRepository.findById(idProyecto)
                .orElseThrow(() -> new ResourceNotFoundException("Proyecto no encontrado con ID: " + idProyecto));

        return procesarEtlParaProyecto(proyecto, "MANUAL_ONE_CLICK_LIDER");
    }

    /**
     * Proceso desatendido asíncrono ejecutado por tarea programada (@Scheduled).
     * Se ejecuta en un hilo del pool "etlTaskExecutor" para no bloquear el scheduler principal.
     */
    @Async("etlTaskExecutor")
    @Scheduled(cron = "0 0 0 * * SUN") // Todos los domingos a la medianoche
    public CompletableFuture<Void> procesoEtlDesatendidoProgramado() {
        log.info("[ETL-ASYNC] Iniciando tarea programada desatendida ETL para la alianza en Brasil...");
        List<Proyecto> proyectosActivos = proyectoRepository.findByEstado("ACTIVO");

        int procesados = 0;
        int fallidos = 0;

        for (Proyecto proyecto : proyectosActivos) {
            try {
                procesarEtlParaProyecto(proyecto, "BATCH_SCHEDULED_UNATTENDED");
                procesados++;
            } catch (Exception e) {
                log.error("[ETL-ASYNC] Error al procesar lote ETL para proyecto ID {}: {}",
                        proyecto.getIdProyecto(), e.getMessage());
                fallidos++;
            }
        }

        log.info("[ETL-ASYNC] Proceso ETL batch finalizado. Procesados: {} | Fallidos: {}", procesados, fallidos);
        return CompletableFuture.completedFuture(null);
    }

    private EtlReportResponse procesarEtlParaProyecto(Proyecto proyecto, String tipoEjecucion) {
        List<Etapa> etapas = etapaRepository.findByProyecto(proyecto);

        StringBuilder sb = new StringBuilder();
        sb.append("HEADER|SYSTEM_IKERNELL|PARTNER_BRAZIL|TYPE_EXPORT|")
          .append(LocalDateTime.now(ZoneId.of("UTC")).format(ISO_FORMATTER)).append("\n");

        sb.append("PROJECT|ID=").append(proyecto.getIdProyecto())
          .append("|NAME=").append(proyecto.getNombre())
          .append("|STATUS=").append(proyecto.getEstado())
          .append("|START_DATE=").append(proyecto.getFechaInicio())
          .append("|ESTIMATED_END=").append(proyecto.getFechaFinEstimada()).append("\n");

        int totalRegistros = 0;

        for (Etapa etapa : etapas) {
            sb.append("STAGE|ID=").append(etapa.getIdEtapa())
              .append("|NAME=").append(etapa.getNombreEtapa())
              .append("|STATUS=").append(etapa.getEstado()).append("\n");
            totalRegistros++;

            for (Error err : etapa.getErrores()) {
                String isoDate = err.getFechaRegistro().atZone(ZoneId.systemDefault())
                        .withZoneSameInstant(ZoneId.of("UTC")).format(ISO_FORMATTER);

                sb.append("METRIC_ERROR|STAGE_ID=").append(etapa.getIdEtapa())
                  .append("|DEV_ID=").append(err.getDesarrollador().getIdTrabajador())
                  .append("|TYPE=").append(err.getTipoError())
                  .append("|SEVERITY=").append(err.getSeveridad())
                  .append("|TIMESTAMP_ISO=").append(isoDate).append("\n");
                totalRegistros++;
            }

            for (Interrupcion intp : etapa.getInterrupciones()) {
                String isoDate = intp.getFechaOcurrencia().atZone(ZoneId.systemDefault())
                        .withZoneSameInstant(ZoneId.of("UTC")).format(ISO_FORMATTER);

                sb.append("METRIC_CONTINGENCY|STAGE_ID=").append(etapa.getIdEtapa())
                  .append("|DEV_ID=").append(intp.getDesarrollador().getIdTrabajador())
                  .append("|TYPE=").append(intp.getTipoInterrupcion())
                  .append("|DURATION_MINUTES=").append(intp.getDuracionMinutos())
                  .append("|TIMESTAMP_ISO=").append(isoDate).append("\n");
                totalRegistros++;
            }
        }

        sb.append("FOOTER|TOTAL_RECORDS=").append(totalRegistros).append("\n");

        String nombreArchivo = String.format("METRICAS_BRASIL_PROY_%d_%s.txt",
                proyecto.getIdProyecto(),
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")));

        byte[] contenidoPlano = sb.toString().getBytes(StandardCharsets.UTF_8);

        String mensajeEnvio = simularEnvioSeguroSftpYEmail(nombreArchivo, contenidoPlano);

        return new EtlReportResponse(
                nombreArchivo,
                "PROCESADO_EXITOSAMENTE (" + tipoEjecucion + ")",
                totalRegistros,
                LocalDateTime.now(),
                mensajeEnvio,
                sb.toString()
        );
    }

    private String simularEnvioSeguroSftpYEmail(String nombreArchivo, byte[] archivoBytes) {
        log.info("[ETL] Conectando con servidor SFTP seguro: sftp.brasil.ikernell.com:22...");
        log.info("[ETL] Subiendo archivo {} ({} bytes) a /incoming/metrics/...", nombreArchivo, archivoBytes.length);
        log.info("[ETL] Enviando notificación por correo electrónico a equipo.brasil@ikernell.org.");

        return "SFTP (sftp.brasil.ikernell.com/incoming/metrics/) & Email Corporativo (equipo.brasil@ikernell.org)";
    }
}
