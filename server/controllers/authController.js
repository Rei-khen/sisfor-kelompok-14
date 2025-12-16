// server/controllers/authController.js
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    // UBAH DISINI: Terima email, bukan username
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email dan password wajib diisi!" });
    }

    // Cek email duplikat
    const [existingUser] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (existingUser.length > 0) {
      return res.status(409).json({ message: "Email sudah terdaftar." });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert pakai email
    await db.query(
      "INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)",
      [email, passwordHash, "owner"]
    );

    res.status(201).json({ message: "Registrasi berhasil! Silakan login." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error saat registrasi." });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, username, password, store_name, login_type } = req.body;

    // --- SKENARIO 1: LOGIN KARYAWAN (Via store_name + username) ---
    if (login_type === "employee" && store_name && username) {
      // 1. Cari Toko dulu
      const [stores] = await db.query(
        "SELECT store_id FROM stores WHERE store_name = ?",
        [store_name]
      );
      if (stores.length === 0) {
        return res.status(404).json({ message: "Toko tidak ditemukan." });
      }
      const storeId = stores[0].store_id;

      // 2. Cari Karyawan di Toko tersebut
      const [users] = await db.query(
        "SELECT * FROM users WHERE username = ? AND store_id = ?",
        [username, storeId]
      );

      if (users.length === 0) {
        return res
          .status(401)
          .json({ message: "Username karyawan tidak ditemukan di toko ini." });
      }

      const user = users[0];

      // Cek Password
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) return res.status(401).json({ message: "Password salah." });

      // Buat Token
      const token = jwt.sign(
        { user_id: user.user_id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      // Ambil Permissions (Opsional, untuk frontend)
      const [permissions] = await db.query(
        "SELECT feature_name FROM user_permissions WHERE user_id = ? AND is_enabled = 1",
        [user.user_id]
      );
      const permissionList = permissions.map((p) => p.feature_name);

      return res.json({
        message: "Login Karyawan Berhasil",
        token,
        user: {
          user_id: user.user_id,
          username: user.username,
          role: user.role,
          permissions: permissionList,
        },
      });
    }

    // --- SKENARIO 2: LOGIN OWNER (Via Email - Kode Lama) ---
    // (Tetap pertahankan kode lama kamu di sini untuk owner)
    // ... (Cari user by email, cek password, return token) ...
    // Jika kamu pakai kode lama, pastikan logika di atas ditaruh SEBELUM logika owner.

    // Contoh implementasi Owner (Simplified):
    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (users.length === 0)
      return res.status(401).json({ message: "Email tidak terdaftar." });

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ message: "Password salah." });

    const token = jwt.sign(
      { user_id: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login Owner Berhasil",
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error saat login." });
  }
};
