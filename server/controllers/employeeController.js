// server/controllers/employeeController.js
const db = require("../config/db");
const bcrypt = require("bcryptjs");

// --- HELPER: Ambil Store ID (Support Owner & Karyawan) ---
const getStoreId = async (userId) => {
  // 1. Cek apakah user adalah OWNER (ada di tabel stores)
  const [stores] = await db.query(
    "SELECT store_id FROM stores WHERE user_id = ?",
    [userId]
  );
  if (stores.length > 0) return stores[0].store_id;

  // 2. Jika bukan owner, cek apakah user adalah KARYAWAN (ada di tabel users)
  const [users] = await db.query(
    "SELECT store_id FROM users WHERE user_id = ?",
    [userId]
  );
  if (users.length > 0) return users[0].store_id;

  return null;
};

// 1. GET - Ambil Daftar Karyawan (Updated Logic)
exports.getEmployees = async (req, res) => {
  try {
    const storeId = await getStoreId(req.user.user_id);
    if (!storeId)
      return res.status(400).json({ message: "Toko tidak ditemukan." });

    // Ambil query param type ('all' atau undefined)
    const { type } = req.query;

    let query;
    let params;

    if (type === "all") {
      // KASUS: Jurnal & Histori (Butuh SEMUA user termasuk Owner)
      // Query ini mengambil user yang punya store_id tersebut ATAU user yang merupakan pemilik toko tersebut
      query = `
        SELECT user_id, username, email, phone_number, role, status 
        FROM users 
        WHERE store_id = ? 
        OR user_id = (SELECT user_id FROM stores WHERE store_id = ?)
        ORDER BY FIELD(role, 'owner', 'admin', 'kasir'), username ASC
      `;
      // Kita butuh storeId dua kali untuk parameter query di atas
      params = [storeId, storeId];
    } else {
      // KASUS: Menu Karyawan (Hanya tampilkan bawahan, Owner disembunyikan)
      query = `
        SELECT user_id, username, email, phone_number, role, status 
        FROM users 
        WHERE store_id = ? AND role != 'owner'
        ORDER BY username ASC
      `;
      params = [storeId];
    }

    const [employees] = await db.query(query, params);
    res.json(employees);
  } catch (error) {
    console.error("Error getEmployees:", error);
    res.status(500).json({ message: "Gagal mengambil data karyawan." });
  }
};

// 2. POST - Tambah Karyawan Baru
exports.createEmployee = async (req, res) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const storeId = await getStoreId(req.user.user_id);
    if (!storeId) throw new Error("ID Toko tidak ditemukan.");

    const {
      username,
      password,
      email,
      phone_number,
      role,
      status,
      permissions, // Array of strings: ['produk', 'penjualan']
    } = req.body;

    // Cek duplikasi email dalam satu toko (opsional, tapi disarankan)
    const [existing] = await connection.query(
      "SELECT user_id FROM users WHERE email = ? AND store_id = ?",
      [email, storeId]
    );
    if (existing.length > 0) {
      return res
        .status(400)
        .json({ message: "Email sudah digunakan di toko ini." });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 1. Insert ke tabel users
    const [userResult] = await connection.query(
      `INSERT INTO users (username, email, password_hash, phone_number, role, status, store_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        username,
        email,
        passwordHash,
        phone_number,
        role || "kasir",
        status || "aktif",
        storeId,
      ]
    );
    const newUserId = userResult.insertId;

    // 2. Insert Permissions (Fitur Aplikasi)
    if (permissions && permissions.length > 0) {
      const allFeatures = [
        "produk",
        "penjualan",
        "histori_penjualan",
        "rekap_penjualan",
        "pengeluaran",
        "jurnal",
        "grafik",
        "buat_barcode",
      ];

      const permissionValues = allFeatures.map((feature) => {
        const isEnabled = permissions.includes(feature);
        return [newUserId, feature, isEnabled];
      });

      await connection.query(
        "INSERT INTO user_permissions (user_id, feature_name, is_enabled) VALUES ?",
        [permissionValues]
      );
    }

    await connection.commit();
    res.status(201).json({ message: "Karyawan berhasil ditambahkan." });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res
      .status(500)
      .json({ message: "Gagal menambah karyawan.", error: error.message });
  } finally {
    connection.release();
  }
};

// 3. GET (Single) - Ambil data 1 karyawan beserta permission-nya
exports.getEmployeeById = async (req, res) => {
  try {
    const storeId = await getStoreId(req.user.user_id);
    const userId = req.params.id;

    // Ambil data user
    const [users] = await db.query(
      `SELECT user_id, username, email, phone_number, role, status 
       FROM users WHERE user_id = ? AND store_id = ?`,
      [userId, storeId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "Karyawan tidak ditemukan." });
    }

    const employee = users[0];

    // Ambil permissions
    const [permissions] = await db.query(
      "SELECT feature_name FROM user_permissions WHERE user_id = ? AND is_enabled = TRUE",
      [userId]
    );

    // Format permission jadi array string sederhana: ['produk', 'penjualan']
    employee.permissions = permissions.map((p) => p.feature_name);

    res.json(employee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

// 4. PUT - Update Karyawan
exports.updateEmployee = async (req, res) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const storeId = await getStoreId(req.user.user_id);
    const userId = req.params.id;

    const {
      username,
      email,
      phone_number,
      role,
      status,
      password, // Password opsional saat edit
      permissions,
    } = req.body;

    // 1. Update tabel users
    let query =
      "UPDATE users SET username=?, email=?, phone_number=?, role=?, status=?";
    let params = [username, email, phone_number, role, status];

    // Hanya update password jika user mengisinya
    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      query += ", password_hash=?";
      params.push(passwordHash);
    }

    query += " WHERE user_id=? AND store_id=?";
    params.push(userId, storeId);

    await connection.query(query, params);

    // 2. Update Permissions
    // Hapus permission lama
    await connection.query("DELETE FROM user_permissions WHERE user_id = ?", [
      userId,
    ]);

    // Insert permission baru jika ada
    if (permissions && permissions.length > 0) {
      const allFeatures = [
        "produk",
        "penjualan",
        "histori_penjualan",
        "rekap_penjualan",
        "pengeluaran",
        "jurnal",
        "grafik",
        "buat_barcode",
      ];

      const permissionValues = allFeatures.map((feature) => {
        const isEnabled = permissions.includes(feature);
        return [userId, feature, isEnabled];
      });

      await connection.query(
        "INSERT INTO user_permissions (user_id, feature_name, is_enabled) VALUES ?",
        [permissionValues]
      );
    }

    await connection.commit();
    res.json({ message: "Data karyawan berhasil diperbarui." });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res
      .status(500)
      .json({ message: "Gagal update karyawan.", error: error.message });
  } finally {
    connection.release();
  }
};

// 5. DELETE - Hapus Karyawan
exports.deleteEmployee = async (req, res) => {
  try {
    const storeId = await getStoreId(req.user.user_id);
    const employeeId = req.params.id;

    // Pastikan karyawan milik toko ini dan bukan owner
    const [check] = await db.query(
      "SELECT * FROM users WHERE user_id = ? AND store_id = ? AND role != 'owner'",
      [employeeId, storeId]
    );

    if (check.length === 0)
      return res
        .status(404)
        .json({ message: "Karyawan tidak ditemukan atau tidak bisa dihapus." });

    await db.query("DELETE FROM users WHERE user_id = ?", [employeeId]);
    res.json({ message: "Karyawan dihapus." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal menghapus." });
  }
};
