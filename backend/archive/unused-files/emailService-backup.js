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
   * Plantilla base corporativa para emails de Fixia 2025
   * iOS-Style Corporate Design System
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
            /* FIXIA 2025 - Corporate Email Design System */
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, Arial, sans-serif; 
                background: linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f0f4ff 100%);
                line-height: 1.6;
                color: #334155;
                padding: 20px 0;
            }
            
            .email-container { 
                max-width: 600px; 
                margin: 0 auto; 
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border-radius: 24px; 
                overflow: hidden; 
                box-shadow: 0 20px 40px rgba(30, 64, 175, 0.1), 0 8px 16px rgba(0, 0, 0, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            .header { 
                background: linear-gradient(135deg, #1e40af 0%, #1d4ed8 50%, #0ea5e9 100%);
                padding: 40px 30px; 
                text-align: center; 
                position: relative;
                overflow: hidden;
            }
            
            .header::before {
                content: '';
                position: absolute;
                top: 0;
                right: 0;
                width: 100px;
                height: 100px;
                background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
                border-radius: 50%;
                transform: translate(30px, -30px);
            }
            
            .logo-container { 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                margin-bottom: 12px;
            }
            
            .logo-icon {
                display: inline-block;
                margin-right: 12px;
                background: rgba(255, 255, 255, 0.15);
                border-radius: 16px;
                padding: 8px;
                backdrop-filter: blur(10px);
            }
            
            .logo-text { 
                font-size: 32px; 
                font-weight: 800; 
                color: white; 
                letter-spacing: -0.5px;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            .tagline { 
                color: rgba(255, 255, 255, 0.9); 
                font-size: 14px; 
                font-weight: 500;
                letter-spacing: 0.5px;
                text-transform: uppercase;
            }
            
            .content { 
                padding: 40px 30px; 
                background: white;
            }
            
            .title { 
                font-size: 28px; 
                color: #1e293b; 
                margin-bottom: 24px; 
                font-weight: 700;
                line-height: 1.2;
            }
            
            .text { 
                color: #475569; 
                line-height: 1.7; 
                margin-bottom: 20px; 
                font-size: 16px;
            }
            
            .button { 
                display: inline-block; 
                background: linear-gradient(135deg, #1e40af 0%, #0ea5e9 100%);
                color: white; 
                padding: 16px 32px; 
                text-decoration: none; 
                border-radius: 16px; 
                font-weight: 600; 
                margin: 32px 0; 
                font-size: 16px;
                letter-spacing: 0.5px;
                box-shadow: 0 8px 16px rgba(30, 64, 175, 0.3);
                transition: all 0.3s ease;
                border: 2px solid transparent;
            }
            
            .button:hover { 
                background: linear-gradient(135deg, #1d4ed8 0%, #0284c7 100%);
                transform: translateY(-2px);
                box-shadow: 0 12px 24px rgba(30, 64, 175, 0.4);
            }
            
            .warning-box {
                background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                border: 2px solid #f59e0b;
                border-radius: 16px;
                padding: 20px;
                margin: 24px 0;
                position: relative;
                overflow: hidden;
            }
            
            .warning-box::before {
                content: '';
                position: absolute;
                top: -2px;
                left: -2px;
                right: -2px;
                bottom: -2px;
                background: linear-gradient(135deg, #f59e0b, #eab308);
                border-radius: 18px;
                z-index: -1;
            }
            
            .success-box {
                background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
                border: 2px solid #16a34a;
                border-radius: 16px;
                padding: 20px;
                margin: 24px 0;
            }
            
            .info-box {
                background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                border: 2px solid #0ea5e9;
                border-radius: 16px;
                padding: 20px;
                margin: 24px 0;
            }
            
            .feature-list {
                background: #f8fafc;
                border-radius: 16px;
                padding: 24px;
                margin: 24px 0;
                border: 1px solid #e2e8f0;
            }
            
            .feature-list ul {
                list-style: none;
                padding: 0;
            }
            
            .feature-list li {
                padding: 8px 0;
                position: relative;
                padding-left: 30px;
                color: #475569;
                font-weight: 500;
            }
            
            .feature-list li::before {
                content: '✓';
                position: absolute;
                left: 0;
                color: #16a34a;
                font-weight: bold;
                font-size: 18px;
            }
            
            .footer { 
                background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
                padding: 32px 30px; 
                text-align: center; 
                color: #cbd5e1;
                position: relative;
                overflow: hidden;
            }
            
            .footer::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 1px;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
            }
            
            .footer-brand {
                font-size: 16px;
                font-weight: 700;
                color: white;
                margin-bottom: 8px;
            }
            
            .footer-text {
                font-size: 14px;
                color: #94a3b8;
                margin-bottom: 20px;
            }
            
            .footer-links {
                margin-top: 16px;
                padding-top: 16px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .footer-links a {
                color: #0ea5e9;
                text-decoration: none;
                font-weight: 500;
                margin: 0 8px;
            }
            
            .footer-links a:hover {
                color: #38bdf8;
            }
            
            .divider { 
                height: 1px; 
                background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
                margin: 24px 0; 
            }
            
            @media (max-width: 600px) {
                .email-container { 
                    margin: 10px; 
                    border-radius: 20px;
                }
                .header { padding: 30px 20px; }
                .content { padding: 30px 20px; }
                .footer { padding: 24px 20px; }
                .title { font-size: 24px; }
                .button { padding: 14px 24px; font-size: 15px; }
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <div class="logo-container">
                    <div class="logo-icon">
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#ffffff" />
                                    <stop offset="100%" stop-color="#e0f2fe" />
                                </linearGradient>
                            </defs>
                            <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#logoGradient)" />
                            <g fill="#1e40af">
                                <rect x="8" y="8" width="2.5" height="16" rx="0.5" />
                                <rect x="8" y="8" width="12" height="2.5" rx="0.5" />
                                <rect x="8" y="14.75" width="9" height="2.5" rx="0.5" />
                            </g>
                            <g fill="#0ea5e9" opacity="0.8">
                                <rect x="21" y="12" width="8" height="2" rx="1" transform="rotate(45 25 13)" />
                                <rect x="21" y="18" width="8" height="2" rx="1" transform="rotate(-45 25 19)" />
                            </g>
                            <circle cx="26" cy="9" r="1.5" fill="#0ea5e9" opacity="0.6" />
                        </svg>
                    </div>
                    <div class="logo-text">FIXIA</div>
                </div>
                <div class="tagline">Servicios Profesionales Certificados</div>
            </div>
            
            <div class="content">
                <h1 class="title">${title}</h1>
                ${content}
                ${buttonText && buttonUrl ? `
                    <div style="text-align: center; margin: 40px 0;">
                        <a href="${buttonUrl}" class="button">${buttonText}</a>
                    </div>
                ` : ''}
            </div>
            
            <div class="footer">
                <div class="footer-brand">FIXIA</div>
                <div class="footer-text">
                    Plataforma profesional de servicios certificados en Chubut<br>
                    Conectamos AS verificados con proyectos de calidad
                </div>
                <div class="divider"></div>
                <div style="font-size: 13px; color: #94a3b8; margin-bottom: 16px;">
                    Si no solicitaste este email, puedes ignorarlo con seguridad.
                </div>
                <div class="footer-links">
                    <a href="mailto:contacto@fixia.com.ar">contacto@fixia.com.ar</a> |
                    <a href="${process.env.FRONTEND_URL}/legal/privacy">Política de Privacidad</a> |
                    <a href="${process.env.FRONTEND_URL}/legal/terms">Términos de Servicio</a>
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
        
        <p class="text">¡Bienvenido/a a <strong>FIXIA</strong>! Te has registrado exitosamente como <strong>${typeLabel}</strong> en nuestra plataforma profesional.</p>
        
        ${isAS ? `
          <div class="success-box">
            <p style="color: #065f46; font-weight: 600; margin: 0; font-size: 16px;">
              🎯 <strong>Profesional AS Certificado</strong>
            </p>
            <p style="color: #047857; margin: 8px 0 0 0; font-size: 14px;">
              Acceso completo a la plataforma profesional de servicios
            </p>
          </div>
          
          <div class="feature-list">
            <p style="color: #1e293b; font-weight: 600; margin: 0 0 16px 0;">Como <strong>Profesional AS</strong>, tendrás acceso a:</p>
            <ul>
              <li>Ofrecer servicios profesionales certificados en Chubut</li>
              <li>Recibir notificaciones instantáneas de nuevos proyectos</li>
              <li>Gestionar tu perfil y portfolio profesional</li>
              <li>Sistema de badges y reputación verificada</li>
              <li>Acceso a la suscripción premium gratuita</li>
              <li>Comunicación directa con clientes verificados</li>
            </ul>
          </div>
        ` : `
          <div class="info-box">
            <p style="color: #0c4a6e; font-weight: 600; margin: 0; font-size: 16px;">
              🔍 <strong>Explorador Certificado</strong>
            </p>
            <p style="color: #0369a1; margin: 8px 0 0 0; font-size: 14px;">
              Conecta con profesionales AS verificados en tu zona
            </p>
          </div>
          
          <div class="feature-list">
            <p style="color: #1e293b; font-weight: 600; margin: 0 0 16px 0;">Como <strong>Explorador</strong>, podrás:</p>
            <ul>
              <li>Buscar servicios profesionales en tu localidad</li>
              <li>Conectar directamente con AS verificados</li>
              <li>Usar nuestro sistema de búsqueda inteligente</li>
              <li>Calificar y ser calificado por profesionales</li>
              <li>Cambiar a modo AS cuando quieras ofrecer servicios</li>
              <li>Acceso a funciones premium gratuitas</li>
            </ul>
          </div>
        `}
        
        <p class="text">Para completar tu registro y verificar tu email, haz clic en el botón de abajo:</p>
        
        <div class="warning-box">
          <p style="color: #92400e; font-weight: 600; margin: 0; font-size: 15px;">
            ⚠️ <strong>Importante:</strong> Este enlace expirará en 24 horas por seguridad.
          </p>
          <p style="color: #a16207; margin: 8px 0 0 0; font-size: 14px;">
            Verifica tu cuenta ahora para acceder a todas las funcionalidades
          </p>
        </div>
        
        <p class="text">Si el botón no funciona, puedes copiar y pegar este enlace en tu navegador:</p>
        <p style="word-break: break-all; color: #0ea5e9; font-size: 14px; background: #f0f9ff; padding: 12px; border-radius: 8px; font-family: monospace;">${verificationUrl}</p>
      `;

      const msg = {
        to: user.email,
        from: {
          email: process.env.SENDGRID_FROM_EMAIL,
          name: 'Fixia - Verificación de Cuenta'
        },
        subject: `🔧 Verifica tu cuenta ${typeLabel} en FIXIA`,
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
        subject: `🎉 ¡Bienvenido/a a FIXIA, ${user.first_name}!`,
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
        subject: '🔐 Restablecer contraseña de FIXIA',
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

  /**
   * Enviar email de confirmación de cambio de contraseña
   */
  static async sendPasswordChangedEmail(user) {
    try {
      const content = `
        <p class="text">¡Hola <strong>${user.first_name}</strong>!</p>
        
        <div class="success-box">
          <p style="color: #065f46; font-weight: 600; margin: 0; font-size: 16px;">
            🔐 <strong>Contraseña Actualizada</strong>
          </p>
          <p style="color: #047857; margin: 8px 0 0 0; font-size: 14px;">
            Tu contraseña ha sido cambiada exitosamente
          </p>
        </div>
        
        <p class="text">Te confirmamos que tu contraseña de <strong>FIXIA</strong> ha sido actualizada exitosamente.</p>
        
        <div class="info-box">
          <p style="color: #0c4a6e; font-weight: 600; margin: 0 0 12px 0;">📊 <strong>Detalles del cambio:</strong></p>
          <ul style="margin: 0; padding-left: 20px; color: #0369a1;">
            <li><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</li>
            <li><strong>Hora:</strong> ${new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</li>
            <li><strong>Dispositivo:</strong> Navegador web</li>
          </ul>
        </div>
        
        <p class="text">Si <strong>NO</strong> fuiste tú quien cambió la contraseña, por favor contactanos inmediatamente.</p>
        
        <div class="warning-box">
          <p style="color: #92400e; font-weight: 600; margin: 0; font-size: 15px;">
            ⚠️ <strong>Importante:</strong> Si no reconoces este cambio, actúa ahora.
          </p>
          <p style="color: #a16207; margin: 8px 0 0 0; font-size: 14px;">
            Contáctanos de inmediato para proteger tu cuenta profesional
          </p>
        </div>
        
        <p class="text">Para tu seguridad, te recomendamos:</p>
        <div class="feature-list">
          <ul>
            <li>Usar contraseñas únicas y seguras</li>
            <li>Habilitar autenticación de dos factores</li>
            <li>No compartir tus credenciales con nadie</li>
            <li>Cerrar sesión en dispositivos públicos</li>
          </ul>
        </div>
      `;

      const msg = {
        to: user.email,
        from: {
          email: process.env.SENDGRID_FROM_EMAIL,
          name: 'FIXIA - Seguridad'
        },
        subject: '🔐 Contraseña actualizada en FIXIA',
        html: this.getEmailTemplate(
          'Contraseña actualizada',
          content,
          '🔒 Acceder a mi cuenta',
          `${process.env.FRONTEND_URL}/auth/login`
        )
      };

      const response = await sgMail.send(msg);
      
      console.log(`✅ Email de confirmación de cambio de contraseña enviado a ${user.email}`);
      return { success: true, messageId: response[0].headers['x-message-id'] };

    } catch (error) {
      console.error('❌ Error enviando email de confirmación:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Enviar email de notificación de nueva solicitud de servicio
   */
  static async sendServiceRequestNotification(professional, serviceRequest) {
    try {
      const content = `
        <p class="text">¡Hola <strong>${professional.first_name}</strong>!</p>
        
        <div class="success-box">
          <p style="color: #065f46; font-weight: 600; margin: 0; font-size: 16px;">
            🎯 <strong>Nueva Solicitud de Servicio</strong>
          </p>
          <p style="color: #047857; margin: 8px 0 0 0; font-size: 14px;">
            Un cliente necesita tus servicios profesionales
          </p>
        </div>
        
        <p class="text">Tenés una nueva oportunidad de trabajo en <strong>FIXIA</strong>:</p>
        
        <div class="info-box">
          <p style="color: #0c4a6e; font-weight: 600; margin: 0 0 12px 0;">📋 <strong>Detalles del proyecto:</strong></p>
          <ul style="margin: 0; padding-left: 20px; color: #0369a1;">
            <li><strong>Servicio:</strong> ${serviceRequest.title}</li>
            <li><strong>Ubicación:</strong> ${serviceRequest.locality}</li>
            <li><strong>Prioridad:</strong> ${serviceRequest.urgency === 'high' ? '🔥 Alta' : serviceRequest.urgency === 'emergency' ? '🚨 Emergencia' : '📅 Normal'}</li>
            <li><strong>Presupuesto:</strong> ${serviceRequest.budget_min && serviceRequest.budget_max ? `$${serviceRequest.budget_min?.toLocaleString()} - $${serviceRequest.budget_max?.toLocaleString()}` : 'A convenir'}</li>
          </ul>
        </div>
        
        <div style="background: #f8fafc; border-radius: 16px; padding: 20px; margin: 24px 0; border: 1px solid #e2e8f0;">
          <p style="color: #1e293b; font-weight: 600; margin: 0 0 8px 0;">💬 <strong>Descripción del cliente:</strong></p>
          <p style="color: #475569; margin: 0; font-style: italic; line-height: 1.6;">"${serviceRequest.description}"</p>
        </div>
        
        <p class="text">⏱️ <strong>¡Actúa rápido!</strong> Los AS que responden primero tienen mayor chance de ser seleccionados.</p>
        
        <div class="warning-box">
          <p style="color: #92400e; font-weight: 600; margin: 0; font-size: 15px;">
            ⚡ <strong>Tiempo limitado:</strong> No pierdas esta oportunidad
          </p>
          <p style="color: #a16207; margin: 8px 0 0 0; font-size: 14px;">
            Responde ahora y destaca entre la competencia
          </p>
        </div>
      `;

      const msg = {
        to: professional.email,
        from: {
          email: process.env.SENDGRID_FROM_EMAIL,
          name: 'FIXIA - Nuevas Oportunidades'
        },
        subject: `🎯 Nueva solicitud: ${serviceRequest.title}`,
        html: this.getEmailTemplate(
          'Nueva solicitud de servicio',
          content,
          '👀 Ver solicitud completa',
          `${process.env.FRONTEND_URL}/as/solicitudes`
        )
      };

      const response = await sgMail.send(msg);
      
      console.log(`✅ Email de notificación enviado a ${professional.email}`);
      return { success: true, messageId: response[0].headers['x-message-id'] };

    } catch (error) {
      console.error('❌ Error enviando email de notificación:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Enviar email de prueba
   */
  static async sendTestEmail(user) {
    try {
      const content = `
        <p class="text">¡Hola <strong>${user.first_name}</strong>!</p>
        
        <div class="success-box">
          <p style="color: #065f46; font-weight: 600; margin: 0; font-size: 16px;">
            🧪 <strong>Email de Prueba</strong>
          </p>
          <p style="color: #047857; margin: 8px 0 0 0; font-size: 14px;">
            Este es un email de prueba enviado desde tu configuración
          </p>
        </div>
        
        <p class="text">Si recibiste este email, significa que tu configuración de notificaciones está funcionando correctamente.</p>
        
        <div class="info-box">
          <p style="color: #0c4a6e; font-weight: 600; margin: 0 0 12px 0;">📊 <strong>Detalles del envío:</strong></p>
          <ul style="margin: 0; padding-left: 20px; color: #0369a1;">
            <li><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</li>
            <li><strong>Hora:</strong> ${new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</li>
            <li><strong>Tipo de cuenta:</strong> ${user.user_type === 'professional' ? 'AS Profesional' : 'Explorador'}</li>
            <li><strong>Estado:</strong> ✅ Configuración activa</li>
          </ul>
        </div>
        
        <p class="text">Puedes configurar qué tipos de notificaciones quieres recibir desde tu panel de configuración.</p>
        
        <div class="feature-list">
          <p style="color: #1e293b; font-weight: 600; margin: 0 0 16px 0;">Tipos de notificaciones disponibles:</p>
          <ul>
            <li>Notificaciones de servicios (solicitudes, actualizaciones)</li>
            <li>Alertas de seguridad (cambios de contraseña, inicios de sesión)</li>
            <li>Notificaciones instantáneas (mensajes, estados)</li>
            <li>Alertas de inicio de sesión (actividad de cuenta)</li>
            <li>Resumen semanal (estadísticas y actividad)</li>
            <li>Emails de marketing (novedades y promociones)</li>
          </ul>
        </div>
        
        <p class="text">Si no querés recibir ciertos tipos de emails, podés configurar tus preferencias en cualquier momento.</p>
      `;

      const msg = {
        to: user.email,
        from: {
          email: process.env.SENDGRID_FROM_EMAIL,
          name: 'FIXIA - Configuración'
        },
        subject: '🧪 Email de prueba - FIXIA',
        html: this.getEmailTemplate(
          'Email de prueba',
          content,
          '⚙️ Configurar notificaciones',
          `${process.env.FRONTEND_URL}/configuracion-email`
        )
      };

      const response = await sgMail.send(msg);
      
      console.log(`✅ Email de prueba enviado a ${user.email}`);
      return { success: true, messageId: response[0].headers['x-message-id'] };

    } catch (error) {
      console.error('❌ Error enviando email de prueba:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Enviar email de notificación de inicio de sesión
   */
  static async sendLoginNotification(user, loginInfo) {
    try {
      const content = `
        <p class="text">¡Hola <strong>${user.first_name}</strong>!</p>
        
        <div class="info-box">
          <p style="color: #0c4a6e; font-weight: 600; margin: 0; font-size: 16px;">
            🔐 <strong>Nuevo inicio de sesión</strong>
          </p>
          <p style="color: #0369a1; margin: 8px 0 0 0; font-size: 14px;">
            Hemos detectado un acceso a tu cuenta en FIXIA
          </p>
        </div>
        
        <p class="text">Se ha iniciado sesión en tu cuenta de <strong>FIXIA</strong> con los siguientes detalles:</p>
        
        <div style="background: #f8fafc; border-radius: 16px; padding: 20px; margin: 24px 0; border: 1px solid #e2e8f0;">
          <p style="color: #1e293b; font-weight: 600; margin: 0 0 12px 0;">📊 <strong>Información del acceso:</strong></p>
          <ul style="margin: 0; padding-left: 20px; color: #475569;">
            <li><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</li>
            <li><strong>Hora:</strong> ${new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</li>
            <li><strong>Dispositivo:</strong> ${loginInfo.device || 'Navegador web'}</li>
            <li><strong>Ubicación:</strong> ${loginInfo.location || 'No disponible'}</li>
            <li><strong>IP:</strong> ${loginInfo.ip || 'No disponible'}</li>
          </ul>
        </div>
        
        <p class="text">Si fuiste tú quien inició sesión, puedes ignorar este email.</p>
        
        <div class="warning-box">
          <p style="color: #92400e; font-weight: 600; margin: 0; font-size: 15px;">
            ⚠️ <strong>¿No fuiste tú?</strong> Protege tu cuenta ahora
          </p>
          <p style="color: #a16207; margin: 8px 0 0 0; font-size: 14px;">
            Si no reconoces este acceso, cambia tu contraseña inmediatamente
          </p>
        </div>
        
        <p class="text">Para mantener tu cuenta segura, te recomendamos:</p>
        <div class="feature-list">
          <ul>
            <li>Revisar regularmente tu actividad de cuenta</li>
            <li>Usar contraseñas únicas y seguras</li>
            <li>Cerrar sesión en dispositivos compartidos</li>
            <li>Mantener actualizada tu información de contacto</li>
          </ul>
        </div>
      `;

      const msg = {
        to: user.email,
        from: {
          email: process.env.SENDGRID_FROM_EMAIL,
          name: 'FIXIA - Seguridad'
        },
        subject: '🔐 Nuevo inicio de sesión en FIXIA',
        html: this.getEmailTemplate(
          'Nuevo inicio de sesión',
          content,
          '🔒 Revisar mi cuenta',
          `${process.env.FRONTEND_URL}/${user.user_type === 'professional' ? 'as' : 'explorador'}/dashboard`
        )
      };

      const response = await sgMail.send(msg);
      
      console.log(`✅ Email de notificación de login enviado a ${user.email}`);
      return { success: true, messageId: response[0].headers['x-message-id'] };

    } catch (error) {
      console.error('❌ Error enviando email de notificación de login:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = EmailService;