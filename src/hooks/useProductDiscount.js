import { useMemo } from 'react';

/**
 * Hook para calcular el precio final de un producto con descuentos aplicados
 * @param {Object} product - El producto con al menos { price }
 * @param {string} applicableTo - Categoría: 'flowers', 'jewelry', o 'all'
 * @param {Array} allPromotions - Array de promociones activas desde Firestore
 * @returns {Object} Información de precio y descuentos
 */
export const useProductDiscount = (product, applicableTo, allPromotions) => {
  return useMemo(() => {
    if (!product || !product.price) {
      return {
        originalPrice: 0,
        finalPrice: 0,
        discount: 0,
        discountPercentage: '0',
        hasDiscount: false,
        appliedPromotions: []
      };
    }

    // Filtrar promociones activas que aplican a este producto
    const activePromotions = (allPromotions || []).filter(p => {
      if (!p.isActive) return false;
      
      // Validar rango de fechas
      const now = new Date().toISOString().split('T')[0];
      if (p.startDate && now < p.startDate) return false;
      if (p.endDate && now > p.endDate) return false;
      
      // Validar si aplica a esta categoría
      return p.applicableTo === 'all' || p.applicableTo === applicableTo;
    });

    // Calcular precio final aplicando todos los descuentos
    let finalPrice = product.price;
    
    for (const promo of activePromotions) {
      if (promo.discountType === 'percentage') {
        // Descuento porcentual
        finalPrice = finalPrice * (1 - promo.discountValue / 100);
      } else if (promo.discountType === 'fixed') {
        // Descuento de monto fijo
        finalPrice = finalPrice - promo.discountValue;
      }
    }

    // Asegurar que el precio no sea negativo
    finalPrice = Math.max(0, finalPrice);

    const discount = product.price - finalPrice;
    const discountPercentage = product.price > 0 
      ? ((discount / product.price) * 100).toFixed(1)
      : '0';

    return {
      originalPrice: product.price,
      finalPrice: finalPrice,
      discount: discount,
      discountPercentage: discountPercentage,
      hasDiscount: activePromotions.length > 0,
      appliedPromotions: activePromotions
    };
  }, [product, applicableTo, allPromotions]);
};
