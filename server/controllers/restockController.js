// server/controllers/restockController.js
const db = require("../config/db");

// Helper
const getStoreAndUser = async (req) => {
  const userId = req.user.user_id;
  const [stores] = await db.query(
    "SELECT store_id FROM stores WHERE user_id = ?",
    [userId]
  );
  if (stores.length === 0) throw new Error("Toko tidak ditemukan.");
  return { storeId: stores[0].store_id, userId };
};

// POST - Tambah Stok (Restok)
exports.addStock = async (req, res) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const { storeId, userId } = await getStoreAndUser(req);
    const { product_id, quantity, unit_cost } = req.body;

    if (!product_id || quantity <= 0) {
      return res.status(400).json({ message: "Data restok tidak valid." });
    }

    // 1. Update Stok di tabel Products
    // Hanya update jika tipe manajemen stoknya 'stock_based'
    await connection.query(
      `UPDATE products 
             SET current_stock = current_stock + ? 
             WHERE product_id = ? AND store_id = ? AND stock_management_type = 'stock_based'`,
      [quantity, product_id, storeId]
    );

    // 2. Catat di Stock Movement (Riwayat)
    const total_cost = quantity * (unit_cost || 0);
    await connection.query(
      `INSERT INTO stock_movement (product_id, store_id, recorded_by_user_id, movement_type, quantity, unit_cost, total_cost)
             VALUES (?, ?, ?, 'in', ?, ?, ?)`,
      [product_id, storeId, userId, quantity, unit_cost || 0, total_cost]
    );

    await connection.commit();
    res.json({ message: "Stok berhasil ditambahkan!" });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: "Gagal restok." });
  } finally {
    connection.release();
  }
};

// GET - Ambil Histori Restok per Produk
exports.getRestockHistory = async (req, res) => {
  try {
    const { storeId } = await getStoreAndUser(req);
    const productId = req.params.productId;

    const [history] = await db.query(
      `SELECT sm.*, u.username as pic_name
             FROM stock_movement sm
             LEFT JOIN users u ON sm.recorded_by_user_id = u.user_id
             WHERE sm.store_id = ? AND sm.product_id = ? AND sm.movement_type = 'in'
             ORDER BY sm.movement_date DESC`,
      [storeId, productId]
    );

    res.json(history);
  } catch (error) {
    console.error("Error fetch restock history:", error);
    res.status(500).json({ message: "Gagal mengambil data histori." });
  }
};
