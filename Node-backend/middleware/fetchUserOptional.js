const jwt = require("jsonwebtoken");

const fetchUserOptional = (req, res, next) => {
  try {
    let token = req.header("auth-token") || req.header("authorization") || "";

    if (!token) {
      req.user = null;
      return next();
    }

    if (token.startsWith("Bearer ")) token = token.slice(7);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const id =
      decoded?.user?.id ||
      decoded?.user?._id ||
      decoded?.id ||
      decoded?.userId;

    const role = decoded?.user?.role || decoded?.role;

    if (!id) {
      req.user = null;
      return next();
    }

    req.user = { id, role };
    next();
  } catch {
    req.user = null;
    next();
  }
};

module.exports = fetchUserOptional;
