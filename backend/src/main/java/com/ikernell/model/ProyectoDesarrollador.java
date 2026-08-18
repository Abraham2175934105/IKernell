package com.ikernell.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "proyecto_desarrollador",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_proyecto_desarrollador", columnNames = {"id_proyecto", "id_desarrollador"})
    }
)
public class ProyectoDesarrollador {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_asignacion")
    private Long idAsignacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proyecto_id", nullable = false)
    private Proyecto proyecto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "desarrollador_id", nullable = false)
    private Trabajador desarrollador;

    @Column(name = "horas_semanales", nullable = false)
    private Integer horasSemanales = 40;

    @Column(name = "fecha_asignacion", nullable = false, updatable = false)
    private LocalDateTime fechaAsignacion = LocalDateTime.now();

    // Constructores
    public ProyectoDesarrollador() {}

    public ProyectoDesarrollador(Long idAsignacion, Proyecto proyecto, Trabajador desarrollador, Integer horasSemanales, LocalDateTime fechaAsignacion) {
        this.idAsignacion = idAsignacion;
        this.proyecto = proyecto;
        this.desarrollador = desarrollador;
        this.horasSemanales = horasSemanales != null ? horasSemanales : 40;
        this.fechaAsignacion = fechaAsignacion != null ? fechaAsignacion : LocalDateTime.now();
    }

    // Getters y Setters
    public Long getIdAsignacion() {
        return idAsignacion;
    }

    public void setIdAsignacion(Long idAsignacion) {
        this.idAsignacion = idAsignacion;
    }

    public Proyecto getProyecto() {
        return proyecto;
    }

    public void setProyecto(Proyecto proyecto) {
        this.proyecto = proyecto;
    }

    public Trabajador getDesarrollador() {
        return desarrollador;
    }

    public void setDesarrollador(Trabajador desarrollador) {
        this.desarrollador = desarrollador;
    }

    public Integer getHorasSemanales() {
        return horasSemanales;
    }

    public void setHorasSemanales(Integer horasSemanales) {
        this.horasSemanales = horasSemanales;
    }

    public LocalDateTime getFechaAsignacion() {
        return fechaAsignacion;
    }

    public void setFechaAsignacion(LocalDateTime fechaAsignacion) {
        this.fechaAsignacion = fechaAsignacion;
    }
}
