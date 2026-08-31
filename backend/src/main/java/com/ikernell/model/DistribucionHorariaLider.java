package com.ikernell.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "distribucion_horaria_lider")
public class DistribucionHorariaLider {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_distribucion")
    private Long idDistribucion;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_trabajador", nullable = false)
    private Trabajador trabajador;

    @Column(name = "semana_codigo", nullable = false, length = 20)
    private String semanaCodigo;

    @Column(name = "horas_lider_asignadas", nullable = false)
    private Integer horasLiderAsignadas = 24;

    @Column(name = "horas_desarrollador_asignadas", nullable = false)
    private Integer horasDesarrolladorAsignadas = 24;

    @Column(name = "modo_distribucion", length = 30)
    private String modoDistribucion = "AUTOMATICO_INTELIGENTE";

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion = LocalDateTime.now();

    public DistribucionHorariaLider() {
    }

    public DistribucionHorariaLider(Trabajador trabajador, String semanaCodigo, Integer horasLiderAsignadas, Integer horasDesarrolladorAsignadas, String modoDistribucion) {
        this.trabajador = trabajador;
        this.semanaCodigo = semanaCodigo;
        this.horasLiderAsignadas = horasLiderAsignadas;
        this.horasDesarrolladorAsignadas = horasDesarrolladorAsignadas;
        this.modoDistribucion = modoDistribucion;
        this.fechaActualizacion = LocalDateTime.now();
    }

    public Long getIdDistribucion() {
        return idDistribucion;
    }

    public void setIdDistribucion(Long idDistribucion) {
        this.idDistribucion = idDistribucion;
    }

    public Trabajador getTrabajador() {
        return trabajador;
    }

    public void setTrabajador(Trabajador trabajador) {
        this.trabajador = trabajador;
    }

    public String getSemanaCodigo() {
        return semanaCodigo;
    }

    public void setSemanaCodigo(String semanaCodigo) {
        this.semanaCodigo = semanaCodigo;
    }

    public Integer getHorasLiderAsignadas() {
        return horasLiderAsignadas;
    }

    public void setHorasLiderAsignadas(Integer horasLiderAsignadas) {
        this.horasLiderAsignadas = horasLiderAsignadas;
    }

    public Integer getHorasDesarrolladorAsignadas() {
        return horasDesarrolladorAsignadas;
    }

    public void setHorasDesarrolladorAsignadas(Integer horasDesarrolladorAsignadas) {
        this.horasDesarrolladorAsignadas = horasDesarrolladorAsignadas;
    }

    public String getModoDistribucion() {
        return modoDistribucion;
    }

    public void setModoDistribucion(String modoDistribucion) {
        this.modoDistribucion = modoDistribucion;
    }

    public LocalDateTime getFechaActualizacion() {
        return fechaActualizacion;
    }

    public void setFechaActualizacion(LocalDateTime fechaActualizacion) {
        this.fechaActualizacion = fechaActualizacion;
    }
}
