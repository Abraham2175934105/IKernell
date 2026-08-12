package com.ikernell.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

// Entidad JPA para mensajes del chat corporativo, segmentados por canal o comunicación directa
@Entity
@Table(name = "mensaje_chat")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class MensajeChat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_mensaje")
    private Long idMensaje;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "remitente_id", nullable = false)
    @JsonIgnoreProperties({"passwordHash", "proyectosLiderados", "actividades", "errores", "interrupciones"})
    private Trabajador remitente;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "destinatario_id")
    @JsonIgnoreProperties({"passwordHash", "proyectosLiderados", "actividades", "errores", "interrupciones"})
    private Trabajador destinatario;

    @Column(name = "canal", length = 50)
    private String canal = "general";

    @NotBlank(message = "El contenido del mensaje no puede estar vacío")
    @Column(name = "contenido", nullable = false, columnDefinition = "TEXT")
    private String contenido;

    @Column(name = "fecha_envio", nullable = false)
    private LocalDateTime fechaEnvio = LocalDateTime.now();

    public MensajeChat() {}

    public MensajeChat(Long idMensaje, Trabajador remitente, Trabajador destinatario, 
                       String canal, String contenido, LocalDateTime fechaEnvio) {
        this.idMensaje = idMensaje;
        this.remitente = remitente;
        this.destinatario = destinatario;
        this.canal = (canal != null && !canal.isBlank()) ? canal : "general";
        this.contenido = contenido;
        this.fechaEnvio = fechaEnvio != null ? fechaEnvio : LocalDateTime.now();
    }

    public Long getIdMensaje() { return idMensaje; }
    public void setIdMensaje(Long idMensaje) { this.idMensaje = idMensaje; }

    public Trabajador getRemitente() { return remitente; }
    public void setRemitente(Trabajador remitente) { this.remitente = remitente; }

    public Trabajador getDestinatario() { return destinatario; }
    public void setDestinatario(Trabajador destinatario) { this.destinatario = destinatario; }

    public String getCanal() { return canal; }
    public void setCanal(String canal) { this.canal = canal; }

    public String getContenido() { return contenido; }
    public void setContenido(String contenido) { this.contenido = contenido; }

    public LocalDateTime getFechaEnvio() { return fechaEnvio; }
    public void setFechaEnvio(LocalDateTime fechaEnvio) { this.fechaEnvio = fechaEnvio; }
}
