package com.ikernell.dto;

import java.time.LocalDateTime;

public class EtlReportResponse {

    private String nombreArchivo;
    private String estado;
    private int totalRegistrosExportados;
    private LocalDateTime fechaGeneracion;
    private String destinoEnvio; // ej: "SFTP - sftp.brasil.ikernell.com / Email"
    private String vistaPreviaFormatoISO; // Muestra representativa de los datos estandarizados

    public EtlReportResponse() {}

    public EtlReportResponse(String nombreArchivo, String estado, int totalRegistrosExportados, 
                             LocalDateTime fechaGeneracion, String destinoEnvio, String vistaPreviaFormatoISO) {
        this.nombreArchivo = nombreArchivo;
        this.estado = estado;
        this.totalRegistrosExportados = totalRegistrosExportados;
        this.fechaGeneracion = fechaGeneracion;
        this.destinoEnvio = destinoEnvio;
        this.vistaPreviaFormatoISO = vistaPreviaFormatoISO;
    }

    public String getNombreArchivo() {
        return nombreArchivo;
    }

    public void setNombreArchivo(String nombreArchivo) {
        this.nombreArchivo = nombreArchivo;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public int getTotalRegistrosExportados() {
        return totalRegistrosExportados;
    }

    public void setTotalRegistrosExportados(int totalRegistrosExportados) {
        this.totalRegistrosExportados = totalRegistrosExportados;
    }

    public LocalDateTime getFechaGeneracion() {
        return fechaGeneracion;
    }

    public void setFechaGeneracion(LocalDateTime fechaGeneracion) {
        this.fechaGeneracion = fechaGeneracion;
    }

    public String getDestinoEnvio() {
        return destinoEnvio;
    }

    public void setDestinoEnvio(String destinoEnvio) {
        this.destinoEnvio = destinoEnvio;
    }

    public String getVistaPreviaFormatoISO() {
        return vistaPreviaFormatoISO;
    }

    public void setVistaPreviaFormatoISO(String vistaPreviaFormatoISO) {
        this.vistaPreviaFormatoISO = vistaPreviaFormatoISO;
    }
}
