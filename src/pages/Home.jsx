import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flower2, Gem, ArrowRight, Tags } from 'lucide-react';
import { useFirestoreDoc } from '../hooks/useFirestoreData';

export default function Home() {
  const { data: homeData } = useFirestoreDoc('pageContent', 'home');
  const [homeContent, setHomeContent] = useState({
    mainSlogan: "Belleza en Cada Detalle",
    mainDescription: "Creamos momentos inolvidables con joyas exclusivas y arreglos florales que expresan tus sentimientos más profundos.",
    quickViewCards: [
      {
        text: "",
        imageUrl: "",
        link: ""
      },
      {
        text: "",
        imageUrl: "",
        link: ""
      },
      {
        text: "",
        imageUrl: "",
        link: ""
      }
    ]
  });

  // Actualizar con datos de Firestore cuando estén disponibles
  useEffect(() => {
    if (homeData) {
      setHomeContent(homeData);
    }
  }, [homeData]);

  return (
    <main className="flex-grow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center py-16 md:py-24"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            {homeContent.mainSlogan}
          </h1>

          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-12">
            {homeContent.mainDescription}
          </p>

          {/* Botones de Acción */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/flores">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 px-8 rounded-full transition transform flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Flower2 size={20} />
                Ver Flores
                <ArrowRight size={16} />
              </motion.button>
            </Link>
            <Link to="/joyeria">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-8 rounded-full transition transform flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Gem size={20} />
                Ver Joyas
                <ArrowRight size={16} />
              </motion.button>
            </Link>
          </div>
        </motion.section>

        {/* Categories Grid */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="py-16 md:py-24"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {homeContent.quickViewCards.map((card, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05 }}
                className="relative group cursor-pointer rounded-2xl overflow-hidden h-56 md:h-64 shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <img
                  src={card.imageUrl}
                  alt={card.text}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${
                  idx === 0 ? 'from-amber-900 to-amber-700' : 
                  idx === 1 ? 'from-red-600 to-red-500' : 
                  'from-red-900 to-red-800'
                } opacity-60 group-hover:opacity-40 transition-opacity duration-300`}></div>
                <div className="absolute inset-0 flex items-end p-6">
                  <div className="w-full">
                    <h3 className="text-white text-2xl font-bold flex items-center gap-2">
                      {idx === 0 && <Gem size={24} />}
                      {idx === 1 && <Flower2 size={24} />}
                      {card.text}
                    </h3>
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Link to={card.link}>
                    <button className="bg-white text-gray-900 font-bold py-2 px-6 rounded-full hover:bg-gray-100 transition">
                      Ver más →
                    </button>
                  </Link>
                </div>
                {idx === 2 && (
                  <div className="absolute top-4 right-4 bg-orange-500 text-white rounded-full p-3 text-xl shadow-lg">
                    <Tags size={24} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* About Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="bg-gradient-to-r from-purple-900 via-purple-800 to-blue-900 rounded-3xl p-8 md:p-12 mb-16 text-white"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
            Quiénes Somos
          </h2>
          <p className="text-lg text-center max-w-3xl mx-auto mb-8 text-gray-200">
            Somos una empresa familiar con más de 20 años de experiencia, dedicada a crear momentos especiales a través de joyas únicas y arreglos florales espectaculares. Cada pieza cuenta una historia, cada ramo transmite un sentimiento.
          </p>
          <div className="text-center">
            <Link to="/quienes-somos">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="bg-white text-purple-600 font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition flex items-center justify-center gap-2 mx-auto"
              >
                Conoce nuestra historia
                <ArrowRight size={20} />
              </motion.button>
            </Link>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
