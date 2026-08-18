package com.ikernell.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

// Entidad JPA para proyectos de software, estructurados con fechas de inicio, estimación y líder asignado
@Entity
@Table(name = "proyecto")
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Proyecto {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_proyecto")
    private Long idProyecto;

    @Column(name = "nombre", nullable = false, length = 150)
    private String nombre;

    @Column(name = "cliente", length = 150)
    private String cliente;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "presupuesto")
    private java.math.BigDecimal presupuesto;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin_estimada", nullable = false)
    private LocalDate fechaFinEstimada;

    @Column(name = "estado", nullable = false, length = 20)
    private String estado;

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "passwordHash", "proyectosLiderados", "actividades", "errores", "interrupciones"})
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "lider_id", nullable = false)
    private Trabajador lider;


    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToMany(mappedBy = "proyecto", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Etapa> etapas = new ArrayList<>();

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToMany
    @JoinTable(
        name = "proyecto_desarrollador",
        joinColumns = @JoinColumn(name = "proyecto_id"),
        inverseJoinColumns = @JoinColumn(name = "desarrollador_id")
    )
    private List<Trabajador> desarrolladores = new ArrayList<>();


    // Constructores
    public Proyecto() {}

    public Proyecto(Long idProyecto, String nombre, String descripcion, LocalDate fechaInicio, 
                    LocalDate fechaFinEstimada, String estado, Trabajador lider) {
        this.idProyecto = idProyecto;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.fechaInicio = fechaInicio;
        this.fechaFinEstimada = fechaFinEstimada;
        this.estado = estado;
        this.lider = lider;
    }

    // Getters y Setters
    public Long getIdProyecto() {
        return idProyecto;
    }

    public void setIdProyecto(Long idProyecto) {
        this.idProyecto = idProyecto;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getCliente() {
        return cliente;
    }

    public void setCliente(String cliente) {
        this.cliente = cliente;
    }

    public java.math.BigDecimal getPresupuesto() {
        return presupuesto;
    }

    public void setPresupuesto(java.math.BigDecimal presupuesto) {
        this.presupuesto = presupuesto;
    }

    public LocalDate getFechaInicio() {
        return fechaInicio;
    }

    public void setFechaInicio(LocalDate fechaInicio) {
        this.fechaInicio = fechaInicio;
    }

    public LocalDate getFechaFinEstimada() {
        return fechaFinEstimada;
    }

    public void setFechaFinEstimada(LocalDate fechaFinEstimada) {
        this.fechaFinEstimada = fechaFinEstimada;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public Trabajador getLider() {
        return lider;
    }

    public void setLider(Trabajador lider) {
        this.lider = lider;
    }

    public List<Etapa> getEtapas() {
        return etapas;
    }

    public void setEtapas(List<Etapa> etapas) {
        this.etapas = etapas;
    }

    public List<Trabajador> getDesarrolladores() {
        return desarrolladores;
    }

    public void setDesarrolladores(List<Trabajador> desarrolladores) {
        this.desarrolladores = desarrolladores;
    }
}
