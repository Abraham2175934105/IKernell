package com.ikernell.dto;

/**
 * Interfaz de Proyección JPA (Interface-Based Projection) para mapear directamente
 * los resultados de la consulta analítica nativa de PostgreSQL (RF-35).
 * 
 * Se utiliza Number para scores y promedios para garantizar total interoperabilidad
 * con BigDecimal, Double, Float y tipos numéricos nativos de PostgreSQL.
 */
public interface BurnoutProjection {

    Long getIdTrabajador();

    String getNombreCompleto();

    String getEmail();

    String getEspecialidad();

    Integer getTareasActivas();

    Number getScoreSemana1();

    Number getScoreSemana2();

    Number getScoreSemana3();

    Number getPromedioCarga();

    String getEstadoAlerta();

    String getRecomendacion();

    Boolean getCapacidadBloqueada();
}
