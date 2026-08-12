package com.ikernell.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Schema(description = "Objeto de transferencia de datos para el registro de errores por parte del desarrollador")
public class ErrorDto {

    @Schema(description = "ID único del error (opcional para creación)", example = "1")
    private Long idError;

    @NotNull(message = "El ID de la etapa (WBS) es obligatorio")
    @Schema(description = "ID de la fase o etapa afectada del proyecto", example = "5", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long idEtapa;

    @Schema(description = "ID del desarrollador (asignado automáticamente desde token si no se especifica)", example = "3")
    private Long idDesarrollador;

    @NotBlank(message = "El tipo de error no puede estar vacío")
    @Schema(description = "Clasificación o tipo del error detectado", example = "ERROR_LOGICA_NEGOCIO", requiredMode = Schema.RequiredMode.REQUIRED)
    private String tipoError;

    @NotBlank(message = "La severidad es obligatoria ('BAJA', 'MEDIA', 'ALTA', 'CRITICA')")
    @Schema(description = "Grado de severidad del error", example = "ALTA", requiredMode = Schema.RequiredMode.REQUIRED)
    private String severidad;

    @Schema(description = "Descripción detallada del error detectado", example = "El cálculo de nómina arroja valores negativos cuando el trabajador tiene más de 3 deducciones")
    private String descripcion;

    @Schema(description = "Fecha de registro (si no se proporciona se asignará la actual)")
    private LocalDateTime fechaRegistro;

    public ErrorDto() {}

    public ErrorDto(Long idError, Long idEtapa, Long idDesarrollador, String tipoError, String severidad, LocalDateTime fechaRegistro) {
        this.idError = idError;
        this.idEtapa = idEtapa;
        this.idDesarrollador = idDesarrollador;
        this.tipoError = tipoError;
        this.severidad = severidad;
        this.fechaRegistro = fechaRegistro;
    }

    public Long getIdError() { return idError; }
    public void setIdError(Long idError) { this.idError = idError; }

    public Long getIdEtapa() { return idEtapa; }
    public void setIdEtapa(Long idEtapa) { this.idEtapa = idEtapa; }

    public Long getIdDesarrollador() { return idDesarrollador; }
    public void setIdDesarrollador(Long idDesarrollador) { this.idDesarrollador = idDesarrollador; }

    public String getTipoError() { return tipoError; }
    public void setTipoError(String tipoError) { this.tipoError = tipoError; }

    public String getSeveridad() { return severidad; }
    public void setSeveridad(String severidad) { this.severidad = severidad; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public LocalDateTime getFechaRegistro() { return fechaRegistro; }
    public void setFechaRegistro(LocalDateTime fechaRegistro) { this.fechaRegistro = fechaRegistro; }
}
