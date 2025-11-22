// server/controllers/transactionController.js
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

// API untuk menyimpan transaksi baru
exports.createTransaction = async (req, res) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const { storeId, userId } = await getStoreAndUser(req);

    // Data dari frontend
    const {
      cartItems, // Array [ { product_id, quantity, selling_price }, ... ]
      paymentMethod,
      customerName,
      subtotal,
      discountAmount,
      total,
    } = req.body;

    // 1. INSERT ke tabel 'transactions' (ringkasan) [cite: 1131]
    const [transResult] = await connection.query(
      `INSERT INTO transactions (store_id, user_id, total_price, discount, subtotal, payment_method, customer_name)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
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

    // 2. Loop & INSERT ke 'transaction_details' [cite: 1132]
    const detailPromises = cartItems.map((item) => {
      return connection.query(
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
    });
    await Promise.all(detailPromises);

    // 3. UPDATE stok produk di tabel 'products' [cite: 1133]
    const stockPromises = cartItems.map((item) => {
      return connection.query(
        `UPDATE products SET current_stock = current_stock - ? 
                 WHERE product_id = ? AND stock_management_type = 'stock_based'`, // Hanya update jika tipe-nya 'stock_based'
        [item.quantity, item.product_id]
      );
    });
    await Promise.all(stockPromises);

    // Jika semua berhasil
    await connection.commit();
    res.status(201).json({
      message: "Transaksi berhasil disimpan!",
      transactionId: newTransactionId,
    });
  } catch (error) {
    await connection.rollback(); // Batalkan semua jika ada 1 error
    console.error("Error saat menyimpan transaksi:", error);
    res
      .status(500)
      .json({ message: "Gagal menyimpan transaksi.", error: error.message });
  } finally {
    connection.release();
  }
};

// 2. GET - Ambil Daftar Transaksi (dengan filter tanggal opsional)
// 2. GET - Ambil Daftar Transaksi dengan Filter Lengkap
exports.getTransactions = async (req, res) => {
  try {
    const { storeId } = await getStoreAndUser(req);

    // Ambil parameter dari query string (frontend)
    const { date, paymentType, cashierId, search } = req.query;

    let query = `
            SELECT t.*, u.username as cashier_name
            FROM transactions t
            LEFT JOIN users u ON t.user_id = u.user_id
            WHERE t.store_id = ?
        `;
    const params = [storeId];

    // 1. Filter Tanggal (Jika ada)
    if (date) {
      query += " AND DATE(t.transaction_time) = ?";
      params.push(date);
    }

    // 2. Filter Metode Bayar (Tunai vs Non-Tunai)
    if (paymentType) {
      if (paymentType === "tunai") {
        query += " AND t.payment_method = 'Tunai'";
      } else if (paymentType === "non-tunai") {
        // Anggap semua yang bukan 'Tunai' adalah Non-Tunai
        query += " AND t.payment_method != 'Tunai'";
      }
    }

    // 3. Filter Kasir
    if (cashierId) {
      query += " AND t.user_id = ?";
      params.push(cashierId);
    }

    // 4. Filter Cari Struk (Search ID)
    if (search) {
      // User mungkin mengetik "SR123", kita ambil angkanya saja "123"
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

// 3. GET (Single) - Ambil Detail Transaksi (termasuk items)
exports.getTransactionById = async (req, res) => {
  try {
    const { storeId } = await getStoreAndUser(req);
    const transactionId = req.params.id;

    // 1. Ambil Data Utama Transaksi
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

    // 2. Ambil Detail Item (Produk yang dibeli)
    const [items] = await db.query(
      `SELECT td.*, p.product_name 
             FROM transaction_details td
             LEFT JOIN products p ON td.product_id = p.product_id
             WHERE td.transaction_id = ?`,
      [transactionId]
    );

    // Gabungkan
    transaction.items = items;

    res.json(transaction);
  } catch (error) {
    console.error("Error fetch transaction detail:", error);
    res.status(500).json({ message: "Gagal mengambil detail transaksi." });
  }
};
