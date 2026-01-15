import mongoose from "mongoose";
const { Schema, model } = mongoose;

const addressSchema = new Schema(
  {
    label: { type: String, default: "Adresse" },
    fullName: { type: String },
    phone: { type: String },
    line1: { type: String },
    line2: { type: String },
    city: { type: String },
    country: { type: String, default: "TN" },
    postalCode: { type: String },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const paymentMethodSchema = new Schema(
  {
    brand: { type: String },
    last4: { type: String },
    holder: { type: String },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "client"],
      default: "client",
      index: true,
    },
    addresses: [addressSchema],
    paymentMethods: [paymentMethodSchema],
    resetToken: { type: String, default: null },
    resetTokenExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

export default model("User", userSchema);
