const express = require("express");
const User = require("../model/User");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const fetchUser = require("../middleware/fetchuser");

const secret = process.env.JWT_SECRET;

/*
================================
REGISTER USER
POST /api/auth/createuser
================================
*/
router.post(
  "/createuser",
  [
    body("name").isLength({ min: 3 }).withMessage("Name must be at least 3 characters"),
    body("email").isEmail().withMessage("Invalid email"),
    body("password").isLength({ min: 5 }).withMessage("Password must be at least 5 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).json({ message: "User already exists" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);

      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        role: "user", // ✅ DEFAULT ROLE
      });

      const payload = {
        user: {
          id: user._id,
          role: user.role, // ✅ ROLE ADDED
        },
      };

      const authToken = jwt.sign(payload, secret, { expiresIn: "7d" });

      res.json({ user, authToken });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
);

/*
================================
LOGIN USER
POST /api/auth/login
================================
*/
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("password").exists().withMessage("Password required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(req.body.password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const payload = {
        user: {
          id: user._id,
          role: user.role, // ✅ ROLE ADDED
        },
      };

      const authToken = jwt.sign(payload, secret, { expiresIn: "7d" });

      res.json({ user, authToken });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
);

/*
================================
GET LOGGED IN USER
GET /api/auth/getuser
================================
*/
router.get("/getuser", fetchUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
