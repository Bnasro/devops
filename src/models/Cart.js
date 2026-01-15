import mongoose from 'mongoose';
const { Schema, model, Types } = mongoose;

const cartItemSchema = new Schema({
  product: { type: Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  priceAmount: { type: Number, required: true },
  currency: { type: String, default: 'TND' },
  quantity: { type: Number, default: 1, min: 1 }
}, { _id: false });

const cartSchema = new Schema({
  user: { type: Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [cartItemSchema],
  coupon: { type: String, default: null }
}, { timestamps: true });

cartSchema.methods.totalAmount = function () {
  return this.items.reduce((sum, it) => sum + it.priceAmount * it.quantity, 0);
};

export default model('Cart', cartSchema);







