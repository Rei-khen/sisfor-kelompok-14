// client/src/pages/Dashboard.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Tipe data
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
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  // --- HANDLERS ---
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Fungsi navigasi ke placeholder
  const goTo = (menuName: string) => {
    navigate(`/feature/${menuName}`);
  };

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        Memuat...
      </div>
    );

  // --- STYLES (Inline CSS) ---
  const layoutStyle: React.CSSProperties = {
    display: "flex",
    height: "100vh",
    width: "100vw",
    overflow: "hidden",
    fontFamily: "sans-serif",
  };

  // SIDEBAR STYLE
  const sidebarStyle: React.CSSProperties = {
    width: "250px",
    backgroundColor: "#050542", // Biru dongker gelap sesuai gambar
    color: "white",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
  };

  const logoAreaStyle: React.CSSProperties = {
    height: "150px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  };

  const sidebarMenuStyle: React.CSSProperties = {
    listStyle: "none",
    padding: 0,
    margin: "20px 0",
    flexGrow: 1,
  };

  const sidebarItemStyle: React.CSSProperties = {
    padding: "15px 25px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    fontSize: "18px",
    fontWeight: "500",
    transition: "0.3s",
    color: "white",
    textDecoration: "none",
  };

  // MAIN CONTENT STYLE
  const mainContentStyle: React.CSSProperties = {
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "white",
    overflowY: "auto",
  };

  // HEADER STYLE
  const headerStyle: React.CSSProperties = {
    height: "60px",
    backgroundColor: "#0088cc", // Biru muda di bagian atas sesuai gambar
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: "0 30px",
    color: "white",
    fontSize: "24px",
  };

  const headerIconStyle: React.CSSProperties = {
    marginLeft: "25px",
    cursor: "pointer",
  };

  // DASHBOARD CONTENT STYLE
  const dashboardBodyStyle: React.CSSProperties = {
    padding: "30px 40px",
  };

  const gridContainerStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", // Responsif
    gap: "30px",
    marginTop: "40px",
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: "white",
    border: "2px solid #eee",
    borderRadius: "15px",
    padding: "30px 20px",
    textAlign: "center",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "180px",
  };

  // --- RENDER ---
  return (
    <div style={layoutStyle}>
      {/* === LEFT SIDEBAR === */}
      <aside style={sidebarStyle}>
        <div style={logoAreaStyle}>
          {/* Placeholder Logo Bulat */}
          <div
            style={{
              width: "60px",
              height: "60px",
              backgroundColor: "#0088cc",
              borderRadius: "50%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "30px",
            }}
          >
            🛒
          </div>
          <h2 style={{ marginTop: "10px", fontSize: "22px" }}>KASIRKU</h2>
        </div>

        <ul style={sidebarMenuStyle}>
          {/* Menu Sidebar sesuai gambar */}
          <li style={sidebarItemStyle} onClick={() => goTo("gudang")}>
            <span style={{ marginRight: "15px", fontSize: "24px" }}>🏭</span>{" "}
            Gudang
          </li>
          <li style={sidebarItemStyle} onClick={() => goTo("karyawan")}>
            <span style={{ marginRight: "15px", fontSize: "24px" }}>👥</span>{" "}
            Karyawan
          </li>
          <li style={sidebarItemStyle} onClick={() => goTo("restok")}>
            <span style={{ marginRight: "15px", fontSize: "24px" }}>🔄</span>{" "}
            Restok
          </li>
          <li style={sidebarItemStyle} onClick={() => goTo("kategori")}>
            <span style={{ marginRight: "15px", fontSize: "24px" }}>🏷️</span>{" "}
            Kategori
          </li>
        </ul>

        {/* Tombol Keluar di bawah sidebar */}
        <div
          style={{
            ...sidebarItemStyle,
            borderTop: "1px solid rgba(255,255,255,0.1)",
            marginTop: "auto",
          }}
          onClick={handleLogout}
        >
          <span style={{ marginRight: "15px", fontSize: "24px" }}>🚪</span>{" "}
          Keluar
        </div>
      </aside>

      {/* === MAIN AREA === */}
      <main style={mainContentStyle}>
        {/* HEADER ATAS */}
        <header style={headerStyle}>
          {/* Ikon-ikon header placeholder */}
          <span style={headerIconStyle} title="Home">
            🏠
          </span>
          <span style={headerIconStyle} title="Calendar">
            📅
          </span>
          <span style={headerIconStyle} title="Cart">
            🛒
          </span>
          <span style={headerIconStyle} title="Store">
            🏪
          </span>
        </header>

        {/* BODY DASHBOARD */}
        <div style={dashboardBodyStyle}>
          <h1 style={{ fontSize: "28px", color: "#333", marginBottom: "5px" }}>
            Selamat datang..{" "}
            <span
              style={{ color: "#888", fontSize: "24px", fontWeight: "normal" }}
            >
              {user?.username || "User"}
            </span>
          </h1>
          <h2 style={{ fontSize: "32px", color: "#0a0a5e", marginTop: 0 }}>
            {store?.display_name || "Nama Toko"}
          </h2>

          {/* GRID MENU UTAMA */}
          <div style={gridContainerStyle}>
            {/* Kartu 1: Pembayaran */}
            <div
              style={cardStyle}
              onClick={() => goTo("pembayaran")}
              onMouseOver={(e) =>
                (e.currentTarget.style.borderColor = "#0088cc")
              }
              onMouseOut={(e) => (e.currentTarget.style.borderColor = "#eee")}
            >
              <span
                style={{
                  fontSize: "60px",
                  color: "#0088cc",
                  marginBottom: "15px",
                }}
              >
                🛒
              </span>
              <span
                style={{ fontSize: "20px", fontWeight: "bold", color: "#333" }}
              >
                Pembayaran
              </span>
            </div>

            {/* Kartu 2: Penjualan */}
            <div
              style={cardStyle}
              onClick={() => goTo("penjualan")}
              onMouseOver={(e) =>
                (e.currentTarget.style.borderColor = "#0088cc")
              }
              onMouseOut={(e) => (e.currentTarget.style.borderColor = "#eee")}
            >
              <span
                style={{
                  fontSize: "60px",
                  color: "#0088cc",
                  marginBottom: "15px",
                }}
              >
                🏪
              </span>
              <span
                style={{ fontSize: "20px", fontWeight: "bold", color: "#333" }}
              >
                Penjualan
              </span>
            </div>

            {/* Kartu 3: Jurnal */}
            <div
              style={cardStyle}
              onClick={() => goTo("jurnal")}
              onMouseOver={(e) =>
                (e.currentTarget.style.borderColor = "#0088cc")
              }
              onMouseOut={(e) => (e.currentTarget.style.borderColor = "#eee")}
            >
              <span
                style={{
                  fontSize: "60px",
                  color: "#0088cc",
                  marginBottom: "15px",
                }}
              >
                📖
              </span>
              <span
                style={{ fontSize: "20px", fontWeight: "bold", color: "#333" }}
              >
                Jurnal
              </span>
            </div>

            {/* Kartu 4: Histori Penjualan */}
            <div
              style={cardStyle}
              onClick={() => goTo("histori-penjualan")}
              onMouseOver={(e) =>
                (e.currentTarget.style.borderColor = "#0088cc")
              }
              onMouseOut={(e) => (e.currentTarget.style.borderColor = "#eee")}
            >
              <span
                style={{
                  fontSize: "60px",
                  color: "#0088cc",
                  marginBottom: "15px",
                }}
              >
                📅
              </span>
              <span
                style={{ fontSize: "20px", fontWeight: "bold", color: "#333" }}
              >
                Histori penjualan
              </span>
            </div>

            {/* Kartu 5: Produk */}
            <div
              style={cardStyle}
              onClick={() => goTo("produk")}
              onMouseOver={(e) =>
                (e.currentTarget.style.borderColor = "#0088cc")
              }
              onMouseOut={(e) => (e.currentTarget.style.borderColor = "#eee")}
            >
              <span
                style={{
                  fontSize: "60px",
                  color: "#0088cc",
                  marginBottom: "15px",
                }}
              >
                📦
              </span>
              <span
                style={{ fontSize: "20px", fontWeight: "bold", color: "#333" }}
              >
                Produk
              </span>
            </div>

            {/* Kartu 6: Grafik */}
            <div
              style={cardStyle}
              onClick={() => goTo("grafik")}
              onMouseOver={(e) =>
                (e.currentTarget.style.borderColor = "#0088cc")
              }
              onMouseOut={(e) => (e.currentTarget.style.borderColor = "#eee")}
            >
              <span
                style={{
                  fontSize: "60px",
                  color: "#0088cc",
                  marginBottom: "15px",
                }}
              >
                📈
              </span>
              <span
                style={{ fontSize: "20px", fontWeight: "bold", color: "#333" }}
              >
                grafik
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
