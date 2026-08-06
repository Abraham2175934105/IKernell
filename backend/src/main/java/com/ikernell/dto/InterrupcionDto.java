package com.ikernell.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Schema(description = "Objeto de transferencia de datos para el reporte de interrupciones o contingencias en una etapa")
public class InterrupcionDto {

    @Schema(description = "ID único de la interrupción", example = "1")
    private Long idInterrupcion;

    @NotNull(message = "El ID de la etapa (Fase afectada) es obligatorio")
    @Schema(description = "ID de la etapa WBS afectada por la contingencia", example = "5", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long idEtapa;

    @Schema(description = "ID del desarrollador (tomado en el servicio desde el token)")
    private Long idDesarrollador;

    @NotBlank(message = "El tipo de interrupción no puede estar vacío")
    @Schema(description = "Tipo o clasificación de la interrupción (ej: CORTE_ENERGIA, REUNION_NO_PROGRAMADA, BLOQUEO_HERRAMIENTA)", example = "REUNION_CLIENTE", requiredMode = Schema.RequiredMode.REQUIRED)
    private String tipoInterrupcion;

    @Schema(description = "Fecha y hora en que ocurrió la interrupción")
    private LocalDateTime fechaOcurrencia;

    @NotNull(message = "La duración en minutos es obligatoria")
    @Min(value = 1, message = "La duración mínima de la interrupción debe ser de al menos 1 minuto")
    @Schema(description = "Tiempo perdido expresado en minutos", example = "45", requiredMode = Schema.RequiredMode.REQUIRED)
    private Integer duracionMinutos;

    @Schema(description = "Explicación o comentarios adicionales del suceso", example = "Reunión de emergencia solicitada por gerencia")
    private String comentarios;

    public InterrupcionDto() {}

    public InterrupcionDto(Long idInterrupcion, Long idEtapa, Long idDesarrollador, String tipoInterrupcion, 
                           LocalDateTime fechaOcurrencia, Integer duracionMinutos, String comentarios) {
        this.idInterrupcion = idInterrupcion;
        this.idEtapa = idEtapa;
        this.idDesarrollador = idDesarrollador;
        this.tipoInterrupcion = tipoInterrupcion;
        this.fechaOcurrencia = fechaOcurrencia;
        this.duracionMinutos = duracionMinutos;
        this.comentarios = comentarios;
    }

    public Long getIdInterrupcion() { return idInterrupcion; }
    public void setIdInterrupcion(Long idInterrupcion) { this.idInterrupcion = idInterrupcion; }

    public Long getIdEtapa() { return idEtapa; }
    public void setIdEtapa(Long idEtapa) { this.idEtapa = idEtapa; }

    public Long getIdDesarrollador() { return idDesarrollador; }
    public void setIdDesarrollador(Long idDesarrollador) { this.idDesarrollador = idDesarrollador; }

    public String getTipoInterrupcion() { return tipoInterrupcion; }
    public void setTipoInterrupcion(String tipoInterrupcion) { this.tipoInterrupcion = tipoInterrupcion; }

    public LocalDateTime getFechaOcurrencia() { return fechaOcurrencia; }
    public void setFechaOcurrencia(LocalDateTime fechaOcurrencia) { this.fechaOcurrencia = fechaOcurrencia; }

    public Integer getDuracionMinutos() { return duracionMinutos; }
    public void setDuracionMinutos(Integer duracionMinutos) { this.duracionMinutos = duracionMinutos; }

    public String getComentarios() { return comentarios; }
    public void setComentarios(String comentarios) { this.comentarios = comentarios; }
}
