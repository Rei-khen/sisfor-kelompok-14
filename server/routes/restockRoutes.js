// server/routes/restockRoutes.js
const express = require("express");
const router = express.Router();
const restockController = require("../controllers/restockController");
const verifyToken = require("../middleware/authMiddleware");

router.use(verifyToken);
router.post("/", restockController.addStock);
router.get("/:productId", restockController.getRestockHistory);

module.exports = router;
