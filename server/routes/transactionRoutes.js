const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");
const verifyToken = require("../middleware/authMiddleware");

router.use(verifyToken);
router.post("/", transactionController.createTransaction); // API: POST /api/transactions
router.get("/", transactionController.getTransactions); // <-- Baru: List
router.get("/:id", transactionController.getTransactionById); // <-- Baru: Detail
module.exports = router;
