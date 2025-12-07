// server/routes/journalRoutes.js
const express = require("express");
const router = express.Router();
const journalController = require("../controllers/journalController");
const verifyToken = require("../middleware/authMiddleware");

router.use(verifyToken);
router.get("/", journalController.getJournalData);

module.exports = router;
