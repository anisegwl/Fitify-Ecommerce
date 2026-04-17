const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const fetchUser = require("../middleware/fetchuser");
const fetchUserOptional = require("../middleware/fetchUserOptional");

const Order = require("../model/Order");


router.get("/my", fetchUser, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    return res.json(orders);
  } catch (err) {
    console.error("My orders error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});


router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    return res.json(order);
  } catch (err) {
    console.error("Get order error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});


router.post("/", fetchUserOptional, async (req, res) => {
  try {
    const {
      customer,
      items,
      deliveryType,
      deliveryFee,
      paymentMethod,
    } = req.body;


    if (
      !customer?.fullName ||
      !customer?.phone ||
      !customer?.city ||
      !customer?.address
    ) {
      return res.status(400).json({ message: "Missing customer details" });
    }


    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Cart items required" });
    }


    if (!["inside", "outside"].includes(deliveryType)) {
      return res.status(400).json({ message: "Invalid delivery type" });
    }

    const df = Number(deliveryFee);
    if (!Number.isFinite(df) || df < 0) {
      return res.status(400).json({ message: "Invalid delivery fee" });
    }
    let computedSubtotal = 0;

    const normalizedItems = items.map((it) => {
      if (!it.productId || !mongoose.Types.ObjectId.isValid(it.productId)) {
        throw new Error("Invalid productId in items");
      }

      const price = Number(it.price);
      const qty = Number(it.qty);

      if (!Number.isFinite(price) || !Number.isFinite(qty) || qty < 1) {
        throw new Error("Invalid item price or qty");
      }

      computedSubtotal += price * qty;

      return {
        productId: it.productId,
        title: it.title || "Product",
        price,
        qty,
        lineTotal: price * qty,
      };
    });

    const computedTotal = computedSubtotal + df;

    const order = await Order.create({
      userId: req.user?.id || null,
      customer: {
        fullName: customer.fullName,
        phone: customer.phone,
        city: customer.city,
        address: customer.address,
        notes: customer.notes || "",
      },
      items: normalizedItems,
      deliveryType,
      deliveryFee: df,
      subtotal: computedSubtotal,
      total: computedTotal,
      paymentMethod: paymentMethod === "online" ? "online" : "cod",
      status: "pending",
    });

    return res.status(201).json({
      message: "Order placed successfully",
      orderId: order._id,
    });
  } catch (err) {
    console.error("Create order error:", err.message || err);
    return res.status(500).json({ message: "Server error while placing order" });
  }
});

module.exports = router;
