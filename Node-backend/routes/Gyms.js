const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Gym = require("../model/Gym");

const fetchUser = require("../middleware/fetchuser");
const adminOnly = require("../middleware/adminOnly");
const { body, validationResult } = require("express-validator");

const router = express.Router();

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error("Only images are allowed"));
  },
});

/*
================================
PUBLIC – GET ALL GYMS
GET /api/gyms
================================
*/
router.get("/", async (req, res) => {
  try {
    const searchQuery = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { location: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    const gyms = await Gym.find(searchQuery).sort({ date: -1 });
    res.json(gyms);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

/*
================================
PUBLIC – GET SINGLE GYM
GET /api/gyms/:id
================================
*/
router.get("/:id", async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id);
    if (!gym) return res.status(404).json({ message: "Gym not found" });
    res.json(gym);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

/*
================================
ADMIN – ADD GYM
POST /api/gyms/addgym
================================
*/
router.post(
  "/addgym",
  fetchUser,
  adminOnly,
  (req, res, next) => {
    upload.single("myfile")(req, res, (err) => {
      if (!err) return next();
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: err.message });
      }
      return res.status(400).json({ message: err.message || "Upload failed" });
    });
  },
  [
    body("name").isLength({ min: 3 }).withMessage("Name must be at least 3 characters"),
    body("description").isLength({ min: 5 }).withMessage("Description must be at least 5 characters"),
    body("location").isLength({ min: 3 }).withMessage("Location is required"),
    body("rating").isFloat({ min: 0, max: 5 }).withMessage("Rating must be between 0 and 5"),
    body("membership.oneMonth").isNumeric().withMessage("1-month price is required"),
    body("membership.threeMonths").isNumeric().withMessage("3-month price is required"),
    body("membership.sixMonths").isNumeric().withMessage("6-month price is required"),
    body("membership.oneYear").isNumeric().withMessage("1-year price is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      // membership may come as flat fields or nested
      const membership = req.body.membership || {
        oneMonth: req.body.oneMonth,
        threeMonths: req.body.threeMonths,
        sixMonths: req.body.sixMonths,
        oneYear: req.body.oneYear,
      };

      const gymData = {
        name: req.body.name,
        description: req.body.description,
        location: req.body.location,
        rating: Number(req.body.rating || 0),
        image: req.file
          ? [`/uploads/${req.file.filename}`]
          : req.body.imageUrl
          ? [req.body.imageUrl]
          : [],
        membership: {
          oneMonth: Number(membership.oneMonth),
          threeMonths: Number(membership.threeMonths),
          sixMonths: Number(membership.sixMonths),
          oneYear: Number(membership.oneYear),
        },
      };

      const gym = await Gym.create(gymData);
      return res.json(gym);
    } catch (error) {
      console.error("Add gym error:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

/*
================================
ADMIN – UPDATE GYM
PUT /api/gyms/:id
================================
*/
router.put(
  "/:id",
  fetchUser,
  adminOnly,
  (req, res, next) => {
    upload.single("myfile")(req, res, (err) => {
      if (!err) return next();
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: err.message });
      }
      return res.status(400).json({ message: err.message || "Upload failed" });
    });
  },
  async (req, res) => {
    try {
      let gym = await Gym.findById(req.params.id);
      if (!gym) return res.status(404).json({ message: "Gym not found" });

      const membership = req.body.membership || {
        oneMonth: req.body.oneMonth,
        threeMonths: req.body.threeMonths,
        sixMonths: req.body.sixMonths,
        oneYear: req.body.oneYear,
      };

      const update = {
        name: req.body.name,
        description: req.body.description,
        location: req.body.location,
      };

      if (req.body.rating !== undefined) update.rating = Number(req.body.rating);
      if (membership.oneMonth !== undefined) {
        update.membership = {
          oneMonth: Number(membership.oneMonth),
          threeMonths: Number(membership.threeMonths),
          sixMonths: Number(membership.sixMonths),
          oneYear: Number(membership.oneYear),
        };
      }

      // Update image: uploaded file > imageUrl > keep existing
      if (req.file) {
        update.image = [`/uploads/${req.file.filename}`];
      } else if (req.body.imageUrl) {
        update.image = [req.body.imageUrl];
      }

      gym = await Gym.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
      return res.json(gym);
    } catch (error) {
      console.error("Update gym error:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

/*
================================
ADMIN – DELETE GYM
DELETE /api/gyms/:id
================================
*/
router.delete("/:id", fetchUser, adminOnly, async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id);
    if (!gym) return res.status(404).json({ message: "Gym not found" });
    await Gym.findByIdAndDelete(req.params.id);
    res.json({ message: "Gym deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
