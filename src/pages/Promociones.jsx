import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tag, Flame, TrendingUp } from 'lucide-react';
import { useFirestoreCollection } from '../hooks/useFirestoreData';

export default function Promociones() {
  const [activeFilter, setActiveFilter] = useState('todos');
  const [promotions, setPromotions] = useState([]);

  const { data: promotionsData } = useFirestoreCollection('promotions');

  useEffect(() => {
    if (promotionsData) {
      // Filtrar solo promociones activas y que estén dentro del rango de fechas
      const now = new Date().toISOString().split('T')[0];
      const activePromos = (Array.isArray(promotionsData) ? promotionsData : []).filter(promo => {
        if (!promo.isActive) return false;
        if (promo.startDate && now < promo.startDate) return false;
        if (promo.endDate && now > promo.endDate) return false;
        return true;
      });
      setPromotions(activePromos);
    }
  }, [promotionsData]);

  const pageContent = {
    title: 'Promociones del Mes',
    emoji: '🎉',
    subtitle: '¡Aprovecha estas ofertas especiales!',
  };

  const filters = [
    { id: 'todos', name: 'Todas' },
    { id: 'flowers', name: 'Flores' },
    { id: 'jewelry', name: 'Joyas' },
  ];

  // Colores gradientes para las promociones (reservado para futura expansión)
  const filteredPromos = activeFilter === 'todos'
    ? promotions
    : promotions.filter(p => p.applicableTo === activeFilter || p.applicableTo === 'all');

  return (
    <main className="flex-grow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
            {pageContent.title} {pageContent.emoji}
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            {pageContent.subtitle}
          </p>
        </motion.div>

        {/* Filtros */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {filters.map(filter => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-6 py-2 rounded-full font-semibold transition-all transform hover:scale-105 ${
                activeFilter === filter.id
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-orange-500'
              }`}
            >
              {filter.name}
            </button>
          ))}
        </motion.div>

        {/* Grid de Promociones */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
        >
          {filteredPromos.length === 0 ? (
            <div className="col-span-1 md:col-span-2 text-center py-16 text-gray-500">
              <p className="text-lg">No hay promociones disponibles en este momento. ¡Vuelve pronto!</p>
            </div>
          ) : (
            filteredPromos.map((promo, idx) => {
              const colorClasses = [
                'from-pink-500 to-rose-500',
                'from-purple-500 to-blue-500',
                'from-pink-400 to-purple-400',
                'from-blue-500 to-cyan-500',
                'from-red-500 to-pink-500',
                'from-amber-500 to-yellow-500',
                'from-green-500 to-emerald-500',
                'from-indigo-500 to-purple-500',
              ];
              const color = colorClasses[idx % colorClasses.length];
              const discountDisplay = promo.discountType === 'percentage' 
                ? `${promo.discountValue}%` 
                : `$${promo.discountValue.toLocaleString()}`;

              return (
                <motion.div
                  key={promo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className={`bg-gradient-to-r ${color} rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden text-white relative`}
                >
                  {/* Badge flotante */}
                  <div className="absolute top-4 right-4 z-10">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="bg-white bg-opacity-20 backdrop-blur rounded-lg p-3"
                    >
                      <div className="text-3xl font-bold text-center">
                        {discountDisplay}
                      </div>
                      <div className="text-xs font-semibold text-center">
                        {promo.discountType === 'percentage' ? 'OFF' : 'AHORRO'}
                      </div>
                    </motion.div>
                  </div>

                  {/* Contenido */}
                  <div className="p-8">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-4xl">🎁</span>
                      <div className="flex-1">
                        <h3 className="text-2xl md:text-3xl font-bold leading-tight">
                          {promo.name}
                        </h3>
                        <p className="text-xs text-white/70 mt-1 capitalize">
                          {promo.applicableTo === 'all' ? 'Todas las categorías' : promo.applicableTo === 'flowers' ? 'Flores' : 'Joyas'}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm md:text-base text-white/90 mb-6">
                      {promo.description}
                    </p>

                    {/* Fechas válidas */}
                    {(promo.startDate || promo.endDate) && (
                      <div className="text-xs text-white/70 mb-6 border-t border-white/20 pt-3">
                        📅 {promo.startDate && `Desde ${promo.startDate}`} {promo.startDate && promo.endDate && 'hasta'} {promo.endDate && `hasta ${promo.endDate}`}
                      </div>
                    )}

                    {/* Botones */}
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 bg-white text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-gray-100 transition flex items-center justify-center gap-2"
                      >
                        <Tag size={18} />
                        Ver Oferta
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 bg-white/20 hover:bg-white/30 font-bold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2 border border-white/30"
                      >
                        <TrendingUp size={18} />
                        Más Info
                      </motion.button>
                    </div>
                  </div>

                  {/* Indicador de fuego */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30">
                    <motion.div
                      animate={{ width: ['0%', '100%'] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="h-full bg-white"
                    ></motion.div>
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>

        {/* Mensaje Final */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-center text-gray-600 italic max-w-3xl mx-auto p-8 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border border-orange-200"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Flame size={20} className="text-orange-500" />
            <p className="text-lg font-semibold">¡Promociones por Tiempo Limitado!</p>
          </div>
          <p>
            ⏰ Las ofertas son válidas mientras el inventario disponible. Consulta con nuestro equipo en tienda para obtener más detalles sobre cada promoción.
          </p>
        </motion.div>
      </div>
    </main>
  );
}
