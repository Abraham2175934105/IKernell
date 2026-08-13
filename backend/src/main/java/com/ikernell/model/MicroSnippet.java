package com.ikernell.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

/**
 * Entidad que representa un bloque de código o solución técnica 
 * inyectable mediante el motor de búsqueda difusa (Fuzzy Search pg_trgm).
 */
@Entity
@Table(name = "micro_snippet")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class MicroSnippet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_snippet")
    private Long idSnippet;

    @Column(name = "titulo", nullable = false, length = 150)
    private String titulo;

    @Column(name = "descripcion", nullable = false, columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "tags_busqueda", nullable = false, columnDefinition = "TEXT")
    private String tagsBusqueda;

    @Column(name = "codigo_solucion", nullable = false, columnDefinition = "TEXT")
    private String codigoSolucion;

    @Column(name = "lenguaje", nullable = false, length = 50)
    private String lenguaje;

    @Column(name = "comando_consola", nullable = false)
    private Boolean comandoConsola = false;

    @Transient
    private Double score;

    public MicroSnippet() {}

    public MicroSnippet(Long idSnippet, String titulo, String descripcion, String tagsBusqueda, 
                        String codigoSolucion, String lenguaje, Boolean comandoConsola) {
        this.idSnippet = idSnippet;
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.tagsBusqueda = tagsBusqueda;
        this.codigoSolucion = codigoSolucion;
        this.lenguaje = lenguaje;
        this.comandoConsola = comandoConsola != null ? comandoConsola : false;
    }

    public Long getIdSnippet() {
        return idSnippet;
    }

    public void setIdSnippet(Long idSnippet) {
        this.idSnippet = idSnippet;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getTagsBusqueda() {
        return tagsBusqueda;
    }

    public void setTagsBusqueda(String tagsBusqueda) {
        this.tagsBusqueda = tagsBusqueda;
    }

    public String getCodigoSolucion() {
        return codigoSolucion;
    }

    public void setCodigoSolucion(String codigoSolucion) {
        this.codigoSolucion = codigoSolucion;
    }

    public String getLenguaje() {
        return lenguaje;
    }

    public void setLenguaje(String lenguaje) {
        this.lenguaje = lenguaje;
    }

    public Boolean getComandoConsola() {
        return comandoConsola;
    }

    public void setComandoConsola(Boolean comandoConsola) {
        this.comandoConsola = comandoConsola;
    }

    public Double getScore() {
        return score;
    }

    public void setScore(Double score) {
        this.score = score;
    }
}
