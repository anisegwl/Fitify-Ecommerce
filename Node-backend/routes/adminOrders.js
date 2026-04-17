const express = require("express");
const router = express.Router();

const adminAuth = require("../middleware/adminAuth");
const Order = require("../model/Order");

// ✅ GET ALL ORDERS (admin)
router.get("/", adminAuth, async (req, res) => {
  try {
    const { q = "", status = "", paymentMethod = "" } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (paymentMethod) filter.paymentMethod = paymentMethod;

    // search on customer fields + orderId
    if (q.trim()) {
      const regex = new RegExp(q.trim(), "i");
      filter.$or = [
        { "customer.fullName": regex },
        { "customer.phone": regex },
        { "customer.city": regex },
        // if q looks like ObjectId, allow direct match
        ...(q.trim().match(/^[0-9a-fA-F]{24}$/) ? [{ _id: q.trim() }] : []),
      ];
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("Admin get orders error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ GET SINGLE ORDER (admin)
router.get("/:id", adminAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    console.error("Admin get order error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ UPDATE ORDER STATUS (admin)
router.put("/:id/status", adminAuth, async (req, res) => {
  try {
    const { status } = req.body;

    const allowed = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Order not found" });

    res.json({ message: "Status updated", order: updated });
  } catch (err) {
    console.error("Admin update status error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
