import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, LayoutDashboard, Package, Tag, FileText, Gem, Flower2, Home, Users, Settings, ChevronLeft, LogIn, Lock } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { useUserRole } from '../hooks/useUserRole';
import HomeEditor from './AdminPageEditors/HomeEditor';
import QuienesSomosEditor from './AdminPageEditors/QuienesSomosEditor';
import FlowersEditor from './AdminPageEditors/FlowersEditor';
import JewelryEditor from './AdminPageEditors/JewelryEditor';
import PromotionsEditor from './AdminPageEditors/PromotionsEditor';
import UsersEditor from './AdminPageEditors/UsersEditor';

// Componente StatCard
const StatCard = ({ icon, title, value, color, textColor }) => {
  const IconComponent = icon;
  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
      className="bg-white p-6 rounded-2xl shadow-lg flex items-center space-x-4 cursor-pointer transition-all"
    >
      <div className={`p-4 rounded-full ${color}`}>
        <IconComponent size={32} className={textColor} />
      </div>
      <div>
        <p className="text-lg text-gray-500 font-medium">{title}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
    </motion.div>
  );
};

export default function AdminDashboard() {
  const { user: userRole, isAdmin, role, loading } = useUserRole();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats] = useState({
    jewelry: 10,
    flowers: 9,
    promotions: 4
  });
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate('/admin/login');
      }
    });

    return unsubscribe;
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/admin/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const statsData = [
    {
      icon: Gem,
      title: "Total Joyas",
      value: stats.jewelry,
      color: "bg-purple-100",
      textColor: "text-purple-800"
    },
    {
      icon: Flower2,
      title: "Total Flores",
      value: stats.flowers,
      color: "bg-pink-100",
      textColor: "text-pink-800"
    },
    {
      icon: Tag,
      title: "Promociones Activas",
      value: stats.promotions,
      color: "bg-orange-100",
      textColor: "text-orange-800"
    },
  ];

  const gestionItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'jewelry', label: 'Joyería', icon: Gem },
    { id: 'flowers', label: 'Flores', icon: Flower2 },
    { id: 'promotions', label: 'Promociones', icon: Tag },
  ];

  const pagesItems = [
    { id: 'home', label: 'Página Inicio', icon: Home },
    { id: 'about', label: 'Quiénes Somos', icon: Users },
  ];

  const adminItems = [
    { id: 'users', label: 'Gestión de Usuarios', icon: Users, adminOnly: true },
    { id: 'settings', label: 'Configuración', icon: Settings, adminOnly: true },
  ];

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
        className="w-64 bg-gradient-to-b from-purple-800 to-gray-900 text-white flex flex-col p-4 shadow-2xl"
      >
        {/* Header del Sidebar */}
        <div className="p-6 border-b border-purple-600">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <div className="mt-4 flex items-center gap-3 bg-purple-600 rounded-lg p-3">
            <div className="w-10 h-10 rounded-full bg-purple-400 flex items-center justify-center font-bold">
              {user.email.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user.email}</p>
              <p className="text-xs text-purple-200">
                {role === 'admin' ? '👑 Administrador' : role === 'editor' ? '✏️ Editor' : '👁️ Visor'}
              </p>
            </div>
          </div>
        </div>

        {/* Navegación - Gestión */}
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-3">GESTIÓN</p>
          <nav className="space-y-2">
            {gestionItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <motion.button
                  key={item.id}
                  whileHover={{ x: 5 }}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-left ${
                    activeTab === item.id
                      ? 'bg-purple-500 shadow-lg'
                      : 'hover:bg-purple-600/50'
                  }`}
                >
                  <IconComponent size={20} />
                  <span className="font-medium">{item.label}</span>
                </motion.button>
              );
            })}
          </nav>

          {/* Navegación - Páginas */}
          <p className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-3 mt-6">PÁGINAS</p>
          <nav className="space-y-2">
            {pagesItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <motion.button
                  key={item.id}
                  whileHover={{ x: 5 }}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-left ${
                    activeTab === item.id
                      ? 'bg-purple-500 shadow-lg'
                      : 'hover:bg-purple-600/50'
                  }`}
                >
                  <IconComponent size={20} />
                  <span className="font-medium">{item.label}</span>
                </motion.button>
              );
            })}
          </nav>

          {/* Navegación - Administración (Solo para Admins) */}
          {isAdmin && (
            <>
              <p className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-3 mt-6">ADMINISTRACIÓN</p>
              <nav className="space-y-2">
                <motion.button
                  whileHover={{ x: 5 }}
                  onClick={() => setActiveTab('users')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-left ${
                    activeTab === 'users'
                      ? 'bg-purple-500 shadow-lg'
                      : 'hover:bg-purple-600/50'
                  }`}
                >
                  <Users size={20} />
                  <span className="font-medium">Gestionar Usuarios</span>
                </motion.button>
              </nav>
            </>
          )}
        </div>

        {/* Footer del Sidebar */}
        <div className="border-t border-purple-600 p-4 space-y-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition text-sm font-medium"
          >
            <ChevronLeft size={18} />
            Volver al sitio
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg transition text-sm font-medium"
          >
            <LogIn size={18} />
            Cerrar Sesión
          </motion.button>
        </div>
      </motion.aside>

      {/* Contenido Principal */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow-md sticky top-0 z-30">
          <div className="px-8 py-4 flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
              <p className="text-gray-600 mt-1">Resumen de tu tienda.</p>
            </motion.div>
          </div>
        </header>

        {/* Contenido */}
        <main className="p-8">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                {/* Cards de estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {statsData.map((stat, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + idx * 0.1 }}
                    >
                      <StatCard {...stat} />
                    </motion.div>
                  ))}
                </div>

                {/* Mensaje de bienvenida */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white p-8 rounded-2xl shadow-lg"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">👋</div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Bienvenido de nuevo!</h2>
                      <p className="text-gray-600 text-lg">
                        Desde aquí puedes gestionar todos los productos y contenidos de tu sitio web. Utiliza el menú lateral para navegar entre las diferentes secciones. ¡Que tengas un día productivo!
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {activeTab === 'jewelry' && <JewelryEditor />}
            {activeTab === 'flowers' && <FlowersEditor />}
            {activeTab === 'promotions' && <PromotionsEditor />}
            {activeTab === 'home' && <HomeEditor />}
            {activeTab === 'about' && <QuienesSomosEditor />}
            {activeTab === 'users' && (
              isAdmin ? (
                <UsersEditor />
              ) : (
                <div className="p-8 text-center">
                  <div className="text-6xl mb-4">🔒</div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Acceso Denegado</h2>
                  <p className="text-gray-600">
                    Solo los administradores pueden gestionar usuarios.
                  </p>
                </div>
              )
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
