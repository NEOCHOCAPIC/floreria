import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Save, Trash2, Plus, ChevronDown } from 'lucide-react';
import { useFirestoreCollection } from '../../hooks/useFirestoreData';

export default function PromotionsEditor() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [expandedPromotion, setExpandedPromotion] = useState(null);

  // Traer categorías
  const { data: flowerCategoriesData } = useFirestoreCollection('flowerCategories');
  const { data: jewelryCategoriesData } = useFirestoreCollection('jewelryCategories');
  const [flowerCategories, setFlowerCategories] = useState([]);
  const [jewelryCategories, setJewelryCategories] = useState([]);

  const [newPromotion, setNewPromotion] = useState({
    name: '',
    description: '',
    discountType: 'percentage', // percentage or fixed
    discountValue: '',
    applicableTo: 'all', // all, flowers, jewelry, specific_category
    specificCategory: '', // Nombre de categoría específica
    productType: 'flowers', // flowers o jewelry (cuando es específica)
    startDate: '',
    endDate: '',
    isActive: true
  });

  useEffect(() => {
    fetchPromotions();
  }, []);

  useEffect(() => {
    if (flowerCategoriesData) {
      setFlowerCategories(Array.isArray(flowerCategoriesData) ? flowerCategoriesData : []);
    }
  }, [flowerCategoriesData]);

  useEffect(() => {
    if (jewelryCategoriesData) {
      setJewelryCategories(Array.isArray(jewelryCategoriesData) ? jewelryCategoriesData : []);
    }
  }, [jewelryCategoriesData]);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'promotions'));
      const promotionsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPromotions(promotionsList);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      setMessage('❌ Error al cargar promociones: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const addPromotion = async () => {
    if (!newPromotion.name.trim() || !newPromotion.description.trim() || !newPromotion.discountValue) {
      setMessage('❌ Completa todos los campos');
      return;
    }

    if (newPromotion.startDate && newPromotion.endDate && newPromotion.startDate > newPromotion.endDate) {
      setMessage('❌ La fecha de inicio debe ser anterior a la fecha de fin');
      return;
    }

    try {
      setSaving(true);
      
      const promotionData = {
        name: newPromotion.name,
        description: newPromotion.description,
        discountType: newPromotion.discountType,
        discountValue: parseFloat(newPromotion.discountValue),
        applicableTo: newPromotion.applicableTo,
        startDate: newPromotion.startDate,
        endDate: newPromotion.endDate,
        isActive: newPromotion.isActive,
        createdAt: new Date()
      };

      // Si es categoría específica, agrega los campos adicionales
      if (newPromotion.applicableTo === 'specific_category') {
        promotionData.productType = newPromotion.productType;
        promotionData.specificCategory = newPromotion.specificCategory;
      }

      await addDoc(collection(db, 'promotions'), promotionData);

      setNewPromotion({
        name: '',
        description: '',
        discountType: 'percentage',
        discountValue: '',
        applicableTo: 'all',
        specificCategory: '',
        productType: 'flowers',
        startDate: '',
        endDate: '',
        isActive: true
      });

      await fetchPromotions();
      setMessage('✅ Promoción agregada exitosamente');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error adding promotion:', error);
      setMessage('❌ Error: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const deletePromotion = async (promotionId) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta promoción?')) return;

    try {
      setSaving(true);
      await deleteDoc(doc(db, 'promotions', promotionId));
      await fetchPromotions();
      setMessage('✅ Promoción eliminada');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting promotion:', error);
      setMessage('❌ Error: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando promociones...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-purple-900">📊 Gestor de Promociones</h2>

      {/* Mensaje de estado */}
      {message && (
        <div className="mb-4 p-4 bg-gray-100 rounded-lg text-center font-semibold">
          {message}
        </div>
      )}

      {/* Formulario para agregar promoción */}
      <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
        <h3 className="text-xl font-bold mb-4 text-purple-900">Agregar Nueva Promoción</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Nombre */}
          <input
            type="text"
            placeholder="Nombre de la promoción"
            value={newPromotion.name}
            onChange={(e) => setNewPromotion({ ...newPromotion, name: e.target.value })}
            className="px-4 py-2 border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          {/* Tipo de descuento */}
          <select
            value={newPromotion.discountType}
            onChange={(e) => setNewPromotion({ ...newPromotion, discountType: e.target.value })}
            className="px-4 py-2 border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="percentage">Porcentaje (%)</option>
            <option value="fixed">Monto Fijo ($)</option>
          </select>

          {/* Valor de descuento */}
          <input
            type="number"
            placeholder={newPromotion.discountType === 'percentage' ? '20' : '5000'}
            value={newPromotion.discountValue}
            onChange={(e) => setNewPromotion({ ...newPromotion, discountValue: e.target.value })}
            className="px-4 py-2 border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          {/* Aplicable a */}
          <select
            value={newPromotion.applicableTo}
            onChange={(e) => setNewPromotion({ ...newPromotion, applicableTo: e.target.value })}
            className="px-4 py-2 border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Todas las categorías</option>
            <option value="flowers">Solo Flores</option>
            <option value="jewelry">Solo Joyas</option>
            <option value="specific_category">Categoría Específica</option>
          </select>

          {/* Fecha inicio */}
          <input
            type="date"
            value={newPromotion.startDate}
            onChange={(e) => setNewPromotion({ ...newPromotion, startDate: e.target.value })}
            className="px-4 py-2 border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          {/* Selectores de categoría específica (condicionales) */}
          {newPromotion.applicableTo === 'specific_category' && (
            <>
              <select
                value={newPromotion.productType}
                onChange={(e) => setNewPromotion({ ...newPromotion, productType: e.target.value })}
                className="px-4 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50"
              >
                <option value="flowers">Tipo: Flores</option>
                <option value="jewelry">Tipo: Joyas</option>
              </select>

              <select
                value={newPromotion.specificCategory}
                onChange={(e) => setNewPromotion({ ...newPromotion, specificCategory: e.target.value })}
                className="px-4 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50"
              >
                <option value="">Selecciona una categoría...</option>
                {newPromotion.productType === 'flowers' 
                  ? flowerCategories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))
                  : jewelryCategories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))
                }
              </select>
            </>
          )}

          {/* Fecha fin */}
          <input
            type="date"
            value={newPromotion.endDate}
            onChange={(e) => setNewPromotion({ ...newPromotion, endDate: e.target.value })}
            className="px-4 py-2 border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Descripción (full width) */}
        <textarea
          placeholder="Descripción de la promoción"
          value={newPromotion.description}
          onChange={(e) => setNewPromotion({ ...newPromotion, description: e.target.value })}
          rows="2"
          className="w-full px-4 py-2 border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
        />

        {/* Estado activo */}
        <label className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            checked={newPromotion.isActive}
            onChange={(e) => setNewPromotion({ ...newPromotion, isActive: e.target.checked })}
            className="w-5 h-5 rounded"
          />
          <span className="font-semibold text-gray-700">Promoción Activa</span>
        </label>

        <button
          onClick={addPromotion}
          disabled={saving}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 rounded-lg hover:shadow-lg transform hover:scale-105 transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Plus size={20} />
          Agregar Promoción
        </button>
      </div>

      {/* Lista de promociones */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-purple-900 mb-4">
          Promociones Existentes ({promotions.length})
        </h3>

        {promotions.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No hay promociones aún</p>
        ) : (
          promotions.map((promo) => (
            <div key={promo.id} className="border-2 border-purple-200 rounded-lg overflow-hidden bg-white">
              {/* Header de promoción */}
              <button
                onClick={() =>
                  setExpandedPromotion(expandedPromotion === promo.id ? null : promo.id)
                }
                className="w-full p-4 flex items-center justify-between hover:bg-purple-50 transition"
              >
                <div className="flex-1 text-left">
                  <h4 className="font-bold text-lg text-gray-800">{promo.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {promo.discountType === 'percentage' ? `${promo.discountValue}%` : `$${promo.discountValue.toLocaleString()}`} de descuento • {promo.applicableTo}
                    {promo.applicableTo === 'specific_category' && ` (${promo.specificCategory})`}
                  </p>
                  {promo.startDate && (
                    <p className="text-xs text-gray-400 mt-1">
                      {promo.startDate} al {promo.endDate}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      promo.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {promo.isActive ? '✅ Activa' : '⭕ Inactiva'}
                  </span>
                  <ChevronDown
                    size={20}
                    className={`transform transition ${
                      expandedPromotion === promo.id ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Contenido expandido */}
              {expandedPromotion === promo.id && (
                <div className="p-4 bg-purple-50 border-t-2 border-purple-200 space-y-4">
                  <p className="text-gray-700 italic">{promo.description}</p>

                  {/* Botón de eliminar */}
                  <button
                    onClick={() => deletePromotion(promo.id)}
                    disabled={saving}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Trash2 size={18} />
                    Eliminar Promoción
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
