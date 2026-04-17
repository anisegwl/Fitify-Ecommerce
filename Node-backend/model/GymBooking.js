const mongoose = require("mongoose");
const { Schema } = mongoose;

const GymBookingSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },

    gymId: { type: Schema.Types.ObjectId, ref: "Gym", required: true },
    gymName: { type: String, required: true },
    gymLocation: { type: String, required: true },

    customer: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      notes: { type: String, default: "" },
    },

    plan: { type: String, enum: ["1 Month", "3 Months", "6 Months", "1 Year"], required: true },
    price: { type: Number, required: true },
    startDate: { type: Date, required: true },

    paymentMethod: { type: String, enum: ["cod", "online"], default: "cod" },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.GymBooking || mongoose.model("GymBooking", GymBookingSchema);
