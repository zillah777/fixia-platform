const sgMail = require('@sendgrid/mail');
const { v4: uuidv4 } = require('uuid');
const { execute } = require('../utils/database');

// Configurar SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Servicio de Email para Fixia usando SendGrid
 */
class EmailService {
  
  /**
   * Plantilla base para emails de Fixia
   */
  static getEmailTemplate(title, content, buttonText = null, buttonUrl = null) {
    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%); padding: 32px 24px; text-align: center; }
            .logo { font-size: 28px; font-weight: bold; color: white; margin-bottom: 8px; }
            .tagline { color: rgba(255, 255, 255, 0.9); font-size: 14px; }
            .content { padding: 32px 24px; }
            .title { font-size: 24px; color: #1e293b; margin-bottom: 16px; }
            .text { color: #64748b; line-height: 1.6; margin-bottom: 16px; }
            .button { display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 24px 0; }
            .button:hover { background: #0284c7; }
            .footer { background: #f1f5f9; padding: 24px; text-align: center; color: #64748b; font-size: 14px; }
            .divider { height: 1px; background: #e2e8f0; margin: 24px 0; }
        </style>
    </head>
    <body>
        <div style="padding: 24px;">
            <div class="container">
                <div class="header">
                    <div class="logo">🔧 Fixia</div>
                    <div class="tagline">El marketplace de servicios profesionales de Chubut</div>
                </div>
                <div class="content">
                    <h1 class="title">${title}</h1>
                    ${content}
                    ${buttonText && buttonUrl ? `
                        <div style="text-align: center;">
                            <a href="${buttonUrl}" class="button">${buttonText}</a>
                        </div>
                    ` : ''}
                </div>
                <div class="footer">
                    <p><strong>Fixia.com.ar</strong> - Conectando profesionales con clientes en toda la provincia de Chubut</p>
                    <div class="divider"></div>
                    <p>Si no solicitaste este email, puedes ignorarlo con seguridad.</p>
                    <p style="margin-top: 8px;">
                        <a href="mailto:soporte@fixia.com.ar" style="color: #0ea5e9;">soporte@fixia.com.ar</a> | 
                        <a href="${process.env.FRONTEND_URL}/legal/privacy" style="color: #0ea5e9;">Política de Privacidad</a>
                    </p>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  /**
   * Generar token de verificación y guardarlo en BD
   */
  static async generateVerificationToken(userId, email, type = 'email_verification') {
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    await execute(`
      INSERT INTO email_verification_tokens (user_id, email, token, type, expires_at) 
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT (user_id, type) 
      DO UPDATE SET token = ?, expires_at = ?, created_at = CURRENT_TIMESTAMP
    `, [userId, email, token, type, expiresAt, token, expiresAt]);

    return token;
  }

  /**
   * Enviar email de verificación para AS o Explorador
   */
  static async sendVerificationEmail(user, userType) {
    try {
      const token = await this.generateVerificationToken(user.id, user.email);
      const verificationUrl = `${process.env.FRONTEND_URL}/verificar-email?token=${token}&type=${userType}`;

      const isAS = userType === 'provider';
      const typeLabel = isAS ? 'Profesional AS' : 'Explorador';
      
      const content = `
        <p class="text">¡Hola <strong>${user.first_name} ${user.last_name}</strong>!</p>
        
        <p class="text">¡Bienvenido/a a <strong>Fixia</strong>! Te has registrado exitosamente como <strong>${typeLabel}</strong> en nuestra plataforma.</p>
        
        ${isAS ? `
          <p class="text">Como <strong>Profesional AS</strong>, podrás:</p>
          <ul style="color: #64748b; margin: 16px 0; padding-left: 20px;">
            <li>Ofrecer tus servicios profesionales en Chubut</li>
            <li>Recibir notificaciones cuando alguien necesite tus servicios</li>
            <li>Gestionar tu perfil y portfolio</li>
            <li>Ganar badges por tu excelente trabajo</li>
            <li>Acceder a la suscripción promocional gratuita</li>
          </ul>
        ` : `
          <p class="text">Como <strong>Explorador</strong>, podrás:</p>
          <ul style="color: #64748b; margin: 16px 0; padding-left: 20px;">
            <li>Buscar servicios profesionales en tu localidad</li>
            <li>Conectar directamente con profesionales verificados</li>
            <li>Usar nuestro sistema de búsqueda inteligente</li>
            <li>Calificar y ser calificado por los profesionales</li>
            <li>Cambiar a modo AS cuando quieras ofrecer servicios</li>
          </ul>
        `}
        
        <p class="text">Para completar tu registro y verificar tu email, haz clic en el botón de abajo:</p>
        
        <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 24px 0;">
          <p style="color: #64748b; font-size: 14px; margin: 0;">
            <strong>⚠️ Importante:</strong> Este enlace expirará en 24 horas por seguridad.
          </p>
        </div>
        
        <p class="text">Si el botón no funciona, puedes copiar y pegar este enlace en tu navegador:</p>
        <p style="word-break: break-all; color: #0ea5e9; font-size: 14px;">${verificationUrl}</p>
      `;

      const msg = {
        to: user.email,
        from: {
          email: process.env.SENDGRID_FROM_EMAIL,
          name: 'Fixia - Verificación de Cuenta'
        },
        subject: `🔧 Verifica tu cuenta ${typeLabel} en Fixia`,
        html: this.getEmailTemplate(
          `Verifica tu cuenta ${typeLabel}`,
          content,
          '✅ Verificar mi Email',
          verificationUrl
        )
      };

      const response = await sgMail.send(msg);
      
      console.log(`✅ Email de verificación enviado a ${user.email} (${typeLabel})`);
      return { success: true, messageId: response[0].headers['x-message-id'] };

    } catch (error) {
      console.error('❌ Error enviando email de verificación:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Enviar email de bienvenida después de verificación
   */
  static async sendWelcomeEmail(user, userType) {
    try {
      const isAS = userType === 'provider';
      const typeLabel = isAS ? 'Profesional AS' : 'Explorador';
      const dashboardUrl = `${process.env.FRONTEND_URL}/${isAS ? 'as' : 'explorador'}/dashboard`;

      const content = `
        <p class="text">¡Hola <strong>${user.first_name}</strong>!</p>
        
        <p class="text">🎉 ¡Tu email ha sido verificado exitosamente! Ya puedes acceder a todas las funcionalidades de Fixia como <strong>${typeLabel}</strong>.</p>
        
        ${isAS ? `
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; border-radius: 12px; margin: 24px 0;">
            <h3 style="margin: 0 0 12px 0; font-size: 18px;">🎁 ¡Oferta de Lanzamiento!</h3>
            <p style="margin: 0; opacity: 0.9;">Como uno de los primeros 200 profesionales AS, tienes <strong>2 meses GRATIS</strong> de suscripción premium.</p>
          </div>
          
          <p class="text"><strong>Próximos pasos recomendados:</strong></p>
          <ol style="color: #64748b; margin: 16px 0; padding-left: 20px;">
            <li>Completa tu perfil profesional</li>
            <li>Sube fotos de tus trabajos al portfolio</li>
            <li>Verifica tu identidad con DNI + selfie</li>
            <li>Configura tus ubicaciones de trabajo</li>
            <li>¡Empieza a recibir solicitudes!</li>
          </ol>
        ` : `
          <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 20px; border-radius: 12px; margin: 24px 0;">
            <h3 style="margin: 0 0 12px 0; font-size: 18px;">🎁 ¡Oferta de Lanzamiento!</h3>
            <p style="margin: 0; opacity: 0.9;">Como uno de los primeros 200 Exploradores, tienes acceso a <strong>funciones premium GRATIS</strong> por 2 meses.</p>
          </div>
          
          <p class="text"><strong>¿Qué puedes hacer ahora?</strong></p>
          <ul style="color: #64748b; margin: 16px 0; padding-left: 20px;">
            <li>Buscar profesionales en tu localidad</li>
            <li>Usar búsqueda inteligente: "busco plomero para hoy"</li>
            <li>Conectar directamente via chat</li>
            <li>¿Quieres ofrecer servicios? ¡Cambia a modo AS desde tu perfil!</li>
          </ul>
        `}
        
        <p class="text">¿Tienes preguntas? Nuestro equipo está aquí para ayudarte en <a href="mailto:soporte@fixia.com.ar" style="color: #0ea5e9;">soporte@fixia.com.ar</a></p>
      `;

      const msg = {
        to: user.email,
        from: {
          email: process.env.SENDGRID_FROM_EMAIL,
          name: 'Fixia - Bienvenido'
        },
        subject: `🎉 ¡Bienvenido/a a Fixia, ${user.first_name}!`,
        html: this.getEmailTemplate(
          `¡Bienvenido/a a Fixia!`,
          content,
          '🚀 Ir a mi Dashboard',
          dashboardUrl
        )
      };

      const response = await sgMail.send(msg);
      
      console.log(`✅ Email de bienvenida enviado a ${user.email} (${typeLabel})`);
      return { success: true, messageId: response[0].headers['x-message-id'] };

    } catch (error) {
      console.error('❌ Error enviando email de bienvenida:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Enviar email de recuperación de contraseña
   */
  static async sendPasswordResetEmail(user) {
    try {
      const token = await this.generateVerificationToken(user.id, user.email, 'password_reset');
      const resetUrl = `${process.env.FRONTEND_URL}/recuperar-password?token=${token}`;

      const content = `
        <p class="text">¡Hola <strong>${user.first_name}</strong>!</p>
        
        <p class="text">Recibimos una solicitud para restablecer la contraseña de tu cuenta en Fixia.</p>
        
        <p class="text">Si fuiste tú quien solicitó esto, haz clic en el botón de abajo para crear una nueva contraseña:</p>
        
        <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 24px 0;">
          <p style="color: #92400e; font-size: 14px; margin: 0;">
            <strong>⚠️ Importante:</strong> Este enlace expirará en 24 horas por seguridad.
          </p>
        </div>
        
        <p class="text">Si NO solicitaste restablecer tu contraseña, puedes ignorar este email con seguridad. Tu cuenta permanecerá protegida.</p>
        
        <p class="text">Si el botón no funciona, puedes copiar y pegar este enlace:</p>
        <p style="word-break: break-all; color: #0ea5e9; font-size: 14px;">${resetUrl}</p>
      `;

      const msg = {
        to: user.email,
        from: {
          email: process.env.SENDGRID_FROM_EMAIL,
          name: 'Fixia - Recuperar Contraseña'
        },
        subject: '🔐 Restablecer contraseña de Fixia',
        html: this.getEmailTemplate(
          'Restablecer tu contraseña',
          content,
          '🔐 Restablecer Contraseña',
          resetUrl
        )
      };

      const response = await sgMail.send(msg);
      
      console.log(`✅ Email de recuperación enviado a ${user.email}`);
      return { success: true, messageId: response[0].headers['x-message-id'] };

    } catch (error) {
      console.error('❌ Error enviando email de recuperación:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Verificar token de email
   */
  static async verifyEmailToken(token, type = 'email_verification') {
    try {
      const [tokens] = await execute(`
        SELECT * FROM email_verification_tokens 
        WHERE token = ? AND type = ? AND expires_at > CURRENT_TIMESTAMP
      `, [token, type]);

      if (tokens.length === 0) {
        return { success: false, error: 'Token inválido o expirado' };
      }

      const tokenData = tokens[0];

      // Marcar email como verificado
      if (type === 'email_verification') {
        await execute(`
          UPDATE users 
          SET email_verified = TRUE, email_verified_at = CURRENT_TIMESTAMP 
          WHERE id = ?
        `, [tokenData.user_id]);
      }

      // Eliminar token usado
      await execute(`
        DELETE FROM email_verification_tokens 
        WHERE token = ?
      `, [token]);

      return { 
        success: true, 
        userId: tokenData.user_id, 
        email: tokenData.email 
      };

    } catch (error) {
      console.error('❌ Error verificando token:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = EmailService;