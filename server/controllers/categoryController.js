// server/controllers/categoryController.js
const db = require("../config/db");

// Helper untuk mendapatkan store_id dari user_id yang sedang login
const getStoreId = async (userId) => {
  const [stores] = await db.query(
    "SELECT store_id FROM stores WHERE user_id = ?",
    [userId]
  );
  return stores.length > 0 ? stores[0].store_id : null;
};

// 1. GET - Ambil semua kategori untuk toko yang sedang login
exports.getCategories = async (req, res) => {
  try {
    const storeId = await getStoreId(req.user.user_id);
    if (!storeId)
      return res.status(404).json({ message: "Toko tidak ditemukan." });

    // Kita ambil data kategori.
    // (Nanti bisa ditambahkan COUNT() untuk menghitung jumlah produk per kategori sesuai gambar)
    const [categories] = await db.query(
      "SELECT * FROM categories WHERE store_id = ? ORDER BY created_at DESC",
      [storeId]
    );
    res.json(categories);
  } catch (error) {
    console.error("Error fetch categories:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// 2. GET (Single) - Ambil 1 kategori untuk diedit
exports.getCategoryById = async (req, res) => {
  try {
    const storeId = await getStoreId(req.user.user_id);
    // Pastikan kategori milik toko yang benar
    const [category] = await db.query(
      "SELECT * FROM categories WHERE category_id = ? AND store_id = ?",
      [req.params.id, storeId]
    );

    if (category.length === 0) {
      return res.status(404).json({ message: "Kategori tidak ditemukan." });
    }
    res.json(category[0]);
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

// 3. POST - Tambah kategori baru
exports.createCategory = async (req, res) => {
  try {
    const storeId = await getStoreId(req.user.user_id);
    if (!storeId)
      return res.status(404).json({ message: "Toko tidak ditemukan." });

    const { category_name, transaction_type } = req.body;

    if (!category_name) {
      return res.status(400).json({ message: "Nama kategori wajib diisi." });
    }

    await db.query(
      "INSERT INTO categories (store_id, category_name, transaction_type) VALUES (?, ?, ?)",
      [storeId, category_name, transaction_type || "Umum"]
    );

    res.status(201).json({ message: "Kategori berhasil ditambahkan." });
  } catch (error) {
    console.error("Error create category:", error);
    res.status(500).json({ message: "Gagal menambah kategori." });
  }
};

// 4. PUT - Update kategori
exports.updateCategory = async (req, res) => {
  try {
    const storeId = await getStoreId(req.user.user_id);
    const { category_name, transaction_type } = req.body;
    const categoryId = req.params.id;

    await db.query(
      "UPDATE categories SET category_name = ?, transaction_type = ? WHERE category_id = ? AND store_id = ?",
      [category_name, transaction_type, categoryId, storeId]
    );

    res.json({ message: "Kategori berhasil diupdate." });
  } catch (error) {
    res.status(500).json({ message: "Gagal update kategori." });
  }
};

// 5. DELETE - Hapus kategori
exports.deleteCategory = async (req, res) => {
  try {
    const storeId = await getStoreId(req.user.user_id);
    const categoryId = req.params.id;

    await db.query(
      "DELETE FROM categories WHERE category_id = ? AND store_id = ?",
      [categoryId, storeId]
    );

    res.json({ message: "Kategori berhasil dihapus." });
  } catch (error) {
    res.status(500).json({ message: "Gagal menghapus kategori." });
  }
};
