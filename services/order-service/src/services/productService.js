const ApiError = require('../utils/ApiError');

const BASE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002';

/**
 * Récupère un produit auprès du Product Service.
 * @param {string} productId
 * @returns {Promise<object>} le produit
 * @throws {ApiError} 400 si introuvable, 503 si le service est injoignable
 */
const getProduct = async (productId) => {
  let response;
  try {
    response = await fetch(`${BASE_URL}/products/${productId}`);
  } catch (e) {
    throw new ApiError(503, 'Product Service injoignable');
  }

  if (response.status === 404) {
    throw new ApiError(400, `Produit introuvable : ${productId}`);
  }
  if (!response.ok) {
    throw new ApiError(502, 'Réponse invalide du Product Service');
  }

  const body = await response.json();
  return body.data;
};

module.exports = { getProduct };
