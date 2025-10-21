import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save } from 'lucide-react';
import { db } from '../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function HomeEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    mainSlogan: '',
    mainDescription: '',
    quickViewCards: [
      { text: '', imageUrl: '', link: '' },
      { text: '', imageUrl: '', link: '' },
      { text: '', imageUrl: '', link: '' }
    ]
  });

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const docRef = doc(db, 'pageContent', 'home');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setFormData(docSnap.data());
      }
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCardChange = (idx, field, value) => {
    const newCards = [...formData.quickViewCards];
    newCards[idx][field] = value;
    setFormData(prev => ({ ...prev, quickViewCards: newCards }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const docRef = doc(db, 'pageContent', 'home');
      await setDoc(docRef, formData, { merge: true });
      setMessage('✅ Página actualizada exitosamente');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving home data:', error);
      setMessage('❌ Error al guardar los cambios: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Gestionar Página de Inicio</h2>
          <p className="text-gray-600 mt-1">Edita el contenido principal de tu página de inicio</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-lg transition flex items-center gap-2"
        >
          <Save size={20} />
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </motion.button>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg font-bold text-center ${
            message.includes('✅') 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}
        >
          {message}
        </motion.div>
      )}

      {/* Sección Principal */}
      <div className="bg-white p-8 rounded-2xl shadow-lg space-y-6">
        <h3 className="text-2xl font-bold text-gray-800">Sección Principal (Hero)</h3>
        
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Eslogan Principal</label>
          <input
            type="text"
            name="mainSlogan"
            value={formData.mainSlogan}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Ej: Belleza en Cada Detalle"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Descripción Principal</label>
          <textarea
            name="mainDescription"
            value={formData.mainDescription}
            onChange={handleInputChange}
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Ej: Creamos momentos inolvidables..."
          />
        </div>
      </div>

      {/* Tarjetas Visuales Rápidas */}
      <div className="bg-white p-8 rounded-2xl shadow-lg space-y-6">
        <h3 className="text-2xl font-bold text-gray-800">Sección Visual Rápida</h3>
        <p className="text-gray-600">3 tarjetas que aparecen en la página de inicio</p>

        <div className="space-y-8">
          {formData.quickViewCards.map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-gray-200 p-6 rounded-lg space-y-4"
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-gray-800">Tarjeta {idx + 1}</h4>
                <span className="text-xs bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                  {idx === 0 ? 'Joyería' : idx === 1 ? 'Flores' : 'Promoción'}
                </span>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Texto de la Tarjeta</label>
                <input
                  type="text"
                  value={card.text}
                  onChange={(e) => handleCardChange(idx, 'text', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ej: Joyas Exclusivas"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">URL de la Imagen</label>
                <div className="space-y-2">
                  <input
                    type="url"
                    value={card.imageUrl}
                    onChange={(e) => handleCardChange(idx, 'imageUrl', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="https://images.unsplash.com/..."
                  />
                  {card.imageUrl && (
                    <div className="relative">
                      <img
                        src={card.imageUrl}
                        alt={`Preview ${idx}`}
                        className="h-32 w-full object-cover rounded-lg"
                      />
                      <button
                        onClick={() => handleCardChange(idx, 'imageUrl', '')}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-bold transition"
                      >
                        Borrar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Botón de Guardar Final */}
      <div className="flex gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          disabled={saving}
          className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
        >
          <Save size={20} />
          {saving ? 'Guardando...' : 'Guardar Todos los Cambios'}
        </motion.button>
      </div>
    </motion.div>
  );
}
