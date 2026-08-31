package com.ikernell.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    // Correo de pruebas del administrador para recepción de copia (CC)
    public static final String CORREO_COPIA_PRUEBAS = "abrahamboada95@gmail.com";

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:abrahamboada95@gmail.com}")
    private String mailFrom;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    // Envía y registra copia del correo con las credenciales temporales de acceso
    // Envía y registra copia del correo con las credenciales temporales de acceso inicial
    @org.springframework.scheduling.annotation.Async
    public void enviarCorreoCredencialesTemporales(String emailPersonal, String emailCorporativo,
            String passwordTemporal, String nombreCompleto, String rol) {
        String destinatarioPrincipal = (emailPersonal != null && !emailPersonal.isBlank()) ? emailPersonal.trim()
                : CORREO_COPIA_PRUEBAS;
        String asunto = "Credenciales Iniciales de Acceso - IKernell Platform";

        String nombreDisplay = (nombreCompleto != null && !nombreCompleto.isBlank()) ? nombreCompleto.trim()
                : "Colaborador";
        String rolDisplay = (rol != null && !rol.isBlank()) ? rol.trim() : "TRABAJADOR";
        String correoCorpDisplay = (emailCorporativo != null && !emailCorporativo.isBlank()) ? emailCorporativo.trim()
                : "correo.corporativo@ikernell.org";
        String passDisplay = (passwordTemporal != null && !passwordTemporal.isBlank()) ? passwordTemporal.trim()
                : "ClaveTemporal2026*";

        // Plantilla HTML Corporativa - Bienvenida al Equipo, Credenciales y Recomendaciones de Acceso
        String htmlBody = String.format(
                "<!DOCTYPE html>" +
                        "<html lang='es'>" +
                        "<head>" +
                        "  <meta charset='UTF-8'>" +
                        "  <meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                        "  <style>" +
                        "    body { font-family: 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; -webkit-font-smoothing: antialiased; }" +
                        "    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0; }" +
                        "    .header { background: linear-gradient(135deg, #0f172a 0%%, #1e3a8a 50%%, #2563eb 100%%); padding: 30px 28px; text-align: left; color: #ffffff; border-bottom: 3px solid #2563eb; }" +
                        "    .header h1 { margin: 0; font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }" +
                        "    .header p { margin: 4px 0 0 0; font-size: 12px; color: #93c5fd; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }" +
                        "    .content { padding: 32px 28px; }" +
                        "    .welcome-text { font-size: 14px; line-height: 1.7; color: #334155; margin-bottom: 20px; }" +
                        "    .badge-role { display: inline-block; background-color: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 20px; font-family: monospace; text-transform: uppercase; }" +
                        "    .welcome-box { background: linear-gradient(135deg, #eff6ff 0%%, #f0fdf4 100%%); border: 1px solid #bfdbfe; border-radius: 10px; padding: 18px 20px; margin: 20px 0; }" +
                        "    .welcome-box h3 { margin: 0 0 8px 0; font-size: 14px; font-weight: 800; color: #1e40af; }" +
                        "    .welcome-box p { margin: 0; font-size: 13px; line-height: 1.6; color: #334155; }" +
                        "    .credentials-box { background-color: #f8fafc; border: 1px solid #cbd5e1; border-left: 4px solid #2563eb; border-radius: 10px; padding: 20px; margin: 20px 0; }" +
                        "    .field-label { font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }" +
                        "    .field-value { font-size: 14px; font-family: 'Courier New', Courier, monospace; font-weight: 700; color: #0f172a; background: #ffffff; border: 1px solid #cbd5e1; padding: 10px 14px; border-radius: 8px; margin-bottom: 16px; word-break: break-all; display: block; }" +
                        "    .field-value-pass { font-size: 16px; font-family: 'Courier New', Courier, monospace; font-weight: 800; color: #1d4ed8; background: #eff6ff; border: 1px dashed #93c5fd; padding: 12px 14px; border-radius: 8px; word-break: break-all; display: block; }" +
                        "    .recommendations { background-color: #fefce8; border: 1px solid #fde68a; border-radius: 10px; padding: 18px 20px; margin: 20px 0; }" +
                        "    .recommendations h4 { margin: 0 0 10px 0; font-size: 12px; font-weight: 800; color: #92400e; text-transform: uppercase; letter-spacing: 0.4px; }" +
                        "    .recommendations ul { margin: 0; padding-left: 18px; font-size: 12px; line-height: 1.8; color: #78350f; }" +
                        "    .recommendations li { margin-bottom: 4px; }" +
                        "    .login-link { display: block; text-align: center; margin: 20px 0; padding: 14px 24px; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; border-radius: 10px; letter-spacing: 0.3px; }" +
                        "    .footer { background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 28px; text-align: center; font-size: 11px; color: #94a3b8; font-weight: 500; }" +
                        "    .footer strong { color: #64748b; }" +
                        "  </style>" +
                        "</head>" +
                        "<body>" +
                        "  <div class='container'>" +
                        "    <div class='header'>" +
                        "      <h1>IKERNELL PLATFORM</h1>" +
                        "      <p>Alta Corporativa - Credenciales de Acceso Inicial</p>" +
                        "    </div>" +
                        "    <div class='content'>" +
                        "      <p class='welcome-text'>" +
                        "        Estimado(a) <strong>%s</strong>,<br><br>" +
                        "        Le damos la bienvenida a la plataforma <strong>IKernell Software Solutions</strong>. Su cuenta corporativa ha sido creada exitosamente con el rol de seguridad: <span class='badge-role'>%s</span>." +
                        "      </p>" +
                        "      " +
                        "      <div class='welcome-box'>" +
                        "        <h3>Bienvenido(a) al Equipo IKernell</h3>" +
                        "        <p>Nos alegra contar con usted en nuestro equipo de trabajo. A partir de este momento tiene acceso al Sistema de Gestion WBS y Analitica donde podra gestionar proyectos, actividades y colaborar con su equipo de manera eficiente.</p>" +
                        "      </div>" +
                        "      " +
                        "      <div class='credentials-box'>" +
                        "        <div class='field-label'>Correo Electronico Corporativo Unico:</div>" +
                        "        <div class='field-value'>%s</div>" +
                        "        " +
                        "        <div class='field-label' style='margin-top: 12px;'>Contrasena Inicial Temporal (Generada Aleatoriamente):</div>" +
                        "        <div class='field-value-pass'>%s</div>" +
                        "      </div>" +
                        "      " +
                        "      <div class='recommendations'>" +
                        "        <h4>Recomendaciones para su Primer Acceso</h4>" +
                        "        <ul>" +
                        "          <li>Ingrese al portal utilizando el boton de acceso que aparece a continuacion o copie la URL directa en su navegador.</li>" +
                        "          <li>Use su <strong>correo corporativo</strong> y la <strong>contrasena temporal</strong> mostrada arriba para iniciar sesion.</li>" +
                        "          <li>En su primer inicio de sesion, el sistema le solicitara verificar sus datos y establecer una <strong>contrasena definitiva</strong>.</li>" +
                        "          <li>Por seguridad, esta contrasena temporal es de un solo uso y fue generada de forma aleatoria.</li>" +
                        "          <li>Si presenta inconvenientes para acceder, comuniquese con su lider de equipo o el coordinador del sistema.</li>" +
                        "        </ul>" +
                        "      </div>" +
                        "      " +
                        "      <a href='http://localhost:5173/login' class='login-link'>Acceder al Portal IKernell - Iniciar Sesion</a>" +
                        "    </div>" +
                        "    <div class='footer'>" +
                        "      <p style='margin:0 0 4px 0;'><strong>IKernell Software Solutions</strong> &bull; Sistema de Gestion WBS & Analitica</p>" +
                        "      <p style='margin:0;'>Mensaje automatico del sistema &bull; Por favor no responda a este correo.</p>" +
                        "    </div>" +
                        "  </div>" +
                        "</body>" +
                        "</html>",
                nombreDisplay,
                rolDisplay,
                correoCorpDisplay,
                passDisplay);

        String logBanner = String.format(
                "\n================================================================================\n" +
                        " [IKERNELL NOTIFICACIÓN HTML ENVIADA] - CREDENCIALES INICIALES & COPIA CC\n" +
                        "--------------------------------------------------------------------------------\n" +
                        " Destinatario Principal (Personal) : %s\n" +
                        " Copia de Pruebas (CC Administrador): %s\n" +
                        " Asunto                            : %s\n" +
                        " Correo Corporativo Generado       : %s\n" +
                        " Contraseña Temporal Asignada      : %s\n" +
                        "================================================================================\n",
                destinatarioPrincipal,
                CORREO_COPIA_PRUEBAS,
                asunto,
                correoCorpDisplay,
                passDisplay);

        logger.info(logBanner);
        System.out.println(logBanner);

        // Intentar envío real por SMTP si JavaMailSender está presente
        if (mailSender != null) {
            try {
                MimeMessage mimeMessage = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

                helper.setFrom(
                        new jakarta.mail.internet.InternetAddress(mailFrom, "IKernell Software Platform", "UTF-8"));
                helper.setTo(destinatarioPrincipal);

                // Si el destinatario principal no es el admin, agregar copia CC al
                // administrador
                if (!destinatarioPrincipal.equalsIgnoreCase(CORREO_COPIA_PRUEBAS)) {
                    helper.setCc(CORREO_COPIA_PRUEBAS);
                }

                helper.setSubject(asunto);
                helper.setText(htmlBody, true); // true = HTML Email

                mailSender.send(mimeMessage);
                logger.info(
                        ">>> [SMTP HTML SUCCESS] Correo HTML enviado exitosamente vía SMTP a {} (con copia CC a {})",
                        destinatarioPrincipal, CORREO_COPIA_PRUEBAS);
            } catch (Exception e) {
                logger.warn(
                        ">>> [SMTP WARNING] No se pudo enviar el correo por SMTP ({}), pero la credencial fue registrada e impresa en logs.",
                        e.getMessage());
            }
        } else {
            logger.info(">>> [SMTP INFO] Servidor SMTP en modo simulación por consola (MAIL_PASSWORD no configurado).");
        }
    }

    // Envía código de verificación de 6 dígitos para recuperación de contraseña
    @org.springframework.scheduling.annotation.Async
    public void enviarCorreoCodigoRecuperacion(String emailPersonal, String emailCorporativo, String codigo6Digitos,
            String nombreCompleto) {
        String destinatarioPrincipal = (emailPersonal != null && !emailPersonal.isBlank()) ? emailPersonal.trim()
                : CORREO_COPIA_PRUEBAS;
        String asunto = "Codigo de Verificacion de Seguridad - IKernell Platform";
        String nombreDisplay = (nombreCompleto != null && !nombreCompleto.isBlank()) ? nombreCompleto.trim()
                : "Usuario";

        String htmlBody = String.format(
                "<!DOCTYPE html>" +
                        "<html lang='es'>" +
                        "<head>" +
                        "  <meta charset='UTF-8'>" +
                        "  <meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                        "  <style>" +
                        "    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; -webkit-font-smoothing: antialiased; }"
                        +
                        "    .card { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(15, 23, 42, 0.06); border: 1px solid #e2e8f0; }"
                        +
                        "    .header-bar { background-color: #0f172a; padding: 24px 32px; text-align: left; border-bottom: 3px solid #2563eb; }"
                        +
                        "    .header-title { margin: 0; font-size: 18px; font-weight: 700; color: #ffffff; letter-spacing: 0.3px; }"
                        +
                        "    .header-subtitle { margin: 4px 0 0 0; font-size: 11px; color: #94a3b8; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }"
                        +
                        "    .body-content { padding: 28px 32px; }" +
                        "    .salutation { font-size: 14px; color: #334155; line-height: 1.6; margin-bottom: 20px; }" +
                        "    .code-box { background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 20px; text-align: center; margin: 24px 0; }"
                        +
                        "    .code-label { font-size: 11px; font-weight: 700; color: #1e40af; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; display: block; }"
                        +
                        "    .code-number { font-size: 32px; font-family: 'Bitstream Vera Sans Mono', Consolas, Monaco, monospace; font-weight: 800; color: #1d4ed8; letter-spacing: 8px; margin: 0; }"
                        +
                        "    .notice-text { font-size: 12px; color: #64748b; line-height: 1.6; border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 20px; }"
                        +
                        "    .footer-bar { background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 32px; text-align: center; font-size: 11px; color: #94a3b8; }"
                        +
                        "  </style>" +
                        "</head>" +
                        "<body>" +
                        "  <div class='card'>" +
                        "    <div class='header-bar'>" +
                        "      <h1 class='header-title'>IKERNELL PLATFORM</h1>" +
                        "      <p class='header-subtitle'>Solicitud de Restablecimiento de Contraseña</p>" +
                        "    </div>" +
                        "    <div class='body-content'>" +
                        "      <p class='salutation'>" +
                        "        Estimado(a) <strong>%s</strong>,<br><br>" +
                        "        Hemos recibido una solicitud para restablecer la contraseña asociada a su cuenta corporativa (<strong>%s</strong>)."
                        +
                        "      </p>" +
                        "      " +
                        "      <div class='code-box'>" +
                        "        <span class='code-label'>Codigo de Verificación (Valido por 15 Minutos)</span>" +
                        "        <div class='code-number'>%s</div>" +
                        "      </div>" +
                        "      " +
                        "      <div class='notice-text'>" +
                        "        Ingrese este codigo de 6 digitos en la pantalla de recuperación para continuar. Si usted no solicito este cambio, puede ignorar este mensaje."
                        +
                        "      </div>" +
                        "    </div>" +
                        "    <div class='footer-bar'>" +
                        "      <strong>IKernell Software Solutions</strong> &bull; Seguridad & Acceso Corporativo" +
                        "    </div>" +
                        "  </div>" +
                        "</body>" +
                        "</html>",
                nombreDisplay,
                emailCorporativo != null ? emailCorporativo : "",
                codigo6Digitos);

        logger.info("\n>>> [CODIGO RECUPERACION GENERADO] Email: {} | Codigo: {}", destinatarioPrincipal,
                codigo6Digitos);

        if (mailSender != null) {
            try {
                MimeMessage mimeMessage = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

                helper.setFrom(new jakarta.mail.internet.InternetAddress(mailFrom, "IKernell Software Platform", "UTF-8"));
                helper.setTo(destinatarioPrincipal);

                if (!destinatarioPrincipal.equalsIgnoreCase(CORREO_COPIA_PRUEBAS)) {
                    helper.setCc(CORREO_COPIA_PRUEBAS);
                }

                helper.setSubject(asunto);
                helper.setText(htmlBody, true);

                mailSender.send(mimeMessage);
                logger.info(">>> [SMTP SUCCESS] Codigo de recuperación enviado a {} (CC: {})", destinatarioPrincipal,
                        CORREO_COPIA_PRUEBAS);
            } catch (Exception e) {
                logger.warn(">>> [SMTP WARNING] Error enviando correo de código: {}", e.getMessage());
            }
        }
    }
}
