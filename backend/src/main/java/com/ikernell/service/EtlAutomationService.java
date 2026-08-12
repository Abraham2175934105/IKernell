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

// Servicio transaccional y asíncrono para el pipeline ETL de métricas operacionales (Alianza Brasil)
@Service
@Transactional
public class EtlAutomationService {

    private static final Logger log = LoggerFactory.getLogger(EtlAutomationService.class);
    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'");

    // Inyección de dependencias
    private final ProyectoRepository proyectoRepository;
    private final EtapaRepository etapaRepository;

    public EtlAutomationService(ProyectoRepository proyectoRepository, EtapaRepository etapaRepository) {
        this.proyectoRepository = proyectoRepository;
        this.etapaRepository = etapaRepository;
    }

    // Ejecuta el proceso ETL de forma interactiva cuando el Líder presiona "Exportar Lote ETL"
    public EtlReportResponse generarYEnviarReporteBrasil(Long idProyecto) {
        // Validaciones
        Proyecto proyecto = proyectoRepository.findById(idProyecto)
                .orElseThrow(() -> new ResourceNotFoundException("Proyecto no encontrado con ID: " + idProyecto));

        return procesarEtlParaProyecto(proyecto, "MANUAL_ONE_CLICK_LIDER");
    }

    // Proceso batch desatendido que corre periódicamente en segundo plano mediante un hilo dedicado
    @Async("etlTaskExecutor")
    @Scheduled(cron = "0 0 0 * * SUN") // Ejecución automática los domingos a medianoche
    public CompletableFuture<Void> procesoEtlDesatendidoProgramado() {
        log.info("[ETL-ASYNC] Iniciando lote programado para exportación internacional a Brasil...");
        List<Proyecto> proyectosActivos = proyectoRepository.findByEstado("ACTIVO");

        int procesados = 0;
        int fallidos = 0;

        for (Proyecto proyecto : proyectosActivos) {
            try {
                procesarEtlParaProyecto(proyecto, "BATCH_SCHEDULED_UNATTENDED");
                procesados++;
            } catch (Exception e) {
                log.error("[ETL-ASYNC] Error procesando proyecto ID {}: {}", proyecto.getIdProyecto(), e.getMessage());
                fallidos++;
            }
        }

        log.info("[ETL-ASYNC] Proceso batch finalizado. Procesados: {} | Fallidos: {}", procesados, fallidos);
        return CompletableFuture.completedFuture(null);
    }

    // Extrae y transforma los datos operacionales a un archivo plano con delimitador pleca (|)
    private EtlReportResponse procesarEtlParaProyecto(Proyecto proyecto, String tipoEjecucion) {
        List<Etapa> etapas = etapaRepository.findByProyecto(proyecto);

        // Estructuración del archivo plano con encabezado, desglose WBS y métricas
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
                // Estandarización de marcas de tiempo a zona horaria UTC
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

        // Bloque de cierre con totalización de registros para control de integridad
        sb.append("FOOTER|TOTAL_RECORDS=").append(totalRegistros).append("\n");

        String nombreArchivo = String.format("METRICAS_BRASIL_PROY_%d_%s.txt",
                proyecto.getIdProyecto(),
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")));

        byte[] contenidoPlano = sb.toString().getBytes(StandardCharsets.UTF_8);

        // Envío simulado por canal seguro SFTP
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

    // Simulación de canal seguro de transporte para la entrega en servidores internacionales
    private String simularEnvioSeguroSftpYEmail(String nombreArchivo, byte[] archivoBytes) {
        log.info("[ETL] Conectando con servidor SFTP seguro: sftp.brasil.ikernell.com:22...");
        log.info("[ETL] Subiendo archivo {} ({} bytes) a /incoming/metrics/...", nombreArchivo, archivoBytes.length);
        log.info("[ETL] Enviando notificación por correo electrónico a equipo.brasil@ikernell.org.");

        return "SFTP (sftp.brasil.ikernell.com/incoming/metrics/) & Email Corporativo (equipo.brasil@ikernell.org)";
    }
}
