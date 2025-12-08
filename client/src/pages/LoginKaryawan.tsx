// client/src/pages/LoginKaryawan.tsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const LoginKaryawan: React.FC = () => {
  const [username, setUsername] = useState(""); // Karyawan biasanya pakai username
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Endpoint backend tetap sama, karena backend akan mengecek data di tabel users
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          username, 
          password,
        }
      );

      // Cek Role di Frontend (Opsional, untuk memastikan yang login benar-benar karyawan)
      const userRole = response.data.user.role;
      if (userRole === 'owner') {
          setError("Akun Owner tidak boleh login di sini. Silakan ke Login Owner.");
          setLoading(false);
          return;
      }

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      // Simpan permissions juga jika backend mengirimnya
      if (response.data.user.permissions) {
        localStorage.setItem("permissions", JSON.stringify(response.data.user.permissions));
      }

      // Karyawan biasanya langsung diarahkan ke Penjualan/Kasir
      navigate("/penjualan"); 
      
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Login gagal. Cek username dan password."
      );
    } finally {
        setLoading(false);
    }
  };

  // --- STYLES ---
  const fontStyle = { fontFamily: "'Montserrat', sans-serif" };
  const primaryColor = "#00acc1"; // Warna Biru Tosca Khas Karyawan/Kasir

  const pageContainerStyle: React.CSSProperties = {
    minHeight: "100vh",
    width: "100vw",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f2f5", // Background abu soft
    ...fontStyle
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    width: "100%",
    maxWidth: "400px",
    margin: "20px",
    textAlign: "center",
    color: "#333"
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 15px",
    marginBottom: "20px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "16px",
    outline: "none",
    backgroundColor: "white",
    color: "#333",
    ...fontStyle
  };

  const buttonStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px",
    backgroundColor: primaryColor,
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "0.2s",
    ...fontStyle
  };

  return (
    <div style={pageContainerStyle}>
      <div style={cardStyle}>
        
        {/* Logo / Icon */}
        <div style={{ fontSize: "50px", marginBottom: "10px" }}>👋</div>

        <h2 style={{ color: "#050542", marginBottom: "5px", marginTop: 0 }}>
          Login Karyawan
        </h2>
        <p style={{ color: "#666", marginBottom: "30px", marginTop: 0, fontSize: "14px" }}>
          Masuk untuk memulai shift kerja Anda
        </p>

        {error && (
          <div style={{ backgroundColor: "#ffebee", color: "#d32f2f", padding: "12px", borderRadius: "8px", marginBottom: "20px", fontSize: "13px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{textAlign: "left"}}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize:"13px" }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Masukkan username"
              style={inputStyle}
            />
          </div>
          
          <div style={{textAlign: "left"}}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize:"13px" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Masukkan password"
              style={inputStyle}
            />
          </div>

          <button type="submit" disabled={loading} style={{...buttonStyle, opacity: loading ? 0.7 : 1}}>
            {loading ? "Memproses..." : "Masuk Kerja"}
          </button>
        </form>

        <div style={{ marginTop: "25px", borderTop: "1px solid #eee", paddingTop: "20px" }}>
          <p style={{ fontSize: "13px", color: "#666", margin: 0 }}>
            Anda Pemilik Toko? <br/>
            <Link to="/login" style={{ color: "#050542", fontWeight: "bold", textDecoration: "none" }}>
              Login sebagai Owner di sini
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default LoginKaryawan;