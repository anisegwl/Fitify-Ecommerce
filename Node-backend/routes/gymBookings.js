const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const fetchUser = require("../middleware/fetchuser");
const fetchUserOptional = require("../middleware/fetchUserOptional");
const GymBooking = require("../model/GymBooking");
const Gym = require("../model/Gym");

// GET /api/gym-bookings/my - Get user's bookings
router.get("/my", fetchUser, async (req, res) => {
  try {
    const bookings = await GymBooking.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    return res.json(bookings);
  } catch (err) {
    console.error("My gym bookings error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// GET /api/gym-bookings/:id - Get single booking
router.get("/:id", async (req, res) => {
  try {
    const booking = await GymBooking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    return res.json(booking);
  } catch (err) {
    console.error("Get gym booking error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// POST /api/gym-bookings - Create a booking
router.post("/", fetchUserOptional, async (req, res) => {
  try {
    const { gymId, customer, plan, price, startDate, paymentMethod } = req.body;

    if (!gymId || !mongoose.Types.ObjectId.isValid(gymId)) {
      return res.status(400).json({ message: "Invalid gym ID" });
    }

    if (!customer?.fullName || !customer?.phone || !customer?.address) {
      return res.status(400).json({ message: "Missing customer details" });
    }

    if (!plan || !["1 Month", "3 Months", "6 Months", "1 Year"].includes(plan)) {
      return res.status(400).json({ message: "Invalid plan selected" });
    }

    if (!startDate) {
      return res.status(400).json({ message: "Start date is required" });
    }

    const gym = await Gym.findById(gymId);
    if (!gym) {
      return res.status(404).json({ message: "Gym not found" });
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({ message: "Invalid price" });
    }

    const booking = await GymBooking.create({
      userId: req.user?.id || null,
      gymId,
      gymName: gym.name,
      gymLocation: gym.location,
      customer: {
        fullName: customer.fullName,
        phone: customer.phone,
        address: customer.address,
        notes: customer.notes || "",
      },
      plan,
      price: numPrice,
      startDate: new Date(startDate),
      paymentMethod: paymentMethod === "online" ? "online" : "cod",
      status: "pending",
    });

    return res.status(201).json({
      message: "Booking confirmed successfully",
      bookingId: booking._id,
    });
  } catch (err) {
    console.error("Create gym booking error:", err);
    return res.status(500).json({ message: "Server error while booking" });
  }
});

module.exports = router;
