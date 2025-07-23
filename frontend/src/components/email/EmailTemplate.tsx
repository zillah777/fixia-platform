import React from 'react';

interface EmailTemplateProps {
  title: string;
  children: React.ReactNode;
  preheader?: string;
  footerText?: string;
}

const EmailTemplate: React.FC<EmailTemplateProps> = ({
  title,
  children,
  preheader = '',
  footerText = '© 2024 Fixia. Todos los derechos reservados.',
}) => {
  // Logo SVG inline para compatibilidad con email clients
  const logoSvg = `
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="22" fill="#3b82f6"/>
      <circle cx="24" cy="24" r="18" fill="none" stroke="white" stroke-width="0.5" opacity="0.2"/>
      <rect x="15" y="14" width="3" height="20" rx="1.5" fill="white"/>
      <rect x="15" y="14" width="14" height="3" rx="1.5" fill="white"/>
      <rect x="15" y="22" width="10" height="3" rx="1.5" fill="white"/>
      <circle cx="32" cy="18" r="2.5" fill="#f97316"/>
      <line x1="29.5" y1="18" x2="25" y2="15" stroke="white" stroke-width="1" opacity="0.6" stroke-linecap="round"/>
      <line x1="29.5" y1="18" x2="25" y2="21" stroke="white" stroke-width="1" opacity="0.6" stroke-linecap="round"/>
    </svg>
  `;

  return (
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>{title}</title>
        <style>{`
          /* Marketplace 2.0 Email Styles */
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background-color: #f9fafb;
          }
          
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          
          .email-header {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            padding: 32px 40px;
            text-align: center;
          }
          
          .email-body {
            padding: 40px;
          }
          
          .email-footer {
            background-color: #f9fafb;
            padding: 24px 40px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
          }
          
          .logo-container {
            display: inline-flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
          }
          
          .logo-text {
            color: white;
            font-size: 24px;
            font-weight: 700;
            letter-spacing: -0.025em;
          }
          
          .email-title {
            color: white;
            font-size: 28px;
            font-weight: 700;
            margin: 0;
            letter-spacing: -0.025em;
          }
          
          .email-subtitle {
            color: rgba(255, 255, 255, 0.9);
            font-size: 16px;
            margin-top: 8px;
            font-weight: 400;
          }
          
          .content-section {
            margin-bottom: 32px;
          }
          
          .content-section:last-child {
            margin-bottom: 0;
          }
          
          h1, h2, h3 {
            color: #1f2937;
            font-weight: 600;
            margin-bottom: 16px;
            line-height: 1.3;
          }
          
          h1 { font-size: 24px; }
          h2 { font-size: 20px; }
          h3 { font-size: 18px; }
          
          p {
            color: #4b5563;
            margin-bottom: 16px;
            font-size: 16px;
            line-height: 1.6;
          }
          
          .btn {
            display: inline-block;
            padding: 16px 32px;
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 16px 0;
            transition: all 0.2s ease;
          }
          
          .btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);
          }
          
          .btn-secondary {
            background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          }
          
          .btn-ghost {
            background: transparent;
            color: #3b82f6;
            border: 2px solid #3b82f6;
          }
          
          .alert {
            padding: 16px;
            border-radius: 8px;
            margin: 16px 0;
            font-size: 14px;
          }
          
          .alert-info {
            background-color: #eff6ff;
            border-left: 4px solid #3b82f6;
            color: #1e40af;
          }
          
          .alert-success {
            background-color: #f0fdf4;
            border-left: 4px solid #22c55e;
            color: #15803d;
          }
          
          .alert-warning {
            background-color: #fffbeb;
            border-left: 4px solid #f59e0b;
            color: #92400e;
          }
          
          .alert-error {
            background-color: #fef2f2;
            border-left: 4px solid #ef4444;
            color: #b91c1c;
          }
          
          .divider {
            height: 1px;
            background-color: #e5e7eb;
            margin: 32px 0;
          }
          
          .footer-text {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 8px;
          }
          
          .footer-links {
            margin-top: 16px;
          }
          
          .footer-links a {
            color: #3b82f6;
            text-decoration: none;
            margin: 0 8px;
            font-size: 14px;
          }
          
          .footer-links a:hover {
            text-decoration: underline;
          }
          
          /* Dark mode support */
          @media (prefers-color-scheme: dark) {
            .email-container {
              background-color: #1f2937;
            }
            
            .email-body {
              background-color: #1f2937;
            }
            
            h1, h2, h3 {
              color: #f9fafb;
            }
            
            p {
              color: #d1d5db;
            }
            
            .email-footer {
              background-color: #111827;
              border-top: 1px solid #374151;
            }
            
            .footer-text {
              color: #9ca3af;
            }
          }
          
          /* Mobile responsiveness */
          @media screen and (max-width: 600px) {
            .email-container {
              margin: 0 16px;
              border-radius: 8px;
            }
            
            .email-header {
              padding: 24px 20px;
            }
            
            .email-body {
              padding: 24px 20px;
            }
            
            .email-footer {
              padding: 16px 20px;
            }
            
            .email-title {
              font-size: 24px;
            }
            
            .btn {
              display: block;
              width: 100%;
              text-align: center;
            }
          }
        `}</style>
      </head>
      <body>
        {/* Preheader text */}
        {preheader && (
          <div style={{
            display: 'none',
            fontSize: '1px',
            color: '#ffffff',
            lineHeight: '1px',
            maxHeight: '0px',
            maxWidth: '0px',
            opacity: 0,
            overflow: 'hidden'
          }}>
            {preheader}
          </div>
        )}
        
        <div className="email-container">
          {/* Header */}
          <div className="email-header">
            <div className="logo-container">
              <div dangerouslySetInnerHTML={{ __html: logoSvg }} />
              <span className="logo-text">Fixia</span>
            </div>
            <h1 className="email-title">{title}</h1>
            <p className="email-subtitle">Marketplace de Servicios Profesionales</p>
          </div>
          
          {/* Body */}
          <div className="email-body">
            {children}
          </div>
          
          {/* Footer */}
          <div className="email-footer">
            <p className="footer-text">{footerText}</p>
            <p className="footer-text">
              Marketplace de servicios profesionales en Argentina
            </p>
            <div className="footer-links">
              <a href="https://fixia.com.ar/legal/terms">Términos</a>
              <a href="https://fixia.com.ar/legal/privacy">Privacidad</a>
              <a href="https://fixia.com.ar/company/contact">Contacto</a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
};

// Specific email templates
export const WelcomeEmailTemplate: React.FC<{ userName: string; userType: 'customer' | 'provider' }> = ({
  userName,
  userType
}) => (
  <EmailTemplate 
    title="¡Bienvenido a Fixia!"
    preheader={`Hola ${userName}, tu cuenta ha sido creada exitosamente.`}
  >
    <div className="content-section">
      <h2>¡Hola {userName}! 👋</h2>
      <p>
        Nos complace darte la bienvenida a <strong>Fixia</strong>, el marketplace de servicios profesionales 
        más confiable de Argentina.
      </p>
      
      {userType === 'customer' ? (
        <>
          <p>
            Como <strong>Cliente</strong>, ahora puedes acceder a cientos de profesionales verificados 
            listos para ayudarte con cualquier servicio que necesites.
          </p>
          <a href="https://fixia.com.ar/explorador/dashboard" className="btn">
            Explorar Dashboard
          </a>
        </>
      ) : (
        <>
          <p>
            Como <strong>Profesional</strong>, ahora puedes conectar con clientes que buscan servicios 
            de calidad excepcional como los que tú ofreces.
          </p>
          <a href="https://fixia.com.ar/as/dashboard" className="btn">
            Acceder a Dashboard AS
          </a>
        </>
      )}
    </div>
    
    <div className="alert alert-info">
      <strong>Próximos pasos:</strong><br />
      • Completa tu perfil<br />
      • {userType === 'customer' ? 'Explora profesionales' : 'Configura tus servicios'}<br />
      • ¡Comienza a conectar!
    </div>
  </EmailTemplate>
);

export const PasswordResetEmailTemplate: React.FC<{ resetUrl: string; userName: string }> = ({
  resetUrl,
  userName
}) => (
  <EmailTemplate 
    title="Restablecer Contraseña"
    preheader="Solicitud de restablecimiento de contraseña para tu cuenta de Fixia"
  >
    <div className="content-section">
      <h2>Hola {userName},</h2>
      <p>
        Recibimos una solicitud para restablecer la contraseña de tu cuenta en Fixia.
      </p>
      <p>
        Si solicitaste este cambio, haz clic en el botón de abajo para crear una nueva contraseña:
      </p>
      <a href={resetUrl} className="btn">
        Restablecer Contraseña
      </a>
    </div>
    
    <div className="alert alert-warning">
      <strong>Importante:</strong> Este enlace expirará en 1 hora por seguridad.
    </div>
    
    <div className="content-section">
      <p>
        Si no solicitaste este cambio, puedes ignorar este correo de forma segura. 
        Tu contraseña actual seguirá siendo válida.
      </p>
    </div>
  </EmailTemplate>
);

export const ServiceRequestEmailTemplate: React.FC<{ 
  professionalName: string; 
  customerName: string; 
  serviceTitle: string;
  requestUrl: string;
}> = ({ professionalName, customerName, serviceTitle, requestUrl }) => (
  <EmailTemplate 
    title="Nueva Solicitud de Servicio"
    preheader={`${customerName} está interesado en tu servicio: ${serviceTitle}`}
  >
    <div className="content-section">
      <h2>¡Tienes una nueva solicitud! 🎉</h2>
      <p>
        Hola <strong>{professionalName}</strong>,
      </p>
      <p>
        <strong>{customerName}</strong> está interesado en tu servicio:
      </p>
      <div className="alert alert-info">
        <strong>{serviceTitle}</strong>
      </div>
    </div>
    
    <div className="content-section">
      <p>
        Esta es una gran oportunidad para conectar con un nuevo cliente. 
        Responde rápidamente para aumentar tus posibilidades de conseguir el trabajo.
      </p>
      <a href={requestUrl} className="btn">
        Ver Solicitud Completa
      </a>
    </div>
    
    <div className="alert alert-success">
      <strong>Consejo:</strong> Los profesionales que responden en las primeras 2 horas 
      tienen 5x más probabilidades de ser contratados.
    </div>
  </EmailTemplate>
);

export default EmailTemplate;