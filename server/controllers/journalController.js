// server/controllers/journalController.js
const db = require("../config/db");

// Helper
const getStoreId = async (userId) => {
  const [stores] = await db.query(
    "SELECT store_id FROM stores WHERE user_id = ?",
    [userId]
  );
  return stores.length > 0 ? stores[0].store_id : null;
};

exports.getJournalData = async (req, res) => {
  try {
    const storeId = await getStoreId(req.user.user_id);
    const { startDate, endDate, paymentMethod, cashierId } = req.query;

    // Query Dasar: Transaksi + Kasir + Hitung Modal (COGS)
    // Kita join ke products untuk ambil purchase_price saat ini sebagai estimasi modal
    let query = `
            SELECT 
                t.transaction_id,
                t.transaction_time,
                t.payment_method,
                t.total_price as revenue,
                u.username as cashier_name,
                COALESCE(SUM(td.quantity * p.purchase_price), 0) as total_cogs
            FROM transactions t
            JOIN transaction_details td ON t.transaction_id = td.transaction_id
            JOIN products p ON td.product_id = p.product_id
            LEFT JOIN users u ON t.user_id = u.user_id
            WHERE t.store_id = ?
        `;

    const params = [storeId];

    // --- FILTER ---
    if (startDate && endDate) {
      query += " AND DATE(t.transaction_time) BETWEEN ? AND ?";
      params.push(startDate, endDate);
    } else if (startDate) {
      query += " AND DATE(t.transaction_time) = ?";
      params.push(startDate);
    }

    if (cashierId) {
      query += " AND t.user_id = ?";
      params.push(cashierId);
    }

    if (paymentMethod) {
      if (paymentMethod.toLowerCase() === "tunai") {
        query += " AND t.payment_method = 'Tunai'";
      } else if (paymentMethod.toLowerCase() === "non-tunai") {
        query += " AND t.payment_method != 'Tunai'";
      }
    }

    query += " GROUP BY t.transaction_id ORDER BY t.transaction_time DESC";

    const [rows] = await db.query(query, params);

    // --- HITUNG RINGKASAN (Summary) ---
    let summary = {
      total_cogs: 0, // Harga Pokok
      total_revenue: 0, // Harga Jual
      total_profit: 0, // Laba
    };

    // Format data per baris
    const formattedData = rows.map((row) => {
      const revenue = Number(row.revenue);
      const cogs = Number(row.total_cogs);
      const profit = revenue - cogs;

      // Akumulasi ke summary
      summary.total_revenue += revenue;
      summary.total_cogs += cogs;
      summary.total_profit += profit;

      return {
        transaction_id: row.transaction_id,
        date: row.transaction_time,
        cashier: row.cashier_name,
        status: row.payment_method, // Tunai / Gopay / dll
        profit: profit,
      };
    });

    res.json({
      summary,
      data: formattedData,
    });
  } catch (error) {
    console.error("Journal Error:", error);
    res.status(500).json({ message: "Gagal memuat data jurnal." });
  }
};
