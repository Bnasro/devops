import mongoose from 'mongoose';
const { Schema, model, Types } = mongoose;

const priceSchema = new Schema({
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'TND' }
}, { _id: false });

const variantSchema = new Schema({
  sku: { type: String, trim: true },
  attributes: { type: Map, of: String },
  price: priceSchema,
  stock: { type: Number, default: 0, min: 0 }
}, { _id: false });

const productSchema = new Schema({
  name: { type: String, required: true, trim: true, index: true },
  slug: { type: String, trim: true, unique: true, index: true },
  description: { type: String },
  price: priceSchema,
  images: [{ type: String }],
  videoUrl: { type: String },
  categories: [{ type: Types.ObjectId, ref: 'Category' }],
  variants: [variantSchema],
  stock: { type: Number, default: 0, min: 0 },
  active: { type: Boolean, default: true }
}, { timestamps: true });

export default model('Product', productSchema);







