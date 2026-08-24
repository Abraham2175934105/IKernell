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
    private final com.ikernell.repository.ErrorRepository errorRepository;
    private final com.ikernell.repository.InterrupcionRepository interrupcionRepository;

    public EtlAutomationService(
            ProyectoRepository proyectoRepository, 
            EtapaRepository etapaRepository,
            com.ikernell.repository.ErrorRepository errorRepository,
            com.ikernell.repository.InterrupcionRepository interrupcionRepository) {
        this.proyectoRepository = proyectoRepository;
        this.etapaRepository = etapaRepository;
        this.errorRepository = errorRepository;
        this.interrupcionRepository = interrupcionRepository;
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
        List<Error> errores = errorRepository.findByProyectoWithDetails(proyecto);
        List<Interrupcion> interrupciones = interrupcionRepository.findByProyectoWithDetails(proyecto);

        int totalEstimado = etapas.size() + errores.size() + interrupciones.size() + 5;
        // Asignación de capacidad inicial para evitar relocalizaciones continuas en memoria RAM
        StringBuilder sb = new StringBuilder(Math.min(5242880, Math.max(1024, totalEstimado * 200)));

        sb.append("HEADER|SYSTEM_IKERNELL|PARTNER_BRAZIL|TYPE_EXPORT|")
          .append(LocalDateTime.now(ZoneId.of("UTC")).format(ISO_FORMATTER)).append("\n");

        sb.append("PROJECT|ID=").append(proyecto.getIdProyecto())
          .append("|NAME=").append(proyecto.getNombre() != null ? proyecto.getNombre() : "N/A")
          .append("|CLIENT=").append(proyecto.getCliente() != null ? proyecto.getCliente() : "INTERNO")
          .append("|STATUS=").append(proyecto.getEstado() != null ? proyecto.getEstado() : "ACTIVO")
          .append("|BUDGET=").append(proyecto.getPresupuesto() != null ? proyecto.getPresupuesto() : "0.00")
          .append("|START_DATE=").append(proyecto.getFechaInicio() != null ? proyecto.getFechaInicio() : "N/A")
          .append("|ESTIMATED_END=").append(proyecto.getFechaFinEstimada() != null ? proyecto.getFechaFinEstimada() : "N/A").append("\n");

        int totalRegistros = 0;

        // Registro de Etapas WBS
        for (Etapa etapa : etapas) {
            sb.append("STAGE|ID=").append(etapa.getIdEtapa())
              .append("|NAME=").append(etapa.getNombreEtapa() != null ? etapa.getNombreEtapa() : "Sin Nombre")
              .append("|STATUS=").append(etapa.getEstado() != null ? etapa.getEstado() : "PENDIENTE").append("\n");
            totalRegistros++;
        }

        // Registro de Errores Técnicos con estandarización UTC estricta
        for (Error err : errores) {
            LocalDateTime fechaReg = err.getFechaRegistro() != null ? err.getFechaRegistro() : LocalDateTime.now(ZoneId.of("UTC"));
            String isoDate = fechaReg.atZone(ZoneId.systemDefault())
                    .withZoneSameInstant(ZoneId.of("UTC")).format(ISO_FORMATTER);

            Long stageId = (err.getEtapa() != null) ? err.getEtapa().getIdEtapa() : 0L;
            String stageName = (err.getEtapa() != null && err.getEtapa().getNombreEtapa() != null) ? err.getEtapa().getNombreEtapa() : "WBS";
            Long devId = (err.getDesarrollador() != null) ? err.getDesarrollador().getIdTrabajador() : 0L;
            String devName = (err.getDesarrollador() != null) ? (err.getDesarrollador().getNombre() + " " + err.getDesarrollador().getApellido()) : "SIN_ASIGNAR";

            sb.append("METRIC_ERROR|STAGE_ID=").append(stageId)
              .append("|STAGE_NAME=").append(stageName)
              .append("|DEV_ID=").append(devId)
              .append("|DEV_NAME=").append(devName)
              .append("|TYPE=").append(err.getTipoError() != null ? err.getTipoError() : "GENERAL")
              .append("|SEVERITY=").append(err.getSeveridad() != null ? err.getSeveridad() : "MEDIA")
              .append("|STATUS=").append(err.getEstadoAtencion() != null ? err.getEstadoAtencion() : "REGISTRADO")
              .append("|TIMESTAMP_ISO=").append(isoDate).append("\n");
            totalRegistros++;
        }

        // Registro de Contingencias e Interrupciones Operativas con estandarización UTC estricta
        for (Interrupcion intp : interrupciones) {
            LocalDateTime fechaOcurr = intp.getFechaOcurrencia() != null ? intp.getFechaOcurrencia() : LocalDateTime.now(ZoneId.of("UTC"));
            String isoDate = fechaOcurr.atZone(ZoneId.systemDefault())
                    .withZoneSameInstant(ZoneId.of("UTC")).format(ISO_FORMATTER);

            Long stageId = (intp.getEtapa() != null) ? intp.getEtapa().getIdEtapa() : 0L;
            String stageName = (intp.getEtapa() != null && intp.getEtapa().getNombreEtapa() != null) ? intp.getEtapa().getNombreEtapa() : "WBS";
            Long devId = (intp.getDesarrollador() != null) ? intp.getDesarrollador().getIdTrabajador() : 0L;
            String devName = (intp.getDesarrollador() != null) ? (intp.getDesarrollador().getNombre() + " " + intp.getDesarrollador().getApellido()) : "SIN_ASIGNAR";

            sb.append("METRIC_CONTINGENCY|STAGE_ID=").append(stageId)
              .append("|STAGE_NAME=").append(stageName)
              .append("|DEV_ID=").append(devId)
              .append("|DEV_NAME=").append(devName)
              .append("|TYPE=").append(intp.getTipoInterrupcion() != null ? intp.getTipoInterrupcion() : "INTERRUPCION")
              .append("|DURATION_MINUTES=").append(intp.getDuracionMinutos() != null ? intp.getDuracionMinutos() : 0)
              .append("|STATUS=").append(intp.getEstadoAtencion() != null ? intp.getEstadoAtencion() : "REGISTRADO")
              .append("|TIMESTAMP_ISO=").append(isoDate).append("\n");
            totalRegistros++;
        }

        // Bloque de cierre con totalización de registros para control de integridad
        sb.append("FOOTER|TOTAL_RECORDS=").append(totalRegistros).append("|INTEGRITY_CHECK=OK\n");

        String nombreArchivo = String.format("METRICAS_BRASIL_PROY_%d_%s.txt",
                proyecto.getIdProyecto(),
                LocalDateTime.now(ZoneId.of("UTC")).format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")));

        String contenidoCompleto = sb.toString();
        byte[] contenidoPlano = contenidoCompleto.getBytes(StandardCharsets.UTF_8);

        // Envío simulado por canal seguro SFTP
        String mensajeEnvio = simularEnvioSeguroSftpYEmail(nombreArchivo, contenidoPlano);

        // Protección contra desbordamiento en respuesta REST: truncar vista previa si excede 50k caracteres
        String vistaPrevia = contenidoCompleto.length() > 50000 
                ? contenidoCompleto.substring(0, 50000) + "\n...[TRUNCADO POR TAMAÑO EXCESIVO EN VISTA PREVIA REST]..." 
                : contenidoCompleto;

        return new EtlReportResponse(
                nombreArchivo,
                "PROCESADO_EXITOSAMENTE (" + tipoEjecucion + ")",
                totalRegistros,
                LocalDateTime.now(ZoneId.of("UTC")),
                mensajeEnvio,
                vistaPrevia
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
