const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const connectDB = require("./db");

dotenv.config();
connectDB();

const app = express();

/* =========================
   ✅ CORS CONFIGURATION
========================= */
app.use(
  cors({
    
    origin: (process.env.CORS_ORIGIN || "http://localhost:5173")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "auth-token"],
    credentials: true,
  })
);

app.use(express.json());

const port = process.env.PORT || 5000;

/* =========================
   UPLOADS SETUP
========================= */
const uploadsDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/* =========================
   STATIC FILES
========================= */
app.use("/uploads", express.static(uploadsDir));

/* =========================
   ROUTES
========================= */
app.use("/api/auth", require("./routes/Auth"));
app.use("/api/products", require("./routes/Products"));
app.use("/api/gyms", require("./routes/Gyms"));

// Wishlist
app.use("/api/wishlist", require("./routes/wishlist"));

// Orders & Bookings
app.use("/api/orders", require("./routes/orders"));
app.use("/api/admin/orders", require("./routes/adminOrders"));

app.use("/api/gym-bookings", require("./routes/gymBookings"));
app.use("/api/admin/gym-bookings", require("./routes/adminGymBookings"));
app.use("/api/admin/users", require("./routes/adminUsers"));


/* =========================
   SERVER
========================= */
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
