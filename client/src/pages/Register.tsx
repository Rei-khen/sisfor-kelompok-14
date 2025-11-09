// client/src/pages/Register.tsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Register: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await axios.post("http://localhost:5000/api/auth/register", {
        email,
        password,
      });

      alert("Registrasi berhasil! Silakan login.");
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registrasi gagal.");
    }
  };

  // Gunakan style yang sama dengan Login agar konsisten
  const pageContainerStyle: React.CSSProperties = {
    minHeight: "100vh",
    width: "100vw",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f2f5",
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    width: "100%",
    maxWidth: "400px",
    margin: "20px",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 15px",
    marginBottom: "20px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "16px",
    outline: "none",
  };

  const buttonStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px",
    backgroundColor: "#0a0a5e",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.2s",
  };

  return (
    <div style={pageContainerStyle}>
      <div style={cardStyle}>
        <h2
          style={{
            textAlign: "center",
            color: "#0a0a5e",
            marginBottom: "10px",
            marginTop: 0,
          }}
        >
          Daftar Kasirku
        </h2>
        <p
          style={{
            textAlign: "center",
            color: "#666",
            marginBottom: "30px",
            marginTop: 0,
          }}
        >
          Mulai kelola usahamu dengan mudah
        </p>

        {error && (
          <div
            style={{
              backgroundColor: "#ffebee",
              color: "#d32f2f",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "20px",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "500",
                color: "#333",
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="contoh@email.com"
              style={inputStyle}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "500",
                color: "#333",
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Buat password aman"
              style={inputStyle}
            />
          </div>
          <button
            type="submit"
            style={buttonStyle}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#0d0d7a")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#0a0a5e")
            }
          >
            Daftar Sekarang
          </button>
        </form>

        <p style={{ marginTop: "25px", textAlign: "center", color: "#666" }}>
          Sudah punya akun?{" "}
          <Link
            to="/login"
            style={{
              color: "#0a0a5e",
              fontWeight: "bold",
              textDecoration: "none",
            }}
          >
            Login di sini
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
