package com.ikernell.model;

import jakarta.persistence.*;

// Entidad JPA para actividades y tareas operativas asignadas a los desarrolladores dentro de una etapa WBS
@Entity
@Table(name = "actividad")
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Actividad {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_actividad")
    private Long idActividad;

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"actividades", "errores", "interrupciones", "hibernateLazyInitializer", "handler"})
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "etapa_id", nullable = false)
    private Etapa etapa;

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "actividades", "errores", "interrupciones", "passwordHash", "proyectosLiderados"})
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "desarrollador_id", nullable = false)
    private Trabajador desarrollador;



    @Column(name = "descripcion", nullable = false, columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "estado", nullable = false, length = 20)
    private String estado;

    @Column(name = "fecha_asignacion")
    private java.time.LocalDateTime fechaAsignacion;

    @PrePersist
    public void onCreate() {
        if (this.fechaAsignacion == null) {
            this.fechaAsignacion = java.time.LocalDateTime.now();
        }
    }

    // Constructores
    public Actividad() {}

    public Actividad(Long idActividad, Etapa etapa, Trabajador desarrollador, String descripcion, String estado) {
        this.idActividad = idActividad;
        this.etapa = etapa;
        this.desarrollador = desarrollador;
        this.descripcion = descripcion;
        this.estado = estado;
    }

    // Getters y Setters
    public Long getIdActividad() {
        return idActividad;
    }

    public void setIdActividad(Long idActividad) {
        this.idActividad = idActividad;
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

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public java.time.LocalDateTime getFechaAsignacion() {
        return fechaAsignacion;
    }

    public void setFechaAsignacion(java.time.LocalDateTime fechaAsignacion) {
        this.fechaAsignacion = fechaAsignacion;
    }
}
