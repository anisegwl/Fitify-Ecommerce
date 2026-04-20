const mongoose = require("mongoose");
const { Schema } = mongoose;

const gymSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  /** Cover image used on cards and detail hero */
  mainImage: { type: String, default: "" },
  /** Additional photos (gallery); mainImage is not repeated here */
  gallery: { type: [String], default: [] },
  /** Legacy: kept in sync as [mainImage, ...gallery] for older clients */
  image: { type: [String], default: [] },
  membership: {
    oneMonth: { type: Number, required: true },
    threeMonths: { type: Number, required: true },
    sixMonths: { type: Number, required: true },
    oneYear: { type: Number, required: true },
  },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Gym", gymSchema);
