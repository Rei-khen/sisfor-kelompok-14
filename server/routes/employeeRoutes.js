// server/routes/employeeRoutes.js
const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employeeController");
const verifyToken = require("../middleware/authMiddleware");

router.use(verifyToken);

router.get("/", employeeController.getEmployees);
router.post("/", employeeController.createEmployee);

module.exports = router;
