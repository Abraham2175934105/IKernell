package com.ikernell.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

// Entidad JPA para el registro de contingencias y tiempos muertos en minutos (alimenta el Semáforo de Riesgo)
@Entity
@Table(name = "interrupcion")
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Interrupcion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_interrupcion")
    private Long idInterrupcion;

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "actividades", "errores", "interrupciones"})
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "etapa_id", nullable = false)
    private Etapa etapa;

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "actividades", "errores", "interrupciones", "passwordHash", "proyectosLiderados"})
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "desarrollador_id", nullable = false)
    private Trabajador desarrollador;

    @Column(name = "tipo_interrupcion", nullable = false, length = 100)
    private String tipoInterrupcion;

    @Column(name = "fecha_ocurrencia", nullable = false)
    private LocalDateTime fechaOcurrencia = LocalDateTime.now();

    @Column(name = "duracion_minutos", nullable = false)
    private Integer duracionMinutos;

    @Column(name = "comentarios", columnDefinition = "TEXT")
    private String comentarios;

    @Column(name = "estado_atencion", length = 30)
    private String estadoAtencion = "REGISTRADO";

    @Column(name = "resolucion_nota", columnDefinition = "TEXT")
    private String resolucionNota;

    @Column(name = "fecha_resolucion")
    private LocalDateTime fechaResolucion;

    // Constructores
    public Interrupcion() {}

    public Interrupcion(Long idInterrupcion, Etapa etapa, Trabajador desarrollador, 
                        String tipoInterrupcion, LocalDateTime fechaOcurrencia, 
                        Integer duracionMinutos, String comentarios) {
        this.idInterrupcion = idInterrupcion;
        this.etapa = etapa;
        this.desarrollador = desarrollador;
        this.tipoInterrupcion = tipoInterrupcion;
        this.fechaOcurrencia = fechaOcurrencia != null ? fechaOcurrencia : LocalDateTime.now();
        this.duracionMinutos = duracionMinutos;
        this.comentarios = comentarios;
        this.estadoAtencion = "REGISTRADO";
    }

    // Getters y Setters
    public Long getIdInterrupcion() {
        return idInterrupcion;
    }

    public void setIdInterrupcion(Long idInterrupcion) {
        this.idInterrupcion = idInterrupcion;
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

    public String getTipoInterrupcion() {
        return tipoInterrupcion;
    }

    public void setTipoInterrupcion(String tipoInterrupcion) {
        this.tipoInterrupcion = tipoInterrupcion;
    }

    public LocalDateTime getFechaOcurrencia() {
        return fechaOcurrencia;
    }

    public void setFechaOcurrencia(LocalDateTime fechaOcurrencia) {
        this.fechaOcurrencia = fechaOcurrencia;
    }

    public Integer getDuracionMinutos() {
        return duracionMinutos;
    }

    public void setDuracionMinutos(Integer duracionMinutos) {
        this.duracionMinutos = duracionMinutos;
    }

    public String getComentarios() {
        return comentarios;
    }

    public void setComentarios(String comentarios) {
        this.comentarios = comentarios;
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
