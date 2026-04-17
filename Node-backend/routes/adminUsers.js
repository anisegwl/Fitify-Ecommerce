const express = require("express");
const router = express.Router();
const User = require("../model/User");
const fetchUser = require("../middleware/fetchuser");
const adminOnly = require("../middleware/adminOnly");

// ✅ GET ALL USERS (Admin)
router.get("/", fetchUser, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error("Fetch all users error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ DELETE USER (Admin)
router.delete("/:id", fetchUser, adminOnly, async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(403).json({ message: "Cannot delete another admin" });
    }

    await User.findByIdAndDelete(userId);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
