// server/controllers/productController.js
const db = require("../config/db");

// Helper untuk mendapatkan store_id dan user_id dari token
const getStoreAndUser = async (req) => {
  const userId = req.user.user_id;
  const [stores] = await db.query(
    "SELECT store_id FROM stores WHERE user_id = ?",
    [userId]
  );
  if (stores.length === 0) throw new Error("Toko tidak ditemukan.");
  return { storeId: stores[0].store_id, userId };
};

// 1. TAMBAH PRODUK BARU (POST)
exports.createProduct = async (req, res) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const { storeId, userId } = await getStoreAndUser(req);

    // Ambil path gambar jika ada upload
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const {
      product_name,
      category_id,
      description,
      barcode,
      unit,
      weight,
      serial_number,
      price_cost_determination, // Harga pokok manual
      price_sell,
      stock_management_type,
      min_stock_alert,
      initial_stock,
      unit_purchase_price, // Harga beli per unit (untuk stok awal)
      price_variants,
    } = req.body;

    if (!product_name || !price_sell) {
      return res.status(400).json({ message: "Nama dan Harga Jual wajib." });
    }

    // Tentukan harga pokok awal
    const final_purchase_price =
      price_cost_determination || unit_purchase_price || 0;

    // A. INSERT ke tabel products
    const [prodRes] = await connection.query(
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
        stock_management_type || "stock_based",
        initial_stock || 0,
        min_stock_alert || 0,
      ]
    );
    const newProductId = prodRes.insertId;

    // B. INSERT Gambar (Jika ada)
    if (imagePath) {
      await connection.query(
        `INSERT INTO product_images (product_id, image_url, is_thumbnail) VALUES (?, ?, ?)`,
        [newProductId, imagePath, true]
      );
    }

    // C. INSERT Stok Awal ke Riwayat (Jika stok > 0 dan manajemen aktif)
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

    // D. INSERT Variasi Harga (Parsing JSON jika dikirim via FormData)
    if (price_variants) {
      let parsedVariants = [];
      try {
        // Cek jika sudah object atau masih string JSON
        parsedVariants =
          typeof price_variants === "string"
            ? JSON.parse(price_variants)
            : price_variants;
      } catch (e) {
        parsedVariants = [];
      }

      if (parsedVariants.length > 0) {
        const variantValues = parsedVariants.map((v) => [
          newProductId,
          v.variant_name,
          v.price,
        ]);
        await connection.query(
          "INSERT INTO product_price_variants (product_id, variant_name, price) VALUES ?",
          [variantValues]
        );
      }
    }

    await connection.commit();
    res.status(201).json({ message: "Produk berhasil ditambahkan!" });
  } catch (error) {
    await connection.rollback();
    console.error("Error create product:", error);
    // Handle duplicate entry error (misal barcode sama)
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ message: "Barcode atau data unik lain sudah terpakai." });
    }
    res.status(500).json({ message: "Gagal menambah produk." });
  } finally {
    connection.release();
  }
};

// 2. GET SEMUA PRODUK (LIST)
exports.getProducts = async (req, res) => {
  try {
    const { storeId } = await getStoreAndUser(req);

    // Ambil produk + kategori + gambar thumbnail
    const [products] = await db.query(
      `SELECT p.*, c.category_name, pi.image_url
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.category_id
       LEFT JOIN product_images pi ON p.product_id = pi.product_id AND pi.is_thumbnail = 1
       WHERE p.store_id = ?
       ORDER BY p.product_name ASC`,
      [storeId]
    );

    // Ambil semua variasi harga untuk toko ini (Optimasi query N+1)
    const productIds = products.map((p) => p.product_id);
    let variants = [];

    if (productIds.length > 0) {
      const [rows] = await db.query(
        `SELECT * FROM product_price_variants WHERE product_id IN (?)`,
        [productIds]
      );
      variants = rows;
    }

    // Gabungkan variasi ke dalam objek produk
    const productsWithVariants = products.map((product) => {
      const productVariants = variants.filter(
        (v) => v.product_id === product.product_id
      );
      return {
        ...product,
        variants: productVariants,
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

// 3. GET HISTORI PENJUALAN PER PRODUK
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

// 4. GET DETAIL SATU PRODUK (UNTUK EDIT)
exports.getProductById = async (req, res) => {
  try {
    const { storeId } = await getStoreAndUser(req);
    const productId = req.params.id;

    // Ambil data produk utama
    const [products] = await db.query(
      `SELECT * FROM products WHERE product_id = ? AND store_id = ?`,
      [productId, storeId]
    );

    if (products.length === 0) {
      return res.status(404).json({ message: "Produk tidak ditemukan." });
    }
    const product = products[0];

    // Ambil variasi harga
    const [variants] = await db.query(
      `SELECT variant_name, price FROM product_price_variants WHERE product_id = ?`,
      [productId]
    );

    product.price_variants = variants;
    res.json(product);
  } catch (error) {
    console.error("Error fetch product detail:", error);
    res.status(500).json({ message: "Gagal mengambil data produk." });
  }
};

// 5. UPDATE PRODUK (PUT)
exports.updateProduct = async (req, res) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const { storeId } = await getStoreAndUser(req);
    const productId = req.params.id;

    // Ambil path gambar baru jika ada
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const {
      product_name,
      category_id,
      description,
      barcode,
      unit,
      weight,
      serial_number,
      price_cost_determination,
      price_sell,
      stock_management_type,
      min_stock_alert,
      unit_purchase_price,
      price_variants,
    } = req.body;

    const final_purchase_price =
      price_cost_determination || unit_purchase_price || 0;

    // A. Update tabel Products
    await connection.query(
      `UPDATE products SET 
        category_id = ?, product_name = ?, description = ?, barcode = ?, 
        unit = ?, weight = ?, serial_number = ?, 
        purchase_price = ?, selling_price = ?, 
        stock_management_type = ?, min_stock_alert = ?
       WHERE product_id = ? AND store_id = ?`,
      [
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
        min_stock_alert || 0,
        productId,
        storeId,
      ]
    );

    // B. Update Gambar (Hanya jika ada upload baru)
    if (imagePath) {
      // Hapus referensi lama (Opsional: hapus file fisiknya juga idealnya)
      await connection.query(
        "DELETE FROM product_images WHERE product_id = ?",
        [productId]
      );
      // Insert yang baru
      await connection.query(
        `INSERT INTO product_images (product_id, image_url, is_thumbnail) VALUES (?, ?, ?)`,
        [productId, imagePath, true]
      );
    }

    // C. Update Variasi Harga (Hapus lalu Insert ulang)
    await connection.query(
      "DELETE FROM product_price_variants WHERE product_id = ?",
      [productId]
    );

    let parsedVariants = [];
    try {
      parsedVariants =
        typeof price_variants === "string"
          ? JSON.parse(price_variants)
          : price_variants;
    } catch (e) {
      parsedVariants = [];
    }

    if (parsedVariants && parsedVariants.length > 0) {
      const variantValues = parsedVariants.map((v) => [
        productId,
        v.variant_name,
        v.price,
      ]);
      await connection.query(
        "INSERT INTO product_price_variants (product_id, variant_name, price) VALUES ?",
        [variantValues]
      );
    }

    await connection.commit();
    res.json({ message: "Produk berhasil diperbarui!" });
  } catch (error) {
    await connection.rollback();
    console.error("Error update product:", error);
    res
      .status(500)
      .json({ message: "Gagal update produk.", error: error.message });
  } finally {
    connection.release();
  }
};
