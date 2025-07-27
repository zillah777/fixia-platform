import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

const ExplorerDashboard: NextPage = () => {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalRequests: 0,
    activeBookings: 0,
    completedBookings: 0,
    savedProfessionals: 0
  });

  useEffect(() => {
    if (!loading && (!user || user.user_type !== 'customer')) {
      router.push('/auth/login');
      return;
    }
  }, [user, loading, router]);

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div>
        <div>Cargando dashboard...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard Explorador | Fixia</title>
        <meta name="description" content="Panel de control para exploradores" />
      </Head>

      <div>
        {/* Navigation */}
        <nav>
          <div>
            <div>
              <h1>Fixia</h1>
            </div>
            <div>
              <Link href="/explorador/perfil">Mi Perfil</Link>
              <button onClick={handleLogout}>Cerrar Sesión</button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main>
          <div>
            <h1>Bienvenido, {user?.first_name}</h1>
            <p>Panel de control del explorador</p>

            {/* Quick Actions */}
            <div>
              <h2>Acciones Rápidas</h2>
              <div>
                <Link href="/explorador/buscar-servicio">
                  <div>
                    <h3>Buscar Servicios</h3>
                    <p>Encuentra profesionales para tus proyectos</p>
                  </div>
                </Link>
                <Link href="/explorador/mis-solicitudes">
                  <div>
                    <h3>Mis Solicitudes</h3>
                    <p>Ver el estado de tus solicitudes</p>
                  </div>
                </Link>
                <Link href="/explorador/chats">
                  <div>
                    <h3>Mensajes</h3>
                    <p>Comunícate con profesionales</p>
                  </div>
                </Link>
                <Link href="/explorador/calificaciones">
                  <div>
                    <h3>Calificaciones</h3>
                    <p>Califica los servicios recibidos</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div>
              <h2>Estadísticas</h2>
              <div>
                <div>
                  <div>{stats.totalRequests}</div>
                  <div>Solicitudes Totales</div>
                </div>
                <div>
                  <div>{stats.activeBookings}</div>
                  <div>Servicios Activos</div>
                </div>
                <div>
                  <div>{stats.completedBookings}</div>
                  <div>Servicios Completados</div>
                </div>
                <div>
                  <div>{stats.savedProfessionals}</div>
                  <div>Profesionales Guardados</div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h2>Actividad Reciente</h2>
              <div>
                <p>No hay actividad reciente</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default ExplorerDashboard;