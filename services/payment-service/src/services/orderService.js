const BASE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3003';

/**
 * Notifie l'Order Service du résultat du paiement (best-effort).
 * Relaie le token de l'utilisateur pour passer le contrôle de propriété.
 * @returns {Promise<boolean>} true si la mise à jour a réussi
 */
const updateOrderStatus = async (orderId, status, token) => {
  try {
    const response = await fetch(`${BASE_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    return response.ok;
  } catch (e) {
    console.warn('⚠️  Notification Order Service échouée :', e.message);
    return false;
  }
};

module.exports = { updateOrderStatus };
