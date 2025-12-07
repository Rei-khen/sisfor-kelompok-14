// client/src/pages/Dashboard.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import MainLayout from "../components/MainLayout";

// --- IMPORT ICON DARI ASSETS ---
// Pastikan nama file sesuai dengan yang ada di folder assets/icon kamu

import iconPenjualan from "../assets/icon/penjualan.png"; // Untuk Penjualan
import iconJurnal from "../assets/icon/jurnal.png"; // Untuk Jurnal
import iconProduk from "../assets/icon/produk.png"; // Untuk Produk
import iconGrafik from "../assets/icon/grafik.png"; // Untuk Grafik
import iconPembayaran from "../assets/icon/pembayaran.png"; // Untuk Pembayaran
import IconHistoriPenjualan from "../assets/icon/histori-penjualan.png"; // Untuk Histori Penjualan

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

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      if (!token || !userStr) {
        navigate("/login");
        return;
      }

      setUser(JSON.parse(userStr));

      try {
        const response = await axios.get(
          "http://localhost:5000/api/store/my-store",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setStore(response.data);
      } catch (err: any) {
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

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        Memuat dashboard...
      </div>
    );
  }

  // Data menu dashboard (diupdate menggunakan icon gambar)
  const menuItems = [
    {
      title: "Pembayaran",
      icon: iconPembayaran,
      link: "/feature/pembayaran",
      color: "#e3f2fd", // Biru muda - background aksen (opsional)
    },
    {
      title: "Penjualan",
      icon: iconPenjualan,
      link: "/penjualan",
      color: "#fbe9e7", // Merah muda
    },
    {
      title: "Jurnal",
      icon: iconJurnal,
      link: "/feature/jurnal",
      color: "#e8f5e9", // Hijau muda
    },
    {
      title: "Histori penjualan",
      icon: IconHistoriPenjualan,
      link: "/histori-penjualan",
      color: "#fff3e0", // Oranye muda
    },
    {
      title: "Produk",
      icon: iconProduk,
      link: "/produk",
      color: "#f3e5f5", // Ungu muda
    },
    {
      title: "grafik",
      icon: iconGrafik,
      link: "/grafik",
      color: "#efebe9", // Coklat muda
    },
  ];

  // --- STYLES KHUSUS DASHBOARD ---
  const gridContainerStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "25px",
    marginTop: "30px",
  };

  const cardStyle = (bgColor: string): React.CSSProperties => ({
    backgroundColor: "white", // Tetap putih sesuai request (tidak pakai bgColor dulu agar bersih)
    // backgroundColor: bgColor, // Uncomment jika ingin warna-warni seperti contoh sebelumnya
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
  });

  // Style untuk gambar icon
  const iconImgStyle: React.CSSProperties = {
    width: "60px", // Ukuran icon gambar
    height: "60px",
    marginBottom: "15px",
    objectFit: "contain",
  };

  return (
    <MainLayout>
      <div style={{ padding: "10px 20px" }}>
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

        <div style={gridContainerStyle}>
          {menuItems.map((item, index) => (
            <div
              key={index}
              style={cardStyle(item.color)}
              onClick={() => navigate(item.link)}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.1)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.05)";
              }}
            >
              {/* Render Ikon Gambar */}
              <img src={item.icon} alt={item.title} style={iconImgStyle} />

              <span
                style={{ fontSize: "18px", fontWeight: "bold", color: "#555" }}
              >
                {item.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
