package com.ikernell.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.Map;

@Schema(description = "Métricas calculadas en tiempo real para el Semáforo Inteligente de Riesgos (RF-25)")
public class SemaforoMetricsDto {

    private Long idProyecto;
    private String nombreProyecto;
    private String nivel; // VERDE, NARANJA, ROJO
    private String titulo;
    private String recomendacion;
    private String badgeClass;
    private String iconClass;
    private Double totalHorasPerdidas;
    private Integer cantidadErroresCriticos;
    private Integer totalErrores;
    private Integer totalInterrupciones;
    private Map<String, Integer> severityCount; // BAJA, MEDIA, ALTA, CRITICA

    public SemaforoMetricsDto() {}

    public SemaforoMetricsDto(Long idProyecto, String nombreProyecto, String nivel, String titulo, 
                              String recomendacion, String badgeClass, String iconClass, 
                              Double totalHorasPerdidas, Integer cantidadErroresCriticos, 
                              Integer totalErrores, Integer totalInterrupciones, 
                              Map<String, Integer> severityCount) {
        this.idProyecto = idProyecto;
        this.nombreProyecto = nombreProyecto;
        this.nivel = nivel;
        this.titulo = titulo;
        this.recomendacion = recomendacion;
        this.badgeClass = badgeClass;
        this.iconClass = iconClass;
        this.totalHorasPerdidas = totalHorasPerdidas;
        this.cantidadErroresCriticos = cantidadErroresCriticos;
        this.totalErrores = totalErrores;
        this.totalInterrupciones = totalInterrupciones;
        this.severityCount = severityCount;
    }

    public Long getIdProyecto() { return idProyecto; }
    public void setIdProyecto(Long idProyecto) { this.idProyecto = idProyecto; }

    public String getNombreProyecto() { return nombreProyecto; }
    public void setNombreProyecto(String nombreProyecto) { this.nombreProyecto = nombreProyecto; }

    public String getNivel() { return nivel; }
    public void setNivel(String nivel) { this.nivel = nivel; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getRecomendacion() { return recomendacion; }
    public void setRecomendacion(String recomendacion) { this.recomendacion = recomendacion; }

    public String getBadgeClass() { return badgeClass; }
    public void setBadgeClass(String badgeClass) { this.badgeClass = badgeClass; }

    public String getIconClass() { return iconClass; }
    public void setIconClass(String iconClass) { this.iconClass = iconClass; }

    public Double getTotalHorasPerdidas() { return totalHorasPerdidas; }
    public void setTotalHorasPerdidas(Double totalHorasPerdidas) { this.totalHorasPerdidas = totalHorasPerdidas; }

    public Integer getCantidadErroresCriticos() { return cantidadErroresCriticos; }
    public void setCantidadErroresCriticos(Integer cantidadErroresCriticos) { this.cantidadErroresCriticos = cantidadErroresCriticos; }

    public Integer getTotalErrores() { return totalErrores; }
    public void setTotalErrores(Integer totalErrores) { this.totalErrores = totalErrores; }

    public Integer getTotalInterrupciones() { return totalInterrupciones; }
    public void setTotalInterrupciones(Integer totalInterrupciones) { this.totalInterrupciones = totalInterrupciones; }

    public Map<String, Integer> getSeverityCount() { return severityCount; }
    public void setSeverityCount(Map<String, Integer> severityCount) { this.severityCount = severityCount; }
}
