import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';

const SecurityPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Seguridad y Protección - Fixia</title>
        <meta name="description" content="Conoce las medidas de seguridad digital, protección de datos y pagos seguros en Fixia" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <span className="text-4xl">🛡️</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Seguridad y Protección de Datos
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tu seguridad es nuestra prioridad. Conoce todas las medidas que implementamos 
              para proteger tu información y garantizar transacciones seguras.
            </p>
          </div>

          {/* Security Overview */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Encriptación Total</h3>
              <p className="text-gray-600">Todos los datos se transmiten con encriptación SSL/TLS de grado militar</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Verificación de Identidad</h3>
              <p className="text-gray-600">Sistema robusto de verificación con DNI y selfie para mayor confianza</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">💳</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Pagos Seguros</h3>
              <p className="text-gray-600">Integración con MercadoPago para transacciones 100% seguras</p>
            </div>
          </div>

          {/* Digital Security */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Seguridad Digital</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">🔐 Protección de Datos</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-green-100 rounded-full w-8 h-8 flex items-center justify-center mr-3 mt-1">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Encriptación AES-256</h4>
                      <p className="text-gray-600 text-sm">Todos los datos sensibles se almacenan con encriptación de grado militar</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-green-100 rounded-full w-8 h-8 flex items-center justify-center mr-3 mt-1">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">HTTPS/TLS 1.3</h4>
                      <p className="text-gray-600 text-sm">Comunicación segura en toda la plataforma con el protocolo más avanzado</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-green-100 rounded-full w-8 h-8 flex items-center justify-center mr-3 mt-1">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Tokens JWT Seguros</h4>
                      <p className="text-gray-600 text-sm">Autenticación basada en tokens con expiración automática</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-green-100 rounded-full w-8 h-8 flex items-center justify-center mr-3 mt-1">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Respaldos Automáticos</h4>
                      <p className="text-gray-600 text-sm">Copias de seguridad diarias con redundancia geográfica</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">🛡️ Protección Perimetral</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mr-3 mt-1">
                      <span className="text-blue-600 text-sm">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Firewall Avanzado</h4>
                      <p className="text-gray-600 text-sm">Protección contra ataques DDoS y accesos no autorizados</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mr-3 mt-1">
                      <span className="text-blue-600 text-sm">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Monitoreo 24/7</h4>
                      <p className="text-gray-600 text-sm">Supervisión continua de la infraestructura y detección de amenazas</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mr-3 mt-1">
                      <span className="text-blue-600 text-sm">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Rate Limiting</h4>
                      <p className="text-gray-600 text-sm">Protección contra ataques de fuerza bruta y spam</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mr-3 mt-1">
                      <span className="text-blue-600 text-sm">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Auditorías de Seguridad</h4>
                      <p className="text-gray-600 text-sm">Evaluaciones regulares por expertos en ciberseguridad</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MercadoPago Security */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white mb-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Seguridad de Pagos con MercadoPago</h2>
                <p className="text-blue-100 mb-6">
                  Utilizamos MercadoPago, una de las plataformas de pago más seguras de América Latina, 
                  para garantizar que todas tus transacciones sean 100% seguras.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="text-yellow-300 mr-3">🏆</span>
                    <span>Certificación PCI DSS Level 1</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-yellow-300 mr-3">🔒</span>
                    <span>Encriptación SSL de 256 bits</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-yellow-300 mr-3">🛡️</span>
                    <span>Protección anti-fraude avanzada</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-yellow-300 mr-3">✅</span>
                    <span>Cumplimiento con normativas internacionales</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Lo que NO almacenamos:</h3>
                <ul className="space-y-2 text-blue-100">
                  <li>❌ Números de tarjeta completos</li>
                  <li>❌ Códigos CVV/CVC</li>
                  <li>❌ Datos bancarios sensibles</li>
                  <li>❌ PINs o contraseñas bancarias</li>
                </ul>
                <p className="text-sm text-blue-200 mt-4">
                  Toda la información sensible de pagos se procesa directamente 
                  en los servidores seguros de MercadoPago.
                </p>
              </div>
            </div>
          </div>

          {/* Identity Verification */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Sistema de Verificación de Identidad</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-orange-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-3xl">📄</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Verificación de DNI</h3>
                <p className="text-gray-600">
                  Los profesionales deben subir fotos del DNI (frente y dorso) 
                  para verificar su identidad real.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-green-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-3xl">🤳</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Selfie con DNI</h3>
                <p className="text-gray-600">
                  Selfie sosteniendo el DNI para confirmar que la persona 
                  corresponde al documento presentado.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-3xl">✅</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Revisión Manual</h3>
                <p className="text-gray-600">
                  Nuestro equipo revisa manualmente cada solicitud 
                  de verificación para garantizar autenticidad.
                </p>
              </div>
            </div>

            <div className="mt-8 bg-green-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-green-800 mb-2">Beneficios de la Verificación</h4>
              <div className="grid md:grid-cols-2 gap-4 text-green-700">
                <div>
                  <p>• Mayor confianza de los clientes</p>
                  <p>• Badge de verificación visible</p>
                  <p>• Mayor ranking en búsquedas</p>
                </div>
                <div>
                  <p>• Acceso a funciones premium</p>
                  <p>• Protección contra perfiles falsos</p>
                  <p>• Respaldo legal en disputas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Protection */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Protección de Privacidad</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">🔒 Control de Datos Personales</h3>
                <div className="space-y-4">
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <h4 className="font-semibold text-yellow-800">Advertencia Especial para AS</h4>
                    <p className="text-yellow-700 text-sm mt-1">
                      Los profesionales deben ser especialmente cuidadosos con sus datos, 
                      especialmente su número de teléfono. Puedes configurar si quieres 
                      mostrarlo en tu perfil público o no.
                    </p>
                  </div>

                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <span className="text-green-600 mr-2">✓</span>
                      <span>Control total sobre la visibilidad de tu teléfono</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-600 mr-2">✓</span>
                      <span>Configuración granular de privacidad</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-600 mr-2">✓</span>
                      <span>Opciones de comunicación anónima</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-600 mr-2">✓</span>
                      <span>Eliminación de datos garantizada</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">🛡️ Tus Derechos GDPR</h3>
                <div className="space-y-3">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold">Derecho de Acceso</h4>
                    <p className="text-gray-600 text-sm">Solicita una copia de todos tus datos</p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold">Derecho de Rectificación</h4>
                    <p className="text-gray-600 text-sm">Corrige información incorrecta</p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold">Derecho al Olvido</h4>
                    <p className="text-gray-600 text-sm">Solicita la eliminación de tus datos</p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold">Derecho de Portabilidad</h4>
                    <p className="text-gray-600 text-sm">Recibe tus datos en formato portable</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Incident Response */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-red-800 mb-6">🚨 Respuesta a Incidentes de Seguridad</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-red-800 mb-3">¿Qué hacer si sospechas un problema?</h3>
                <ul className="space-y-2 text-red-700">
                  <li>• Cambia tu contraseña inmediatamente</li>
                  <li>• Revisa tu actividad reciente en la cuenta</li>
                  <li>• Contacta a nuestro equipo de seguridad</li>
                  <li>• Documenta cualquier actividad sospechosa</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-red-800 mb-3">Contacto de Emergencia</h3>
                <div className="bg-red-100 rounded-lg p-4">
                  <p className="text-red-800 font-semibold">📧 security@fixia.com.ar</p>
                  <p className="text-red-700 text-sm mt-1">Respuesta garantizada en menos de 2 horas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Certificaciones y Cumplimiento</h2>
            
            <div className="grid md:grid-cols-4 gap-6 text-center">
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="text-4xl mb-3">🏆</div>
                <h3 className="font-semibold mb-2">ISO 27001</h3>
                <p className="text-sm text-gray-600">Gestión de Seguridad de la Información</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <div className="text-4xl mb-3">🛡️</div>
                <h3 className="font-semibold mb-2">GDPR</h3>
                <p className="text-sm text-gray-600">Cumplimiento Europeo de Protección de Datos</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <div className="text-4xl mb-3">⚖️</div>
                <h3 className="font-semibold mb-2">Ley 25.326</h3>
                <p className="text-sm text-gray-600">Protección de Datos Personales Argentina</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <div className="text-4xl mb-3">💳</div>
                <h3 className="font-semibold mb-2">PCI DSS</h3>
                <p className="text-sm text-gray-600">Estándar de Seguridad de Pagos</p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Nuestro compromiso con la seguridad está respaldado por certificaciones internacionales 
                y auditorías regulares por terceros independientes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SecurityPage;