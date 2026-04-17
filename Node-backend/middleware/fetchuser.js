const jwt = require("jsonwebtoken");

const fetchUser = (req, res, next) => {
  try {
    let token = req.header("auth-token") || req.header("authorization") || "";

    if (!token) return res.status(401).json({ message: "Access denied" });

    if (token.startsWith("Bearer ")) token = token.slice(7);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const id =
      decoded?.user?.id ||
      decoded?.user?._id ||
      decoded?.id ||
      decoded?.userId;

    const role = decoded?.user?.role || decoded?.role;

    if (!id) return res.status(401).json({ message: "Invalid token payload" });

    req.user = { id, role };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = fetchUser;
