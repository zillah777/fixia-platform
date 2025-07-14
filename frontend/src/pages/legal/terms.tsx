import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';

const TermsPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Términos y Condiciones - Fixia</title>
        <meta name="description" content="Términos y condiciones de uso de la plataforma Fixia" />
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
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Definiciones y Naturaleza del Servicio</h2>
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <p className="font-semibold text-blue-800">
                    FIXIA.COM.AR es una plataforma digital de intermediación que funciona como:
                  </p>
                  <ul className="mt-2 text-blue-700">
                    <li>• Las páginas amarillas del futuro</li>
                    <li>• Los clasificados de la nueva era digital</li>
                    <li>• Un buscador y automatizador de búsqueda</li>
                    <li>• Un sistema de matchmaking entre oferentes y demandantes</li>
                    <li>• Un puente o nexo facilitador (NO responsable)</li>
                  </ul>
                </div>
                
                <p>
                  Fixia.com.ar es comparable a "Uber de servicios" donde conectamos profesionales (AS - Ases) 
                  con exploradores (clientes) que buscan servicios, actuando únicamente como intermediario 
                  tecnológico sin participación directa en la prestación de servicios.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Exención de Responsabilidades</h2>
                
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                  <h3 className="font-semibold text-red-800 mb-2">IMPORTANTE: Limitaciones de Responsabilidad</h3>
                  <p className="text-red-700">
                    FIXIA.COM.AR NO SE HACE RESPONSABLE de ningún aspecto relacionado con los servicios 
                    prestados entre usuarios, incluyendo pero no limitándose a:
                  </p>
                </div>

                <h3 className="text-xl font-semibold mt-6 mb-3">2.1. Responsabilidad Civil</h3>
                <p>
                  Fixia.com.ar NO asume responsabilidad civil por daños, perjuicios, lesiones personales, 
                  daños materiales o cualquier otro tipo de daño que pueda surgir de:
                </p>
                <ul className="list-disc ml-6 mt-2">
                  <li>La prestación de servicios entre usuarios</li>
                  <li>La calidad, puntualidad o resultado de los servicios</li>
                  <li>Accidentes durante la prestación del servicio</li>
                  <li>Daños a la propiedad del cliente o terceros</li>
                  <li>Incumplimiento de acuerdos entre las partes</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">2.2. Responsabilidad Contractual</h3>
                <p>
                  Los contratos se establecen directamente entre el AS (profesional) y el Explorador (cliente). 
                  Fixia.com.ar:
                </p>
                <ul className="list-disc ml-6 mt-2">
                  <li>NO es parte de ningún contrato de servicios</li>
                  <li>NO garantiza el cumplimiento de los acuerdos</li>
                  <li>NO valida la capacidad técnica o legal de los profesionales</li>
                  <li>NO interviene en disputas contractuales</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">2.3. Responsabilidad Penal</h3>
                <p>
                  Fixia.com.ar queda exento de cualquier responsabilidad penal derivada de:
                </p>
                <ul className="list-disc ml-6 mt-2">
                  <li>Actividades ilegales realizadas por usuarios</li>
                  <li>Delitos cometidos durante la prestación de servicios</li>
                  <li>Falsificación de documentos o identidad</li>
                  <li>Fraudes entre usuarios</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Ausencia de Comisiones</h2>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-green-800">
                    <strong>Fixia.com.ar NO cobra comisiones</strong> sobre las transacciones realizadas 
                    entre usuarios. Todos los pagos y acuerdos económicos son directamente entre AS y Exploradores.
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Obligaciones de los Usuarios AS (Profesionales)</h2>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">4.1. Registro y Verificación</h3>
                <ul className="list-disc ml-6">
                  <li>Proporcionar información veraz y actualizada</li>
                  <li>Completar el proceso de verificación de identidad</li>
                  <li>Mantener actualizados sus datos de contacto</li>
                  <li>Decidir conscientemente la visibilidad de su número telefónico</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">4.2. Protección de Datos Personales</h3>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-yellow-800">
                    <strong>ADVERTENCIA:</strong> Los AS deben ser cuidadosos con sus datos personales, 
                    especialmente su número de teléfono. La plataforma permite configurar la visibilidad 
                    de esta información.
                  </p>
                </div>

                <h3 className="text-xl font-semibold mt-6 mb-3">4.3. Responsabilidades Profesionales</h3>
                <ul className="list-disc ml-6">
                  <li>Poseer las habilitaciones legales requeridas para su actividad</li>
                  <li>Contar con seguros apropiados para su actividad profesional</li>
                  <li>Cumplir con la legislación laboral y fiscal vigente</li>
                  <li>Mantener estándares de calidad y profesionalismo</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Sistema de Badges y Reputación</h2>
                <p>
                  Los badges son indicadores de reputación basados en:
                </p>
                <ul className="list-disc ml-6 mt-2">
                  <li>Completitud del perfil</li>
                  <li>Verificación de identidad</li>
                  <li>Años en la plataforma</li>
                  <li>Calificaciones de usuarios</li>
                  <li>Responsabilidad y cumplimiento</li>
                </ul>
                <p className="mt-4">
                  Los badges son indicativos y no constituyen garantía de calidad o responsabilidad 
                  por parte de Fixia.com.ar.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Prohibiciones</h2>
                <ul className="list-disc ml-6">
                  <li>Usar la plataforma para actividades ilegales</li>
                  <li>Proporcionar información falsa o engañosa</li>
                  <li>Acosar, intimidar o amenazar a otros usuarios</li>
                  <li>Violar derechos de propiedad intelectual</li>
                  <li>Intentar vulnerar la seguridad de la plataforma</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Modificaciones</h2>
                <p>
                  Fixia.com.ar se reserva el derecho de modificar estos términos en cualquier momento. 
                  Las modificaciones serán notificadas a los usuarios y entrarán en vigor tras su 
                  publicación en la plataforma.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Jurisdicción</h2>
                <p>
                  Estos términos se rigen por las leyes de la República Argentina. Cualquier disputa 
                  será sometida a la jurisdicción de los tribunales competentes de la Provincia del Chubut.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Contacto</h2>
                <p>
                  Para consultas sobre estos términos, contactar a: 
                  <a href="mailto:legal@fixia.com.ar" className="text-blue-600 hover:underline ml-1">
                    legal@fixia.com.ar
                  </a>
                </p>
              </section>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Al utilizar Fixia.com.ar, usted acepta estos términos y condiciones en su totalidad.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsPage;