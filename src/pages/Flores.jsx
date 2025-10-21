import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flower2 } from 'lucide-react';
import { useFirestoreCollection } from '../hooks/useFirestoreData';

export default function Flores() {
  const [activeCategory, setActiveCategory] = useState('todos');
  const { data: flowersData } = useFirestoreCollection('flowers');
  const { data: categoriesData } = useFirestoreCollection('flowerCategories');
  const { data: promotionsData } = useFirestoreCollection('promotions');

  const [flowers, setFlowers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [promotions, setPromotions] = useState([]);

  useEffect(() => {
    if (flowersData) {
      setFlowers(Array.isArray(flowersData) ? flowersData : []);
    }
  }, [flowersData]);

  useEffect(() => {
    if (categoriesData) {
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    }
  }, [categoriesData]);

  useEffect(() => {
    if (promotionsData) {
      setPromotions(Array.isArray(promotionsData) ? promotionsData : []);
    }
  }, [promotionsData]);

  const pageContent = {
    title: 'Florería Santa Gemita',
    emoji: '🌸',
    description: 'En Florería Santa Gemita, transformamos tus sentimientos en arreglos inolvidables. Cada flor es seleccionada a mano por su frescura y belleza, creando un mensaje único para celebrar, agradecer o consolar. Deja que la naturaleza hable por ti y convierte un simple día en un recuerdo mágico.',
    footerMessage: 'En Florería Santa Gemita cada flor tiene su momento. Los precios pueden variar según la estación y la disponibilidad, manteniendo siempre la frescura y calidad que nos caracteriza.'
  };

  const allCategories = [
    { id: 'todos', name: 'Todos' },
    ...categories.map(cat => ({ id: cat.name, name: cat.name }))
  ];

  const filteredFlowers = activeCategory === 'todos'
    ? flowers
    : flowers.filter(f => f.category === activeCategory);

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
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="text-pink-500">{pageContent.title}</span>
            <span className="text-4xl ml-2">{pageContent.emoji}</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            {pageContent.description}
          </p>
        </motion.div>

        {/* Filtros de Categoría */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {allCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-6 py-2 rounded-full font-semibold transition-all transform hover:scale-105 ${
                activeCategory === cat.id
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-pink-500'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </motion.div>

        {/* Grid de Flores */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
        >
          {filteredFlowers.map((flower, idx) => {
            // Filtrar promociones activas que aplican a flores
            const activePromotions = promotions.filter(p => {
              if (!p.isActive) return false;
              const now = new Date().toISOString().split('T')[0];
              if (p.startDate && now < p.startDate) return false;
              if (p.endDate && now > p.endDate) return false;
              return p.applicableTo === 'all' || p.applicableTo === 'flowers';
            });

            // Calcular precio final
            let finalPrice = flower.price;
            for (const promo of activePromotions) {
              if (promo.discountType === 'percentage') {
                finalPrice = finalPrice * (1 - promo.discountValue / 100);
              } else if (promo.discountType === 'fixed') {
                finalPrice = finalPrice - promo.discountValue;
              }
            }
            finalPrice = Math.max(0, finalPrice);
            
            const discount = flower.price - finalPrice;
            const discountPercentage = flower.price > 0 
              ? ((discount / flower.price) * 100).toFixed(1)
              : '0';
            const hasDiscount = activePromotions.length > 0;

            return (
            <motion.div
              key={flower.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all"
            >
              {/* Imagen */}
              <div className="w-full h-64 bg-gradient-to-b from-pink-300 via-purple-200 to-pink-100 flex items-center justify-center overflow-hidden relative">
                {flower.imageUrl ? (
                  <img src={flower.imageUrl} alt={flower.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-8xl">🌹</span>
                )}
                
                {/* Badge de Descuento */}
                {hasDiscount && (
                  <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg">
                    -{discountPercentage}%
                  </div>
                )}
              </div>

              {/* Contenido */}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-gray-800">
                  <Flower2 className="inline-block mr-2 text-pink-500" size={20} />
                  {flower.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {flower.description || 'Hermoso arreglo con flores frescas seleccionadas especialmente para hacer tu momento memorable.'}
                </p>

                {/* Sección de Precios */}
                <div className="mb-4">
                  {hasDiscount ? (
                    <div className="space-y-1">
                      {/* Precio Original (Tachado) */}
                      <div className="text-sm text-gray-400 line-through">
                        ${flower.price.toLocaleString()}
                      </div>
                      
                      {/* Precio Final (Grande y Rojo) */}
                      <div className="text-3xl font-bold text-red-600">
                        ${finalPrice.toLocaleString()}
                      </div>
                      
                      {/* Ahorro */}
                      <div className="text-xs text-green-600 font-semibold">
                        💚 Ahorras: ${discount.toLocaleString()}
                      </div>
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-pink-500">
                      ${flower.price.toLocaleString()}
                    </div>
                  )}
                </div>

                {/* Botón de Compra */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full font-semibold py-2 px-6 rounded-lg transition ${
                    hasDiscount
                      ? 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white'
                      : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white'
                  }`}
                >
                  {hasDiscount ? '🔥 ¡Aprovechar Descuento!' : '🛒 Comprar'}
                </motion.button>
              </div>
            </motion.div>
            );
          })}
        </motion.div>

        {/* Mensaje Final */}
        {filteredFlowers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-center text-gray-600 italic max-w-3xl mx-auto p-8 bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl border border-pink-200"
          >
            <p className="text-lg">{pageContent.footerMessage}</p>
          </motion.div>
        )}

        {/* Sin resultados */}
        {filteredFlowers.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">
              No hay arreglos florales disponibles en esta categoría.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
