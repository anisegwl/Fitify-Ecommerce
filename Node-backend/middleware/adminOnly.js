const User = require("../model/User");

const adminOnly = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await User.findById(req.user.id).select("role");
    if (!user) return res.status(401).json({ message: "User not found" });

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Admin access denied" });
    }

    next();
  } catch (error) {
    console.error("adminOnly error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = adminOnly;
