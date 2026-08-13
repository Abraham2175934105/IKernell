package com.ikernell.dto;

/**
 * Interfaz de Proyección JPA (Interface-Based Projection) para mapear directamente
 * los resultados de la consulta analítica nativa de PostgreSQL (RF-35).
 * 
 * Spring Data JPA instancia automáticamente proxies de esta interfaz,
 * eliminando la necesidad de mapeo manual con Object[] o constructores.
 */
public interface BurnoutProjection {

    Long getIdTrabajador();

    String getNombreCompleto();

    String getEmail();

    String getEspecialidad();

    Integer getTareasActivas();

    Double getScoreSemana1();

    Double getScoreSemana2();

    Double getScoreSemana3();

    Double getPromedioCarga();

    String getEstadoAlerta();

    String getRecomendacion();

    Boolean getCapacidadBloqueada();
}
