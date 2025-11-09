// server/controllers/authController.js
const db = require("../config/db");
const bcrypt = require("bcryptjs");

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Validasi input dasar
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username dan password wajib diisi!" });
    }

    // 2. Cek apakah username sudah ada
    const [existingUser] = await db.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );
    if (existingUser.length > 0) {
      return res
        .status(409)
        .json({ message: "Username sudah terpakai, pilih yang lain." });
    }

    // 3. Hash password agar aman
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4. Simpan ke database (default role: 'owner')
    await db.query(
      "INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)",
      [username, passwordHash, "owner"]
    );

    res.status(201).json({ message: "Registrasi berhasil! Silakan login." });
  } catch (error) {
    console.error("Error saat register:", error);
    res.status(500).json({ message: "Terjadi kesalahan di server." });
  }
};
