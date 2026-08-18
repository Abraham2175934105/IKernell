package com.ikernell.dto;

public class DesarrolladorCargaDTO {

    private Long idTrabajador;
    private String nombre;
    private String apellido;
    private String especialidad;
    private String profesion;
    private String email;
    private Integer horasAsignadas;
    private Integer horasDisponibles;
    private Integer limiteMaximo;
    private Double porcentajeCarga;
    private String nivelCarga; // DISPONIBLE, MODERADA, ALTA, COMPLETA

    public DesarrolladorCargaDTO() {}

    public DesarrolladorCargaDTO(Long idTrabajador, String nombre, String apellido, String especialidad, 
                                 String profesion, String email, Integer horasAsignadas, 
                                 Integer horasDisponibles, Integer limiteMaximo, 
                                 Double porcentajeCarga, String nivelCarga) {
        this.idTrabajador = idTrabajador;
        this.nombre = nombre;
        this.apellido = apellido;
        this.especialidad = especialidad;
        this.profesion = profesion;
        this.email = email;
        this.horasAsignadas = horasAsignadas;
        this.horasDisponibles = horasDisponibles;
        this.limiteMaximo = limiteMaximo;
        this.porcentajeCarga = porcentajeCarga;
        this.nivelCarga = nivelCarga;
    }

    public Long getIdTrabajador() { return idTrabajador; }
    public void setIdTrabajador(Long idTrabajador) { this.idTrabajador = idTrabajador; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getApellido() { return apellido; }
    public void setApellido(String apellido) { this.apellido = apellido; }

    public String getEspecialidad() { return especialidad; }
    public void setEspecialidad(String especialidad) { this.especialidad = especialidad; }

    public String getProfesion() { return profesion; }
    public void setProfesion(String profesion) { this.profesion = profesion; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Integer getHorasAsignadas() { return horasAsignadas; }
    public void setHorasAsignadas(Integer horasAsignadas) { this.horasAsignadas = horasAsignadas; }

    public Integer getHorasDisponibles() { return horasDisponibles; }
    public void setHorasDisponibles(Integer horasDisponibles) { this.horasDisponibles = horasDisponibles; }

    public Integer getLimiteMaximo() { return limiteMaximo; }
    public void setLimiteMaximo(Integer limiteMaximo) { this.limiteMaximo = limiteMaximo; }

    public Double getPorcentajeCarga() { return porcentajeCarga; }
    public void setPorcentajeCarga(Double porcentajeCarga) { this.porcentajeCarga = porcentajeCarga; }

    public String getNivelCarga() { return nivelCarga; }
    public void setNivelCarga(String nivelCarga) { this.nivelCarga = nivelCarga; }
}
