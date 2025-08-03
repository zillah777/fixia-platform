import React from 'react';

interface PromotionWelcomeEmailProps {
  firstName: string;
  lastName: string;
  userType: 'provider' | 'customer';
  promotionEndDate: string;
  loginUrl: string;
}

export function PromotionWelcomeEmail({
  firstName,
  lastName,
  userType,
  promotionEndDate,
  loginUrl
}: PromotionWelcomeEmailProps) {
  const fullName = `${firstName} ${lastName}`;
  const userTypeLabel = userType === 'provider' ? 'AS Profesional' : 'Explorador';
  
  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      lineHeight: '1.6',
      color: '#333333',
      backgroundColor: '#f8fafc',
      margin: 0,
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Header with Fixia branding */}
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)',
          padding: '40px 40px 20px',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'inline-block',
            width: '60px',
            height: '60px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            marginBottom: '20px',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: 'bold',
              color: 'white'
            }}>
              F
            </div>
          </div>
          <h1 style={{
            color: 'white',
            fontSize: '28px',
            fontWeight: 'bold',
            margin: '0 0 8px 0'
          }}>
            ¡Bienvenido a Fixia!
          </h1>
          <p style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '16px',
            margin: '0'
          }}>
            Conecta. Confía. Resuelve.
          </p>
        </div>

        {/* Promotion Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
          padding: '20px',
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{
            fontSize: '18px',
            fontWeight: 'bold',
            marginBottom: '8px'
          }}>
            🎉 ¡Promoción Activada!
          </div>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '8px'
          }}>
            Plan Profesional GRATIS por 2 meses
          </div>
          <div style={{
            fontSize: '14px',
            opacity: '0.9'
          }}>
            Valor: $8,000 ARS • Válido hasta {promotionEndDate}
          </div>
        </div>

        {/* Main content */}
        <div style={{ padding: '40px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '20px'
          }}>
            Hola {fullName},
          </h2>

          <p style={{
            fontSize: '16px',
            color: '#4b5563',
            marginBottom: '20px'
          }}>
            ¡Felicitaciones! Te has registrado exitosamente como <strong>{userTypeLabel}</strong> en Fixia 
            y formas parte de nuestras primeras 200 cuentas con promoción especial.
          </p>

          <div style={{
            background: '#f0f9ff',
            border: '1px solid #e0f2fe',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#0369a1',
              marginBottom: '16px',
              marginTop: '0'
            }}>
              ✨ Beneficios de tu promoción:
            </h3>
            <ul style={{
              color: '#0c4a6e',
              paddingLeft: '20px',
              margin: '0'
            }}>
              <li style={{ marginBottom: '8px' }}>🚀 <strong>Servicios ilimitados</strong> durante 2 meses</li>
              <li style={{ marginBottom: '8px' }}>⭐ <strong>Badge de profesional verificado</strong></li>
              <li style={{ marginBottom: '8px' }}>🔝 <strong>Prioridad en resultados de búsqueda</strong></li>
              <li style={{ marginBottom: '8px' }}>💰 <strong>Comisión reducida del 5%</strong> (vs 8% plan básico)</li>
              <li style={{ marginBottom: '8px' }}>📊 <strong>Estadísticas detalladas y análisis</strong></li>
              <li style={{ marginBottom: '8px' }}>🏆 <strong>Soporte prioritario 24/7</strong></li>
            </ul>
          </div>

          <div style={{
            background: '#fef3c7',
            border: '1px solid #fde68a',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <span style={{
                fontSize: '20px',
                marginRight: '8px'
              }}>⚡</span>
              <strong style={{
                color: '#92400e',
                fontSize: '16px'
              }}>
                Activación Automática
              </strong>
            </div>
            <p style={{
              color: '#92400e',
              margin: '0',
              fontSize: '14px'
            }}>
              Tu promoción se ha aplicado automáticamente. No necesitas hacer nada más. 
              Disfruta de todos los beneficios Premium desde ahora hasta el {promotionEndDate}.
            </p>
          </div>

          <div style={{
            textAlign: 'center',
            marginBottom: '32px'
          }}>
            <a href={loginUrl} style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              color: 'white',
              textDecoration: 'none',
              padding: '16px 32px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 'bold',
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)'
            }}>
              🚀 Acceder a Mi Cuenta
            </a>
          </div>

          <div style={{
            borderTop: '1px solid #e5e7eb',
            paddingTop: '24px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '16px',
              marginTop: '0'
            }}>
              Próximos pasos:
            </h3>
            
            {userType === 'provider' ? (
              <ol style={{
                color: '#4b5563',
                paddingLeft: '20px',
                margin: '0'
              }}>
                <li style={{ marginBottom: '8px' }}>Complete tu perfil profesional</li>
                <li style={{ marginBottom: '8px' }}>Crea tu primer servicio</li>
                <li style={{ marginBottom: '8px' }}>Sube ejemplos de tu trabajo al portafolio</li>
                <li style={{ marginBottom: '8px' }}>Comienza a recibir oportunidades</li>
              </ol>
            ) : (
              <ol style={{
                color: '#4b5563',
                paddingLeft: '20px',
                margin: '0'
              }}>
                <li style={{ marginBottom: '8px' }}>Explora profesionales en tu área</li>
                <li style={{ marginBottom: '8px' }}>Publica tu primera solicitud de servicio</li>
                <li style={{ marginBottom: '8px' }}>Conecta con profesionales verificados</li>
                <li style={{ marginBottom: '8px' }}>Disfruta de soporte prioritario</li>
              </ol>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          background: '#f9fafb',
          padding: '32px',
          textAlign: 'center',
          borderTop: '1px solid #e5e7eb'
        }}>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: '0 0 16px 0'
          }}>
            ¿Tienes preguntas? Nuestro equipo está aquí para ayudarte.
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '24px',
            flexWrap: 'wrap',
            marginBottom: '20px'
          }}>
            <a href="mailto:soporte@fixia.com.ar" style={{
              color: '#3b82f6',
              textDecoration: 'none',
              fontSize: '14px'
            }}>
              📧 soporte@fixia.com.ar
            </a>
            <a href="https://wa.me/+5492804123456" style={{
              color: '#3b82f6',
              textDecoration: 'none',
              fontSize: '14px'
            }}>
              📱 WhatsApp
            </a>
          </div>
          <p style={{
            fontSize: '12px',
            color: '#9ca3af',
            margin: '0'
          }}>
            © 2025 Fixia • Hecho con ❤️ para la comunidad de Chubut
          </p>
        </div>
      </div>

      {/* Mobile responsive styles */}
      <style>{`
        @media only screen and (max-width: 600px) {
          .email-container {
            margin: 0 !important;
            border-radius: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}

export default PromotionWelcomeEmail;