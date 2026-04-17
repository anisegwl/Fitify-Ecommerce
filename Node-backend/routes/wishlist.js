const express = require("express");
const router = express.Router();
const User = require("../model/User");
const Product = require("../model/Product");
const fetchUser = require("../middleware/fetchuser");

// ✅ GET USER WISHLIST
router.get("/", fetchUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("wishlist");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user.wishlist);
  } catch (err) {
    console.error("Get wishlist error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ ADD TO WISHLIST
router.post("/add", fetchUser, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ message: "Product ID required" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.wishlist.includes(productId)) {
      return res.status(400).json({ message: "Product already in wishlist" });
    }

    user.wishlist.push(productId);
    await user.save();

    res.json({ message: "Added to wishlist", wishlist: user.wishlist });
  } catch (err) {
    console.error("Add wishlist error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ REMOVE FROM WISHLIST
router.delete("/remove/:productId", fetchUser, async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
    await user.save();

    res.json({ message: "Removed from wishlist", wishlist: user.wishlist });
  } catch (err) {
    console.error("Remove wishlist error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
