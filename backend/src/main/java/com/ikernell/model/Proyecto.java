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

    @Column(name = "reasignado")
    private Boolean reasignado = false;

    @Column(name = "fecha_reasignacion")
    private java.time.LocalDateTime fechaReasignacion;

    @Column(name = "motivo_reasignacion", columnDefinition = "TEXT")
    private String motivoReasignacion;

    @Column(name = "id_lider_anterior")
    private Long idLiderAnterior;

    @Column(name = "nombre_lider_anterior", length = 150)
    private String nombreLiderAnterior;

    @Column(name = "leido_por_lider_anterior")
    private Boolean leidoPorLiderAnterior = false;

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "passwordHash", "proyectosLiderados", "actividades", "errores", "interrupciones"})
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "lider_id", nullable = false)
    private Trabajador lider;


    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"proyecto", "hibernateLazyInitializer", "handler"})
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

    public Boolean getReasignado() {
        return reasignado != null ? reasignado : false;
    }

    public void setReasignado(Boolean reasignado) {
        this.reasignado = reasignado;
    }

    public java.time.LocalDateTime getFechaReasignacion() {
        return fechaReasignacion;
    }

    public void setFechaReasignacion(java.time.LocalDateTime fechaReasignacion) {
        this.fechaReasignacion = fechaReasignacion;
    }

    public String getMotivoReasignacion() {
        return motivoReasignacion;
    }

    public void setMotivoReasignacion(String motivoReasignacion) {
        this.motivoReasignacion = motivoReasignacion;
    }

    public Long getIdLiderAnterior() {
        return idLiderAnterior;
    }

    public void setIdLiderAnterior(Long idLiderAnterior) {
        this.idLiderAnterior = idLiderAnterior;
    }

    public String getNombreLiderAnterior() {
        return nombreLiderAnterior;
    }

    public void setNombreLiderAnterior(String nombreLiderAnterior) {
        this.nombreLiderAnterior = nombreLiderAnterior;
    }

    public Boolean getLeidoPorLiderAnterior() {
        return leidoPorLiderAnterior != null ? leidoPorLiderAnterior : false;
    }

    public void setLeidoPorLiderAnterior(Boolean leidoPorLiderAnterior) {
        this.leidoPorLiderAnterior = leidoPorLiderAnterior;
    }

    public List<Trabajador> getDesarrolladores() {
        return desarrolladores;
    }

    public void setDesarrolladores(List<Trabajador> desarrolladores) {
        this.desarrolladores = desarrolladores;
    }
}
