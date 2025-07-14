import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';

const PrivacyPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Política de Privacidad - Fixia</title>
        <meta name="description" content="Política de privacidad y protección de datos de Fixia" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              Política de Privacidad y Protección de Datos
            </h1>
            
            <div className="prose max-w-none">
              <p className="text-lg text-gray-700 mb-6">
                <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-AR')}
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introducción</h2>
                <p>
                  En Fixia.com.ar respetamos tu privacidad y nos comprometemos a proteger tus datos personales. 
                  Esta política explica cómo recopilamos, utilizamos, almacenamos y protegemos tu información 
                  en cumplimiento con la Ley 25.326 de Protección de Datos Personales de Argentina y el 
                  Reglamento General de Protección de Datos (GDPR).
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Responsable del Tratamiento</h2>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p><strong>Fixia.com.ar</strong></p>
                  <p>Email: privacy@fixia.com.ar</p>
                  <p>Dirección: [Dirección en Chubut, Argentina]</p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Datos que Recopilamos</h2>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">3.1. Datos de Registro</h3>
                <ul className="list-disc ml-6">
                  <li>Nombre y apellido</li>
                  <li>Fecha de nacimiento</li>
                  <li>Localidad y dirección</li>
                  <li>Teléfono y correo electrónico</li>
                  <li>Documento Nacional de Identidad (DNI) y número de trámite</li>
                  <li>Fotografía de perfil</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">3.2. Datos Profesionales (Solo AS)</h3>
                <ul className="list-disc ml-6">
                  <li>Profesión y especialización</li>
                  <li>Número de matrícula profesional</li>
                  <li>Años de experiencia</li>
                  <li>Portafolio de trabajos</li>
                  <li>Referencias personales</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">3.3. Datos de Verificación</h3>
                <ul className="list-disc ml-6">
                  <li>Fotografías del DNI (frente y dorso)</li>
                  <li>Selfie sosteniendo el DNI</li>
                  <li>Documentos de habilitación profesional</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">3.4. Datos de Uso</h3>
                <ul className="list-disc ml-6">
                  <li>Historial de búsquedas</li>
                  <li>Servicios contratados o prestados</li>
                  <li>Mensajes y comunicaciones</li>
                  <li>Calificaciones y reseñas</li>
                  <li>Geolocalización (con tu consentimiento)</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Finalidades del Tratamiento</h2>
                <h3 className="text-xl font-semibold mt-6 mb-3">4.1. Finalidades Principales</h3>
                <ul className="list-disc ml-6">
                  <li>Facilitar la conexión entre profesionales y clientes</li>
                  <li>Verificar la identidad de los usuarios</li>
                  <li>Gestionar perfiles y servicios</li>
                  <li>Procesar reservas y pagos</li>
                  <li>Proporcionar soporte al cliente</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">4.2. Finalidades Secundarias</h3>
                <ul className="list-disc ml-6">
                  <li>Mejorar nuestros servicios</li>
                  <li>Prevenir fraudes y actividades ilícitas</li>
                  <li>Cumplir con obligaciones legales</li>
                  <li>Enviar comunicaciones de marketing (con tu consentimiento)</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Seguridad Digital y Protección</h2>
                
                <div className="bg-green-50 p-4 rounded-lg mb-4">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">Medidas de Seguridad Implementadas</h3>
                </div>

                <h3 className="text-xl font-semibold mt-6 mb-3">5.1. Seguridad Técnica</h3>
                <ul className="list-disc ml-6">
                  <li><strong>Encriptación:</strong> Todos los datos se transmiten usando HTTPS/TLS</li>
                  <li><strong>Cifrado de base de datos:</strong> Información sensible encriptada en reposo</li>
                  <li><strong>Autenticación:</strong> Sistema de tokens JWT seguros</li>
                  <li><strong>Firewall:</strong> Protección contra accesos no autorizados</li>
                  <li><strong>Monitoreo:</strong> Supervisión 24/7 de actividades sospechosas</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">5.2. Seguridad Organizacional</h3>
                <ul className="list-disc ml-6">
                  <li>Acceso limitado por roles y necesidad</li>
                  <li>Auditorías regulares de seguridad</li>
                  <li>Capacitación en protección de datos</li>
                  <li>Protocolos de respuesta a incidentes</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">5.3. Almacenamiento Seguro</h3>
                <ul className="list-disc ml-6">
                  <li>Servidores en centros de datos certificados</li>
                  <li>Respaldos automáticos encriptados</li>
                  <li>Redundancia geográfica</li>
                  <li>Eliminación segura de datos</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Seguridad de Pagos con MercadoPago</h2>
                
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">Protección en Transacciones</h3>
                  <p className="text-blue-700">
                    Fixia.com.ar utiliza MercadoPago como procesador de pagos, garantizando 
                    los más altos estándares de seguridad financiera.
                  </p>
                </div>

                <h3 className="text-xl font-semibold mt-6 mb-3">6.1. Características de Seguridad</h3>
                <ul className="list-disc ml-6">
                  <li><strong>PCI DSS Compliance:</strong> Cumplimiento con estándares internacionales</li>
                  <li><strong>Tokenización:</strong> Los datos de tarjetas no se almacenan en nuestros servidores</li>
                  <li><strong>3D Secure:</strong> Autenticación adicional para mayor seguridad</li>
                  <li><strong>Monitoreo anti-fraude:</strong> Detección automática de transacciones sospechosas</li>
                  <li><strong>Certificación SSL:</strong> Comunicación segura en todos los pagos</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">6.2. Información que NO Almacenamos</h3>
                <ul className="list-disc ml-6">
                  <li>Números de tarjetas de crédito/débito completos</li>
                  <li>Códigos de seguridad (CVV)</li>
                  <li>Datos bancarios completos</li>
                  <li>PINs o contraseñas bancarias</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Compartir Información</h2>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">7.1. Con Otros Usuarios</h3>
                <p>Compartimos información limitada para facilitar las conexiones:</p>
                <ul className="list-disc ml-6 mt-2">
                  <li>Nombre y foto de perfil</li>
                  <li>Información profesional básica</li>
                  <li>Calificaciones y reseñas</li>
                  <li>Ubicación aproximada (si está habilitada)</li>
                </ul>

                <div className="bg-yellow-50 p-4 rounded-lg mt-4">
                  <p className="text-yellow-800">
                    <strong>Control de Privacidad:</strong> Puedes configurar qué información 
                    quieres compartir, especialmente tu número de teléfono.
                  </p>
                </div>

                <h3 className="text-xl font-semibold mt-6 mb-3">7.2. Con Terceros</h3>
                <ul className="list-disc ml-6">
                  <li><strong>Proveedores de servicios:</strong> Hosting, análisis, soporte</li>
                  <li><strong>Procesadores de pago:</strong> MercadoPago para transacciones</li>
                  <li><strong>Autoridades:</strong> Solo cuando sea legalmente requerido</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Tus Derechos</h2>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">8.1. Derechos Fundamentales</h3>
                <ul className="list-disc ml-6">
                  <li><strong>Acceso:</strong> Solicitar copia de tus datos</li>
                  <li><strong>Rectificación:</strong> Corregir datos inexactos</li>
                  <li><strong>Eliminación:</strong> Solicitar borrado de tus datos</li>
                  <li><strong>Portabilidad:</strong> Recibir tus datos en formato portable</li>
                  <li><strong>Oposición:</strong> Oponerte a ciertos tratamientos</li>
                  <li><strong>Limitación:</strong> Restringir el procesamiento</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">8.2. Cómo Ejercer tus Derechos</h3>
                <p>Para ejercer cualquier derecho, contáctanos a:</p>
                <ul className="list-disc ml-6 mt-2">
                  <li>Email: privacy@fixia.com.ar</li>
                  <li>Desde tu perfil en la aplicación</li>
                  <li>Teléfono: [Número de contacto]</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Retención de Datos</h2>
                <ul className="list-disc ml-6">
                  <li><strong>Datos de cuenta:</strong> Mientras mantengas tu cuenta activa</li>
                  <li><strong>Datos de transacciones:</strong> 10 años (requisitos legales)</li>
                  <li><strong>Datos de verificación:</strong> 5 años tras la eliminación de cuenta</li>
                  <li><strong>Comunicaciones:</strong> 2 años para soporte y mejoras</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Transferencias Internacionales</h2>
                <p>
                  Algunos de nuestros proveedores pueden estar ubicados fuera de Argentina. 
                  En estos casos, garantizamos protecciones adecuadas mediante:
                </p>
                <ul className="list-disc ml-6 mt-2">
                  <li>Contratos de transferencia estándar</li>
                  <li>Certificaciones de adequacy</li>
                  <li>Salvaguardas adicionales de seguridad</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Menores de Edad</h2>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-red-800">
                    <strong>Importante:</strong> Fixia.com.ar está destinado a usuarios mayores de 18 años. 
                    No recopilamos intencionalmente datos de menores de edad.
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Cookies y Tecnologías Similares</h2>
                <p>Utilizamos cookies para:</p>
                <ul className="list-disc ml-6 mt-2">
                  <li>Mantener tu sesión activa</li>
                  <li>Recordar tus preferencias</li>
                  <li>Analizar el uso de la plataforma</li>
                  <li>Mejorar la experiencia del usuario</li>
                </ul>
                <p className="mt-4">
                  Puedes configurar tu navegador para rechazar cookies, aunque esto puede 
                  afectar la funcionalidad de la plataforma.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Cambios en esta Política</h2>
                <p>
                  Podemos actualizar esta política ocasionalmente. Te notificaremos cambios 
                  significativos por email o mediante notificaciones en la plataforma.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Contacto</h2>
                <p>Para consultas sobre privacidad o protección de datos:</p>
                <div className="bg-gray-50 p-4 rounded-lg mt-4">
                  <p><strong>Email:</strong> privacy@fixia.com.ar</p>
                  <p><strong>Teléfono:</strong> [Número de contacto]</p>
                  <p><strong>Dirección:</strong> [Dirección postal en Chubut]</p>
                </div>
              </section>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Esta política de privacidad es efectiva desde la fecha indicada arriba.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPage;