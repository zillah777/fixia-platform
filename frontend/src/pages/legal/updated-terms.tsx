import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';

const UpdatedTermsPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Términos y Condiciones - Fixia</title>
        <meta name="description" content="Términos y condiciones de uso de la plataforma Fixia - Anunciante automatizado" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              Términos y Condiciones de Uso
            </h1>
            
            <div className="prose max-w-none">
              <p className="text-lg text-gray-700 mb-6">
                <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-AR')}
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Naturaleza del Servicio</h2>
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <p className="font-semibold text-blue-800">
                    FIXIA.COM.AR es un ANUNCIANTE AUTOMATIZADO con features modernos que funciona como:
                  </p>
                  <ul className="mt-2 text-blue-700">
                    <li>• <strong>Matchmaking inteligente</strong> entre AS (oferentes) y Exploradores (demandantes)</li>
                    <li>• <strong>Sistema de búsqueda avanzada</strong> con filtros como "busco niñera para hoy a las 10:00 pm"</li>
                    <li>• <strong>Notificaciones automáticas urgentes</strong> para AS disponibles</li>
                    <li>• <strong>Plataforma de conexión</strong> que anuncia gente que quiere prestar servicios</li>
                    <li>• <strong>Puente tecnológico</strong> que acerca a proveedores de micro servicios con quienes los necesitan</li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Suscripciones y Promociones</h2>
                
                <div className="bg-green-50 p-4 rounded-lg mb-4">
                  <h3 className="font-semibold text-green-800 mb-2">🎉 Promoción de Lanzamiento</h3>
                  <p className="text-green-700">
                    <strong>Los primeros 200 AS y 200 Exploradores</strong> tendrán acceso <strong>GRATUITO por 2 meses</strong> 
                    a todas las funcionalidades premium de la plataforma.
                  </p>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg mb-4">
                  <h3 className="font-semibold text-amber-800 mb-2">💳 Sistema de Suscripciones</h3>
                  <ul className="text-amber-700 space-y-1">
                    <li>• <strong>SOLO facturación mensual</strong> para anunciantes de servicios (AS)</li>
                    <li>• <strong>Plan Gratuito:</strong> Funcionalidades básicas limitadas</li>
                    <li>• <strong>Plan Mensual:</strong> Acceso completo a todas las funcionalidades</li>
                    <li>• <strong>Exploradores:</strong> Uso gratuito de la plataforma</li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. 🚨 EXENCIÓN TOTAL DE RESPONSABILIDAD</h2>
                
                <div className="bg-red-50 border-l-4 border-red-400 p-6 mb-4">
                  <h3 className="font-semibold text-red-800 mb-3 text-xl">⚠️ DISCLAMER FUNDAMENTAL</h3>
                  <p className="text-red-700 font-bold mb-3 text-lg">
                    FIXIA.COM.AR NO SE HACE RESPONSABLE POR:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-red-800 mb-2">Incumplimientos y Calidad:</h4>
                      <ul className="text-red-700 text-sm space-y-1">
                        <li>❌ Incumplimientos de cualquier tipo</li>
                        <li>❌ Calidad de servicios prestados</li>
                        <li>❌ Impuntualidad o retrasos</li>
                        <li>❌ Cobros adicionales no acordados</li>
                        <li>❌ Falta de profesionalismo</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-800 mb-2">Delitos y Daños:</h4>
                      <ul className="text-red-700 text-sm space-y-1">
                        <li>❌ Robos, estafas, fraudes</li>
                        <li>❌ Pérdidas, faltantes, daños</li>
                        <li>❌ Actividades delictuales</li>
                        <li>❌ Violaciones al código civil/penal</li>
                        <li>❌ Cualquier actividad ilícita</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 p-4 mb-4">
                  <h3 className="font-semibold text-yellow-800 mb-2">📢 Nuestra Función Exclusiva</h3>
                  <p className="text-yellow-700">
                    Fixia.com.ar <strong>únicamente anuncia</strong> personas que desean prestar servicios y 
                    las conecta con personas que necesitan esos servicios. <strong>Somos un intermediario tecnológico</strong> 
                    que facilita el encuentro entre oferta y demanda.
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Responsabilidades de los Usuarios</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-3">👨‍💼 AS (Anunciantes de Servicios)</h3>
                    <ul className="text-blue-700 text-sm space-y-1">
                      <li>• Prestar servicios con profesionalismo</li>
                      <li>• Cumplir con acuerdos pactados</li>
                      <li>• Mantener información veraz y actualizada</li>
                      <li>• Responder a solicitudes de manera oportuna</li>
                      <li>• Cumplir con todas las leyes aplicables</li>
                    </ul>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-purple-800 mb-3">🔍 Exploradores (Clientes)</h3>
                    <ul className="text-purple-700 text-sm space-y-1">
                      <li>• Proporcionar información clara sobre sus necesidades</li>
                      <li>• Respetar los acuerdos establecidos</li>
                      <li>• Realizar pagos según lo acordado</li>
                      <li>• Comportarse de manera respetuosa</li>
                      <li>• Evaluar honestamente los servicios recibidos</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Funcionalidades de la Plataforma</h2>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h3 className="font-semibold text-gray-800 mb-3">🤖 Búsqueda Inteligente y Matchmaking</h3>
                  <ul className="text-gray-700 space-y-2">
                    <li>• <strong>Filtros avanzados:</strong> Búsquedas específicas como "busco niñera para hoy a las 10:00 pm"</li>
                    <li>• <strong>Notificaciones automáticas:</strong> Los AS disponibles reciben alertas inmediatas</li>
                    <li>• <strong>Geolocalización:</strong> Conexión con profesionales cercanos</li>
                    <li>• <strong>Sistema de disponibilidad:</strong> Estados "disponible", "ocupado", "desconectado"</li>
                    <li>• <strong>Urgencia inteligente:</strong> Priorización automática según la urgencia del servicio</li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Limitaciones Legales</h2>
                
                <div className="bg-red-100 border-2 border-red-300 p-6 rounded-lg">
                  <h3 className="font-bold text-red-900 mb-4 text-xl">⚖️ CLÁUSULA DE EXONERACIÓN LEGAL</h3>
                  
                  <div className="space-y-4 text-red-800">
                    <p className="font-semibold">
                      Al utilizar FIXIA.COM.AR, los usuarios reconocen y aceptan que:
                    </p>
                    
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>FIXIA.COM.AR actúa únicamente como plataforma de conexión e intermediación</li>
                      <li>Los acuerdos, contratos y negociaciones se realizan directamente entre AS y Exploradores</li>
                      <li>FIXIA.COM.AR no participa en la prestación efectiva de servicios</li>
                      <li>Los usuarios son responsables de verificar credenciales, referencias y antecedentes</li>
                      <li>Cualquier disputa debe resolverse directamente entre las partes involucradas</li>
                      <li>FIXIA.COM.AR no puede garantizar la idoneidad, honestidad o competencia de los usuarios</li>
                    </ol>
                    
                    <p className="font-bold mt-4 p-3 bg-red-200 rounded">
                      🚫 FIXIA.COM.AR QUEDA EXENTA DE TODA RESPONSABILIDAD CIVIL, CONTRACTUAL, EXTRACONTRACTUAL Y PENAL 
                      derivada de las relaciones entre usuarios.
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Uso Responsable</h2>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-3">💡 Recomendaciones de Seguridad</h3>
                  <ul className="text-green-700 space-y-1 text-sm">
                    <li>• Solicita referencias y verifica antecedentes</li>
                    <li>• Establece acuerdos claros por escrito</li>
                    <li>• Utiliza métodos de pago seguros y trazables</li>
                    <li>• Conserva evidencia de todas las comunicaciones</li>
                    <li>• Reporta comportamientos sospechosos a través de la plataforma</li>
                    <li>• Confía en tu instinto - si algo no se siente bien, no procedas</li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Contacto y Soporte</h2>
                <p>
                  Para consultas, soporte técnico o reportes relacionados con la plataforma:
                </p>
                <ul className="mt-2">
                  <li>📧 Email: soporte@fixia.com.ar</li>
                  <li>🌐 Web: www.fixia.com.ar</li>
                  <li>📱 Teléfono: +54 9 280 XXX-XXXX</li>
                </ul>
              </section>

              <div className="border-t pt-6 mt-8">
                <p className="text-sm text-gray-600">
                  Al utilizar FIXIA.COM.AR, confirmas que has leído, entendido y aceptado estos términos y condiciones en su totalidad.
                  El uso continuado de la plataforma constituye la aceptación de futuras modificaciones a estos términos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UpdatedTermsPage;