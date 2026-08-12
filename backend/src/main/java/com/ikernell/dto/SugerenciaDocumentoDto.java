package com.ikernell.dto;

public class SugerenciaDocumentoDto {

    private Long idDocumento;
    private String titulo;
    private String categoria;
    private String formato;
    private String version;

    public SugerenciaDocumentoDto() {}

    public SugerenciaDocumentoDto(Long idDocumento, String titulo, String categoria, String formato, String version) {
        this.idDocumento = idDocumento;
        this.titulo = titulo;
        this.categoria = categoria;
        this.formato = formato;
        this.version = version;
    }

    public Long getIdDocumento() { return idDocumento; }
    public void setIdDocumento(Long idDocumento) { this.idDocumento = idDocumento; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }

    public String getFormato() { return formato; }
    public void setFormato(String formato) { this.formato = formato; }

    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }
}
