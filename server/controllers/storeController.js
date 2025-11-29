// server/controllers/storeController.js
const db = require("../config/db");

// Cek apakah user sudah punya toko
exports.getMyStore = async (req, res) => {
  try {
    const userId = req.user.user_id; // Didapat dari middleware autentikasi nanti
    const [stores] = await db.query("SELECT * FROM stores WHERE user_id = ?", [
      userId,
    ]);

    if (stores.length === 0) {
      return res.status(404).json({ message: "Toko belum dibuat." });
    }

    res.json(stores[0]);
  } catch (error) {
    console.error("Error ambil data toko:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

// Buat toko baru
exports.createStore = async (req, res) => {
  // Kita pakai transaction agar kalau satu gagal, semua batal
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const userId = req.user.user_id;
    // Data sesuai gambar:
    const { username, store_name, display_name, address, province, regency } =
      req.body;

    // 1. Validasi input wajib
    if (!username || !store_name || !display_name) {
      throw new Error("Username, Storename, dan Nama Toko wajib diisi.");
    }

    // 2. Update tabel users (isi kolom username)
    await connection.query("UPDATE users SET username = ? WHERE user_id = ?", [
      username,
      userId,
    ]);

    // 3. Insert ke tabel stores
    await connection.query(
      "INSERT INTO stores (user_id, store_name, display_name, address, province, regency) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, store_name, display_name, address, province, regency]
    );

    await connection.commit(); // Simpan permanen jika semua sukses
    res.status(201).json({ message: "Setup profil dan toko berhasil!" });
  } catch (error) {
    await connection.rollback(); // Batalkan jika ada error
    console.error("Error setup:", error);
    // Cek error duplikat (misal store_name sudah dipakai orang lain)
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ message: "Storename sudah dipakai, coba yang lain." });
    }
    res
      .status(500)
      .json({ message: error.message || "Gagal melakukan setup." });
  } finally {
    connection.release();
  }
};
