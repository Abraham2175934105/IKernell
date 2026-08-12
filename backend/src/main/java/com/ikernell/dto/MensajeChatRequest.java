package com.ikernell.dto;

import jakarta.validation.constraints.NotBlank;

public class MensajeChatRequest {

    private String canal = "general";

    @NotBlank(message = "El contenido del mensaje no puede estar vacío")
    private String contenido;

    private Long destinatarioId;

    public MensajeChatRequest() {}

    public MensajeChatRequest(String canal, String contenido, Long destinatarioId) {
        this.canal = canal;
        this.contenido = contenido;
        this.destinatarioId = destinatarioId;
    }

    public String getCanal() { return canal; }
    public void setCanal(String canal) { this.canal = canal; }

    public String getContenido() { return contenido; }
    public void setContenido(String contenido) { this.contenido = contenido; }

    public Long getDestinatarioId() { return destinatarioId; }
    public void setDestinatarioId(Long destinatarioId) { this.destinatarioId = destinatarioId; }
}
