const express = require("express");
const router = express.Router();
const fetchUser = require("../middleware/fetchuser");
const adminOnly = require("../middleware/adminOnly");
const GymBooking = require("../model/GymBooking");

// GET /api/admin/gym-bookings - Get all bookings
router.get("/", fetchUser, adminOnly, async (req, res) => {
  try {
    const bookings = await GymBooking.find().sort({ createdAt: -1 });
    return res.json(bookings);
  } catch (err) {
    console.error("Admin get gym bookings error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/admin/gym-bookings/:id/status - Update booking status
router.put("/:id/status", fetchUser, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "confirmed", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const booking = await GymBooking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    return res.json({ message: "Status updated", booking });
  } catch (err) {
    console.error("Admin update gym booking status error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
