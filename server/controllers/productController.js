// server/controllers/productController.js
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

// 1. LOGIKA "TAMBAH PRODUK" (Versi Lengkap Sesuai UI)
exports.createProduct = async (req, res) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const { storeId, userId } = await getStoreAndUser(req);

    // Ambil SEMUA data dari form frontend
    const {
      // Bagian Utama
      product_name,
      category_id,
      price_cost_determination, // "Harga pokok ditentukan" (ini adalah price_cost)
      price_sell,

      // Bagian Opsional
      description,
      barcode,
      stock_management_type,
      purchase_price_method, // "Pengaturan Harga pokok"
      initial_stock,
      min_stock_alert,
      // total_purchase_price, (Dihitung otomatis)
      unit_purchase_price, // "Harga satu pembelian stok"
      selling_price_method, // "Pengaturan harga jual"
      unit,
      weight,
      serial_number,
      price_variants, // Array: [{ name: "Grosir", price: 10000 }]
    } = req.body;

    // Validasi dasar
    if (!product_name || !price_sell) {
      return res
        .status(400)
        .json({ message: "Nama produk dan Harga Jual wajib diisi." });
    }

    // Tentukan harga pokok (purchase_price)
    // Sesuai UI, "Harga pokok ditentukan" adalah harga beli awal
    const final_purchase_price =
      price_cost_determination || unit_purchase_price || 0;

    // Langkah 1: INSERT ke 'products'
    const [productResult] = await connection.query(
      `INSERT INTO products (
                store_id, category_id, product_name, description, barcode, unit, weight, serial_number, 
                purchase_price, selling_price, stock_management_type, current_stock, min_stock_alert
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        storeId,
        category_id || null,
        product_name,
        description,
        barcode || null,
        unit,
        weight || null,
        serial_number,
        final_purchase_price,
        price_sell,
        stock_management_type,
        initial_stock || 0,
        min_stock_alert || 0,
      ]
    );
    const newProductId = productResult.insertId;

    // Langkah 2: INSERT stok awal ke 'stock_movement'
    if (stock_management_type === "stock_based" && initial_stock > 0) {
      const total_cost = (unit_purchase_price || 0) * (initial_stock || 0);
      await connection.query(
        `INSERT INTO stock_movement (product_id, store_id, recorded_by_user_id, movement_type, quantity, unit_cost, total_cost)
                 VALUES (?, ?, ?, 'in', ?, ?, ?)`,
        [
          newProductId,
          storeId,
          userId,
          initial_stock,
          unit_purchase_price || 0,
          total_cost,
        ]
      );
    }

    // Langkah 3: INSERT variasi harga (jika ada)
    if (price_variants && price_variants.length > 0) {
      const variantValues = price_variants.map((v) => [
        newProductId,
        v.variant_name,
        v.price,
      ]);
      await connection.query(
        "INSERT INTO product_price_variants (product_id, variant_name, price) VALUES ?",
        [variantValues]
      );
    }

    await connection.commit();
    res.status(201).json({
      message: "Produk berhasil ditambahkan!",
      productId: newProductId,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error create product:", error);
    res
      .status(500)
      .json({ message: "Gagal menambah produk.", error: error.message });
  } finally {
    connection.release();
  }
};

// 2. LOGIKA "MENAMPILKAN PRODUK" (Updated dengan Variasi)
exports.getProducts = async (req, res) => {
  try {
    const { storeId } = await getStoreAndUser(req);

    // 1. Ambil data produk utama
    const [products] = await db.query(
      `SELECT p.*, c.category_name 
             FROM products p
             LEFT JOIN categories c ON p.category_id = c.category_id
             WHERE p.store_id = ?
             ORDER BY p.product_name ASC`,
      [storeId]
    );

    // 2. Ambil SEMUA variasi harga milik toko ini (dioptimalkan)
    // Kita cari variasi yang product_id-nya ada di daftar produk toko ini
    const productIds = products.map((p) => p.product_id);
    let variants = [];

    if (productIds.length > 0) {
      const [rows] = await db.query(
        `SELECT * FROM product_price_variants WHERE product_id IN (?)`,
        [productIds]
      );
      variants = rows;
    }

    // 3. Gabungkan variasi ke dalam objek produk
    const productsWithVariants = products.map((product) => {
      const productVariants = variants.filter(
        (v) => v.product_id === product.product_id
      );
      return {
        ...product,
        variants: productVariants, // Tambahkan array variants ke respon
      };
    });

    res.json(productsWithVariants);
  } catch (error) {
    console.error("Error fetch products:", error);
    res
      .status(500)
      .json({ message: "Gagal mengambil data produk.", error: error.message });
  }
};

// 3. GET - Ambil Histori PENJUALAN per Produk
exports.getProductSalesHistory = async (req, res) => {
  try {
    const { storeId } = await getStoreAndUser(req);
    const productId = req.params.id;

    const [history] = await db.query(
      `SELECT 
                t.transaction_time, 
                td.quantity, 
                td.price_per_unit, 
                td.total_price, 
                u.username as cashier_name
             FROM transaction_details td
             JOIN transactions t ON td.transaction_id = t.transaction_id
             LEFT JOIN users u ON t.user_id = u.user_id
             WHERE t.store_id = ? AND td.product_id = ?
             ORDER BY t.transaction_time DESC`,
      [storeId, productId]
    );

    res.json(history);
  } catch (error) {
    console.error("Error fetch sales history:", error);
    res
      .status(500)
      .json({ message: "Gagal mengambil data histori penjualan." });
  }
};
