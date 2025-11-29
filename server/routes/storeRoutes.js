// server/routes/storeRoutes.js
const express = require("express");
const router = express.Router();
const storeController = require("../controllers/storeController");
const verifyToken = require("../middleware/authMiddleware");

// Semua route di bawah ini butuh login (verifyToken)
router.get("/my-store", verifyToken, storeController.getMyStore);
router.post("/create", verifyToken, storeController.createStore);

module.exports = router;
