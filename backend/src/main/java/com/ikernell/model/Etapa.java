package com.ikernell.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "etapa")
public class Etapa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_etapa")
    private Long idEtapa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proyecto_id", nullable = false)
    private Proyecto proyecto;

    @Column(name = "nombre_etapa", nullable = false, length = 100)
    private String nombreEtapa;

    @Column(name = "estado", nullable = false, length = 20)
    private String estado;

    @OneToMany(mappedBy = "etapa", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Actividad> actividades = new ArrayList<>();

    @OneToMany(mappedBy = "etapa", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Error> errores = new ArrayList<>();

    @OneToMany(mappedBy = "etapa", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Interrupcion> interrupciones = new ArrayList<>();

    // Constructores
    public Etapa() {}

    public Etapa(Long idEtapa, Proyecto proyecto, String nombreEtapa, String estado) {
        this.idEtapa = idEtapa;
        this.proyecto = proyecto;
        this.nombreEtapa = nombreEtapa;
        this.estado = estado;
    }

    // Getters y Setters
    public Long getIdEtapa() {
        return idEtapa;
    }

    public void setIdEtapa(Long idEtapa) {
        this.idEtapa = idEtapa;
    }

    public Proyecto getProyecto() {
        return proyecto;
    }

    public void setProyecto(Proyecto proyecto) {
        this.proyecto = proyecto;
    }

    public String getNombreEtapa() {
        return nombreEtapa;
    }

    public void setNombreEtapa(String nombreEtapa) {
        this.nombreEtapa = nombreEtapa;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public List<Actividad> getActividades() {
        return actividades;
    }

    public void setActividades(List<Actividad> actividades) {
        this.actividades = actividades;
    }

    public List<Error> getErrores() {
        return errores;
    }

    public void setErrores(List<Error> errores) {
        this.errores = errores;
    }

    public List<Interrupcion> getInterrupciones() {
        return interrupciones;
    }

    public void setInterrupciones(List<Interrupcion> interrupciones) {
        this.interrupciones = interrupciones;
    }
}
