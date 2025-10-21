import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, addDoc, deleteDoc, doc, getDocs, query, where, updateDoc,setDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { ChevronDown, Trash2, Edit2, X } from 'lucide-react';

export default function UsersEditor() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [expandedUser, setExpandedUser] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);

  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'editor' // 'admin' | 'editor' | 'viewer'
  });

  const [editingUser, setEditingUser] = useState({
    role: ''
  });

  const roles = [
    {
      id: 'admin',
      name: 'Administrador',
      description: 'Acceso total: ver, editar, crear usuarios, gestionar roles',
      icon: '👑',
      color: 'from-red-500 to-pink-500'
    },
    {
      id: 'editor',
      name: 'Editor',
      description: 'Puede editar contenido: flores, joyas, promociones, páginas',
      icon: '✏️',
      color: 'from-blue-500 to-purple-500'
    },
    {
      id: 'viewer',
      name: 'Visor',
      description: 'Solo lectura: puede ver pero no editar contenido',
      icon: '👁️',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      console.error('Error fetching users:', error);
      setMessage('❌ Error al cargar usuarios: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const addUser = async () => {
    if (!newUser.email.trim() || !newUser.password) {
      setMessage('❌ Email y contraseña son requeridos');
      return;
    }

    if (!validateEmail(newUser.email)) {
      setMessage('❌ Email inválido');
      return;
    }

    if (newUser.password.length < 6) {
      setMessage('❌ La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newUser.password !== newUser.confirmPassword) {
      setMessage('❌ Las contraseñas no coinciden');
      return;
    }

    try {
      setSaving(true);

      // Verificar si el usuario ya existe
      const existingUsers = await getDocs(
        query(collection(db, 'users'), where('email', '==', newUser.email))
      );

      if (existingUsers.size > 0) {
        setMessage('❌ Este email ya está registrado');
        return;
      }

      // Crear usuario en Auth
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newUser.email,
        newUser.password
      );

      // Crear documento en Firestore
    //   await addDoc(collection(db, 'users'), {
    //     email: newUser.email,
    //     uid: userCredential.user.uid,
    //     role: newUser.role,
    //     createdAt: new Date().toISOString(),
    //     createdBy: auth.currentUser?.email || 'system',
    //     status: 'active'
    //   });
    // 1. Define la referencia al documento usando el UID
      const userDocRef = doc(db, 'users', userCredential.user.uid);

      // 2. Usa setDoc para crear el documento con ese ID
      await setDoc(userDocRef, {
        email: newUser.email,
        uid: userCredential.user.uid, // Puedes mantener el UID como campo si quieres, no hace daño
        role: newUser.role,
        createdAt: new Date().toISOString(),
        createdBy: auth.currentUser?.email || 'system',
        status: 'active'
      });

      setNewUser({
        email: '',
        password: '',
        confirmPassword: '',
        role: 'editor'
      });

      await fetchUsers();
      setMessage('✅ Usuario agregado exitosamente');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error adding user:', error);
      if (error.code === 'auth/email-already-in-use') {
        setMessage('❌ Este email ya está registrado en Firebase');
      } else if (error.code === 'auth/weak-password') {
        setMessage('❌ La contraseña es muy débil');
      } else {
        setMessage('❌ Error: ' + error.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      setSaving(true);
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        role: newRole,
        updatedAt: new Date().toISOString()
      });

      await fetchUsers();
      setEditingUserId(null);
      setMessage('✅ Rol actualizado exitosamente');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating role:', error);
      setMessage('❌ Error: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setSaving(true);
      await deleteDoc(doc(db, 'users', userId));
      await fetchUsers();
      setMessage('✅ Usuario eliminado');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting user:', error);
      setMessage('❌ Error: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando usuarios...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-red-900">👥 Gestor de Usuarios</h2>

      {/* Mensaje de estado */}
      {message && (
        <div className="mb-4 p-4 bg-gray-100 rounded-lg text-center font-semibold">
          {message}
        </div>
      )}

      {/* Formulario para agregar usuario */}
      <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border-2 border-red-200">
        <h3 className="text-xl font-bold mb-4 text-red-900">➕ Agregar Nuevo Usuario</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Email */}
          <input
            type="email"
            placeholder="Email del usuario"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            className="px-4 py-2 border-2 border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />

          {/* Rol */}
          <select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            className="px-4 py-2 border-2 border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {roles.map(role => (
              <option key={role.id} value={role.id}>
                {role.icon} {role.name}
              </option>
            ))}
          </select>

          {/* Contraseña */}
          <input
            type="password"
            placeholder="Contraseña (mín. 6 caracteres)"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            className="px-4 py-2 border-2 border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />

          {/* Confirmar contraseña */}
          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={newUser.confirmPassword}
            onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
            className="px-4 py-2 border-2 border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Botón guardar */}
        <button
          onClick={addUser}
          disabled={saving}
          className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold py-2 rounded-lg hover:shadow-lg transition disabled:opacity-50"
        >
          {saving ? 'Guardando...' : '💾 Crear Usuario'}
        </button>
      </div>

      {/* Información de Roles */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {roles.map(role => (
          <div
            key={role.id}
            className={`p-4 bg-gradient-to-r ${role.color} text-white rounded-lg shadow-md`}
          >
            <div className="text-3xl mb-2">{role.icon}</div>
            <h4 className="font-bold text-lg">{role.name}</h4>
            <p className="text-sm text-white/80 mt-2">{role.description}</p>
          </div>
        ))}
      </div>

      {/* Lista de usuarios */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-red-900 mb-4">
          Usuarios Registrados ({users.length})
        </h3>

        {users.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No hay usuarios aún</p>
        ) : (
          users.map((user) => {
            const userRole = roles.find(r => r.id === user.role);
            return (
              <div
                key={user.id}
                className="border-2 border-red-200 rounded-lg overflow-hidden bg-white"
              >
                {/* Header de usuario */}
                <button
                  onClick={() =>
                    setExpandedUser(expandedUser === user.id ? null : user.id)
                  }
                  className="w-full p-4 flex items-center justify-between hover:bg-red-50 transition"
                >
                  <div className="flex-1 text-left">
                    <h4 className="font-bold text-lg text-gray-800">
                      {user.email}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {userRole?.icon} {userRole?.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Creado: {new Date(user.createdAt).toLocaleDateString()} por {user.createdBy}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        user.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {user.status === 'active' ? '✅ Activo' : '⭕ Inactivo'}
                    </span>
                    <ChevronDown
                      size={20}
                      className={`transform transition ${
                        expandedUser === user.id ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {/* Contenido expandido */}
                {expandedUser === user.id && (
                  <div className="border-t-2 border-red-200 p-4 bg-red-50 space-y-4">
                    {/* Cambiar Rol */}
                    {editingUserId === user.id ? (
                      <div className="space-y-3">
                        <label className="block text-sm font-bold text-gray-700">
                          Cambiar Rol
                        </label>
                        <select
                          value={editingUser.role}
                          onChange={(e) =>
                            setEditingUser({ ...editingUser, role: e.target.value })
                          }
                          className="w-full px-4 py-2 border-2 border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          {roles.map(role => (
                            <option key={role.id} value={role.id}>
                              {role.icon} {role.name}
                            </option>
                          ))}
                        </select>
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateUserRole(user.id, editingUser.role)}
                            disabled={saving}
                            className="flex-1 bg-green-500 text-white font-bold py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
                          >
                            ✅ Guardar
                          </button>
                          <button
                            onClick={() => setEditingUserId(null)}
                            className="flex-1 bg-gray-500 text-white font-bold py-2 rounded-lg hover:bg-gray-600"
                          >
                            ❌ Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingUserId(user.id);
                            setEditingUser({ role: user.role });
                          }}
                          className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white font-bold py-2 rounded-lg hover:bg-blue-600"
                        >
                          <Edit2 size={18} /> Cambiar Rol
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          disabled={saving}
                          className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white font-bold py-2 rounded-lg hover:bg-red-600 disabled:opacity-50"
                        >
                          <Trash2 size={18} /> Eliminar
                        </button>
                      </div>
                    )}

                    {/* Información adicional */}
                    <div className="bg-white p-3 rounded-lg border-2 border-red-200">
                      <p className="text-sm text-gray-600">
                        <strong>UID:</strong> {user.uid}
                      </p>
                      {user.updatedAt && (
                        <p className="text-sm text-gray-600 mt-1">
                          <strong>Última actualización:</strong> {new Date(user.updatedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Información importante */}
      <div className="mt-8 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
        <h4 className="font-bold text-yellow-900 mb-2">⚠️ Información Importante</h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>✓ Solo ADMINISTRADORES pueden crear, editar y eliminar usuarios</li>
          <li>✓ Las contraseñas son encriptadas por Firebase Auth</li>
          <li>✓ Cada usuario puede iniciar sesión con su email y contraseña</li>
          <li>✓ Los permisos se verifican en cada carga de página según el rol</li>
          <li>✓ ADMINISTRADOR: Acceso total. EDITOR: Edita contenido. VISOR: Solo lectura</li>
        </ul>
      </div>
    </div>
  );
}
