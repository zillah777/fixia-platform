import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

const Registro: NextPage = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    user_type: 'customer'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register, isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const type = router.query.type;
    if (type === 'provider' || type === 'customer') {
      setFormData(prev => ({ ...prev, user_type: type }));
    }
  }, [router.query.type]);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.user_type === 'provider') {
        router.push('/as/dashboard');
      } else {
        router.push('/explorador/dashboard');
      }
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setIsLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
    } catch (err: any) {
      setError(err.message || 'Error al crear cuenta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Registro | Fixia</title>
        <meta name="description" content="Crea tu cuenta en Fixia" />
      </Head>

      <div>
        <div>
          <div>
            <div>
              <Link href="/">
                <h1>Fixia</h1>
              </Link>
            </div>

            <div>
              <h2>Crear Cuenta</h2>
              <p>
                Únete a {formData.user_type === 'provider' ? 'profesionales' : 'clientes'} en Fixia
              </p>

              {error && (
                <div>
                  <span>⚠ {error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div>
                  <label>Tipo de cuenta</label>
                  <div>
                    <label>
                      <input
                        type="radio"
                        value="customer"
                        checked={formData.user_type === 'customer'}
                        onChange={(e) => setFormData(prev => ({ ...prev, user_type: e.target.value }))}
                      />
                      Cliente (busco servicios)
                    </label>
                    <label>
                      <input
                        type="radio"
                        value="provider"
                        checked={formData.user_type === 'provider'}
                        onChange={(e) => setFormData(prev => ({ ...prev, user_type: e.target.value }))}
                      />
                      Profesional (ofrezco servicios)
                    </label>
                  </div>
                </div>

                <div>
                  <div>
                    <label htmlFor="first_name">Nombre</label>
                    <input
                      id="first_name"
                      type="text"
                      required
                      value={formData.first_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                      placeholder="Tu nombre"
                    />
                  </div>

                  <div>
                    <label htmlFor="last_name">Apellido</label>
                    <input
                      id="last_name"
                      type="text"
                      required
                      value={formData.last_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                      placeholder="Tu apellido"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="tu@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="password">Contraseña</label>
                  <input
                    id="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Repite tu contraseña"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
                </button>
              </form>

              <div>
                <p>
                  ¿Ya tienes cuenta?{' '}
                  <Link href="/auth/login">
                    Inicia sesión aquí
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Registro;