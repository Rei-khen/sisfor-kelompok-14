// server/routes/productRoutes.js
const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const verifyToken = require("../middleware/authMiddleware");

router.use(verifyToken); // Wajib login untuk akses semua

// Rute untuk MENAMPILKAN produk
router.get("/", productController.getProducts);

// Rute untuk MENAMBAH produk
router.post("/", productController.createProduct);

router.get("/:id/sales", productController.getProductSalesHistory);

// (Kita tambahkan rute DELETE dan UPDATE nanti)
// router.delete('/:id', productController.deleteProduct);

module.exports = router;
