import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const WishlistItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  addedAt: { type: Date, default: Date.now }
});

const WishlistSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: { type: [WishlistItemSchema], default: [] }
  },
  { timestamps: true }
);

export default model('Wishlist', WishlistSchema);

