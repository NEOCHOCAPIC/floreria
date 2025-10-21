import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Hook personalizado para gestionar roles y permisos
 * Retorna información del usuario actual y sus permisos
 */
export function useUserRole() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      try {
        if (authUser) {
          // Obtener documento del usuario en Firestore
          const userDocRef = doc(db, 'users', authUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              uid: authUser.uid,
              email: authUser.email,
              ...userData
            });
            setRole(userData.role);
          } else {
            // Si no existe el documento, crear uno por defecto
            console.warn('Usuario no encontrado en Firestore, usando rol de visor');
            setUser({
              uid: authUser.uid,
              email: authUser.email,
              role: 'viewer'
            });
            setRole('viewer');
          }
        } else {
          setUser(null);
          setRole(null);
        }
      } catch (err) {
        console.error('Error fetching user role:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Funciones de verificación de permisos
  const isAdmin = role === 'admin';
  const isEditor = role === 'editor' || role === 'admin';
  const isViewer = role === 'viewer' || role === 'editor' || role === 'admin';

  // Verificar permiso específico
  const hasPermission = (requiredRole) => {
    if (requiredRole === 'admin') return isAdmin;
    if (requiredRole === 'editor') return isEditor;
    if (requiredRole === 'viewer') return isViewer;
    return false;
  };

  // Obtener descripción del rol
  const getRoleDescription = () => {
    const descriptions = {
      admin: 'Administrador - Acceso total',
      editor: 'Editor - Puede editar contenido',
      viewer: 'Visor - Solo lectura'
    };
    return descriptions[role] || 'Desconocido';
  };

  return {
    user,
    role,
    loading,
    error,
    isAdmin,
    isEditor,
    isViewer,
    hasPermission,
    getRoleDescription
  };
}

/**
 * Hook para obtener información de roles disponibles
 */
export function useRoles() {
  const roles = [
    {
      id: 'admin',
      name: 'Administrador',
      description: 'Acceso total: ver, editar, crear usuarios, gestionar roles',
      permissions: [
        'view_dashboard',
        'edit_content',
        'manage_users',
        'view_analytics',
        'delete_content',
        'manage_settings'
      ]
    },
    {
      id: 'editor',
      name: 'Editor',
      description: 'Puede editar contenido: flores, joyas, promociones, páginas',
      permissions: [
        'view_dashboard',
        'edit_content',
        'view_analytics'
      ]
    },
    {
      id: 'viewer',
      name: 'Visor',
      description: 'Solo lectura: puede ver pero no editar contenido',
      permissions: [
        'view_dashboard'
      ]
    }
  ];

  const getRoleById = (roleId) => roles.find(r => r.id === roleId);

  const hasPermissionInRole = (roleId, permission) => {
    const role = getRoleById(roleId);
    return role && role.permissions.includes(permission);
  };

  return {
    roles,
    getRoleById,
    hasPermissionInRole
  };
}

/**
 * Función auxiliar para verificar permisos de usuario
 */
export function canUserAccess(userRole, requiredRole) {
  if (userRole === 'admin') return true;
  if (requiredRole === 'viewer') return true;
  if (requiredRole === 'editor' && userRole === 'editor') return true;
  return false;
}

/**
 * Función para obtener el icono del rol
 */
export function getRoleIcon(roleId) {
  const icons = {
    admin: '👑',
    editor: '✏️',
    viewer: '👁️'
  };
  return icons[roleId] || '❓';
}

/**
 * Función para obtener el color del rol
 */
export function getRoleColor(roleId) {
  const colors = {
    admin: 'from-red-500 to-pink-500',
    editor: 'from-blue-500 to-purple-500',
    viewer: 'from-green-500 to-emerald-500'
  };
  return colors[roleId] || 'from-gray-500 to-gray-600';
}
