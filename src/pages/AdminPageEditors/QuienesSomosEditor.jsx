import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Save } from 'lucide-react';

export default function QuienesSomosEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    title: 'Nuestra Esencia',
    subtitle: 'Descubre quiénes somos, qué nos inspira y cómo damos vida a cada detalle.',
    introText: '',
    missionText: '',
    mapUrl: '',
    values: [
      { title: 'Calidad Premium', description: '', icon: '⭐' },
      { title: 'Diseño Innovador', description: '', icon: '🎨' },
      { title: 'Servicio Personalizado', description: '', icon: '💝' }
    ],
    videos: [
      { title: '', description: '', videoUrl: '' },
      { title: '', description: '', videoUrl: '' },
      { title: '', description: '', videoUrl: '' }
    ]
  });

  useEffect(() => {
    fetchQuienesSomosData();
  }, []);

  const fetchQuienesSomosData = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, 'pageContent', 'quienesSomos');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setFormData(docSnap.data());
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleValueChange = (idx, field, value) => {
    setFormData(prev => ({
      ...prev,
      values: prev.values.map((v, i) => i === idx ? { ...v, [field]: value } : v)
    }));
  };

  const handleVideoChange = (idx, field, value) => {
    setFormData(prev => ({
      ...prev,
      videos: prev.videos.map((v, i) => i === idx ? { ...v, [field]: value } : v)
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const docRef = doc(db, 'pageContent', 'quienesSomos');
      await setDoc(docRef, formData, { merge: true });
      setMessage('✅ Página actualizada exitosamente');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Error al guardar los cambios: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 rounded-lg">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Gestionar "Quiénes Somos"</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition"
        >
          <Save size={20} />
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      {/* Mensajes de éxito/error */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
        >
          {message}
        </div>
      )}

      <div className="space-y-8">
        {/* Título y Subtítulo */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Encabezado Principal</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subtítulo</label>
              <input
                type="text"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Contenido Principal</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Texto de Introducción</label>
              <textarea
                name="introText"
                value={formData.introText}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nuestra Misión</label>
              <textarea
                name="missionText"
                value={formData.missionText}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">URL del Mapa (Embed)</label>
              <textarea
                name="mapUrl"
                value={formData.mapUrl}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Valores */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Nuestros Valores</h3>
          <div className="space-y-6">
            {formData.values.map((value, idx) => (
              <div key={idx} className="border border-gray-200 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ícono</label>
                    <input
                      type="text"
                      value={value.icon}
                      onChange={(e) => handleValueChange(idx, 'icon', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-center text-2xl"
                      maxLength="2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                    <input
                      type="text"
                      value={value.title}
                      onChange={(e) => handleValueChange(idx, 'title', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                  <textarea
                    value={value.description}
                    onChange={(e) => handleValueChange(idx, 'description', e.target.value)}
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Videos */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Videos</h3>
          <div className="space-y-6">
            {formData.videos.map((video, idx) => (
              <div key={idx} className="border border-gray-200 p-4 rounded-lg">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Título del Video</label>
                    <input
                      type="text"
                      value={video.title}
                      onChange={(e) => handleVideoChange(idx, 'title', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Descripción del Video</label>
                    <textarea
                      value={video.description}
                      onChange={(e) => handleVideoChange(idx, 'description', e.target.value)}
                      rows="2"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">URL del Video (Embed de YouTube)</label>
                    <input
                      type="text"
                      value={video.videoUrl}
                      onChange={(e) => handleVideoChange(idx, 'videoUrl', e.target.value)}
                      placeholder="https://www.youtube.com/embed/..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Botón guardar al final */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 transition"
        >
          <Save size={20} />
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </div>
  );
}
