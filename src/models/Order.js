import mongoose from 'mongoose';
const { Schema, model, Types } = mongoose;

const orderItemSchema = new Schema({
  product: { type: Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  priceAmount: { type: Number, required: true },
  currency: { type: String, default: 'TND' },
  quantity: { type: Number, required: true }
}, { _id: false });

const orderSchema = new Schema({
  user: { type: Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  currency: { type: String, default: 'TND' },
  shippingAddress: {
    label: String,
    fullName: String,
    phone: String,
    line1: String,
    line2: String,
    city: String,
    country: String,
    postalCode: String
  },
  paymentSummary: {
    brand: String,
    last4: String,
    holder: String
  },
  status: { type: String, enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  payment: { type: String, default: 'cash_on_delivery' }
}, { timestamps: true });

export default model('Order', orderSchema);



