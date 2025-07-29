const sgMail = require('@sendgrid/mail');
const { v4: uuidv4 } = require('uuid');
const { execute } = require('../utils/database');

// Configurar SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Servicio de Email para Fixia usando SendGrid
 * LIQUID GLASS "CONFIANZA LÍQUIDA" EMAIL DESIGN SYSTEM
 */
class EmailService {
  
  /**
   * Plantilla base Liquid Glass para emails de Fixia 2025
   * "CONFIANZA LÍQUIDA" Design System - Email Edition
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
            /* FIXIA 2025 - LIQUID GLASS "CONFIANZA LÍQUIDA" EMAIL DESIGN SYSTEM */
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
            
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; 
                background: radial-gradient(ellipse at top, #1e293b 0%, #0f172a 50%, #020617 100%);
                background-attachment: fixed;
                line-height: 1.6;
                color: #e2e8f0;
                padding: 40px 20px;
                min-height: 100vh;
            }
            
            /* Liquid Glass Container with Floating Orbs Background */
            .email-container { 
                max-width: 640px; 
                margin: 0 auto; 
                background: rgba(30, 41, 59, 0.4);
                backdrop-filter: blur(24px);
                border-radius: 32px; 
                overflow: hidden; 
                box-shadow: 
                  0 32px 64px rgba(0, 0, 0, 0.3),
                  0 16px 32px rgba(59, 130, 246, 0.1),
                  inset 0 1px 0 rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.1);
                position: relative;
            }
            
            .email-container::before {
                content: '';
                position: absolute;
                top: -50%;
                left: -25%;
                width: 200px;
                height: 200px;
                background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
                border-radius: 50%;
                z-index: 0;
            }
            
            .email-container::after {
                content: '';
                position: absolute;
                bottom: -50%;
                right: -25%;
                width: 160px;
                height: 160px;
                background: radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, transparent 70%);
                border-radius: 50%;
                z-index: 0;
            }
            
            /* Liquid Glass Header with Advanced Glass Morphism */
            .header { 
                background: linear-gradient(135deg, 
                  rgba(59, 130, 246, 0.2) 0%, 
                  rgba(29, 78, 216, 0.25) 30%,
                  rgba(14, 165, 233, 0.2) 70%,
                  rgba(168, 85, 247, 0.15) 100%);
                backdrop-filter: blur(20px);
                padding: 48px 40px; 
                text-align: center; 
                position: relative;
                overflow: hidden;
                z-index: 1;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .header::before {
                content: '';
                position: absolute;
                top: -30px;
                right: -30px;
                width: 120px;
                height: 120px;
                background: radial-gradient(circle, 
                  rgba(255, 255, 255, 0.08) 0%, 
                  rgba(59, 130, 246, 0.05) 40%,
                  transparent 70%);
                border-radius: 50%;
                animation: float 6s ease-in-out infinite;
            }
            
            .header::after {
                content: '';
                position: absolute;
                bottom: -40px;
                left: -40px;
                width: 100px;
                height: 100px;
                background: radial-gradient(circle, 
                  rgba(168, 85, 247, 0.06) 0%, 
                  transparent 70%);
                border-radius: 50%;
                animation: float 8s ease-in-out infinite reverse;
            }
            
            @keyframes float {
                0%, 100% { transform: translateY(0px) rotate(0deg); }
                33% { transform: translateY(-10px) rotate(120deg); }
                66% { transform: translateY(5px) rotate(240deg); }
            }
            
            /* Liquid Glass Logo Container */
            .logo-container { 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                margin-bottom: 20px;
            }
            
            .logo-icon {
                display: inline-block;
                margin-right: 16px;
                background: rgba(255, 255, 255, 0.08);
                border-radius: 20px;
                padding: 12px;
                backdrop-filter: blur(16px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                box-shadow: 
                  0 8px 16px rgba(0, 0, 0, 0.1),
                  inset 0 1px 0 rgba(255, 255, 255, 0.1);
            }
            
            .logo-text { 
                font-size: 36px; 
                font-weight: 800; 
                background: linear-gradient(135deg, #ffffff 0%, #e0f2fe 50%, #bfdbfe 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                letter-spacing: -1px;
                text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                filter: drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3));
            }
            
            .tagline { 
                color: rgba(255, 255, 255, 0.8); 
                font-size: 13px; 
                font-weight: 500;
                letter-spacing: 1px;
                text-transform: uppercase;
                margin-top: 8px;
                background: rgba(255, 255, 255, 0.05);
                padding: 6px 16px;
                border-radius: 20px;
                backdrop-filter: blur(8px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                display: inline-block;
            }
            
            /* Liquid Glass Content Area */
            .content { 
                padding: 48px 40px; 
                background: rgba(255, 255, 255, 0.02);
                backdrop-filter: blur(16px);
                position: relative;
                z-index: 1;
            }
            
            .title { 
                font-size: 32px; 
                background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                margin-bottom: 32px; 
                font-weight: 700;
                line-height: 1.2;
                text-align: center;
            }
            
            .text { 
                color: rgba(255, 255, 255, 0.9); 
                line-height: 1.7; 
                margin-bottom: 24px; 
                font-size: 16px;
                font-weight: 400;
            }
            
            /* Liquid Glass Button */
            .button { 
                display: inline-block; 
                background: linear-gradient(135deg, 
                  rgba(59, 130, 246, 0.8) 0%, 
                  rgba(29, 78, 216, 0.9) 50%,
                  rgba(14, 165, 233, 0.8) 100%);
                backdrop-filter: blur(16px);
                color: white; 
                padding: 18px 36px; 
                text-decoration: none; 
                border-radius: 20px; 
                font-weight: 600; 
                margin: 32px 0; 
                font-size: 16px;
                letter-spacing: 0.5px;
                box-shadow: 
                  0 12px 24px rgba(59, 130, 246, 0.3),
                  0 6px 12px rgba(0, 0, 0, 0.1),
                  inset 0 1px 0 rgba(255, 255, 255, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.2);
                position: relative;
                overflow: hidden;
            }
            
            .button::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, 
                  transparent, 
                  rgba(255, 255, 255, 0.2), 
                  transparent);
                transition: left 0.5s;
            }
            
            .button:hover::before {
                left: 100%;
            }
            
            .button:hover { 
                background: linear-gradient(135deg, 
                  rgba(59, 130, 246, 0.9) 0%, 
                  rgba(29, 78, 216, 1) 50%,
                  rgba(14, 165, 233, 0.9) 100%);
                transform: translateY(-3px);
                box-shadow: 
                  0 16px 32px rgba(59, 130, 246, 0.4),
                  0 8px 16px rgba(0, 0, 0, 0.2),
                  inset 0 1px 0 rgba(255, 255, 255, 0.3);
            }
            
            /* Liquid Glass Alert Boxes */
            .warning-box {
                background: rgba(251, 191, 36, 0.08);
                backdrop-filter: blur(16px);
                border: 1px solid rgba(251, 191, 36, 0.3);
                border-radius: 20px;
                padding: 24px;
                margin: 32px 0;
                position: relative;
                overflow: hidden;
                box-shadow: 
                  0 8px 16px rgba(251, 191, 36, 0.1),
                  inset 0 1px 0 rgba(255, 255, 255, 0.1);
            }
            
            .warning-box::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, 
                  transparent, 
                  rgba(251, 191, 36, 0.1), 
                  transparent);
                animation: shimmer 3s infinite;
            }
            
            .success-box {
                background: rgba(34, 197, 94, 0.08);
                backdrop-filter: blur(16px);
                border: 1px solid rgba(34, 197, 94, 0.3);
                border-radius: 20px;
                padding: 24px;
                margin: 32px 0;
                box-shadow: 
                  0 8px 16px rgba(34, 197, 94, 0.1),
                  inset 0 1px 0 rgba(255, 255, 255, 0.1);
            }
            
            .info-box {
                background: rgba(59, 130, 246, 0.08);
                backdrop-filter: blur(16px);
                border: 1px solid rgba(59, 130, 246, 0.3);
                border-radius: 20px;
                padding: 24px;
                margin: 32px 0;
                box-shadow: 
                  0 8px 16px rgba(59, 130, 246, 0.1),
                  inset 0 1px 0 rgba(255, 255, 255, 0.1);
            }
            
            @keyframes shimmer {
                0% { left: -100%; }
                50% { left: 100%; }
                100% { left: 100%; }
            }
            
            /* Liquid Glass Feature List */
            .feature-list {
                background: rgba(255, 255, 255, 0.03);
                backdrop-filter: blur(16px);
                border-radius: 20px;
                padding: 32px;
                margin: 32px 0;
                border: 1px solid rgba(255, 255, 255, 0.1);
                box-shadow: 
                  0 8px 16px rgba(0, 0, 0, 0.1),
                  inset 0 1px 0 rgba(255, 255, 255, 0.05);
            }
            
            .feature-list ul {
                list-style: none;
                padding: 0;
            }
            
            .feature-list li {
                padding: 12px 0;
                position: relative;
                padding-left: 36px;
                color: rgba(255, 255, 255, 0.9);
                font-weight: 500;
                transition: all 0.3s ease;
            }
            
            .feature-list li::before {
                content: '✓';
                position: absolute;
                left: 0;
                top: 12px;
                color: #22c55e;
                font-weight: bold;
                font-size: 18px;
                background: rgba(34, 197, 94, 0.1);
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                border: 1px solid rgba(34, 197, 94, 0.3);
            }
            
            /* Liquid Glass Footer */
            .footer { 
                background: rgba(15, 23, 42, 0.6);
                backdrop-filter: blur(20px);
                padding: 40px 40px; 
                text-align: center; 
                color: rgba(203, 213, 225, 0.9);
                position: relative;
                overflow: hidden;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                z-index: 1;
            }
            
            .footer::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 1px;
                background: linear-gradient(90deg, 
                  transparent, 
                  rgba(255, 255, 255, 0.2), 
                  rgba(59, 130, 246, 0.3),
                  rgba(255, 255, 255, 0.2),
                  transparent);
                animation: shimmer 4s infinite;
            }
            
            .footer-brand {
                font-size: 18px;
                font-weight: 800;
                background: linear-gradient(135deg, #ffffff 0%, #e0f2fe 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                margin-bottom: 12px;
            }
            
            .footer-text {
                font-size: 14px;
                color: rgba(148, 163, 184, 0.8);
                margin-bottom: 24px;
            }
            
            .footer-links {
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .footer-links a {
                color: rgba(59, 130, 246, 0.9);
                text-decoration: none;
                font-weight: 500;
                margin: 0 12px;
                padding: 6px 12px;
                border-radius: 12px;
                transition: all 0.3s ease;
                background: rgba(59, 130, 246, 0.05);
                border: 1px solid rgba(59, 130, 246, 0.1);
            }
            
            .footer-links a:hover {
                color: rgba(56, 189, 248, 1);
                background: rgba(59, 130, 246, 0.1);
                border-color: rgba(59, 130, 246, 0.2);
                transform: translateY(-1px);
            }
            
            .divider { 
                height: 1px; 
                background: linear-gradient(90deg, 
                  transparent, 
                  rgba(255, 255, 255, 0.1), 
                  rgba(59, 130, 246, 0.2),
                  rgba(255, 255, 255, 0.1),
                  transparent);
                margin: 32px 0; 
            }
            
            /* Mobile Responsive Liquid Glass */
            @media (max-width: 600px) {
                body { padding: 20px 10px; }
                .email-container { 
                    margin: 0; 
                    border-radius: 24px;
                }
                .header { padding: 36px 24px; }
                .content { padding: 36px 24px; }
                .footer { padding: 32px 24px; }
                .title { font-size: 28px; }
                .logo-text { font-size: 32px; }
                .button { 
                    padding: 16px 24px; 
                    font-size: 15px;
                    display: block;
                    text-align: center;
                }
                .feature-list { padding: 24px; }
                .warning-box,
                .success-box,
                .info-box { padding: 20px; }
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <div class="logo-container">
                    <div class="logo-icon">
                        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="rgba(255, 255, 255, 0.9)" />
                                    <stop offset="50%" stop-color="rgba(59, 130, 246, 0.8)" />
                                    <stop offset="100%" stop-color="rgba(14, 165, 233, 0.7)" />
                                </linearGradient>
                                <filter id="glow">
                                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                                    <feMerge> 
                                        <feMergeNode in="coloredBlur"/>
                                        <feMergeNode in="SourceGraphic"/>
                                    </feMerge>
                                </filter>
                            </defs>
                            <rect x="2" y="2" width="32" height="32" rx="10" fill="url(#logoGradient)" filter="url(#glow)" />
                            <g fill="rgba(30, 64, 175, 0.9)" filter="url(#glow)">
                                <rect x="10" y="10" width="3" height="18" rx="1" />
                                <rect x="10" y="10" width="14" height="3" rx="1" />
                                <rect x="10" y="17" width="11" height="3" rx="1" />
                            </g>
                            <g fill="rgba(14, 165, 233, 0.8)" filter="url(#glow)">
                                <circle cx="28" cy="12" r="2" />
                                <rect x="25" y="15" width="6" height="2" rx="1" transform="rotate(45 28 16)" />
                                <rect x="25" y="19" width="6" height="2" rx="1" transform="rotate(-45 28 20)" />
                            </g>
                        </svg>
                    </div>
                    <div class="logo-text">FIXIA</div>
                </div>
                <div class="tagline">"Confianza Líquida" • Servicios Certificados</div>
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
                <div style="font-size: 13px; color: rgba(148, 163, 184, 0.6); margin-bottom: 16px;">
                    Si no solicitaste este email, puedes ignorarlo con seguridad.
                </div>
                <div class="footer-links">
                    <a href="mailto:contacto@fixia.com.ar">contacto@fixia.com.ar</a>
                    <a href="${process.env.FRONTEND_URL}/legal/privacy">Política de Privacidad</a>
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
   * Enviar email de verificación con Liquid Glass Design
   */
  static async sendVerificationEmail(user, userType) {
    try {
      const token = await this.generateVerificationToken(user.id, user.email);
      const verificationUrl = `${process.env.FRONTEND_URL}/verificar-email?token=${token}&type=${userType}`;

      const isAS = userType === 'provider';
      const typeLabel = isAS ? 'Profesional AS' : 'Explorador';
      
      const content = `
        <p class="text">¡Hola <strong>${user.first_name} ${user.last_name}</strong>!</p>
        
        <p class="text">¡Bienvenido/a a <strong>FIXIA</strong>! Te has registrado exitosamente como <strong>${typeLabel}</strong> en nuestra plataforma con diseño "Confianza Líquida".</p>
        
        ${isAS ? `
          <div class="success-box">
            <p style="color: rgba(34, 197, 94, 0.9); font-weight: 600; margin: 0; font-size: 16px;">
              🎯 <strong>Profesional AS Certificado</strong>
            </p>
            <p style="color: rgba(34, 197, 94, 0.7); margin: 8px 0 0 0; font-size: 14px;">
              Acceso completo a la plataforma profesional con glass morphism
            </p>
          </div>
          
          <div class="feature-list">
            <p style="color: rgba(255, 255, 255, 0.9); font-weight: 600; margin: 0 0 16px 0;">Como <strong>Profesional AS</strong>, tendrás acceso a:</p>
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
            <p style="color: rgba(59, 130, 246, 0.9); font-weight: 600; margin: 0; font-size: 16px;">
              🔍 <strong>Explorador Certificado</strong>
            </p>
            <p style="color: rgba(59, 130, 246, 0.7); margin: 8px 0 0 0; font-size: 14px;">
              Conecta con profesionales AS verificados en tu zona
            </p>
          </div>
          
          <div class="feature-list">
            <p style="color: rgba(255, 255, 255, 0.9); font-weight: 600; margin: 0 0 16px 0;">Como <strong>Explorador</strong>, podrás:</p>
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
          <p style="color: rgba(251, 191, 36, 0.9); font-weight: 600; margin: 0; font-size: 15px;">
            ⚠️ <strong>Importante:</strong> Este enlace expirará en 24 horas por seguridad.
          </p>
          <p style="color: rgba(251, 191, 36, 0.7); margin: 8px 0 0 0; font-size: 14px;">
            Verifica tu cuenta ahora para acceder a todas las funcionalidades
          </p>
        </div>
        
        <p class="text">Si el botón no funciona, puedes copiar y pegar este enlace en tu navegador:</p>
        <p style="word-break: break-all; color: rgba(59, 130, 246, 0.9); font-size: 14px; background: rgba(59, 130, 246, 0.05); padding: 12px; border-radius: 12px; font-family: monospace; border: 1px solid rgba(59, 130, 246, 0.2);">${verificationUrl}</p>
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
   * Enviar email de bienvenida con Liquid Glass Design
   */
  static async sendWelcomeEmail(user, userType) {
    try {
      const isAS = userType === 'provider';
      const typeLabel = isAS ? 'Profesional AS' : 'Explorador';
      const dashboardUrl = `${process.env.FRONTEND_URL}/${isAS ? 'as' : 'explorador'}/dashboard`;

      const content = `
        <p class="text">¡Hola <strong>${user.first_name}</strong>!</p>
        
        <p class="text">🎉 ¡Tu email ha sido verificado exitosamente! Ya puedes acceder a todas las funcionalidades de Fixia con nuestro diseño "Confianza Líquida" como <strong>${typeLabel}</strong>.</p>
        
        ${isAS ? `
          <div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%); backdrop-filter: blur(16px); color: rgba(255, 255, 255, 0.9); padding: 24px; border-radius: 20px; margin: 32px 0; border: 1px solid rgba(34, 197, 94, 0.3);">
            <h3 style="margin: 0 0 12px 0; font-size: 18px; color: rgba(34, 197, 94, 0.9);">🎁 ¡Oferta de Lanzamiento!</h3>
            <p style="margin: 0; opacity: 0.9;">Como uno de los primeros 200 profesionales AS, tienes <strong>2 meses GRATIS</strong> de suscripción premium.</p>
          </div>
          
          <p class="text"><strong>Próximos pasos recomendados:</strong></p>
          <ol style="color: rgba(255, 255, 255, 0.8); margin: 16px 0; padding-left: 20px;">
            <li>Completa tu perfil profesional</li>
            <li>Sube fotos de tus trabajos al portfolio</li>
            <li>Verifica tu identidad con DNI + selfie</li>
            <li>Configura tus ubicaciones de trabajo</li>
            <li>¡Empieza a recibir solicitudes!</li>
          </ol>
        ` : `
          <div style="background: linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(168, 85, 247, 0.1) 100%); backdrop-filter: blur(16px); color: rgba(255, 255, 255, 0.9); padding: 24px; border-radius: 20px; margin: 32px 0; border: 1px solid rgba(168, 85, 247, 0.3);">
            <h3 style="margin: 0 0 12px 0; font-size: 18px; color: rgba(168, 85, 247, 0.9);">🎁 ¡Oferta de Lanzamiento!</h3>
            <p style="margin: 0; opacity: 0.9;">Como uno de los primeros 200 Exploradores, tienes acceso a <strong>funciones premium GRATIS</strong> por 2 meses.</p>
          </div>
          
          <p class="text"><strong>¿Qué puedes hacer ahora?</strong></p>
          <ul style="color: rgba(255, 255, 255, 0.8); margin: 16px 0; padding-left: 20px;">
            <li>Buscar profesionales en tu localidad</li>
            <li>Usar búsqueda inteligente: "busco plomero para hoy"</li>
            <li>Conectar directamente via chat</li>
            <li>¿Quieres ofrecer servicios? ¡Cambia a modo AS desde tu perfil!</li>
          </ul>
        `}
        
        <p class="text">¿Tienes preguntas? Nuestro equipo está aquí para ayudarte en <a href="mailto:soporte@fixia.com.ar" style="color: rgba(59, 130, 246, 0.9);">soporte@fixia.com.ar</a></p>
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
   * Enviar email de recuperación de contraseña con Liquid Glass Design
   */
  static async sendPasswordResetEmail(user) {
    try {
      const token = await this.generateVerificationToken(user.id, user.email, 'password_reset');
      const resetUrl = `${process.env.FRONTEND_URL}/recuperar-password?token=${token}`;

      const content = `
        <p class="text">¡Hola <strong>${user.first_name}</strong>!</p>
        
        <p class="text">Recibimos una solicitud para restablecer la contraseña de tu cuenta en Fixia.</p>
        
        <p class="text">Si fuiste tú quien solicitó esto, haz clic en el botón de abajo para crear una nueva contraseña:</p>
        
        <div class="warning-box">
          <p style="color: rgba(251, 191, 36, 0.9); font-weight: 600; margin: 0; font-size: 15px;">
            ⚠️ <strong>Importante:</strong> Este enlace expirará en 24 horas por seguridad.
          </p>
          <p style="color: rgba(251, 191, 36, 0.7); margin: 8px 0 0 0; font-size: 14px;">
            Tu cuenta permanecerá protegida hasta que completes el proceso
          </p>
        </div>
        
        <p class="text">Si <strong>NO</strong> solicitaste restablecer tu contraseña, puedes ignorar este email con seguridad. Tu cuenta permanecerá protegida.</p>
        
        <p class="text">Si el botón no funciona, puedes copiar y pegar este enlace:</p>
        <p style="word-break: break-all; color: rgba(59, 130, 246, 0.9); font-size: 14px; background: rgba(59, 130, 246, 0.05); padding: 12px; border-radius: 12px; font-family: monospace; border: 1px solid rgba(59, 130, 246, 0.2);">${resetUrl}</p>
        
        <div class="info-box">
          <p style="color: rgba(59, 130, 246, 0.9); font-weight: 600; margin: 0 0 8px 0;">🔒 <strong>Recordatorio de seguridad:</strong></p>
          <p style="color: rgba(59, 130, 246, 0.7); margin: 0; font-size: 14px;">
            Nunca compartas tus credenciales con nadie. Fixia nunca te pedirá tu contraseña por email.
          </p>
        </div>
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

  // ... resto de métodos conservados con algunos ajustes de estilo
}

module.exports = EmailService;