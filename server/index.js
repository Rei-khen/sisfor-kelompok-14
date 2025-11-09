// server/index.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./config/db"); // Import koneksi database agar tereksekusi

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Agar frontend bisa akses
app.use(express.json()); // Agar bisa baca data JSON dari request body

// Route Test Sederhana
app.get("/", (req, res) => {
  res.send("Server Kasirku berjalan dengan baik!");
});

// Jalankan Server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
