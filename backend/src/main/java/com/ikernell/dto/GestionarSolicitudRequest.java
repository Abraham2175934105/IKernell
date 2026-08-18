package com.ikernell.dto;

import java.io.Serializable;

/**
 * DTO para registrar la atención, notas de gestión o motivo de reapertura
 * de una solicitud de contacto recibida desde la web pública.
 */
public class GestionarSolicitudRequest implements Serializable {

    private String estado; // PENDIENTE, EN_PROCESO, ATENDIDA, REABIERTA
    private String notasAtencion; // Qué se realizó, contexto del caso, acuerdos comerciales
    private String motivoReapertura; // Explicación obligatoria si el caso se reabre

    public GestionarSolicitudRequest() {}

    public GestionarSolicitudRequest(String estado, String notasAtencion, String motivoReapertura) {
        this.estado = estado;
        this.notasAtencion = notasAtencion;
        this.motivoReapertura = motivoReapertura;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getNotasAtencion() {
        return notasAtencion;
    }

    public void setNotasAtencion(String notasAtencion) {
        this.notasAtencion = notasAtencion;
    }

    public String getMotivoReapertura() {
        return motivoReapertura;
    }

    public void setMotivoReapertura(String motivoReapertura) {
        this.motivoReapertura = motivoReapertura;
    }
}
