// server/config/db.js
const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config(); // Load variabel dari file .env

// Buat pool koneksi
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Ubah pool menjadi promise-based agar bisa pakai async/await
const promisePool = pool.promise();

console.log(
  `Mencoba terhubung ke database ${process.env.DB_NAME} di ${process.env.DB_HOST}...`
);

// Test koneksi sederhana
promisePool
  .query("SELECT 1")
  .then(() => console.log("Berhasil terhubung ke database MySQL!"))
  .catch((err) => console.error("Gagal terhubung ke database:", err.message));

module.exports = promisePool;
