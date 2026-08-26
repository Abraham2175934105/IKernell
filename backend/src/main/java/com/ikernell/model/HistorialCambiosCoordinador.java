package com.ikernell.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "historial_cambios_coordinador")
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class HistorialCambiosCoordinador {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_historial")
    private Long idHistorial;

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"etapas", "desarrolladores", "hibernateLazyInitializer", "handler"})
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "proyecto_id", nullable = false)
    private Proyecto proyecto;

    @Column(name = "id_coordinador")
    private Long idCoordinador;

    @Column(name = "nombre_coordinador", length = 150)
    private String nombreCoordinador;

    @Column(name = "email_coordinador", length = 150)
    private String emailCoordinador;

    @Column(name = "accion", nullable = false, length = 100)
    private String accion;

    @Column(name = "detalles", columnDefinition = "TEXT")
    private String detalles;

    @Column(name = "fecha_cambio", nullable = false)
    private LocalDateTime fechaCambio;

    @Column(name = "batch_id", length = 100)
    private String batchId;

    public HistorialCambiosCoordinador() {}

    public HistorialCambiosCoordinador(Proyecto proyecto, Long idCoordinador, String nombreCoordinador, 
                                       String emailCoordinador, String accion, String detalles, 
                                       LocalDateTime fechaCambio, String batchId) {
        this.proyecto = proyecto;
        this.idCoordinador = idCoordinador;
        this.nombreCoordinador = nombreCoordinador;
        this.emailCoordinador = emailCoordinador;
        this.accion = accion;
        this.detalles = detalles;
        this.fechaCambio = fechaCambio;
        this.batchId = batchId;
    }

    public Long getIdHistorial() {
        return idHistorial;
    }

    public void setIdHistorial(Long idHistorial) {
        this.idHistorial = idHistorial;
    }

    public Proyecto getProyecto() {
        return proyecto;
    }

    public void setProyecto(Proyecto proyecto) {
        this.proyecto = proyecto;
    }

    public Long getIdCoordinador() {
        return idCoordinador;
    }

    public void setIdCoordinador(Long idCoordinador) {
        this.idCoordinador = idCoordinador;
    }

    public String getNombreCoordinador() {
        return nombreCoordinador;
    }

    public void setNombreCoordinador(String nombreCoordinador) {
        this.nombreCoordinador = nombreCoordinador;
    }

    public String getEmailCoordinador() {
        return emailCoordinador;
    }

    public void setEmailCoordinador(String emailCoordinador) {
        this.emailCoordinador = emailCoordinador;
    }

    public String getAccion() {
        return accion;
    }

    public void setAccion(String accion) {
        this.accion = accion;
    }

    public String getDetalles() {
        return detalles;
    }

    public void setDetalles(String detalles) {
        this.detalles = detalles;
    }

    public LocalDateTime getFechaCambio() {
        return fechaCambio;
    }

    public void setFechaCambio(LocalDateTime fechaCambio) {
        this.fechaCambio = fechaCambio;
    }

    public String getBatchId() {
        return batchId;
    }

    public void setBatchId(String batchId) {
        this.batchId = batchId;
    }
}
