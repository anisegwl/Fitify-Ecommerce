const mongoose = require("mongoose");
const { Schema } = mongoose;

const OrderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true },
    lineTotal: { type: Number, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },

    customer: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      city: { type: String, required: true },
      address: { type: String, required: true },
      notes: { type: String, default: "" },
    },

    items: { type: [OrderItemSchema], required: true },

    deliveryType: { type: String, enum: ["inside", "outside"], required: true },
    deliveryFee: { type: Number, required: true },

    subtotal: { type: Number, required: true },
    total: { type: Number, required: true },

    paymentMethod: { type: String, enum: ["cod", "online"], default: "cod" },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// ✅ IMPORTANT: export a MODEL, not schema
module.exports = mongoose.models.Order || mongoose.model("Order", OrderSchema);
