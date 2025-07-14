import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';

const AboutPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Quiénes Somos - Fixia</title>
        <meta name="description" content="Conoce la historia y misión de Fixia, las páginas amarillas del futuro" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Quiénes Somos
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Somos las páginas amarillas del futuro, los clasificados de la nueva era digital. 
              Conectamos profesionales con clientes de manera inteligente y moderna.
            </p>
          </div>

          {/* Mission Section */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Nuestra Misión</h2>
                <p className="text-lg text-gray-700 mb-4">
                  Revolucionar la forma en que las personas encuentran y contratan servicios profesionales 
                  en Chubut, creando un ecosistema digital que beneficie tanto a profesionales como a clientes.
                </p>
                <p className="text-gray-600">
                  Somos el puente que conecta talento con necesidad, facilitando encuentros que 
                  generan valor y confianza en nuestra comunidad.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full w-48 h-48 mx-auto flex items-center justify-center">
                  <span className="text-6xl text-white">🚀</span>
                </div>
              </div>
            </div>
          </div>

          {/* What We Are Section */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-blue-50 rounded-lg p-8">
              <h3 className="text-2xl font-bold text-blue-900 mb-4">¿Qué es Fixia?</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="text-blue-600 mr-3">📱</span>
                  <span>Las páginas amarillas del futuro</span>
                </div>
                <div className="flex items-center">
                  <span className="text-blue-600 mr-3">🔍</span>
                  <span>Un buscador inteligente de servicios</span>
                </div>
                <div className="flex items-center">
                  <span className="text-blue-600 mr-3">🤝</span>
                  <span>Un sistema de matchmaking profesional</span>
                </div>
                <div className="flex items-center">
                  <span className="text-blue-600 mr-3">🌉</span>
                  <span>Un puente entre oferentes y demandantes</span>
                </div>
                <div className="flex items-center">
                  <span className="text-blue-600 mr-3">🚗</span>
                  <span>El "Uber" de los servicios profesionales</span>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-8">
              <h3 className="text-2xl font-bold text-purple-900 mb-4">Nuestro Enfoque</h3>
              <div className="space-y-4">
                <p className="text-purple-800">
                  <strong>Simplicidad:</strong> Encontrar un profesional debe ser tan fácil como pedir un taxi.
                </p>
                <p className="text-purple-800">
                  <strong>Confianza:</strong> Verificamos identidades y fomentamos un sistema de reseñas transparente.
                </p>
                <p className="text-purple-800">
                  <strong>Velocidad:</strong> Los clientes llegan a ti mil veces más rápido que en métodos tradicionales.
                </p>
                <p className="text-purple-800">
                  <strong>Justicia:</strong> No cobramos comisiones. El dinero va directamente al profesional.
                </p>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">¿Cómo Funciona?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">👨‍💼</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Para Profesionales (AS)</h3>
                <p className="text-gray-600">
                  Registrate, verifica tu identidad, crea tu perfil profesional y recibe solicitudes 
                  de clientes automáticamente.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">🔍</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Para Clientes (Exploradores)</h3>
                <p className="text-gray-600">
                  Busca el servicio que necesitas, compara profesionales verificados y contrata 
                  directamente con quien más te convenga.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Conexión Instantánea</h3>
                <p className="text-gray-600">
                  Nuestro algoritmo inteligente conecta automáticamente la demanda con la oferta 
                  más adecuada en tiempo real.
                </p>
              </div>
            </div>
          </div>

          {/* Why Choose Us */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white mb-12">
            <h2 className="text-3xl font-bold mb-8 text-center">¿Por Qué Elegir Fixia?</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Para Profesionales</h3>
                <ul className="space-y-2">
                  <li>✅ Sin comisiones sobre tus servicios</li>
                  <li>✅ Mayor visibilidad que Facebook o clasificados tradicionales</li>
                  <li>✅ Sistema de verificación que genera confianza</li>
                  <li>✅ Herramientas profesionales de gestión</li>
                  <li>✅ Ranking que premia la calidad</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">Para Clientes</h3>
                <ul className="space-y-2">
                  <li>✅ Profesionales verificados y calificados</li>
                  <li>✅ Comparación transparente de servicios</li>
                  <li>✅ Sistema de reseñas confiable</li>
                  <li>✅ Búsqueda inteligente por ubicación</li>
                  <li>✅ Chat directo con profesionales</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Our Values */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Nuestros Valores</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-4">🤝</div>
                <h3 className="font-semibold mb-2">Confianza</h3>
                <p className="text-sm text-gray-600">Construimos relaciones basadas en transparencia y verificación</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="font-semibold mb-2">Innovación</h3>
                <p className="text-sm text-gray-600">Utilizamos tecnología de vanguardia para conectar personas</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="font-semibold mb-2">Precisión</h3>
                <p className="text-sm text-gray-600">Conectamos exactamente lo que necesitas con quien lo puede hacer</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🌱</div>
                <h3 className="font-semibold mb-2">Crecimiento</h3>
                <p className="text-sm text-gray-600">Apoyamos el crecimiento de profesionales y empresas locales</p>
              </div>
            </div>
          </div>

          {/* Team Section */}
          <div className="bg-gray-100 rounded-lg p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Nuestro Compromiso</h2>
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-lg text-gray-700 mb-6">
                En Fixia creemos que cada profesional merece una oportunidad justa de mostrar su talento, 
                y cada cliente merece acceso a servicios de calidad con total transparencia.
              </p>
              <p className="text-gray-600 mb-6">
                Somos un equipo apasionado por la tecnología y comprometido con el desarrollo económico 
                local de Chubut. Trabajamos incansablemente para que nuestra plataforma sea la herramienta 
                que impulse el crecimiento de profesionales y la satisfacción de clientes.
              </p>
              <div className="bg-white rounded-lg p-6 inline-block">
                <p className="text-sm text-gray-500 italic">
                  "No somos solo una app, somos el futuro de cómo las personas se conectan para crear valor juntas"
                </p>
                <p className="text-sm font-semibold text-gray-700 mt-2">- Equipo Fixia</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">¿Listo para formar parte del futuro?</h2>
            <p className="text-gray-600 mb-8">
              Únete a miles de profesionales y clientes que ya confían en Fixia
            </p>
            <div className="space-x-4">
              <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                Registrarse como Profesional
              </button>
              <button className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors">
                Buscar Servicios
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutPage;