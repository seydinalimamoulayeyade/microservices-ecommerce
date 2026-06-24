const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Le nom du produit est requis'],
      trim: true,
      maxlength: [120, 'Le nom ne peut dépasser 120 caractères'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Le prix est requis'],
      min: [0, 'Le prix ne peut être négatif'],
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Le stock ne peut être négatif'],
    },
    category: {
      type: String,
      trim: true,
      default: 'general',
      lowercase: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
