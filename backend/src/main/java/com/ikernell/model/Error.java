package com.ikernell.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

// Entidad JPA para reportes de errores técnicos detectados en una etapa WBS (alimenta el Semáforo de Riesgo)
@Entity
@Table(name = "error")
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Error {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_error")
    private Long idError;

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "actividades", "errores", "interrupciones"})
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "etapa_id", nullable = false)
    private Etapa etapa;

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "actividades", "errores", "interrupciones", "passwordHash", "proyectosLiderados"})
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "desarrollador_id", nullable = false)
    private Trabajador desarrollador;

    @Column(name = "tipo_error", nullable = false, length = 100)
    private String tipoError;

    @Column(name = "severidad", nullable = false, length = 20)
    private String severidad;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "fecha_registro", nullable = false, updatable = false)
    private LocalDateTime fechaRegistro = LocalDateTime.now();

    @Column(name = "estado_atencion", length = 30)
    private String estadoAtencion = "REGISTRADO";

    @Column(name = "resolucion_nota", columnDefinition = "TEXT")
    private String resolucionNota;

    @Column(name = "fecha_resolucion")
    private LocalDateTime fechaResolucion;

    // Constructores
    public Error() {}

    public Error(Long idError, Etapa etapa, Trabajador desarrollador, String tipoError, 
                 String severidad, LocalDateTime fechaRegistro) {
        this.idError = idError;
        this.etapa = etapa;
        this.desarrollador = desarrollador;
        this.tipoError = tipoError;
        this.severidad = severidad;
        this.fechaRegistro = fechaRegistro != null ? fechaRegistro : LocalDateTime.now();
        this.estadoAtencion = "REGISTRADO";
    }

    // Getters y Setters
    public Long getIdError() {
        return idError;
    }

    public void setIdError(Long idError) {
        this.idError = idError;
    }

    public Etapa getEtapa() {
        return etapa;
    }

    public void setEtapa(Etapa etapa) {
        this.etapa = etapa;
    }

    public Trabajador getDesarrollador() {
        return desarrollador;
    }

    public void setDesarrollador(Trabajador desarrollador) {
        this.desarrollador = desarrollador;
    }

    public String getTipoError() {
        return tipoError;
    }

    public void setTipoError(String tipoError) {
        this.tipoError = tipoError;
    }

    public String getSeveridad() {
        return severidad;
    }

    public void setSeveridad(String severidad) {
        this.severidad = severidad;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public LocalDateTime getFechaRegistro() {
        return fechaRegistro;
    }

    public void setFechaRegistro(LocalDateTime fechaRegistro) {
        this.fechaRegistro = fechaRegistro;
    }

    public String getEstadoAtencion() {
        return estadoAtencion;
    }

    public void setEstadoAtencion(String estadoAtencion) {
        this.estadoAtencion = estadoAtencion;
    }

    public String getResolucionNota() {
        return resolucionNota;
    }

    public void setResolucionNota(String resolucionNota) {
        this.resolucionNota = resolucionNota;
    }

    public LocalDateTime getFechaResolucion() {
        return fechaResolucion;
    }

    public void setFechaResolucion(LocalDateTime fechaResolucion) {
        this.fechaResolucion = fechaResolucion;
    }
}
