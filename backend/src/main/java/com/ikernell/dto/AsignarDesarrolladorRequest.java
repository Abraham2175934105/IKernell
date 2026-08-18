package com.ikernell.dto;

public class AsignarDesarrolladorRequest {

    private Long idDesarrollador;
    private Integer horasSemanales;

    public AsignarDesarrolladorRequest() {}

    public AsignarDesarrolladorRequest(Long idDesarrollador, Integer horasSemanales) {
        this.idDesarrollador = idDesarrollador;
        this.horasSemanales = horasSemanales;
    }

    public Long getIdDesarrollador() { return idDesarrollador; }
    public void setIdDesarrollador(Long idDesarrollador) { this.idDesarrollador = idDesarrollador; }

    public Integer getHorasSemanales() { return horasSemanales; }
    public void setHorasSemanales(Integer horasSemanales) { this.horasSemanales = horasSemanales; }
}
