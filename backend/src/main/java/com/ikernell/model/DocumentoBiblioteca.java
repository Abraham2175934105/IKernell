package com.ikernell.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Entity
@Table(name = "documento_biblioteca")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class DocumentoBiblioteca {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_documento")
    private Long idDocumento;

    @NotBlank(message = "El título del documento es obligatorio")
    @Column(name = "titulo", nullable = false, length = 200)
    private String titulo;

    @NotBlank(message = "La categoría es obligatoria")
    @Column(name = "categoria", nullable = false, length = 100)
    private String categoria;

    @Column(name = "archivo_url", length = 500)
    private String archivoUrl;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "version", length = 20)
    private String version = "v1.0";

    @Column(name = "formato", length = 50)
    private String formato = "PDF";

    @Column(name = "contenido_texto", columnDefinition = "TEXT")
    private String contenidoTexto;

    @Column(name = "fecha_subida", nullable = false)
    private LocalDateTime fechaSubida = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "subido_por_id")
    @JsonIgnoreProperties({"passwordHash", "proyectosLiderados", "actividades", "errores", "interrupciones"})
    private Trabajador subidoPor;

    public DocumentoBiblioteca() {}

    public DocumentoBiblioteca(Long idDocumento, String titulo, String categoria, String archivoUrl, 
                               String descripcion, String version, String formato, String contenidoTexto, 
                               LocalDateTime fechaSubida, Trabajador subidoPor) {
        this.idDocumento = idDocumento;
        this.titulo = titulo;
        this.categoria = categoria;
        this.archivoUrl = archivoUrl;
        this.descripcion = descripcion;
        this.version = version != null ? version : "v1.0";
        this.formato = formato != null ? formato : "PDF";
        this.contenidoTexto = contenidoTexto;
        this.fechaSubida = fechaSubida != null ? fechaSubida : LocalDateTime.now();
        this.subidoPor = subidoPor;
    }

    public Long getIdDocumento() { return idDocumento; }
    public void setIdDocumento(Long idDocumento) { this.idDocumento = idDocumento; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }

    public String getArchivoUrl() { return archivoUrl; }
    public void setArchivoUrl(String archivoUrl) { this.archivoUrl = archivoUrl; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }

    public String getFormato() { return formato; }
    public void setFormato(String formato) { this.formato = formato; }

    public String getContenidoTexto() { return contenidoTexto; }
    public void setContenidoTexto(String contenidoTexto) { this.contenidoTexto = contenidoTexto; }

    public LocalDateTime getFechaSubida() { return fechaSubida; }
    public void setFechaSubida(LocalDateTime fechaSubida) { this.fechaSubida = fechaSubida; }

    public Trabajador getSubidoPor() { return subidoPor; }
    public void setSubidoPor(Trabajador subidoPor) { this.subidoPor = subidoPor; }
}
