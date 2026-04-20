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
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /image\//.test(file.mimetype || "");
    if (mimetype && extname) return cb(null, true);
    cb(new Error("Only images are allowed"));
  },
});

const gymImageUpload = upload.fields([
  { name: "mainfile", maxCount: 1 },
  { name: "gallery", maxCount: 20 },
]);

const runGymUpload = (req, res, next) => {
  gymImageUpload(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: err.message });
    }
    return res.status(400).json({ message: err.message || "Upload failed" });
  });
};

/*
================================
PUBLIC – GET ALL GYMS
GET /api/gyms
================================
*/
router.get("/", async (req, res) => {
  try {
    const sortBy = String(req.query.sort || "").toLowerCase();
    const limit = Math.min(Math.max(Number(req.query.limit) || 0, 0), 50);

    const searchQuery = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { location: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    const gyms = await Gym.find(searchQuery).sort({ date: -1 });

    if (sortBy === "ranking") {
      const oneMonthPrices = gyms
        .map((g) => Number(g.membership?.oneMonth || 0))
        .filter((p) => p > 0);

      const minPrice = oneMonthPrices.length ? Math.min(...oneMonthPrices) : 0;
      const maxPrice = oneMonthPrices.length ? Math.max(...oneMonthPrices) : 0;
      const priceRange = maxPrice - minPrice;

      const ranked = gyms
        .map((gym) => {
          const rating = Number(gym.rating || 0);
          const oneMonth = Number(gym.membership?.oneMonth || 0);

          let affordability = 0;
          if (oneMonth > 0 && priceRange > 0) {
            affordability = 1 - (oneMonth - minPrice) / priceRange;
          } else if (oneMonth > 0) {
            affordability = 0.5;
          }

          const rankingScore = Number((rating * 0.75 + affordability * 5 * 0.25).toFixed(2));
          return { gym, rankingScore };
        })
        .sort((a, b) => b.rankingScore - a.rankingScore || (b.gym.rating || 0) - (a.gym.rating || 0))
        .map((entry) => ({
          ...entry.gym.toObject(),
          rankingScore: entry.rankingScore,
        }));

      return res.json(limit > 0 ? ranked.slice(0, limit) : ranked);
    }

    return res.json(limit > 0 ? gyms.slice(0, limit) : gyms);
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
  runGymUpload,
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

      let mainImage = "";
      if (req.files?.mainfile?.[0]) {
        mainImage = `/uploads/${req.files.mainfile[0].filename}`;
      } else if (req.body.mainImageUrl?.trim()) {
        mainImage = req.body.mainImageUrl.trim();
      } else if (req.body.imageUrl?.trim()) {
        mainImage = req.body.imageUrl.trim();
      }

      let galleryUrls = [];
      try {
        const g = JSON.parse(req.body.galleryUrls || "[]");
        if (Array.isArray(g)) galleryUrls = g.map(String).filter(Boolean);
      } catch {
        galleryUrls = [];
      }

      const galleryFiles = (req.files?.gallery || []).map((f) => `/uploads/${f.filename}`);
      const gallery = [...galleryUrls, ...galleryFiles];
      const image = [mainImage, ...gallery].filter(Boolean);

      const gymData = {
        name: req.body.name,
        description: req.body.description,
        location: req.body.location,
        rating: Number(req.body.rating || 0),
        mainImage,
        gallery,
        image,
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
  runGymUpload,
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

      let mainImage = gym.mainImage || (gym.image && gym.image[0]) || "";
      if (req.files?.mainfile?.[0]) {
        mainImage = `/uploads/${req.files.mainfile[0].filename}`;
      } else if (req.body.mainImageUrl?.trim()) {
        mainImage = req.body.mainImageUrl.trim();
      } else if (req.body.imageUrl?.trim()) {
        mainImage = req.body.imageUrl.trim();
      }

      let galleryKeep = [];
      try {
        const parsed = JSON.parse(req.body.galleryKeep || "[]");
        if (Array.isArray(parsed)) galleryKeep = parsed.map(String).filter(Boolean);
      } catch {
        galleryKeep = [];
      }

      let galleryUrlsAdd = [];
      try {
        const g = JSON.parse(req.body.galleryUrls || "[]");
        if (Array.isArray(g)) galleryUrlsAdd = g.map(String).filter(Boolean);
      } catch {
        galleryUrlsAdd = [];
      }

      const newGalleryFiles = (req.files?.gallery || []).map(
        (f) => `/uploads/${f.filename}`
      );

      const hasGalleryPayload =
        req.body.galleryKeep !== undefined ||
        req.body.galleryUrls !== undefined ||
        (req.files?.gallery && req.files.gallery.length > 0);

      let finalGallery;
      if (hasGalleryPayload) {
        finalGallery = [...galleryKeep, ...galleryUrlsAdd, ...newGalleryFiles];
      } else {
        finalGallery = Array.isArray(gym.gallery) && gym.gallery.length > 0
          ? [...gym.gallery]
          : Array.isArray(gym.image) && gym.image.length > 1
            ? gym.image.slice(1)
            : [];
      }

      const image = [mainImage, ...finalGallery].filter(Boolean);
      update.mainImage = mainImage;
      update.gallery = finalGallery;
      update.image = image;

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
