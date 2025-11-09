// client/src/pages/Dashboard.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import MainLayout from "../components/MainLayout"; // Import layout yang baru kita buat

// Definisi tipe data
interface Store {
  display_name: string;
}
interface User {
  username: string;
  email: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [store, setStore] = useState<Store | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // --- EFFECT: Cek Login & Ambil Data Toko ---
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      // Jika tidak ada token atau data user, lempar ke halaman login
      if (!token || !userStr) {
        navigate("/login");
        return;
      }

      setUser(JSON.parse(userStr));

      try {
        // Ambil data toko dari backend
        const response = await axios.get(
          "http://localhost:5000/api/store/my-store",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setStore(response.data);
      } catch (err: any) {
        // Jika error 404 (belum punya toko), arahkan ke halaman setup toko
        if (err.response && err.response.status === 404) {
          navigate("/create-store");
        } else {
          console.error("Error fetching store data:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Fungsi navigasi untuk menu grid
  const goTo = (menuPath: string) => {
    navigate(menuPath);
  };

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        Memuat dashboard...
      </div>
    );
  }

  // --- STYLES KHUSUS DASHBOARD ---
  const gridContainerStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", // Grid responsif
    gap: "25px",
    marginTop: "30px",
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "30px 20px",
    textAlign: "center",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "160px",
    border: "1px solid #f0f0f0",
    transition: "transform 0.2s, box-shadow 0.2s",
  };

  // --- RENDER DASHBOARD DENGAN LAYOUT ---
  return (
    <MainLayout>
      <div style={{ padding: "10px 20px" }}>
        {/* Sapaan User dan Nama Toko */}
        <h2
          style={{
            fontSize: "22px",
            color: "#333",
            marginBottom: "5px",
            fontWeight: "normal",
          }}
        >
          Selamat datang..{" "}
          <span style={{ color: "#999" }}>{user?.username || "User"}</span>
        </h2>
        <h1
          style={{
            fontSize: "32px",
            color: "#050542",
            marginTop: 0,
            fontWeight: "bold",
          }}
        >
          {store?.display_name || "Toko Anda"}
        </h1>

        {/* GRID MENU UTAMA */}
        <div style={gridContainerStyle}>
          {/* Kartu 1: Pembayaran */}
          <div
            style={cardStyle}
            onClick={() => goTo("/feature/pembayaran")}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.1)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.05)";
            }}
          >
            <span style={{ fontSize: "50px", marginBottom: "15px" }}>🛒</span>
            <span
              style={{ fontSize: "18px", fontWeight: "bold", color: "#555" }}
            >
              Pembayaran
            </span>
          </div>

          {/* Kartu 2: Penjualan */}
          <div
            style={cardStyle}
            onClick={() => goTo("/feature/penjualan")}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.1)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.05)";
            }}
          >
            <span style={{ fontSize: "50px", marginBottom: "15px" }}>🏪</span>
            <span
              style={{ fontSize: "18px", fontWeight: "bold", color: "#555" }}
            >
              Penjualan
            </span>
          </div>

          {/* Kartu 3: Jurnal */}
          <div
            style={cardStyle}
            onClick={() => goTo("/feature/jurnal")}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.1)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.05)";
            }}
          >
            <span style={{ fontSize: "50px", marginBottom: "15px" }}>📖</span>
            <span
              style={{ fontSize: "18px", fontWeight: "bold", color: "#555" }}
            >
              Jurnal
            </span>
          </div>

          {/* Kartu 4: Histori Penjualan */}
          <div
            style={cardStyle}
            onClick={() => goTo("/feature/histori-penjualan")}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.1)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.05)";
            }}
          >
            <span style={{ fontSize: "50px", marginBottom: "15px" }}>📅</span>
            <span
              style={{ fontSize: "18px", fontWeight: "bold", color: "#555" }}
            >
              Histori penjualan
            </span>
          </div>

          {/* Kartu 5: Produk - Kita arahkan langsung ke Kategori dulu sebagai pusat produk */}
          <div
            style={cardStyle}
            onClick={() => goTo("/kategori")}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.1)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.05)";
            }}
          >
            <span style={{ fontSize: "50px", marginBottom: "15px" }}>📦</span>
            <span
              style={{ fontSize: "18px", fontWeight: "bold", color: "#555" }}
            >
              Produk
            </span>
          </div>

          {/* Kartu 6: Grafik */}
          <div
            style={cardStyle}
            onClick={() => goTo("/feature/grafik")}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.1)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.05)";
            }}
          >
            <span style={{ fontSize: "50px", marginBottom: "15px" }}>📈</span>
            <span
              style={{ fontSize: "18px", fontWeight: "bold", color: "#555" }}
            >
              grafik
            </span>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
