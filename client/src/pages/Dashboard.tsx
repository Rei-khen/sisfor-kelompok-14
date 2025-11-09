// client/src/pages/Dashboard.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Definisi tipe data Toko sesuai database baru
interface Store {
  store_id: number;
  store_name: string; // ID unik toko
  display_name: string; // Nama tampilan toko
  address: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    const checkStore = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        // Cek ke backend apakah user punya toko
        const response = await axios.get(
          "http://localhost:5000/api/store/my-store",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setStore(response.data);
      } catch (err: any) {
        // Jika belum punya toko (404), arahkan ke halaman setup baru
        if (err.response && err.response.status === 404) {
          navigate("/create-store");
        } else {
          console.error("Error cek toko:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    checkStore();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        Memuat dashboard...
      </div>
    );
  }

  if (!store) return null;

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      {/* Header Dashboard */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
          paddingBottom: "15px",
          borderBottom: "2px solid #f0f0f0",
        }}
      >
        <div>
          {/* Tampilkan display_name toko */}
          <h1 style={{ margin: 0, color: "#0a0a5e" }}>{store.display_name}</h1>
          <p style={{ margin: "5px 0 0", color: "#666", fontSize: "14px" }}>
            Selamat datang, <strong>{user?.username || user?.email}</strong> (
            {user?.role})
          </p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: "10px 20px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Keluar
        </button>
      </header>

      {/* Konten Utama Dashboard */}
      <main>
        <h3 style={{ color: "#333", marginBottom: "20px" }}>Ringkasan Toko</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
          }}
        >
          {/* Kartu Menu (Placeholder untuk fitur selanjutnya) */}
          <div style={cardStyle}>
            <span style={{ fontSize: "40px" }}>📦</span>
            <h4>Produk</h4>
            <p style={{ color: "#888", fontSize: "14px" }}>
              Kelola stok & harga
            </p>
          </div>
          <div style={cardStyle}>
            <span style={{ fontSize: "40px" }}>🛒</span>
            <h4>Kasir</h4>
            <p style={{ color: "#888", fontSize: "14px" }}>
              Mulai transaksi baru
            </p>
          </div>
          <div style={cardStyle}>
            <span style={{ fontSize: "40px" }}>📊</span>
            <h4>Laporan</h4>
            <p style={{ color: "#888", fontSize: "14px" }}>
              Lihat penjualan harian
            </p>
          </div>
          <div style={cardStyle}>
            <span style={{ fontSize: "40px" }}>⚙️</span>
            <h4>Pengaturan</h4>
            <p style={{ color: "#888", fontSize: "14px" }}>Ubah info toko</p>
          </div>
        </div>
      </main>
    </div>
  );
};

// Style untuk kartu menu dashboard
const cardStyle: React.CSSProperties = {
  backgroundColor: "white",
  padding: "25px",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  textAlign: "center",
  cursor: "pointer",
  transition: "transform 0.2s, box-shadow 0.2s",
  border: "1px solid #eee",
};

export default Dashboard;
