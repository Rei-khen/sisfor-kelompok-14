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

//import routes
const authRoutes = require("./routes/authRoutes"); // Import route
const storeRoutes = require("./routes/storeRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const restockRoutes = require("./routes/restockRoutes");

// Route Test Sederhana
app.get("/", (req, res) => {
  res.send("Server Kasirku berjalan dengan baik!");
});

// Gunakan route
app.use("/api/auth", authRoutes);
app.use("/api/store", storeRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/restock", restockRoutes);

// Jalankan Server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
