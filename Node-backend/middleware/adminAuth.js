const jwt = require("jsonwebtoken");
const User = require("../model/User");

const secret = process.env.JWT_SECRET;

module.exports = async function adminAuth(req, res, next) {
  try {
    let token = req.header("auth-token");
    if (!token) return res.status(401).json({ message: "No token provided" });

    // If someone sends: Bearer xxx
    if (token.startsWith("Bearer ")) token = token.slice(7);

    const decoded = jwt.verify(token, secret);

    // Your payload is: { user: { id, role } }
    const userId = decoded?.user?.id;
    if (!userId) return res.status(401).json({ message: "Invalid token payload" });

    const user = await User.findById(userId).select("role name email");
    if (!user) return res.status(401).json({ message: "User not found" });

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    req.user = { id: user._id, role: user.role }; // keep consistent shape
    next();
  } catch (err) {
    console.error("adminAuth error:", err.message || err);
    return res.status(401).json({ message: "Token invalid" });
  }
};
