// server/controllers/storeController.js
const db = require("../config/db");

// Cek apakah user sudah punya toko
// GET - Ambil Data Toko Saya (Untuk Owner & Karyawan)
exports.getMyStore = async (req, res) => {
  try {
    const userId = req.user.user_id;

    // 1. Cek detail user dulu untuk tahu Role dan Store ID nya
    const [users] = await db.query(
      "SELECT role, store_id FROM users WHERE user_id = ?",
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan." });
    }

    const user = users[0];
    let storeQuery = "";
    let queryParam = "";

    // 2. Tentukan cara mencari toko berdasarkan Role
    if (user.role === "owner") {
      // Jika Owner: Cari toko yang user_id-nya adalah dia
      storeQuery = "SELECT * FROM stores WHERE user_id = ?";
      queryParam = userId;
    } else {
      // Jika Karyawan: Cari toko berdasarkan store_id yang ada di akun karyawannya
      if (!user.store_id) {
        return res
          .status(404)
          .json({
            message: "Akun karyawan ini tidak terhubung ke toko manapun.",
          });
      }
      storeQuery = "SELECT * FROM stores WHERE store_id = ?";
      queryParam = user.store_id;
    }

    // 3. Eksekusi Query
    const [stores] = await db.query(storeQuery, [queryParam]);

    if (stores.length === 0) {
      return res.status(404).json({ message: "Toko tidak ditemukan." });
    }

    res.json(stores[0]);
  } catch (error) {
    console.error("Error getMyStore:", error);
    res.status(500).json({ message: "Gagal mengambil data toko." });
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
