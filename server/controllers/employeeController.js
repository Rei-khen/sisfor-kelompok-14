// server/controllers/employeeController.js
const db = require("../config/db");
const bcrypt = require("bcryptjs");

// Helper
const getStoreId = async (userId) => {
  const [stores] = await db.query(
    "SELECT store_id FROM stores WHERE user_id = ?",
    [userId]
  );
  return stores.length > 0 ? stores[0].store_id : null;
};

// 1. GET - Ambil Daftar Karyawan
exports.getEmployees = async (req, res) => {
  try {
    const storeId = await getStoreId(req.user.user_id);
    // Ambil user yang store_id nya sama, tapi BUKAN owner
    const [employees] = await db.query(
      `SELECT user_id, username, email, phone_number, role, status 
             FROM users 
             WHERE store_id = ? AND role != 'owner'`,
      [storeId]
    );
    res.json(employees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil data karyawan." });
  }
};

// 2. POST - Tambah Karyawan Baru
exports.createEmployee = async (req, res) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const ownerStoreId = await getStoreId(req.user.user_id); // Karyawan ikut storeID owner

    const {
      username,
      password,
      email,
      phone_number,
      role,
      status,
      permissions, // Array of strings: ['produk', 'penjualan']
    } = req.body;

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
        ownerStoreId,
      ]
    );
    const newUserId = userResult.insertId;

    // 2. Insert Permissions (Fitur Aplikasi)
    // Daftar semua fitur yang tersedia di aplikasi
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

    // Siapkan array untuk batch insert
    const permissionValues = allFeatures.map((feature) => {
      // Cek apakah fitur ini dipilih (ada di array permissions dari frontend)
      const isEnabled = permissions.includes(feature);
      return [newUserId, feature, isEnabled];
    });

    await connection.query(
      "INSERT INTO user_permissions (user_id, feature_name, is_enabled) VALUES ?",
      [permissionValues]
    );

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
    // Cara paling bersih: Hapus semua permission lama, lalu insert yang baru
    await connection.query("DELETE FROM user_permissions WHERE user_id = ?", [
      userId,
    ]);

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
