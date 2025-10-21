import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History, PlayCircle, X } from 'lucide-react';
import { useFirestoreDoc } from '../hooks/useFirestoreData';

export default function QuienesSomos() {
  const { data: pageData } = useFirestoreDoc('pageContent', 'quienesSomos');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [pageContent, setPageContent] = useState({
    title: 'Nuestra Esencia',
    subtitle: 'Descubre quiénes somos, qué nos inspira y cómo damos vida a cada detalle.',
    introText: '',
    missionText: '',
    mapUrl: '',
    values: [],
    videos: []
  });

  useEffect(() => {
    if (pageData) {
      setPageContent(pageData);
    }
  }, [pageData]);

  const videos = pageContent.videos || [];
  const values = pageContent.values || [];

  const cardVariants = {
    offscreen: { y: 50, opacity: 0 },
    onscreen: { y: 0, opacity: 1, transition: { type: 'spring', duration: 0.8 } }
  };

  return (
    <main className="flex-grow">
      <div className="bg-gradient-to-b from-purple-50 via-pink-50 to-blue-50">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center py-16 md:py-24"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-transparent">
            {pageContent.title}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {pageContent.subtitle}
          </p>
        </motion.div>

        {/* Contenido Principal */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Intro */}
          <motion.section
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ once: true, amount: 0.3 }}
            variants={cardVariants}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <p className="text-gray-700 leading-relaxed text-lg">
              {pageContent.introText}
            </p>
          </motion.section>

          {/* Valores */}
          <motion.section
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ once: true, amount: 0.3 }}
            className="mb-20"
          >
            <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">Nuestros Valores</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((value, idx) => (
                <motion.div
                  key={value.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-all"
                >
                  <div className="text-6xl mb-4">{value.icon}</div>
                  <h3 className="text-2xl font-bold mb-2 text-gray-800">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Videos */}
          <motion.section
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ once: true, amount: 0.3 }}
            className="mb-20"
          >
            <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">Nuestras Historias</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {videos.map((video, idx) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex flex-col"
                >
                  <motion.div
                    onClick={() => setSelectedVideo(video)}
                    whileHover={{ scale: 1.05 }}
                    className="cursor-pointer group relative rounded-2xl overflow-hidden shadow-lg w-full h-56 transform hover:-translate-y-2 transition-all flex items-center justify-center"
                  >
                    {/* Miniatura de YouTube */}
                    {(() => {
                      // Extraer el ID del video de la URL tipo https://www.youtube.com/embed/VIDEO_ID
                      const match = video.videoUrl?.match(/embed\/([\w-]+)/);
                      const videoId = match ? match[1] : null;
                      const thumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : undefined;
                      return thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={video.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500" />
                      );
                    })()}
                    <div className="absolute inset-0 flex items-center justify-center transition-all">
                      <PlayCircle className="text-white text-opacity-80 group-hover:text-opacity-100 group-hover:scale-110 transition-all" size={64} />
                    </div>
                  </motion.div>
                  <div className="bg-white p-4 rounded-b-2xl flex-grow shadow-lg">
                    <h3 className="font-bold text-lg text-gray-800">{video.title}</h3>
                    <p className="text-sm text-gray-600 mt-2">{video.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Misión y Mapa */}
          <motion.section
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ once: true, amount: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16"
          >
            <motion.div
              variants={cardVariants}
              initial="offscreen"
              whileInView="onscreen"
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <History className="text-purple-500" size={32} />
                Nuestra Misión
              </h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                {pageContent.missionText}
              </p>
            </motion.div>

            <motion.div
              variants={cardVariants}
              initial="offscreen"
              whileInView="onscreen"
              viewport={{ once: true }}
              className="h-80 rounded-2xl overflow-hidden shadow-2xl"
            >
              <iframe
                src={pageContent.mapUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación de la tienda"
              ></iframe>
            </motion.div>
          </motion.section>
        </div>
      </div>

      {/* Modal de Video */}
      {selectedVideo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl max-w-3xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gray-900 p-6 flex justify-between items-center border-b border-gray-700">
              <h3 className="text-white text-xl font-bold">{selectedVideo.title}</h3>
              <button
                onClick={() => setSelectedVideo(null)}
                className="text-gray-400 hover:text-white transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Video */}
            <div className="aspect-video bg-black">
              <iframe
                src={selectedVideo.videoUrl}
                title="Video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>

            {/* Descripción */}
            <div className="p-6 border-t border-gray-700">
              <p className="text-gray-300 text-base">
                {selectedVideo.description}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </main>
  );
}
