// server/controllers/authController.js
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken"); // Tambahan baru

//controller buat login atau register
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

//controller buat login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Validasi input
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username dan password wajib diisi!" });
    }

    // 2. Cari user berdasarkan username
    const [users] = await db.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);
    const user = users[0];

    // 3. Cek apakah user ditemukan
    if (!user) {
      return res.status(401).json({ message: "Username atau password salah." });
    }

    // 4. Verifikasi password dengan bcrypt
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Username atau password salah." });
    }

    // 5. Jika cocok, buat Token JWT
    // Token ini akan jadi "tiket" user untuk akses fitur lain nanti.
    const token = jwt.sign(
      { user_id: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" } // Token berlaku 1 hari
    );

    res.json({
      message: "Login berhasil!",
      token,
      user: {
        id: user.user_id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error saat login:", error);
    res.status(500).json({ message: "Terjadi kesalahan di server." });
  }
};
