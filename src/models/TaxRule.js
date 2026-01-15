import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const TaxRuleSchema = new Schema(
  {
    country: { type: String, required: true, uppercase: true },
    rate: { type: Number, required: true, min: 0, max: 1 },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

TaxRuleSchema.index({ country: 1 }, { unique: true });

export default model('TaxRule', TaxRuleSchema);

