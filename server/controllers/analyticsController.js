// server/controllers/analyticsController.js
const db = require("../config/db");

// Helper
const getStoreId = async (userId) => {
  const [stores] = await db.query(
    "SELECT store_id FROM stores WHERE user_id = ?",
    [userId]
  );
  return stores.length > 0 ? stores[0].store_id : null;
};

exports.getDashboardStats = async (req, res) => {
  try {
    const storeId = await getStoreId(req.user.user_id);

    // 1. Ringkasan Utama
    const [todayStats] = await db.query(
      `
            SELECT 
                COALESCE(SUM(total_price), 0) as today_revenue,
                COUNT(*) as today_transactions
            FROM transactions 
            WHERE store_id = ? AND DATE(transaction_time) = CURDATE()
        `,
      [storeId]
    );

    const [totalStats] = await db.query(
      `
            SELECT 
                COALESCE(SUM(t.total_price), 0) as total_revenue,
                COUNT(t.transaction_id) as total_transactions,
                COALESCE((SELECT SUM(quantity) FROM transaction_details td JOIN transactions tr ON td.transaction_id = tr.transaction_id WHERE tr.store_id = ?), 0) as total_products_sold
            FROM transactions t WHERE t.store_id = ?
        `,
      [storeId, storeId]
    );

    const [lowStock] = await db.query(
      `
            SELECT COUNT(*) as count FROM products 
            WHERE store_id = ? AND current_stock <= min_stock_alert AND stock_management_type = 'stock_based'
        `,
      [storeId]
    );

    // 2. Grafik Tren Penjualan (PERBAIKAN DISINI)
    // Kita GROUP BY menggunakan format tanggal yang sama persis
    const [salesTrend] = await db.query(
      `
            SELECT 
                DATE_FORMAT(transaction_time, '%d %b') as date,
                SUM(total_price) as total
            FROM transactions 
            WHERE store_id = ? AND transaction_time >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            GROUP BY DATE_FORMAT(transaction_time, '%d %b'), DATE(transaction_time)
            ORDER BY DATE(transaction_time) ASC
        `,
      [storeId]
    );

    // 3. Grafik Kategori (PERBAIKAN DISINI)
    // Kita tambahkan c.category_name ke GROUP BY
    const [categoryDist] = await db.query(
      `
            SELECT 
                COALESCE(c.category_name, 'Uncategorized') as name,
                COALESCE(SUM(td.quantity), 0) as value
            FROM transaction_details td
            JOIN products p ON td.product_id = p.product_id
            LEFT JOIN categories c ON p.category_id = c.category_id
            JOIN transactions t ON td.transaction_id = t.transaction_id
            WHERE t.store_id = ?
            GROUP BY c.category_id, c.category_name
        `,
      [storeId]
    );

    // 4. Top Produk (PERBAIKAN DISINI)
    // Kita tambahkan semua kolom non-agregat ke GROUP BY
    const [topProducts] = await db.query(
      `
            SELECT 
                p.product_name as name,
                COALESCE(SUM(td.quantity), 0) as sold,
                p.current_stock as stock,
                p.min_stock_alert
            FROM transaction_details td
            JOIN products p ON td.product_id = p.product_id
            JOIN transactions t ON td.transaction_id = t.transaction_id
            WHERE t.store_id = ?
            GROUP BY p.product_id, p.product_name, p.current_stock, p.min_stock_alert
            ORDER BY sold DESC
            LIMIT 5
        `,
      [storeId]
    );

    res.json({
      summary: {
        today_revenue: Number(todayStats[0].today_revenue),
        today_transactions: Number(todayStats[0].today_transactions),
        total_revenue: Number(totalStats[0].total_revenue),
        products_sold: Number(totalStats[0].total_products_sold),
        total_transactions: Number(totalStats[0].total_transactions),
        low_stock_count: Number(lowStock[0].count),
      },
      trend: salesTrend,
      categories: categoryDist,
      topProducts: topProducts,
    });
  } catch (error) {
    console.error("Analytics Error Detail:", error);
    res
      .status(500)
      .json({ message: "Gagal memuat data analitik: " + error.message });
  }
};
