package com.ikernell.dto;

import java.util.List;

/**
 * DTO para la transferencia de métricas del Predictor de Burnout Histórico (RF-35).
 * Analiza el historial acumulado en ventanas de 21 días (Semanas S1, S2, S3).
 */
public class BurnoutMetricsDto {

    private Long idTrabajador;
    private String nombreCompleto;
    private String email;
    private String especialidad;
    private int tareasActivas;
    private double scoreSemana1; // Días 15 a 21
    private double scoreSemana2; // Días 8 a 14
    private double scoreSemana3; // Últimos 7 días
    private double promedioCarga;
    private String estadoAlerta; // RIESGO_BURNOUT_INMINENTE, SOBRECARGA_AGUDA, TENDENCIA_DE_ESTRES_ACELERADA, ESTABLE
    private String recomendacion;
    private boolean capacidadBloqueada;
    private List<Double> historicoTendencia;

    public BurnoutMetricsDto() {}

    public Long getIdTrabajador() {
        return idTrabajador;
    }

    public void setIdTrabajador(Long idTrabajador) {
        this.idTrabajador = idTrabajador;
    }

    public String getNombreCompleto() {
        return nombreCompleto;
    }

    public void setNombreCompleto(String nombreCompleto) {
        this.nombreCompleto = nombreCompleto;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getEspecialidad() {
        return especialidad;
    }

    public void setEspecialidad(String especialidad) {
        this.especialidad = especialidad;
    }

    public int getTareasActivas() {
        return tareasActivas;
    }

    public void setTareasActivas(int tareasActivas) {
        this.tareasActivas = tareasActivas;
    }

    public double getScoreSemana1() {
        return scoreSemana1;
    }

    public void setScoreSemana1(double scoreSemana1) {
        this.scoreSemana1 = scoreSemana1;
    }

    public double getScoreSemana2() {
        return scoreSemana2;
    }

    public void setScoreSemana2(double scoreSemana2) {
        this.scoreSemana2 = scoreSemana2;
    }

    public double getScoreSemana3() {
        return scoreSemana3;
    }

    public void setScoreSemana3(double scoreSemana3) {
        this.scoreSemana3 = scoreSemana3;
    }

    public double getPromedioCarga() {
        return promedioCarga;
    }

    public void setPromedioCarga(double promedioCarga) {
        this.promedioCarga = promedioCarga;
    }

    public String getEstadoAlerta() {
        return estadoAlerta;
    }

    public void setEstadoAlerta(String estadoAlerta) {
        this.estadoAlerta = estadoAlerta;
    }

    public String getRecomendacion() {
        return recomendacion;
    }

    public void setRecomendacion(String recomendacion) {
        this.recomendacion = recomendacion;
    }

    public boolean isCapacidadBloqueada() {
        return capacidadBloqueada;
    }

    public void setCapacidadBloqueada(boolean capacidadBloqueada) {
        this.capacidadBloqueada = capacidadBloqueada;
    }

    public List<Double> getHistoricoTendencia() {
        return historicoTendencia;
    }

    public void setHistoricoTendencia(List<Double> historicoTendencia) {
        this.historicoTendencia = historicoTendencia;
    }
}
