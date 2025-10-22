import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flower2, Sparkles } from 'lucide-react';
import { useFirestoreCollection } from '../hooks/useFirestoreData';

export default function Promociones() {
  const [activeFilter, setActiveFilter] = useState('todos');
  const [discountedProducts, setDiscountedProducts] = useState([]);

  const { data: promotionsData } = useFirestoreCollection('promotions');
  const { data: flowersData } = useFirestoreCollection('flowers');
  const { data: jewelryData } = useFirestoreCollection('jewelry');

  useEffect(() => {
    if (promotionsData && flowersData && jewelryData) {
      const now = new Date().toISOString().split('T')[0];
      
      // Filtrar solo promociones activas y dentro de rango de fechas
      const activePromos = (Array.isArray(promotionsData) ? promotionsData : []).filter(promo => {
        if (!promo.isActive) return false;
        if (promo.startDate && now < promo.startDate) return false;
        if (promo.endDate && now > promo.endDate) return false;
        return true;
      });

      // Combinar flores y joyas
      const allProducts = [
        ...((Array.isArray(flowersData) ? flowersData : []).map(p => ({ ...p, type: 'flowers' }))),
        ...((Array.isArray(jewelryData) ? jewelryData : []).map(p => ({ ...p, type: 'jewelry' })))
      ];

      // Para cada producto, buscar si tiene promoción activa
      const productsWithDiscount = allProducts.map(product => {
        const applicablePromos = activePromos.filter(p => {
          // Aplicable a todas
          if (p.applicableTo === 'all') return true;
          
          // Aplicable a tipo (flowers/jewelry)
          if (p.applicableTo === product.type) return true;
          
          // Aplicable a categoría específica
          if (p.applicableTo === 'specific_category' && 
              p.productType === product.type && 
              p.specificCategory === product.category) {
            return true;
          }
          
          return false;
        });

        if (applicablePromos.length === 0) return null;

        // Calcular precio final con todos los descuentos
        let finalPrice = product.price;
        for (const promo of applicablePromos) {
          if (promo.discountType === 'percentage') {
            finalPrice = finalPrice * (1 - promo.discountValue / 100);
          } else if (promo.discountType === 'fixed') {
            finalPrice = finalPrice - promo.discountValue;
          }
        }
        finalPrice = Math.max(0, finalPrice);

        const discount = product.price - finalPrice;
        const discountPercentage = product.price > 0 
          ? ((discount / product.price) * 100).toFixed(1)
          : '0';

        return {
          ...product,
          originalPrice: product.price,
          finalPrice,
          discount,
          discountPercentage,
          promotions: applicablePromos
        };
      }).filter(p => p !== null);

      setDiscountedProducts(productsWithDiscount);
    }
  }, [promotionsData, flowersData, jewelryData]);

  const pageContent = {
    title: 'Ofertas del Mes',
    emoji: '🔥',
    subtitle: '¡Productos con descuento disponibles ahora!',
  };

  const filters = [
    { id: 'todos', name: 'Todas' },
    { id: 'flowers', name: 'Flores' },
    { id: 'jewelry', name: 'Joyas' },
  ];

  const filteredPromos = activeFilter === 'todos'
    ? discountedProducts
    : discountedProducts.filter(p => p.type === activeFilter);

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

        {/* Grid de Productos con Descuento */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
        >
          {filteredPromos.length === 0 ? (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-16 text-gray-500">
              <p className="text-lg">No hay productos en oferta en este momento. ¡Vuelve pronto!</p>
            </div>
          ) : (
            filteredPromos.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden"
              >
                {/* Imagen */}
                <div className="w-full h-64 bg-gradient-to-b from-pink-300 via-purple-200 to-pink-100 flex items-center justify-center overflow-hidden relative">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-8xl">
                      {product.type === 'flowers' ? '🌹' : '💎'}
                    </span>
                  )}
                  
                  {/* Badge de Descuento */}
                  <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg">
                    -{product.discountPercentage}%
                  </div>

                  {/* Badge "EN OFERTA" */}
                  <div className="absolute top-3 left-3 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full font-bold text-xs shadow-lg flex items-center gap-1">
                    <Sparkles size={14} />
                    EN OFERTA
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-gray-800 flex items-center gap-2">
                    <Flower2 className="text-pink-500" size={20} />
                    {product.name}
                  </h3>

                  {product.category && (
                    <p className="text-sm text-gray-500 mb-3">
                      {product.category}
                    </p>
                  )}

                  <p className="text-gray-600 text-sm mb-4">
                    {product.description || 'Producto especial en oferta.'}
                  </p>

                  {/* Promociones que aplican */}
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs font-semibold text-blue-900 mb-2">💰 Promociones aplicadas:</p>
                    <div className="space-y-1">
                      {product.promotions.map((promo, i) => (
                        <p key={i} className="text-xs text-blue-800">
                          • {promo.name} ({promo.discountType === 'percentage' ? `${promo.discountValue}%` : `$${promo.discountValue}`})
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Precios */}
                  <div className="mb-4">
                    <div className="space-y-1">
                      {/* Precio Original (Tachado) */}
                      <div className="text-sm text-gray-400 line-through">
                        ${product.originalPrice.toLocaleString()}
                      </div>
                      
                      {/* Precio Final (Grande y Rojo) */}
                      <div className="text-3xl font-bold text-red-600">
                        ${product.finalPrice.toLocaleString()}
                      </div>
                      
                      {/* Ahorro */}
                      <div className="text-sm text-green-600 font-semibold">
                        💚 Ahorras: ${product.discount.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Botón WhatsApp */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      const message = `Hola! Me interesa cotizar:*${product.name}*\n${product.category ? `Categoría: ${product.category}\n` : ''}Precio: $${product.originalPrice.toLocaleString()}\n *Con descuento: $${product.finalPrice.toLocaleString()}*\n\n¿Me das más información?`;
                      const encodedMessage = encodeURIComponent(message);
                      window.open(`https://api.whatsapp.com/send?phone=56993177866&text=${encodedMessage}`, '_blank');
                    }}
                    className="w-full bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.515" />
                    </svg>
                    ¡Cotizar Descuento!
                  </motion.button>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Mensaje Final */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-center text-gray-600 italic max-w-3xl mx-auto p-8 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl border border-red-200"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles size={20} className="text-red-500" />
            <p className="text-lg font-semibold">¡Ofertas por Tiempo Limitado!</p>
          </div>
          <p>
            ⏰ Los precios y descuentos son válidos mientras haya inventario disponible. Consulta con nuestro equipo en tienda para obtener más detalles.
          </p>
        </motion.div>
      </div>
    </main>
  );
}
