package com.ikernell.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Entity
@Table(name = "solicitud_contacto")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class SolicitudContacto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_solicitud")
    private Long idSolicitud;

    @NotBlank(message = "El nombre del remitente es obligatorio")
    @Column(name = "nombre_remitente", nullable = false, length = 100)
    private String nombreRemitente;

    @NotBlank(message = "El correo electrónico es obligatorio")
    @Email(message = "El correo electrónico debe tener un formato válido")
    @Column(name = "email_remitente", nullable = false, length = 150)
    private String emailRemitente;

    @Column(name = "telefono", length = 30)
    private String telefono;

    @NotBlank(message = "El asunto de la consulta es obligatorio")
    @Column(name = "asunto", nullable = false, length = 150)
    private String asunto;

    @NotBlank(message = "El mensaje no puede estar vacío")
    @Column(name = "mensaje", nullable = false, columnDefinition = "TEXT")
    private String mensaje;

    @Column(name = "fecha_envio", nullable = false, updatable = false)
    private LocalDateTime fechaEnvio = LocalDateTime.now();

    @Column(name = "atendido", nullable = false)
    private Boolean atendido = false;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "coordinador_id")
    @JsonIgnoreProperties({"passwordHash", "proyectosLiderados", "actividades", "errores", "interrupciones"})
    private Trabajador coordinador;

    public SolicitudContacto() {}

    public SolicitudContacto(Long idSolicitud, String nombreRemitente, String emailRemitente, 
                             String telefono, String asunto, String mensaje, 
                             LocalDateTime fechaEnvio, Boolean atendido, Trabajador coordinador) {
        this.idSolicitud = idSolicitud;
        this.nombreRemitente = nombreRemitente;
        this.emailRemitente = emailRemitente;
        this.telefono = telefono;
        this.asunto = asunto;
        this.mensaje = mensaje;
        this.fechaEnvio = fechaEnvio != null ? fechaEnvio : LocalDateTime.now();
        this.atendido = atendido != null ? atendido : false;
        this.coordinador = coordinador;
    }

    public Long getIdSolicitud() { return idSolicitud; }
    public void setIdSolicitud(Long idSolicitud) { this.idSolicitud = idSolicitud; }

    public String getNombreRemitente() { return nombreRemitente; }
    public void setNombreRemitente(String nombreRemitente) { this.nombreRemitente = nombreRemitente; }

    public String getEmailRemitente() { return emailRemitente; }
    public void setEmailRemitente(String emailRemitente) { this.emailRemitente = emailRemitente; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public String getAsunto() { return asunto; }
    public void setAsunto(String asunto) { this.asunto = asunto; }

    public String getMensaje() { return mensaje; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }

    public LocalDateTime getFechaEnvio() { return fechaEnvio; }
    public void setFechaEnvio(LocalDateTime fechaEnvio) { this.fechaEnvio = fechaEnvio; }

    public Boolean getAtendido() { return atendido; }
    public void setAtendido(Boolean atendido) { this.atendido = atendido; }

    public Trabajador getCoordinador() { return coordinador; }
    public void setCoordinador(Trabajador coordinador) { this.coordinador = coordinador; }
}
