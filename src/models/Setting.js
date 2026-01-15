import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const SettingSchema = new Schema(
  {
    _id: { type: String, default: 'global' },
    storeName: { type: String, default: 'nasr E‑commerce' },
    currency: { type: String, default: 'TND' },
    supportEmail: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    address: {
      line1: { type: String, default: '' },
      city: { type: String, default: '' },
      country: { type: String, default: 'TN' },
      postalCode: { type: String, default: '' }
    },
    taxIncluded: { type: Boolean, default: true },
    orderPrefix: { type: String, default: 'ORD' },
    languages: { type: [String], default: ['fr','en','ar'] },
    shipping: {
      baseFee: { type: String, default: '' },
      freeThreshold: { type: String, default: '' },
      eta: { type: String, default: '2-5 jours' },
      local: { type: Boolean, default: true },
      international: { type: Boolean, default: false },
      zones: [
        new Schema(
          {
            name: { type: String, required: true },
            countries: { type: String, default: '' },
            fee: { type: String, default: '' }
          },
          { _id: false }
        )
      ]
    }
  },
  { timestamps: true, _id: false }
);

export default model('Setting', SettingSchema);

