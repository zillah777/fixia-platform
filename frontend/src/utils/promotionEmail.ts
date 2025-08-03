import { PromotionWelcomeEmail } from '@/components/email-templates/PromotionWelcomeEmail';
import { renderToString } from 'react-dom/server';
import React from 'react';

interface SendPromotionWelcomeEmailParams {
  firstName: string;
  lastName: string;
  email: string;
  userType: 'provider' | 'customer';
  promotionEndDate: Date;
}

export async function sendPromotionWelcomeEmail({
  firstName,
  lastName,
  email,
  userType,
  promotionEndDate
}: SendPromotionWelcomeEmailParams) {
  try {
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://fixia.com.ar'}/auth/login`;
    const formattedEndDate = promotionEndDate.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Generate the email HTML
    const emailHtml = renderToString(
      React.createElement(PromotionWelcomeEmail, {
        firstName,
        lastName,
        userType,
        promotionEndDate: formattedEndDate,
        loginUrl
      })
    );

    // In a real application, you would send this through your email service
    // For now, we'll log it or use a mock email service
    const emailData = {
      to: email,
      subject: userType === 'provider' 
        ? '🎉 ¡Bienvenido a Fixia! Tu promoción AS Profesional está activa'
        : '🎉 ¡Bienvenido a Fixia! Tu promoción Explorador está activa',
      html: emailHtml,
      text: generateTextVersion(firstName, lastName, userType, formattedEndDate, loginUrl)
    };

    // TODO: Replace with actual email service (SendGrid, Mailgun, etc.)
    console.log('🎯 PROMOTION EMAIL TO SEND:', emailData);
    
    // Mock successful email send
    return {
      success: true,
      messageId: `promo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Error sending promotion welcome email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

function generateTextVersion(
  firstName: string,
  lastName: string,
  userType: 'provider' | 'customer',
  promotionEndDate: string,
  loginUrl: string
): string {
  const fullName = `${firstName} ${lastName}`;
  const userTypeLabel = userType === 'provider' ? 'AS Profesional' : 'Explorador';
  
  return `
¡Bienvenido a Fixia, ${fullName}!

🎉 ¡PROMOCIÓN ACTIVADA!
Plan Profesional GRATIS por 2 meses
Valor: $8,000 ARS • Válido hasta ${promotionEndDate}

Felicitaciones! Te has registrado exitosamente como ${userTypeLabel} en Fixia y formas parte de nuestras primeras 200 cuentas con promoción especial.

✨ BENEFICIOS DE TU PROMOCIÓN:
• 🚀 Servicios ilimitados durante 2 meses
• ⭐ Badge de profesional verificado
• 🔝 Prioridad en resultados de búsqueda
• 💰 Comisión reducida del 5% (vs 8% plan básico)
• 📊 Estadísticas detalladas y análisis
• 🏆 Soporte prioritario 24/7

⚡ ACTIVACIÓN AUTOMÁTICA
Tu promoción se ha aplicado automáticamente. No necesitas hacer nada más. 
Disfruta de todos los beneficios Premium desde ahora hasta el ${promotionEndDate}.

🚀 ACCEDER A TU CUENTA: ${loginUrl}

PRÓXIMOS PASOS:
${userType === 'provider' 
  ? `1. Complete tu perfil profesional
2. Crea tu primer servicio
3. Sube ejemplos de tu trabajo al portafolio
4. Comienza a recibir oportunidades`
  : `1. Explora profesionales en tu área
2. Publica tu primera solicitud de servicio
3. Conecta con profesionales verificados
4. Disfruta de soporte prioritario`
}

¿Tienes preguntas? Nuestro equipo está aquí para ayudarte.
📧 soporte@fixia.com.ar
📱 WhatsApp: +54 9 280 412-3456

© 2025 Fixia • Hecho con ❤️ para la comunidad de Chubut
  `.trim();
}

// Utility function to check if user is eligible for promotion email
export function shouldSendPromotionEmail(
  isNewRegistration: boolean,
  hasPromoCode: boolean,
  userType: 'provider' | 'customer'
): boolean {
  return isNewRegistration && hasPromoCode;
}

// Utility function to schedule promotion reminder emails
export async function schedulePromotionReminders(
  email: string,
  firstName: string,
  promotionEndDate: Date
) {
  const reminderDates = [
    new Date(promotionEndDate.getTime() - (7 * 24 * 60 * 60 * 1000)), // 7 days before
    new Date(promotionEndDate.getTime() - (3 * 24 * 60 * 60 * 1000)), // 3 days before
    new Date(promotionEndDate.getTime() - (1 * 24 * 60 * 60 * 1000))  // 1 day before
  ];

  console.log(`📅 Scheduled promotion reminders for ${email}:`, reminderDates);
  
  // TODO: Implement actual email scheduling system
  return {
    success: true,
    reminderCount: reminderDates.length,
    reminderDates
  };
}

export default {
  sendPromotionWelcomeEmail,
  shouldSendPromotionEmail,
  schedulePromotionReminders
};