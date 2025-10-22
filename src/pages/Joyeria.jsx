import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gem } from 'lucide-react';
import { useFirestoreCollection } from '../hooks/useFirestoreData';

export default function Joyeria() {
  const [activeCategory, setActiveCategory] = useState('todos');
  const { data: jewelryData } = useFirestoreCollection('jewelry');
  const { data: categoriesData } = useFirestoreCollection('jewelryCategories');
  const { data: promotionsData } = useFirestoreCollection('promotions');

  const [jewelry, setJewelry] = useState([]);
  const [categories, setCategories] = useState([]);
  const [promotions, setPromotions] = useState([]);

  useEffect(() => {
    if (jewelryData) {
      setJewelry(Array.isArray(jewelryData) ? jewelryData : []);
    }
  }, [jewelryData]);

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
    title: 'Silver Glow',
    emoji: '💎',
    description: 'En Silver Glow creemos que cada joya es un reflejo de tu luz interior. Descubre nuestra colección exclusiva de joyas premium diseñadas para momentos extraordinarios.'
  };

  const allCategories = [
    { id: 'todos', name: 'Todos' },
    ...categories.map(cat => ({ id: cat.name, name: cat.name }))
  ];

  const filteredJewelry = activeCategory === 'todos'
    ? jewelry
    : jewelry.filter(j => j.category === activeCategory);

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
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
            {pageContent.title} {pageContent.emoji}
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
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-purple-500'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </motion.div>

        {/* Grid de Joyas */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredJewelry.length > 0 ? (
            filteredJewelry.map((item, idx) => {
              // Filtrar promociones activas que aplican a joyas
              const activePromotions = promotions.filter(p => {
                if (!p.isActive) return false;
                const now = new Date().toISOString().split('T')[0];
                if (p.startDate && now < p.startDate) return false;
                if (p.endDate && now > p.endDate) return false;
                
                // Aplicable a todas las categorías
                if (p.applicableTo === 'all') return true;
                
                // Aplicable a todas las joyas
                if (p.applicableTo === 'jewelry') return true;
                
                // Aplicable a categoría específica
                if (p.applicableTo === 'specific_category' && 
                    p.productType === 'jewelry' && 
                    p.specificCategory === item.category) {
                  return true;
                }
                
                return false;
              });

              // Calcular precio final
              let finalPrice = item.price;
              for (const promo of activePromotions) {
                if (promo.discountType === 'percentage') {
                  finalPrice = finalPrice * (1 - promo.discountValue / 100);
                } else if (promo.discountType === 'fixed') {
                  finalPrice = finalPrice - promo.discountValue;
                }
              }
              finalPrice = Math.max(0, finalPrice);
              
              const discount = item.price - finalPrice;
              const discountPercentage = item.price > 0 
                ? ((discount / item.price) * 100).toFixed(1)
                : '0';
              const hasDiscount = activePromotions.length > 0;

              return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all"
              >
                {/* Imagen */}
                <div className="w-full h-64 bg-gradient-to-b from-yellow-200 via-amber-100 to-yellow-50 flex items-center justify-center overflow-hidden relative">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-8xl">💍</span>
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
                    <Gem className="inline-block mr-2 text-purple-500" size={20} />
                    {item.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {item.description || 'Joya premium con materiales de alta calidad y diseño exclusivo.'}
                  </p>

                  {/* Sección de Precios */}
                  <div className="mb-4">
                    {hasDiscount ? (
                      <div className="space-y-1">
                        {/* Precio Original (Tachado) */}
                        <div className="text-sm text-gray-400 line-through">
                          ${item.price.toLocaleString()}
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
                      <div className="text-2xl font-bold text-purple-600">
                        ${item.price.toLocaleString()}
                      </div>
                    )}
                  </div>

                  {/* Botón WhatsApp */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      const message = `Hola! Me interesa cotizar: *${item.name}*\n${item.category ? `Descripccion ${item.description}\n` : ''}Precio: $${item.price.toLocaleString()}${hasDiscount ? ` *Con descuento: $${finalPrice.toLocaleString()}*` : ''}\n\n¿Me das más información?`;
                      const encodedMessage = encodeURIComponent(message);
                      window.open(`https://api.whatsapp.com/send?phone=56993177866&text=${encodedMessage}`, '_blank');
                    }}
                    className={`w-full font-semibold py-2 px-6 rounded-lg transition ${
                      hasDiscount
                        ? 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white'
                        : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white'
                    }`}
                  >
                    {hasDiscount ? '🔥 ¡Cotizar Descuento!' : 'Cotizar por WhatsApp'}
                  </motion.button>
                </div>
              </motion.div>
              );
            })
          ) : (
            <p className="col-span-full text-center text-gray-500 py-16 text-lg">
              No hay joyas disponibles en esta categoría.
            </p>
          )}
        </motion.div>

        {/* Mensaje Final */}
        {filteredJewelry.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-center text-gray-600 italic max-w-3xl mx-auto p-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border border-purple-200 mt-16"
          >
            <p className="text-lg">
              ✨ Todas nuestras joyas son elaboradas con materiales premium y certificados. Cada pieza es única y viene con garantía de autenticidad.
            </p>
          </motion.div>
        )}
      </div>
    </main>
  );
}
