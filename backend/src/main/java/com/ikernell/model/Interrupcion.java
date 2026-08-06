package com.ikernell.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "interrupcion")
public class Interrupcion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_interrupcion")
    private Long idInterrupcion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_etapa", nullable = false)
    private Etapa etapa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_desarrollador", nullable = false)
    private Trabajador desarrollador;

    @Column(name = "tipo_interrupcion", nullable = false, length = 100)
    private String tipoInterrupcion;

    @Column(name = "fecha_ocurrencia", nullable = false)
    private LocalDateTime fechaOcurrencia;

    @Column(name = "duracion_minutos", nullable = false)
    private Integer duracionMinutos;

    @Column(name = "comentarios", columnDefinition = "TEXT")
    private String comentarios;

    // Constructores
    public Interrupcion() {}

    public Interrupcion(Long idInterrupcion, Etapa etapa, Trabajador desarrollador, 
                        String tipoInterrupcion, LocalDateTime fechaOcurrencia, 
                        Integer duracionMinutos, String comentarios) {
        this.idInterrupcion = idInterrupcion;
        this.etapa = etapa;
        this.desarrollador = desarrollador;
        this.tipoInterrupcion = tipoInterrupcion;
        this.fechaOcurrencia = fechaOcurrencia;
        this.duracionMinutos = duracionMinutos;
        this.comentarios = comentarios;
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
}
