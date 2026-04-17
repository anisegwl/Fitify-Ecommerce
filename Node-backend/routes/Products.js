const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Product = require("../model/Product");

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
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only images are allowed"));
  },
});

/*
================================
PUBLIC – GET ALL PRODUCTS
GET /api/products
================================
*/
router.get("/", async (req, res) => {
  try {
    const searchQuery = req.query.search
      ? { title: { $regex: req.query.search, $options: "i" } }
      : {};

    const categoryFilter = req.query.category
      ? { category: req.query.category }
      : {};

    const products = await Product.find({
      ...searchQuery,
      ...categoryFilter,
    });

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

/*
================================
ADMIN – ADD PRODUCT (with image)
POST /api/products/addproduct
================================
*/
router.post(
  "/addproduct",
  fetchUser,
  adminOnly,

  // ✅ Wrap multer so errors become JSON instead of HTML 500
  (req, res, next) => {
    upload.single("myfile")(req, res, (err) => {
      if (!err) return next();

      // Multer "file too large" etc.
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: err.message });
      }

      // fileFilter error: "Only images are allowed"
      return res.status(400).json({ message: err.message || "Upload failed" });
    });
  },

  [
    body("title").isLength({ min: 3 }).withMessage("Title must be at least 3 characters"),
    body("description").isLength({ min: 5 }).withMessage("Description must be at least 5 characters"),
    body("price").isNumeric().withMessage("Price must be numeric"),
    body("instock").isNumeric().withMessage("Stock must be numeric"),
    body("discount").isNumeric().withMessage("Discount must be numeric"),
    body("category").isIn(["Men", "Women", "Supplements", "Accessories"]).withMessage("Invalid category"),
  ],

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const productData = {
        title: req.body.title,
        description: req.body.description,
        price: Number(req.body.price),
        discount: Number(req.body.discount || 0),
        instock: Number(req.body.instock),
        category: req.body.category,
        image: req.file ? [`/uploads/${req.file.filename}`] : [],
      };

      const product = await Product.create(productData);
      return res.json(product);
    } catch (error) {
      console.error("Add product error:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
);


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
      let product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ message: "Product not found" });

      const update = {
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
      };

      if (req.body.price !== undefined) update.price = Number(req.body.price);
      if (req.body.discount !== undefined) update.discount = Number(req.body.discount || 0);
      if (req.body.instock !== undefined) update.instock = Number(req.body.instock);

      // If new image uploaded
      if (req.file) {
        update.image = [`/uploads/${req.file.filename}`];
      }

      product = await Product.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
      return res.json(product);
    } catch (error) {
      console.error("Update product error:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

/*
================================
ADMIN – DELETE PRODUCT
DELETE /api/products/:id
================================
*/
router.delete("/:id", fetchUser, adminOnly, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
