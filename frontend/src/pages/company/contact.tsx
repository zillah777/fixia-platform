import React, { useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';

const ContactPage: NextPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    userType: 'general'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Here you would normally send to your API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        userType: 'general'
      });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Contacto - Fixia</title>
        <meta name="description" content="Contáctanos para cualquier consulta sobre Fixia" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">Contactanos</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              ¿Tienes preguntas, sugerencias o necesitas ayuda? Estamos aquí para ayudarte. 
              Contáctanos y te responderemos lo antes posible.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Información de Contacto</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-blue-100 rounded-lg p-3 mr-4">
                      <span className="text-2xl">📧</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Email General</h3>
                      <p className="text-gray-600">info@fixia.com.ar</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-green-100 rounded-lg p-3 mr-4">
                      <span className="text-2xl">🛡️</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Soporte Técnico</h3>
                      <p className="text-gray-600">soporte@fixia.com.ar</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-purple-100 rounded-lg p-3 mr-4">
                      <span className="text-2xl">⚖️</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Asuntos Legales</h3>
                      <p className="text-gray-600">legal@fixia.com.ar</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-yellow-100 rounded-lg p-3 mr-4">
                      <span className="text-2xl">🔒</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Privacidad</h3>
                      <p className="text-gray-600">privacy@fixia.com.ar</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-red-100 rounded-lg p-3 mr-4">
                      <span className="text-2xl">📞</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Teléfono</h3>
                      <p className="text-gray-600">+54 9 280 XXX-XXXX</p>
                      <p className="text-sm text-gray-500">Lunes a Viernes, 9:00 - 18:00</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-indigo-100 rounded-lg p-3 mr-4">
                      <span className="text-2xl">📍</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Oficina</h3>
                      <p className="text-gray-600">
                        Rawson, Chubut<br />
                        Argentina
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-6 text-white">
                <h3 className="text-xl font-semibold mb-4">¿Necesitas ayuda inmediata?</h3>
                <div className="space-y-3">
                  <a 
                    href="/faq" 
                    className="block bg-white/20 rounded-lg p-3 hover:bg-white/30 transition-colors"
                  >
                    <div className="flex items-center">
                      <span className="mr-3">❓</span>
                      <span>Preguntas Frecuentes</span>
                    </div>
                  </a>
                  <a 
                    href="/help" 
                    className="block bg-white/20 rounded-lg p-3 hover:bg-white/30 transition-colors"
                  >
                    <div className="flex items-center">
                      <span className="mr-3">📚</span>
                      <span>Centro de Ayuda</span>
                    </div>
                  </a>
                  <a 
                    href="/status" 
                    className="block bg-white/20 rounded-lg p-3 hover:bg-white/30 transition-colors"
                  >
                    <div className="flex items-center">
                      <span className="mr-3">🟢</span>
                      <span>Estado del Servicio</span>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2 max-w-2xl lg:max-w-none">
              <div className="bg-white rounded-lg shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Envíanos un Mensaje</h2>
                
                {submitStatus === 'success' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                      <span className="text-green-600 text-xl mr-3">✅</span>
                      <p className="text-green-800">
                        ¡Mensaje enviado exitosamente! Te responderemos pronto.
                      </p>
                    </div>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                      <span className="text-red-600 text-xl mr-3">❌</span>
                      <p className="text-red-800">
                        Hubo un error al enviar el mensaje. Por favor, intenta nuevamente.
                      </p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre Completo *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="input w-full"
                        placeholder="Tu nombre completo"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="input w-full"
                        placeholder="tu@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="input w-full"
                        placeholder="+54 9 280 XXX-XXXX"
                      />
                    </div>

                    <div>
                      <label htmlFor="userType" className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Usuario
                      </label>
                      <select
                        id="userType"
                        name="userType"
                        value={formData.userType}
                        onChange={handleInputChange}
                        className="input w-full"
                      >
                        <option value="general">Consulta General</option>
                        <option value="customer">Cliente (Explorador)</option>
                        <option value="provider">Profesional (AS)</option>
                        <option value="business">Empresa</option>
                        <option value="media">Medios de Comunicación</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Asunto *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="input w-full"
                      placeholder="¿En qué podemos ayudarte?"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Mensaje *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={6}
                      className="input w-full"
                      placeholder="Describe tu consulta o mensaje..."
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="privacy"
                      required
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="privacy" className="ml-2 text-sm text-gray-600">
                      Acepto la{' '}
                      <a href="/legal/privacy" className="text-blue-600 hover:underline">
                        Política de Privacidad
                      </a>{' '}
                      y el tratamiento de mis datos personales
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="spinner w-5 h-5 mr-2"></div>
                        Enviando...
                      </div>
                    ) : (
                      'Enviar Mensaje'
                    )}
                  </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600 text-center">
                    Tiempo de respuesta promedio: <strong>24 horas</strong> en días hábiles
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="mt-12 bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start">
              <div className="text-red-600 text-2xl mr-4">🚨</div>
              <div>
                <h3 className="text-lg font-semibold text-red-800 mb-2">Contacto de Emergencia</h3>
                <p className="text-red-700 mb-2">
                  Si tienes una emergencia relacionada con la seguridad de la plataforma, 
                  fraude o situaciones que requieren atención inmediata:
                </p>
                <p className="text-red-800 font-semibold">
                  📧 emergencia@fixia.com.ar
                </p>
                <p className="text-sm text-red-600 mt-1">
                  Respuesta garantizada en menos de 4 horas
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;