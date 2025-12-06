// server/controllers/productController.js
const db = require("../config/db");
const fs = require('fs');
const path = require('path');

// Helper untuk mendapatkan store_id dan user_id dari token
const getStoreAndUser = async (req) => {
  if (!req.user || !req.user.user_id) throw new Error("Unauthorized");
  const userId = req.user.user_id;
  
  const [stores] = await db.query(
    "SELECT store_id FROM stores WHERE user_id = ?",
    [userId]
  );
  
  if (stores.length === 0) throw new Error("Toko tidak ditemukan.");
  return { storeId: stores[0].store_id, userId };
};

// 1. TAMBAH PRODUK BARU (FIXED: ERROR SELLING_PRICE NULL)
exports.createProduct = async (req, res) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const { storeId, userId } = await getStoreAndUser(req);
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    // Ambil data dari body
    const {
      product_name, category_id, description, barcode, unit, weight, serial_number,
      price_cost_determination, 
      selling_price, // <--- KITA UBAH DISINI (Dulu price_sell, sekarang selling_price)
      stock_management_type,
      min_stock_alert, 
      initial_stock, 
      unit_purchase_price, 
      price_variants,
      location_source
    } = req.body;

    // Validasi sederhana
    if (!product_name) {
      return res.status(400).json({ message: "Nama Produk wajib diisi." });
    }

    // Default value agar tidak NULL
    const final_purchase_price = price_cost_determination || unit_purchase_price || 0;
    const final_selling_price = selling_price || 0; // <--- Jaga-jaga kalau frontend kirim kosong, jadi 0

    // Tentukan stok masuk kemana (Gudang atau Toko)
    let storeStock = 0;
    let warehouseStock = 0;

    if (location_source === 'gudang') {
        warehouseStock = Number(initial_stock) || 0;
    } else {
        storeStock = Number(initial_stock) || 0;
    }

    // A. INSERT ke tabel products
    const [prodRes] = await connection.query(
      `INSERT INTO products (
        store_id, category_id, product_name, description, barcode, unit, weight, serial_number, 
        purchase_price, selling_price, stock_management_type, current_stock, warehouse_stock, min_stock_alert
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        final_selling_price, // <--- Masukkan variabel yang sudah dipastikan tidak NULL
        stock_management_type || "stock_based", 
        storeStock, 
        warehouseStock, 
        min_stock_alert || 0,
      ]
    );
    const newProductId = prodRes.insertId;

    // B. INSERT Gambar
    if (imagePath) {
      await connection.query(
        `INSERT INTO product_images (product_id, image_url, is_thumbnail) VALUES (?, ?, ?)`,
        [newProductId, imagePath, true]
      );
    }

    // C. INSERT Stok Awal ke Riwayat
    if (stock_management_type === "stock_based" && initial_stock > 0) {
      const total_cost = (unit_purchase_price || 0) * (initial_stock || 0);
      await connection.query(
        `INSERT INTO stock_movement (product_id, store_id, recorded_by_user_id, movement_type, quantity, unit_cost, total_cost)
         VALUES (?, ?, ?, 'in', ?, ?, ?)`,
        [newProductId, storeId, userId, initial_stock, unit_purchase_price || 0, total_cost]
      );
    }

    // D. INSERT Variasi Harga
    if (price_variants) {
      let parsedVariants = [];
      try {
        parsedVariants = typeof price_variants === "string" ? JSON.parse(price_variants) : price_variants;
      } catch (e) { parsedVariants = []; }

      if (parsedVariants.length > 0) {
        const variantValues = parsedVariants.map((v) => [newProductId, v.variant_name, v.price]);
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
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Barcode sudah terpakai." });
    }
    res.status(500).json({ message: "Gagal menambah produk." });
  } finally {
    connection.release();
  }
};

// 2. GET SEMUA PRODUK (DENGAN PAGINATION)
exports.getProducts = async (req, res) => {
  try {
    const { storeId } = await getStoreAndUser(req);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    const [countResult] = await db.query(
        `SELECT COUNT(*) as total FROM products 
         WHERE store_id = ? AND (product_name LIKE ? OR barcode LIKE ?)`,
        [storeId, `%${search}%`, `%${search}%`]
    );
    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    const [products] = await db.query(
      `SELECT p.*, c.category_name, pi.image_url, s.store_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.category_id
       LEFT JOIN product_images pi ON p.product_id = pi.product_id AND pi.is_thumbnail = 1
       LEFT JOIN stores s ON p.store_id = s.store_id
       WHERE p.store_id = ? AND (p.product_name LIKE ? OR p.barcode LIKE ?)
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [storeId, `%${search}%`, `%${search}%`, limit, offset]
    );

    res.json({
        data: products,
        page,
        totalPages,
        totalItems
    });

  } catch (error) {
    console.error("Error fetch products:", error);
    res.status(500).json({ message: "Gagal mengambil data produk.", error: error.message });
  }
};

// 3. TRANSFER STOK (GUDANG -> TOKO)
exports.transferStock = async (req, res) => {
    const connection = await db.getConnection();
    await connection.beginTransaction();
    try {
        const { id } = req.params; 
        const { quantity } = req.body; 

        const [rows] = await connection.query("SELECT warehouse_stock FROM products WHERE product_id = ?", [id]);
        if (rows.length === 0) throw new Error("Produk tidak ditemukan");
        
        if (rows[0].warehouse_stock < quantity) {
            return res.status(400).json({ message: "Stok gudang tidak cukup!" });
        }

        await connection.query(
            `UPDATE products SET 
             warehouse_stock = warehouse_stock - ?,
             current_stock = current_stock + ?
             WHERE product_id = ?`,
            [quantity, quantity, id]
        );

        await connection.commit();
        res.json({ message: "Stok berhasil dipindahkan ke Toko" });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: error.message });
    } finally {
        connection.release();
    }
};

// ... (Fungsi updateProduct, deleteProduct, getById dll biarkan saja seperti file asli Anda, atau copy dari jawaban sebelumnya jika hilang) ...
// Pastikan updateProduct dan deleteProduct ada agar fitur Edit/Hapus jalan.
exports.getProductById = async (req, res) => {
    try {
      const { storeId } = await getStoreAndUser(req);
      const productId = req.params.id;
      const [products] = await db.query(
        `SELECT * FROM products WHERE product_id = ? AND store_id = ?`,
        [productId, storeId]
      );
      if (products.length === 0) return res.status(404).json({ message: "Produk tidak ditemukan." });
      const product = products[0];
      const [variants] = await db.query(`SELECT variant_name, price FROM product_price_variants WHERE product_id = ?`, [productId]);
      product.price_variants = variants;
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil detail produk." });
    }
};

exports.getProductSalesHistory = async (req, res) => { /* logic sales history */ };

exports.updateProduct = async (req, res) => {
    const connection = await db.getConnection();
    await connection.beginTransaction();
    try {
        const { storeId } = await getStoreAndUser(req);
        const productId = req.params.id;
        const {
            product_name, category_id, description, barcode, unit, weight, serial_number,
            selling_price, stock_management_type, min_stock_alert
        } = req.body;

        await connection.query(
            `UPDATE products SET 
                product_name=?, category_id=?, description=?, barcode=?, unit=?, weight=?, serial_number=?, 
                selling_price=?, stock_management_type=?, min_stock_alert=?
            WHERE product_id=? AND store_id=?`,
            [product_name, category_id, description, barcode, unit, weight, serial_number, selling_price, stock_management_type, min_stock_alert, productId, storeId]
        );
        await connection.commit();
        res.json({ message: "Produk berhasil diperbarui!" });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: "Gagal update." });
    } finally {
        connection.release();
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query(`DELETE FROM products WHERE product_id = ?`, [id]);
        res.json({ message: "Produk berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ message: "Gagal hapus produk" });
    }
};  