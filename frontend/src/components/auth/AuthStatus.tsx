import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserIcon, LockClosedIcon, LockOpenIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

const AuthStatus: React.FC = () => {
  const { user, loading, logout, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <Card className="p-4 max-w-md mx-auto">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
          <span className="text-gray-600">Verificando autenticación...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 max-w-md mx-auto">
      <div className="flex items-center gap-4 mb-4">
        {isAuthenticated ? (
          <LockOpenIcon className="h-8 w-8 text-accent-600" />
        ) : (
          <LockClosedIcon className="h-8 w-8 text-gray-400" />
        )}
        <div>
          <h3 className="font-semibold text-gray-900">
            {isAuthenticated ? 'Sesión Activa' : 'No Autenticado'}
          </h3>
          <p className="text-sm text-gray-600">
            {isAuthenticated 
              ? 'Tu sesión es válida y segura'
              : 'Necesitas iniciar sesión'
            }
          </p>
        </div>
      </div>

      {user && (
        <div className="border-t pt-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <UserIcon className="h-5 w-5 text-gray-500" />
            <span className="font-medium text-gray-900">
              {user.first_name} {user.last_name}
            </span>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Tipo:</strong> {user.user_type}</p>
            <p><strong>ID:</strong> {user.id}</p>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {isAuthenticated ? (
          <Button variant="outline" onClick={logout} className="flex-1">
            Cerrar Sesión
          </Button>
        ) : (
          <Button variant="primary" onClick={() => window.location.href = '/auth/login'} className="flex-1">
            Iniciar Sesión
          </Button>
        )}
        <Button 
          variant="ghost" 
          onClick={() => window.location.reload()} 
          className="px-3"
        >
          ↻
        </Button>
      </div>
    </Card>
  );
};

export default AuthStatus;