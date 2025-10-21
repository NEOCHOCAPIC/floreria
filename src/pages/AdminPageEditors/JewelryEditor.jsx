import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query } from 'firebase/firestore';
import { Save, Trash2, Plus, ChevronDown } from 'lucide-react';

export default function JewelryEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [jewelry, setJewelry] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newJewel, setNewJewel] = useState({
    name: '',
    category: '',
    price: '',
    imageUrl: '',
    description: ''
  });
  const [newCategory, setNewCategory] = useState('');
  const [expandedJewel, setExpandedJewel] = useState(null);

  useEffect(() => {
    fetchJewelry();
    fetchCategories();
  }, []);

  const fetchJewelry = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'jewelry'));
      const querySnapshot = await getDocs(q);
      const jewelryList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setJewelry(jewelryList);
    } catch (error) {
      console.error('Error fetching jewelry:', error);
      setMessage('❌ Error al cargar joyas: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'jewelryCategories'));
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
      await addDoc(collection(db, 'jewelryCategories'), {
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

  const addJewel = async () => {
    if (!newJewel.name || !newJewel.category || !newJewel.price || !newJewel.imageUrl) {
      setMessage('❌ Completa todos los campos');
      return;
    }

    try {
      setSaving(true);
      await addDoc(collection(db, 'jewelry'), {
        ...newJewel,
        price: parseFloat(newJewel.price),
        createdAt: new Date()
      });
      setNewJewel({ name: '', category: '', price: '', imageUrl: '', description: '' });
      await fetchJewelry();
      setMessage('✅ Joya agregada exitosamente');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Error al agregar joya: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const updateJewel = async (id, updatedData) => {
    try {
      setSaving(true);
      const jewelRef = doc(db, 'jewelry', id);
      await updateDoc(jewelRef, {
        ...updatedData,
        price: parseFloat(updatedData.price)
      });
      await fetchJewelry();
      setMessage('✅ Joya actualizada exitosamente');
      setExpandedJewel(null);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Error al actualizar joya: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteJewel = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta joya?')) return;

    try {
      setSaving(true);
      await deleteDoc(doc(db, 'jewelry', id));
      await fetchJewelry();
      setMessage('✅ Joya eliminada exitosamente');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Error al eliminar joya: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Cargando joyas...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 rounded-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Gestionar Joyas</h2>

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
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
          />
          <button
            onClick={addCategory}
            disabled={saving}
            className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition"
          >
            <Plus size={20} />
            Agregar
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <span key={cat.id} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
              {cat.name}
            </span>
          ))}
        </div>
      </div>

      {/* Sección Agregar Joya */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Agregar Nueva Joya</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
            <input
              type="text"
              value={newJewel.name}
              onChange={(e) => setNewJewel({ ...newJewel, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
            <select
              value={newJewel.category}
              onChange={(e) => setNewJewel({ ...newJewel, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
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
                value={newJewel.price}
                onChange={(e) => setNewJewel({ ...newJewel, price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">URL de Imagen</label>
              <input
                type="text"
                value={newJewel.imageUrl}
                onChange={(e) => setNewJewel({ ...newJewel, imageUrl: e.target.value })}
                placeholder="https://..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
            <textarea
              value={newJewel.description}
              onChange={(e) => setNewJewel({ ...newJewel, description: e.target.value })}
              rows="2"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          {newJewel.imageUrl && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Vista Previa:</p>
              <img src={newJewel.imageUrl} alt="preview" className="h-40 object-cover rounded-lg" />
            </div>
          )}

          <button
            onClick={addJewel}
            disabled={saving}
            className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white font-bold py-2 px-6 rounded-lg flex items-center justify-center gap-2 transition"
          >
            <Save size={20} />
            Agregar Joya
          </button>
        </div>
      </div>

      {/* Lista de Joyas */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Joyas Existentes ({jewelry.length})</h3>
        <div className="space-y-4">
          {jewelry.map(jewel => (
            <div key={jewel.id} className="border border-gray-200 rounded-lg p-4">
              <button
                onClick={() => setExpandedJewel(expandedJewel === jewel.id ? null : jewel.id)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-4 text-left">
                  {jewel.imageUrl && (
                    <img src={jewel.imageUrl} alt={jewel.name} className="h-12 w-12 object-cover rounded" />
                  )}
                  <div>
                    <h4 className="font-bold text-gray-800">{jewel.name}</h4>
                    <p className="text-sm text-gray-600">{jewel.category} • ${jewel.price}</p>
                  </div>
                </div>
                <ChevronDown
                  size={20}
                  className={`text-gray-600 transition ${expandedJewel === jewel.id ? 'rotate-180' : ''}`}
                />
              </button>

              {expandedJewel === jewel.id && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                    <input
                      type="text"
                      defaultValue={jewel.name}
                      onChange={(e) => (jewel.tempName = e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                    <select
                      defaultValue={jewel.category}
                      onChange={(e) => (jewel.tempCategory = e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
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
                        defaultValue={jewel.price}
                        onChange={(e) => (jewel.tempPrice = e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">URL de Imagen</label>
                      <input
                        type="text"
                        defaultValue={jewel.imageUrl}
                        onChange={(e) => (jewel.tempImageUrl = e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                    <textarea
                      defaultValue={jewel.description}
                      onChange={(e) => (jewel.tempDescription = e.target.value)}
                      rows="2"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        updateJewel(jewel.id, {
                          name: jewel.tempName || jewel.name,
                          category: jewel.tempCategory || jewel.category,
                          price: jewel.tempPrice || jewel.price,
                          imageUrl: jewel.tempImageUrl || jewel.imageUrl,
                          description: jewel.tempDescription || jewel.description
                        })
                      }
                      disabled={saving}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-2 px-6 rounded-lg transition"
                    >
                      Guardar Cambios
                    </button>
                    <button
                      onClick={() => deleteJewel(jewel.id)}
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
