package com.ikernell.dto;

import com.ikernell.model.Rol;

public class AuthResponse {

    private String token;
    private String type = "Bearer";
    private Long idTrabajador;
    private String nombre;
    private String apellido;
    private String email;
    private String emailPersonal;
    private String identificacion;
    private String profesion;
    private String especialidad;
    private Rol rol;
    private Boolean primerLogin = false;

    public AuthResponse() {}

    public AuthResponse(String token, Long idTrabajador, String nombre, String apellido, String email, Rol rol) {
        this.token = token;
        this.idTrabajador = idTrabajador;
        this.nombre = nombre;
        this.apellido = apellido;
        this.email = email;
        this.rol = rol;
    }

    public AuthResponse(String token, Long idTrabajador, String nombre, String apellido, String email, 
                        String emailPersonal, String identificacion, String profesion, String especialidad, 
                        Rol rol, Boolean primerLogin) {
        this.token = token;
        this.idTrabajador = idTrabajador;
        this.nombre = nombre;
        this.apellido = apellido;
        this.email = email;
        this.emailPersonal = emailPersonal;
        this.identificacion = identificacion;
        this.profesion = profesion;
        this.especialidad = especialidad;
        this.rol = rol;
        this.primerLogin = primerLogin != null ? primerLogin : false;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Long getIdTrabajador() {
        return idTrabajador;
    }

    public void setIdTrabajador(Long idTrabajador) {
        this.idTrabajador = idTrabajador;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getApellido() {
        return apellido;
    }

    public void setApellido(String apellido) {
        this.apellido = apellido;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getEmailPersonal() {
        return emailPersonal;
    }

    public void setEmailPersonal(String emailPersonal) {
        this.emailPersonal = emailPersonal;
    }

    public String getIdentificacion() {
        return identificacion;
    }

    public void setIdentificacion(String identificacion) {
        this.identificacion = identificacion;
    }

    public String getProfesion() {
        return profesion;
    }

    public void setProfesion(String profesion) {
        this.profesion = profesion;
    }

    public String getEspecialidad() {
        return especialidad;
    }

    public void setEspecialidad(String especialidad) {
        this.especialidad = especialidad;
    }

    public Rol getRol() {
        return rol;
    }

    public void setRol(Rol rol) {
        this.rol = rol;
    }

    public Boolean getPrimerLogin() {
        return primerLogin;
    }

    public void setPrimerLogin(Boolean primerLogin) {
        this.primerLogin = primerLogin;
    }
}
