import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const ReturnItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  quantity: { type: Number, required: true, min: 1 },
  reason: { type: String, default: 'unspecified' }
});

const ReturnSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    items: { type: [ReturnItemSchema], default: [] },
    status: { type: String, enum: ['requested', 'approved', 'rejected', 'received', 'refunded'], default: 'requested' },
    notes: { type: String }
  },
  { timestamps: true }
);

export default model('Return', ReturnSchema);

