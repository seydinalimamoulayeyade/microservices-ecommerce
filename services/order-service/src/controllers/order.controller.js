const Order = require('../models/Order');
const ApiError = require('../utils/ApiError');
const { getProduct } = require('../services/productService');

const VALID_STATUS = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

// POST /orders  (JWT requis)
const createOrder = async (req, res, next) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      throw new ApiError(400, 'items est requis et doit contenir au moins un article');
    }

    const orderItems = [];
    let totalAmount = 0;

    // Vérification du stock auprès du Product Service
    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity < 1) {
        throw new ApiError(400, 'Chaque article doit avoir un productId et une quantity >= 1');
      }

      const product = await getProduct(item.productId);

      if (product.stock < item.quantity) {
        throw new ApiError(
          400,
          `Stock insuffisant pour "${product.name}" (demandé ${item.quantity}, disponible ${product.stock})`
        );
      }

      orderItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      });
      totalAmount += product.price * item.quantity;
    }

    const order = await Order.create({
      userId: req.user.id,
      items: orderItems,
      totalAmount: Math.round(totalAmount * 100) / 100,
    });

    res.status(201).json({ status: 'success', data: order });
  } catch (err) {
    next(err);
  }
};

// GET /orders  (mes commandes)
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', results: orders.length, data: orders });
  } catch (err) {
    next(err);
  }
};

// GET /orders/:id
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) throw new ApiError(404, 'Commande introuvable');

    // Seul le propriétaire (ou un admin) peut consulter la commande
    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      throw new ApiError(403, 'Accès refusé à cette commande');
    }

    res.status(200).json({ status: 'success', data: order });
  } catch (err) {
    next(err);
  }
};

// PATCH /orders/:id/status
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status || !VALID_STATUS.includes(status)) {
      throw new ApiError(400, `status invalide. Valeurs autorisées : ${VALID_STATUS.join(', ')}`);
    }

    const order = await Order.findById(req.params.id);
    if (!order) throw new ApiError(404, 'Commande introuvable');

    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      throw new ApiError(403, 'Accès refusé à cette commande');
    }

    order.status = status;
    await order.save();

    res.status(200).json({ status: 'success', data: order });
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder, getMyOrders, getOrderById, updateOrderStatus };
