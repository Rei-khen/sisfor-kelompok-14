// server/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]; // Biasanya format: "Bearer <token>"

  if (!token) {
    return res
      .status(403)
      .json({ message: "Token diperlukan untuk akses ini." });
  }

  try {
    // Ambil token asli setelah kata "Bearer "
    const bearer = token.split(" ");
    const bearerToken = bearer[1];

    const decoded = jwt.verify(bearerToken, process.env.JWT_SECRET);
    req.user = decoded; // Simpan data user di request agar bisa dipakai di controller
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token tidak valid." });
  }
};

module.exports = verifyToken;
