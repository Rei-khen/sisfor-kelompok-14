// server/controllers/transactionController.js
const db = require("../config/db");

// --- HELPER DIPERBAIKI (Support Owner & Karyawan) ---
const getStoreAndUser = async (req) => {
  const userId = req.user.user_id;

  // 1. Cek apakah user adalah OWNER? (Cari di tabel stores)
  const [stores] = await db.query(
    "SELECT store_id FROM stores WHERE user_id = ?",
    [userId]
  );
  if (stores.length > 0) {
    return { storeId: stores[0].store_id, userId };
  }

  // 2. Jika bukan Owner, cek apakah user adalah KARYAWAN? (Cari di tabel users)
  const [users] = await db.query(
    "SELECT store_id FROM users WHERE user_id = ?",
    [userId]
  );
  if (users.length > 0 && users[0].store_id) {
    return { storeId: users[0].store_id, userId };
  }

  // 3. Jika tidak ketemu di keduanya
  throw new Error("Toko tidak ditemukan. Pastikan akun memiliki akses toko.");
};
// ----------------------------------------------------

// 1. POST - Simpan Transaksi Baru
exports.createTransaction = async (req, res) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const { storeId, userId } = await getStoreAndUser(req);

    const {
      cartItems,
      paymentMethod,
      customerName,
      subtotal,
      discountAmount,
      total,
    } = req.body;

    if (!cartItems || cartItems.length === 0) {
      throw new Error("Keranjang kosong.");
    }

    // A. INSERT ke tabel 'transactions'
    const [transResult] = await connection.query(
      `INSERT INTO transactions (store_id, user_id, total_price, discount, subtotal, payment_method, customer_name, transaction_time)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        storeId,
        userId,
        total,
        discountAmount,
        subtotal,
        paymentMethod,
        customerName || null,
      ]
    );
    const newTransactionId = transResult.insertId;

    // B. Loop item keranjang
    for (const item of cartItems) {
      // 1. Insert Detail Transaksi
      await connection.query(
        `INSERT INTO transaction_details (transaction_id, product_id, quantity, price_per_unit, total_price)
             VALUES (?, ?, ?, ?, ?)`,
        [
          newTransactionId,
          item.product_id,
          item.quantity,
          item.selling_price,
          item.quantity * item.selling_price,
        ]
      );

      // 2. Update Stok & Catat Mutasi (Hanya jika stok di-manage)
      // Ambil info produk terkini (termasuk harga beli untuk jurnal HPP)
      const [prodData] = await connection.query(
        "SELECT stock_management_type, current_stock, purchase_price FROM products WHERE product_id = ?",
        [item.product_id]
      );

      if (prodData.length > 0) {
        const product = prodData[0];

        if (product.stock_management_type === "stock_based") {
          // Cek Stok Cukup (Validasi Backend)
          if (product.current_stock < item.quantity) {
            throw new Error(
              `Stok tidak cukup untuk produk ID ${item.product_id}`
            );
          }

          // Kurangi Stok
          await connection.query(
            "UPDATE products SET current_stock = current_stock - ? WHERE product_id = ?",
            [item.quantity, item.product_id]
          );

          // Catat Log Keluar (Stock Movement) -> PENTING UNTUK KARTU STOK
          const unitCost = product.purchase_price || 0;
          await connection.query(
            `INSERT INTO stock_movement (product_id, store_id, recorded_by_user_id, movement_type, quantity, unit_cost, total_cost)
                     VALUES (?, ?, ?, 'out', ?, ?, ?)`,
            [
              item.product_id,
              storeId,
              userId,
              item.quantity,
              unitCost,
              unitCost * item.quantity,
            ]
          );
        }
      }
    }

    await connection.commit();
    res.status(201).json({
      message: "Transaksi berhasil disimpan!",
      transactionId: newTransactionId,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error creating transaction:", error);
    res
      .status(500)
      .json({ message: error.message || "Gagal menyimpan transaksi." });
  } finally {
    connection.release();
  }
};

// 2. GET - Ambil Daftar Transaksi (Filter Lengkap)
exports.getTransactions = async (req, res) => {
  try {
    const { storeId } = await getStoreAndUser(req);
    const { date, paymentType, cashierId, search } = req.query;

    let query = `
      SELECT t.*, u.username as cashier_name
      FROM transactions t
      LEFT JOIN users u ON t.user_id = u.user_id
      WHERE t.store_id = ?
    `;
    const params = [storeId];

    if (date) {
      query += " AND DATE(t.transaction_time) = ?";
      params.push(date);
    }

    if (paymentType) {
      if (paymentType === "tunai") {
        query += " AND t.payment_method = 'Tunai'";
      } else if (paymentType === "non-tunai") {
        query += " AND t.payment_method != 'Tunai'";
      }
    }

    if (cashierId) {
      query += " AND t.user_id = ?";
      params.push(cashierId);
    }

    if (search) {
      const idNumber = search.replace(/\D/g, "");
      if (idNumber) {
        query += " AND t.transaction_id LIKE ?";
        params.push(`%${idNumber}%`);
      }
    }

    query += " ORDER BY t.transaction_time DESC";

    const [transactions] = await db.query(query, params);
    res.json(transactions);
  } catch (error) {
    console.error("Error fetch transactions:", error);
    res.status(500).json({ message: "Gagal mengambil data transaksi." });
  }
};

// 3. GET (Single) - Ambil Detail Transaksi
exports.getTransactionById = async (req, res) => {
  try {
    const { storeId } = await getStoreAndUser(req);
    const transactionId = req.params.id;

    // 1. Data Utama
    const [transactions] = await db.query(
      `SELECT t.*, u.username as cashier_name, s.display_name as store_name
       FROM transactions t
       LEFT JOIN users u ON t.user_id = u.user_id
       LEFT JOIN stores s ON t.store_id = s.store_id
       WHERE t.transaction_id = ? AND t.store_id = ?`,
      [transactionId, storeId]
    );

    if (transactions.length === 0) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan." });
    }
    const transaction = transactions[0];

    // 2. Detail Item
    const [items] = await db.query(
      `SELECT td.*, p.product_name 
       FROM transaction_details td
       LEFT JOIN products p ON td.product_id = p.product_id
       WHERE td.transaction_id = ?`,
      [transactionId]
    );

    transaction.items = items;
    res.json(transaction);
  } catch (error) {
    console.error("Error fetch transaction detail:", error);
    res.status(500).json({ message: "Gagal mengambil detail transaksi." });
  }
};
