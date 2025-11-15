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
    res
      .status(201)
      .json({
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
