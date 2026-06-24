const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');

// GET /products  (filtres optionnels : ?category=...&search=...)
const getAllProducts = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const filter = {};
    if (category) filter.category = category.toLowerCase();
    if (search) filter.name = { $regex: search, $options: 'i' };

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', results: products.length, data: products });
  } catch (err) {
    next(err);
  }
};

// GET /products/:id
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) throw new ApiError(404, 'Produit introuvable');
    res.status(200).json({ status: 'success', data: product });
  } catch (err) {
    next(err);
  }
};

// POST /products  (admin)
const createProduct = async (req, res, next) => {
  try {
    const { name, price } = req.body;
    if (!name || price === undefined) {
      throw new ApiError(400, 'name et price sont requis');
    }
    const product = await Product.create(req.body);
    res.status(201).json({ status: 'success', data: product });
  } catch (err) {
    next(err);
  }
};

// PUT /products/:id  (admin)
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) throw new ApiError(404, 'Produit introuvable');
    res.status(200).json({ status: 'success', data: product });
  } catch (err) {
    next(err);
  }
};

// DELETE /products/:id  (admin)
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) throw new ApiError(404, 'Produit introuvable');
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
