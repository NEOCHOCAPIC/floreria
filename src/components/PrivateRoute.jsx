import { Navigate } from 'react-router-dom';
import { useUserRole } from '../hooks/useUserRole';

/**
 * Componente para proteger rutas según rol
 * Uso: <PrivateRoute requiredRole="admin"><AdminComponent /></PrivateRoute>
 */
export function PrivateRoute({ children, requiredRole = 'viewer' }) {
  const { role, loading } = useUserRole();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Verificar permisos
  const hasAccess = () => {
    if (!role) return false;
    if (requiredRole === 'admin') return role === 'admin';
    if (requiredRole === 'editor') return role === 'editor' || role === 'admin';
    if (requiredRole === 'viewer') return true; // Todos pueden ver
    return false;
  };

  if (!hasAccess()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Acceso Denegado</h1>
          <p className="text-gray-600 mb-6">
            No tienes permisos para acceder a esta sección. Tu rol es: <strong>{role}</strong>
          </p>
          <p className="text-sm text-gray-500">
            Se requiere: <strong>{requiredRole}</strong>
          </p>
        </div>
      </div>
    );
  }

  return children;
}

/**
 * Componente para mostrar/ocultar contenido según rol
 * Uso: <RoleBasedView role="admin"><AdminOnlyContent /></RoleBasedView>
 */
export function RoleBasedView({ children, role: requiredRole, fallback = null }) {
  const { role, loading } = useUserRole();

  if (loading) return null;

  const hasAccess = () => {
    if (!role) return false;
    if (requiredRole === 'admin') return role === 'admin';
    if (requiredRole === 'editor') return role === 'editor' || role === 'admin';
    if (requiredRole === 'viewer') return true;
    return false;
  };

  return hasAccess() ? children : fallback;
}
