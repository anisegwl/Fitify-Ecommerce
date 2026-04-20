const mongoose = require("mongoose");
const { Schema } = mongoose;

const productSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  instock: { type: Number, required: true },
  discount: { type: Number, required: true },
  image: { type: [String], default: [] },
  sizes: { type: [String], default: [] },
  category: {
    type: String,
    enum: ["Men", "Women", "Supplements", "Accessories"],
    required: true,
  },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Product", productSchema);
