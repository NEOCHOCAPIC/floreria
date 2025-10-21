import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query } from 'firebase/firestore';
import { Save, Trash2, Plus, ChevronDown } from 'lucide-react';

export default function FlowersEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [flowers, setFlowers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newFlower, setNewFlower] = useState({
    name: '',
    category: '',
    price: '',
    imageUrl: '',
    description: ''
  });
  const [newCategory, setNewCategory] = useState('');
  const [expandedFlower, setExpandedFlower] = useState(null);

  useEffect(() => {
    fetchFlowers();
    fetchCategories();
  }, []);

  const fetchFlowers = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'flowers'));
      const querySnapshot = await getDocs(q);
      const flowersList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFlowers(flowersList);
    } catch (error) {
      console.error('Error fetching flowers:', error);
      setMessage('❌ Error al cargar flores: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'flowerCategories'));
      const categoriesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCategories(categoriesList);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const addCategory = async () => {
    if (!newCategory.trim()) {
      setMessage('❌ Ingresa un nombre para la categoría');
      return;
    }

    try {
      setSaving(true);
      await addDoc(collection(db, 'flowerCategories'), {
        name: newCategory,
        createdAt: new Date()
      });
      setNewCategory('');
      await fetchCategories();
      setMessage('✅ Categoría agregada exitosamente');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Error al agregar categoría: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const addFlower = async () => {
    if (!newFlower.name || !newFlower.category || !newFlower.price || !newFlower.imageUrl) {
      setMessage('❌ Completa todos los campos');
      return;
    }

    try {
      setSaving(true);
      await addDoc(collection(db, 'flowers'), {
        ...newFlower,
        price: parseFloat(newFlower.price),
        createdAt: new Date()
      });
      setNewFlower({ name: '', category: '', price: '', imageUrl: '', description: '' });
      await fetchFlowers();
      setMessage('✅ Flor agregada exitosamente');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Error al agregar flor: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const updateFlower = async (id, updatedData) => {
    try {
      setSaving(true);
      const flowerRef = doc(db, 'flowers', id);
      await updateDoc(flowerRef, {
        ...updatedData,
        price: parseFloat(updatedData.price)
      });
      await fetchFlowers();
      setMessage('✅ Flor actualizada exitosamente');
      setExpandedFlower(null);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Error al actualizar flor: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteFlower = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta flor?')) return;

    try {
      setSaving(true);
      await deleteDoc(doc(db, 'flowers', id));
      await fetchFlowers();
      setMessage('✅ Flor eliminada exitosamente');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Error al eliminar flor: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Cargando flores...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 rounded-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Gestionar Flores</h2>

      {/* Mensajes */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
        >
          {message}
        </div>
      )}

      {/* Sección Categorías */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Categorías</h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Nueva categoría..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
          />
          <button
            onClick={addCategory}
            disabled={saving}
            className="bg-pink-500 hover:bg-pink-600 disabled:bg-gray-400 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition"
          >
            <Plus size={20} />
            Agregar
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <span key={cat.id} className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm font-medium">
              {cat.name}
            </span>
          ))}
        </div>
      </div>

      {/* Sección Agregar Flor */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Agregar Nueva Flor</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
            <input
              type="text"
              value={newFlower.name}
              onChange={(e) => setNewFlower({ ...newFlower, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
            <select
              value={newFlower.category}
              onChange={(e) => setNewFlower({ ...newFlower, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
            >
              <option value="">Selecciona una categoría</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Precio ($)</label>
              <input
                type="number"
                value={newFlower.price}
                onChange={(e) => setNewFlower({ ...newFlower, price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">URL de Imagen</label>
              <input
                type="text"
                value={newFlower.imageUrl}
                onChange={(e) => setNewFlower({ ...newFlower, imageUrl: e.target.value })}
                placeholder="https://..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
            <textarea
              value={newFlower.description}
              onChange={(e) => setNewFlower({ ...newFlower, description: e.target.value })}
              rows="2"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
            />
          </div>

          {newFlower.imageUrl && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Vista Previa:</p>
              <img src={newFlower.imageUrl} alt="preview" className="h-40 object-cover rounded-lg" />
            </div>
          )}

          <button
            onClick={addFlower}
            disabled={saving}
            className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-gray-400 text-white font-bold py-2 px-6 rounded-lg flex items-center justify-center gap-2 transition"
          >
            <Save size={20} />
            Agregar Flor
          </button>
        </div>
      </div>

      {/* Lista de Flores */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Flores Existentes ({flowers.length})</h3>
        <div className="space-y-4">
          {flowers.map(flower => (
            <div key={flower.id} className="border border-gray-200 rounded-lg p-4">
              <button
                onClick={() => setExpandedFlower(expandedFlower === flower.id ? null : flower.id)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-4 text-left">
                  {flower.imageUrl && (
                    <img src={flower.imageUrl} alt={flower.name} className="h-12 w-12 object-cover rounded" />
                  )}
                  <div>
                    <h4 className="font-bold text-gray-800">{flower.name}</h4>
                    <p className="text-sm text-gray-600">{flower.category} • ${flower.price}</p>
                  </div>
                </div>
                <ChevronDown
                  size={20}
                  className={`text-gray-600 transition ${expandedFlower === flower.id ? 'rotate-180' : ''}`}
                />
              </button>

              {expandedFlower === flower.id && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                    <input
                      type="text"
                      defaultValue={flower.name}
                      onChange={(e) => (flower.tempName = e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                    <select
                      defaultValue={flower.category}
                      onChange={(e) => (flower.tempCategory = e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Precio</label>
                      <input
                        type="number"
                        defaultValue={flower.price}
                        onChange={(e) => (flower.tempPrice = e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">URL de Imagen</label>
                      <input
                        type="text"
                        defaultValue={flower.imageUrl}
                        onChange={(e) => (flower.tempImageUrl = e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                    <textarea
                      defaultValue={flower.description}
                      onChange={(e) => (flower.tempDescription = e.target.value)}
                      rows="2"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        updateFlower(flower.id, {
                          name: flower.tempName || flower.name,
                          category: flower.tempCategory || flower.category,
                          price: flower.tempPrice || flower.price,
                          imageUrl: flower.tempImageUrl || flower.imageUrl,
                          description: flower.tempDescription || flower.description
                        })
                      }
                      disabled={saving}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-2 px-6 rounded-lg transition"
                    >
                      Guardar Cambios
                    </button>
                    <button
                      onClick={() => deleteFlower(flower.id)}
                      disabled={saving}
                      className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition"
                    >
                      <Trash2 size={16} />
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
