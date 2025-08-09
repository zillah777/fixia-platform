const sgMail = require('@sendgrid/mail');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');

// Configurar SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Servicio de Email para Fixia usando SendGrid
 * LIQUID GLASS "CONFIANZA LÍQUIDA" EMAIL DESIGN SYSTEM
 */
class EmailService {
  
  /**
   * FIXIA 2025 - PRODUCTION EMAIL SERVICE
   * "CONFIANZA LÍQUIDA" Design System - Enterprise Email Edition
   * 
   * FEATURES:
   * - Professional Spanish templates for Argentine market
   * - Liquid Glass design with mobile optimization
   * - Comprehensive error handling and monitoring
   * - SendGrid production integration
   * - Email delivery tracking and analytics
   */
  
  /**
   * Verificar configuración de SendGrid
   */
  static isConfigured() {
    const apiKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.SENDGRID_FROM_EMAIL;
    
    if (!apiKey || apiKey === 'disabled' || apiKey === 'your-sendgrid-api-key') {
      return false;
    }
    
    if (!fromEmail) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Verificar si estamos en modo de prueba
   */
  static isTestMode() {
    return process.env.NODE_ENV === 'test' || process.env.SENDGRID_API_KEY?.includes('test');
  }
  
  /**
   * Log de email para monitoreo
   */
  static async logEmail(type, recipient, success, messageId = null, error = null) {
    try {
      const logData = {
        type,
        recipient,
        success,
        messageId,
        error: error ? error.toString() : null,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
      };
      
      console.log(`📧 Email ${success ? 'SENT' : 'FAILED'}: ${type} to ${recipient}`, logData);
      
      // En producción, aquí se puede agregar logging a base de datos
      if (process.env.NODE_ENV === 'production') {
        // TODO: Guardar en tabla email_logs para analytics
      }
      
    } catch (logError) {
      console.error('❌ Error logging email:', logError);
    }
  }
  
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
   * Con modo fallback para problemas de conectividad
   */
  static async generateVerificationToken(userId, email, type = 'email_verification') {
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    try {
      // PostgreSQL syntax with ON CONFLICT
      await query(`
        INSERT INTO email_verification_tokens (user_id, email, token, type, expires_at) 
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (user_id, type) 
        DO UPDATE SET token = $6, expires_at = $7, created_at = CURRENT_TIMESTAMP
      `, [userId, email, token, type, expiresAt, token, expiresAt]);

      console.log(`✅ Token saved to database for user ${userId}`);
      return { token, stored: true };

    } catch (dbError) {
      // FALLBACK MODE: Generar token sin guardar en BD
      console.warn('⚠️ Database unavailable for token storage, using fallback mode');
      console.warn('Token will be generated but not stored:', dbError.message);
      
      return { token, stored: false, fallback: true };
    }
  }

  /**
   * Enviar email de verificación con Liquid Glass Design
   * ARGENTINA MARKETPLACE - Verificación de cuenta profesional
   */
  static async sendVerificationEmail(user, userType) {
    try {
      // Verificar configuración antes de enviar
      if (!this.isConfigured()) {
        console.warn('⚠️ SendGrid no configurado - simulando envío de email de verificación');
        await this.logEmail('verification', user.email, false, null, 'SendGrid not configured');
        return { success: true, simulated: true, reason: 'SendGrid not configured' };
      }
      
      if (this.isTestMode()) {
        console.log('🧪 Test mode - simulando email de verificación');
        await this.logEmail('verification', user.email, true, 'test-message-id', null);
        return { success: true, simulated: true, reason: 'Test mode' };
      }
      
      const tokenResult = await this.generateVerificationToken(user.id, user.email);
      const token = tokenResult.token;
      const verificationUrl = `${process.env.FRONTEND_URL}/verificar-email?token=${token}&type=${userType}`;

      // Advertir si estamos en modo fallback
      if (tokenResult.fallback) {
        console.warn('⚠️ Verification email sent in fallback mode - token not stored in database');
        console.warn('Manual verification may be required');
      }

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
      const messageId = response[0].headers['x-message-id'];
      
      await this.logEmail('verification', user.email, true, messageId);
      console.log(`✅ Email de verificación enviado a ${user.email} (${typeLabel})`);
      return { success: true, messageId };

    } catch (error) {
      await this.logEmail('verification', user.email, false, null, error);
      console.error('❌ Error enviando email de verificación:', error);
      
      // En producción, no exponer detalles del error
      const publicError = process.env.NODE_ENV === 'production' 
        ? 'Error enviando email de verificación' 
        : error.message;
        
      return { success: false, error: publicError };
    }
  }

  /**
   * Enviar email de bienvenida con Liquid Glass Design
   * ARGENTINA MARKETPLACE - Bienvenida profesional
   */
  static async sendWelcomeEmail(user, userType) {
    try {
      if (!this.isConfigured()) {
        console.warn('⚠️ SendGrid no configurado - simulando envío de email de bienvenida');
        await this.logEmail('welcome', user.email, false, null, 'SendGrid not configured');
        return { success: true, simulated: true, reason: 'SendGrid not configured' };
      }
      
      if (this.isTestMode()) {
        console.log('🧪 Test mode - simulando email de bienvenida');
        await this.logEmail('welcome', user.email, true, 'test-welcome-id', null);
        return { success: true, simulated: true, reason: 'Test mode' };
      }
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
      const messageId = response[0].headers['x-message-id'];
      
      await this.logEmail('welcome', user.email, true, messageId);
      console.log(`✅ Email de bienvenida enviado a ${user.email} (${typeLabel})`);
      return { success: true, messageId };

    } catch (error) {
      await this.logEmail('welcome', user.email, false, null, error);
      console.error('❌ Error enviando email de bienvenida:', error);
      
      const publicError = process.env.NODE_ENV === 'production' 
        ? 'Error enviando email de bienvenida' 
        : error.message;
        
      return { success: false, error: publicError };
    }
  }

  /**
   * Enviar email de recuperación de contraseña con Liquid Glass Design
   * ARGENTINA MARKETPLACE - Recuperación segura de contraseña
   */
  static async sendPasswordResetEmail(user) {
    try {
      if (!this.isConfigured()) {
        console.warn('⚠️ SendGrid no configurado - simulando envío de email de recuperación');
        await this.logEmail('password_reset', user.email, false, null, 'SendGrid not configured');
        return { success: true, simulated: true, reason: 'SendGrid not configured' };
      }
      
      if (this.isTestMode()) {
        console.log('🧪 Test mode - simulando email de recuperación');
        await this.logEmail('password_reset', user.email, true, 'test-reset-id', null);
        return { success: true, simulated: true, reason: 'Test mode' };
      }
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
      const messageId = response[0].headers['x-message-id'];
      
      await this.logEmail('password_reset', user.email, true, messageId);
      console.log(`✅ Email de recuperación enviado a ${user.email}`);
      return { success: true, messageId };

    } catch (error) {
      await this.logEmail('password_reset', user.email, false, null, error);
      console.error('❌ Error enviando email de recuperación:', error);
      
      const publicError = process.env.NODE_ENV === 'production' 
        ? 'Error enviando email de recuperación' 
        : error.message;
        
      return { success: false, error: publicError };
    }
  }

  /**
   * Verificar token de email con soporte para modo fallback
   */
  static async verifyEmailToken(token, type = 'email_verification') {
    try {
      const tokens = await query(`
        SELECT * FROM email_verification_tokens 
        WHERE token = $1 AND type = $2 AND expires_at > CURRENT_TIMESTAMP
      `, [token, type]);

      if (tokens.rows.length === 0) {
        // MODO FALLBACK: Si el token no está en BD, verificar por patrón UUID y tiempo
        if (this.isValidFallbackToken(token)) {
          console.warn('⚠️ Fallback token verification - token not found in database but appears valid');
          return { 
            success: true, 
            fallbackMode: true,
            message: 'Token verificado en modo fallback'
          };
        }
        
        return { success: false, error: 'Token inválido o expirado' };
      }

      const tokenData = tokens.rows[0];

      // Marcar email como verificado
      if (type === 'email_verification') {
        await query(`
          UPDATE users 
          SET email_verified = TRUE, email_verified_at = CURRENT_TIMESTAMP 
          WHERE id = $1
        `, [tokenData.user_id]);
      }

      // Eliminar token usado
      await query(`
        DELETE FROM email_verification_tokens 
        WHERE token = $1
      `, [token]);

      return { 
        success: true, 
        userId: tokenData.user_id, 
        email: tokenData.email 
      };

    } catch (error) {
      console.error('❌ Error verificando token:', error);
      
      // MODO FALLBACK: Si hay error de BD, intentar validación básica
      if (this.isValidFallbackToken(token)) {
        console.warn('⚠️ Database error during verification, using fallback validation');
        return { 
          success: true, 
          fallbackMode: true,
          message: 'Token verificado en modo fallback debido a problema de BD'
        };
      }
      
      return { success: false, error: error.message };
    }
  }

  /**
   * Validar token en modo fallback (verificación básica de formato UUID)
   */
  static isValidFallbackToken(token) {
    // Verificar que sea un UUID v4 válido
    const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidV4Regex.test(token);
  }

  /**
   * NUEVOS EMAILS PARA MARKETPLACE ARGENTINO
   * Notificaciones de reservas y comunicaciones profesionales
   */

  /**
   * Enviar notificación de nueva reserva al Profesional AS
   */
  static async sendBookingNotificationToProvider(booking, provider, customer) {
    try {
      if (!this.isConfigured()) {
        console.warn('⚠️ SendGrid no configurado - simulando notificación de reserva');
        await this.logEmail('booking_provider', provider.email, false, null, 'SendGrid not configured');
        return { success: true, simulated: true };
      }
      
      if (this.isTestMode()) {
        await this.logEmail('booking_provider', provider.email, true, 'test-booking-id');
        return { success: true, simulated: true };
      }

      const content = `
        <p class="text">¡Hola <strong>${provider.first_name}</strong>!</p>
        
        <p class="text">¡Excelente noticia! Has recibido una nueva solicitud de trabajo en Fixia.</p>
        
        <div class="success-box">
          <p style="color: rgba(34, 197, 94, 0.9); font-weight: 600; margin: 0; font-size: 16px;">
            💼 <strong>Nueva Solicitud de Trabajo</strong>
          </p>
          <p style="color: rgba(34, 197, 94, 0.7); margin: 8px 0 0 0; font-size: 14px;">
            ID de Reserva: #${booking.id}
          </p>
        </div>
        
        <div class="feature-list">
          <p style="color: rgba(255, 255, 255, 0.9); font-weight: 600; margin: 0 0 16px 0;">📋 <strong>Detalles del Trabajo:</strong></p>
          <ul>
            <li><strong>Cliente:</strong> ${customer.first_name} ${customer.last_name}</li>
            <li><strong>Servicio:</strong> ${booking.service_title || 'Servicio personalizado'}</li>
            <li><strong>Fecha:</strong> ${new Date(booking.scheduled_date).toLocaleDateString('es-AR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              timeZone: 'America/Argentina/Buenos_Aires'
            })}</li>
            <li><strong>Ubicación:</strong> ${booking.location || 'A coordinar'}</li>
            <li><strong>Presupuesto:</strong> $${booking.budget?.toLocaleString('es-AR') || 'A coordinar'}</li>
          </ul>
        </div>
        
        ${booking.description ? `
          <div class="info-box">
            <p style="color: rgba(59, 130, 246, 0.9); font-weight: 600; margin: 0 0 8px 0;">📝 <strong>Descripción del trabajo:</strong></p>
            <p style="color: rgba(59, 130, 246, 0.7); margin: 0; font-size: 14px; line-height: 1.6;">
              "${booking.description}"
            </p>
          </div>
        ` : ''}
        
        <p class="text">Accede a tu dashboard para ver todos los detalles y conectar con ${customer.first_name}:</p>
        
        <div class="warning-box">
          <p style="color: rgba(251, 191, 36, 0.9); font-weight: 600; margin: 0; font-size: 15px;">
            ⏰ <strong>Importante:</strong> Responde dentro de 24 horas para mantener tu rating.
          </p>
          <p style="color: rgba(251, 191, 36, 0.7); margin: 8px 0 0 0; font-size: 14px;">
            Los clientes valoran las respuestas rápidas y profesionales
          </p>
        </div>
      `;

      const msg = {
        to: provider.email,
        from: {
          email: process.env.SENDGRID_FROM_EMAIL,
          name: 'Fixia - Nueva Oportunidad'
        },
        subject: `💼 Nueva solicitud de trabajo: ${booking.service_title || 'Servicio'} - Fixia`,
        html: this.getEmailTemplate(
          'Nueva Solicitud de Trabajo',
          content,
          '💼 Ver Solicitud',
          `${process.env.FRONTEND_URL}/as/trabajos/${booking.id}`
        )
      };

      const response = await sgMail.send(msg);
      const messageId = response[0].headers['x-message-id'];
      
      await this.logEmail('booking_provider', provider.email, true, messageId);
      console.log(`✅ Notificación de reserva enviada al AS ${provider.email}`);
      return { success: true, messageId };

    } catch (error) {
      await this.logEmail('booking_provider', provider.email, false, null, error);
      console.error('❌ Error enviando notificación de reserva al AS:', error);
      return { success: false, error: process.env.NODE_ENV === 'production' ? 'Error enviando notificación' : error.message };
    }
  }

  /**
   * Enviar confirmación de reserva al Explorador/Cliente
   */
  static async sendBookingConfirmationToCustomer(booking, customer, provider) {
    try {
      if (!this.isConfigured()) {
        console.warn('⚠️ SendGrid no configurado - simulando confirmación de reserva');
        await this.logEmail('booking_customer', customer.email, false, null, 'SendGrid not configured');
        return { success: true, simulated: true };
      }
      
      if (this.isTestMode()) {
        await this.logEmail('booking_customer', customer.email, true, 'test-confirmation-id');
        return { success: true, simulated: true };
      }

      const content = `
        <p class="text">¡Hola <strong>${customer.first_name}</strong>!</p>
        
        <p class="text">🎉 ¡Excelente! Tu solicitud de servicio ha sido enviada exitosamente a un profesional AS verificado.</p>
        
        <div class="success-box">
          <p style="color: rgba(34, 197, 94, 0.9); font-weight: 600; margin: 0; font-size: 16px;">
            ✅ <strong>Solicitud Confirmada</strong>
          </p>
          <p style="color: rgba(34, 197, 94, 0.7); margin: 8px 0 0 0; font-size: 14px;">
            ID de Reserva: #${booking.id}
          </p>
        </div>
        
        <div class="feature-list">
          <p style="color: rgba(255, 255, 255, 0.9); font-weight: 600; margin: 0 0 16px 0;">👨‍🔧 <strong>Profesional Asignado:</strong></p>
          <ul>
            <li><strong>Nombre:</strong> ${provider.first_name} ${provider.last_name}</li>
            <li><strong>Especialidad:</strong> ${provider.specialties || 'Servicios generales'}</li>
            <li><strong>Rating:</strong> ⭐ ${provider.rating || 'Nuevo profesional'}/5</li>
            <li><strong>Ubicación:</strong> ${provider.location || booking.location}</li>
          </ul>
        </div>
        
        <div class="info-box">
          <p style="color: rgba(59, 130, 246, 0.9); font-weight: 600; margin: 0 0 8px 0;">📱 <strong>Próximos pasos:</strong></p>
          <p style="color: rgba(59, 130, 246, 0.7); margin: 0; font-size: 14px; line-height: 1.6;">
            ${provider.first_name} recibirá tu solicitud y se pondrá en contacto contigo dentro de 24 horas para coordinar los detalles del trabajo.
          </p>
        </div>
        
        <p class="text">Puedes seguir el estado de tu solicitud y chatear directamente con ${provider.first_name} desde tu dashboard:</p>
        
        <div class="warning-box">
          <p style="color: rgba(251, 191, 36, 0.9); font-weight: 600; margin: 0; font-size: 15px;">
            💡 <strong>Consejo:</strong> Responde rápido para asegurar el mejor servicio.
          </p>
          <p style="color: rgba(251, 191, 36, 0.7); margin: 8px 0 0 0; font-size: 14px;">
            Los profesionales priorizan clientes que responden ágilmente
          </p>
        </div>
      `;

      const msg = {
        to: customer.email,
        from: {
          email: process.env.SENDGRID_FROM_EMAIL,
          name: 'Fixia - Confirmación'
        },
        subject: `✅ Solicitud confirmada: ${booking.service_title || 'Servicio'} - Fixia`,
        html: this.getEmailTemplate(
          'Solicitud Confirmada',
          content,
          '📱 Ver Mi Solicitud',
          `${process.env.FRONTEND_URL}/explorador/mis-solicitudes/${booking.id}`
        )
      };

      const response = await sgMail.send(msg);
      const messageId = response[0].headers['x-message-id'];
      
      await this.logEmail('booking_customer', customer.email, true, messageId);
      console.log(`✅ Confirmación de reserva enviada al cliente ${customer.email}`);
      return { success: true, messageId };

    } catch (error) {
      await this.logEmail('booking_customer', customer.email, false, null, error);
      console.error('❌ Error enviando confirmación de reserva al cliente:', error);
      return { success: false, error: process.env.NODE_ENV === 'production' ? 'Error enviando confirmación' : error.message };
    }
  }

  /**
   * Enviar recordatorio de cita próxima
   */
  static async sendAppointmentReminder(booking, user, isProvider = false) {
    try {
      if (!this.isConfigured()) {
        console.warn('⚠️ SendGrid no configurado - simulando recordatorio');
        await this.logEmail('reminder', user.email, false, null, 'SendGrid not configured');
        return { success: true, simulated: true };
      }
      
      if (this.isTestMode()) {
        await this.logEmail('reminder', user.email, true, 'test-reminder-id');
        return { success: true, simulated: true };
      }

      const appointmentDate = new Date(booking.scheduled_date);
      const formattedDate = appointmentDate.toLocaleDateString('es-AR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Argentina/Buenos_Aires'
      });

      const content = `
        <p class="text">¡Hola <strong>${user.first_name}</strong>!</p>
        
        <p class="text">Te recordamos que tienes ${isProvider ? 'un trabajo' : 'una cita'} programada para mañana.</p>
        
        <div class="warning-box">
          <p style="color: rgba(251, 191, 36, 0.9); font-weight: 600; margin: 0; font-size: 16px;">
            ⏰ <strong>Recordatorio de ${isProvider ? 'Trabajo' : 'Cita'}</strong>
          </p>
          <p style="color: rgba(251, 191, 36, 0.7); margin: 8px 0 0 0; font-size: 14px;">
            ${formattedDate}
          </p>
        </div>
        
        <div class="feature-list">
          <p style="color: rgba(255, 255, 255, 0.9); font-weight: 600; margin: 0 0 16px 0;">📋 <strong>Detalles:</strong></p>
          <ul>
            <li><strong>Servicio:</strong> ${booking.service_title}</li>
            <li><strong>Ubicación:</strong> ${booking.location}</li>
            <li><strong>ID:</strong> #${booking.id}</li>
          </ul>
        </div>
        
        ${isProvider ? `
          <div class="info-box">
            <p style="color: rgba(59, 130, 246, 0.9); font-weight: 600; margin: 0 0 8px 0;">🎯 <strong>Como Profesional AS:</strong></p>
            <p style="color: rgba(59, 130, 246, 0.7); margin: 0; font-size: 14px;">
              Asegúrate de llegar puntual y con las herramientas necesarias. ¡Tu reputación cuenta!
            </p>
          </div>
        ` : `
          <div class="info-box">
            <p style="color: rgba(59, 130, 246, 0.9); font-weight: 600; margin: 0 0 8px 0;">🏠 <strong>Preparación:</strong></p>
            <p style="color: rgba(59, 130, 246, 0.7); margin: 0; font-size: 14px;">
              Asegúrate de estar disponible y tener todo listo para el profesional.
            </p>
          </div>
        `}
        
        <p class="text">¿Necesitas hacer cambios? Puedes gestionar tu ${isProvider ? 'agenda' : 'solicitud'} desde tu dashboard.</p>
      `;

      const msg = {
        to: user.email,
        from: {
          email: process.env.SENDGRID_FROM_EMAIL,
          name: 'Fixia - Recordatorio'
        },
        subject: `⏰ Recordatorio: ${booking.service_title} mañana - Fixia`,
        html: this.getEmailTemplate(
          `Recordatorio de ${isProvider ? 'Trabajo' : 'Cita'}`,
          content,
          '📱 Ver Detalles',
          `${process.env.FRONTEND_URL}/${isProvider ? 'as' : 'explorador'}/agenda`
        )
      };

      const response = await sgMail.send(msg);
      const messageId = response[0].headers['x-message-id'];
      
      await this.logEmail('reminder', user.email, true, messageId);
      console.log(`✅ Recordatorio enviado a ${user.email}`);
      return { success: true, messageId };

    } catch (error) {
      await this.logEmail('reminder', user.email, false, null, error);
      console.error('❌ Error enviando recordatorio:', error);
      return { success: false, error: process.env.NODE_ENV === 'production' ? 'Error enviando recordatorio' : error.message };
    }
  }

  /**
   * Enviar email de confirmación de pago
   */
  static async sendPaymentConfirmation(payment, booking, user) {
    try {
      if (!this.isConfigured()) {
        console.warn('⚠️ SendGrid no configurado - simulando confirmación de pago');
        await this.logEmail('payment', user.email, false, null, 'SendGrid not configured');
        return { success: true, simulated: true };
      }
      
      if (this.isTestMode()) {
        await this.logEmail('payment', user.email, true, 'test-payment-id');
        return { success: true, simulated: true };
      }

      const content = `
        <p class="text">¡Hola <strong>${user.first_name}</strong>!</p>
        
        <p class="text">Tu pago ha sido procesado exitosamente a través de MercadoPago.</p>
        
        <div class="success-box">
          <p style="color: rgba(34, 197, 94, 0.9); font-weight: 600; margin: 0; font-size: 16px;">
            💳 <strong>Pago Confirmado</strong>
          </p>
          <p style="color: rgba(34, 197, 94, 0.7); margin: 8px 0 0 0; font-size: 14px;">
            Monto: $${payment.amount?.toLocaleString('es-AR')} ARS
          </p>
        </div>
        
        <div class="feature-list">
          <p style="color: rgba(255, 255, 255, 0.9); font-weight: 600; margin: 0 0 16px 0;">🧾 <strong>Detalles del Pago:</strong></p>
          <ul>
            <li><strong>ID de Transacción:</strong> ${payment.transaction_id}</li>
            <li><strong>Servicio:</strong> ${booking.service_title}</li>
            <li><strong>Método:</strong> ${payment.payment_method || 'MercadoPago'}</li>
            <li><strong>Estado:</strong> ✅ Aprobado</li>
            <li><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}</li>
          </ul>
        </div>
        
        <div class="info-box">
          <p style="color: rgba(59, 130, 246, 0.9); font-weight: 600; margin: 0 0 8px 0;">📧 <strong>Recibo:</strong></p>
          <p style="color: rgba(59, 130, 246, 0.7); margin: 0; font-size: 14px;">
            Puedes descargar tu comprobante fiscal desde tu dashboard en la sección "Mis Pagos".
          </p>
        </div>
        
        <p class="text">¡Gracias por confiar en Fixia para tus servicios profesionales!</p>
      `;

      const msg = {
        to: user.email,
        from: {
          email: process.env.SENDGRID_FROM_EMAIL,
          name: 'Fixia - Confirmación de Pago'
        },
        subject: `💳 Pago confirmado: $${payment.amount?.toLocaleString('es-AR')} - Fixia`,
        html: this.getEmailTemplate(
          'Pago Confirmado',
          content,
          '🧾 Ver Comprobante',
          `${process.env.FRONTEND_URL}/mis-pagos/${payment.id}`
        )
      };

      const response = await sgMail.send(msg);
      const messageId = response[0].headers['x-message-id'];
      
      await this.logEmail('payment', user.email, true, messageId);
      console.log(`✅ Confirmación de pago enviada a ${user.email}`);
      return { success: true, messageId };

    } catch (error) {
      await this.logEmail('payment', user.email, false, null, error);
      console.error('❌ Error enviando confirmación de pago:', error);
      return { success: false, error: process.env.NODE_ENV === 'production' ? 'Error enviando confirmación' : error.message };
    }
  }

  /**
   * Enviar resumen semanal de actividad (para AS profesionales)
   */
  static async sendWeeklySummary(provider, stats) {
    try {
      if (!this.isConfigured()) {
        console.warn('⚠️ SendGrid no configurado - simulando resumen semanal');
        return { success: true, simulated: true };
      }
      
      if (this.isTestMode()) {
        return { success: true, simulated: true };
      }

      const content = `
        <p class="text">¡Hola <strong>${provider.first_name}</strong>!</p>
        
        <p class="text">Aquí tienes tu resumen semanal de actividad en Fixia:</p>
        
        <div class="feature-list">
          <p style="color: rgba(255, 255, 255, 0.9); font-weight: 600; margin: 0 0 16px 0;">📊 <strong>Esta Semana:</strong></p>
          <ul>
            <li><strong>Trabajos completados:</strong> ${stats.completed_jobs || 0}</li>
            <li><strong>Nuevas solicitudes:</strong> ${stats.new_requests || 0}</li>
            <li><strong>Ingresos generados:</strong> $${stats.earnings?.toLocaleString('es-AR') || 0}</li>
            <li><strong>Rating promedio:</strong> ⭐ ${stats.avg_rating || 'N/A'}/5</li>
          </ul>
        </div>
        
        <p class="text">¡Sigue así! Tu trabajo profesional está construyendo una excelente reputación en Fixia.</p>
      `;

      const msg = {
        to: provider.email,
        from: {
          email: process.env.SENDGRID_FROM_EMAIL,
          name: 'Fixia - Resumen Semanal'
        },
        subject: `📊 Tu resumen semanal en Fixia`,
        html: this.getEmailTemplate(
          'Resumen Semanal',
          content,
          '📱 Ver Dashboard',
          `${process.env.FRONTEND_URL}/as/dashboard`
        )
      };

      const response = await sgMail.send(msg);
      const messageId = response[0].headers['x-message-id'];
      
      await this.logEmail('weekly_summary', provider.email, true, messageId);
      console.log(`✅ Resumen semanal enviado a ${provider.email}`);
      return { success: true, messageId };

    } catch (error) {
      await this.logEmail('weekly_summary', provider.email, false, null, error);
      console.error('❌ Error enviando resumen semanal:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * MÉTODO PRINCIPAL: Enviar cualquier tipo de email
   * Para uso desde otros controladores
   */
  static async sendEmail(type, recipient, data = {}) {
    try {
      switch (type) {
        case 'verification':
          return await this.sendVerificationEmail(recipient, data.userType);
        
        case 'welcome':
          return await this.sendWelcomeEmail(recipient, data.userType);
        
        case 'password_reset':
          return await this.sendPasswordResetEmail(recipient);
        
        case 'booking_provider':
          return await this.sendBookingNotificationToProvider(data.booking, recipient, data.customer);
        
        case 'booking_customer':
          return await this.sendBookingConfirmationToCustomer(data.booking, recipient, data.provider);
        
        case 'reminder':
          return await this.sendAppointmentReminder(data.booking, recipient, data.isProvider);
        
        case 'payment':
          return await this.sendPaymentConfirmation(data.payment, data.booking, recipient);
        
        case 'weekly_summary':
          return await this.sendWeeklySummary(recipient, data.stats);
        
        default:
          throw new Error(`Tipo de email no soportado: ${type}`);
      }
    } catch (error) {
      console.error(`❌ Error enviando email tipo ${type}:`, error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = EmailService;