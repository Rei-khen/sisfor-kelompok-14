// client/src/components/MainLayout.tsx
import React, { type ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// --- IMPORT SEMUA ICON DARI ASSETS ---
import iconKasirku from "../assets/icon/kasirku.png";
import iconDashboard from "../assets/icon/dashboard.png";
import iconGudang from "../assets/icon/gudang.png";
import iconKaryawan from "../assets/icon/karyawan.png";
import iconRestok from "../assets/icon/restok.png";
import iconKategori from "../assets/icon/kategori.png";
import iconKeluar from "../assets/icon/keluar.png";

// Icon Khusus untuk Header (Navbar Atas)
import iconJurnal from "../assets/icon/jurnal.png";
import iconPembayaran from "../assets/icon/pembayaran.png";
import iconPenjualan from "../assets/icon/penjualan.png";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // --- STYLES ---
  const layoutStyle: React.CSSProperties = {
    display: "flex",
    height: "100vh",
    width: "100vw",
    overflow: "hidden",
    fontFamily: "sans-serif",
    backgroundColor: "#f0f2f5",
  };

  const sidebarStyle: React.CSSProperties = {
    width: "260px",
    backgroundColor: "#050542",
    color: "white",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    boxShadow: "2px 0 5px rgba(0,0,0,0.1)",
  };

  // --- BAGIAN LOGO DIPERBESAR ---
  const logoAreaStyle: React.CSSProperties = {
    height: "160px", // Diperbesar dari 120px agar muat
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    marginBottom: "10px",
    flexShrink: 0,
  };

  const logoImgStyle: React.CSSProperties = {
    width: "100px", // Diperbesar dari 60px
    height: "100px", // Diperbesar dari 60px
    objectFit: "contain",
    marginBottom: "10px",
  };
  // -----------------------------

  const sidebarMenuStyle: React.CSSProperties = {
    listStyle: "none",
    padding: "0 15px",
    margin: "10px 0",
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  };

  // Style Logika Aktif Sidebar
  const getSidebarItemStyle = (path: string): React.CSSProperties => {
    const isActive = location.pathname.startsWith(path);
    return {
      padding: "10px 20px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      fontSize: "15px",
      fontWeight: isActive ? "bold" : "500",
      transition: "all 0.3s",
      backgroundColor: isActive ? "white" : "transparent",
      color: isActive ? "#050542" : "rgba(255,255,255,0.8)",
      borderRadius: "8px",
      textDecoration: "none",
    };
  };

  const getSidebarIconStyle = (path: string): React.CSSProperties => {
    const isActive = location.pathname.startsWith(path);
    return {
      width: "22px",
      height: "22px",
      marginRight: "15px",
      objectFit: "contain",
      filter: isActive ? "invert(1) brightness(0)" : "none", // Invert jadi hitam jika aktif
      transition: "filter 0.3s",
    };
  };

  const mainContentAreaStyle: React.CSSProperties = {
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  };

  // --- STYLE HEADER (NAVBAR ATAS) ---
  const headerStyle: React.CSSProperties = {
    height: "60px",
    backgroundColor: "#00acc1",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: "0 30px",
    gap: "25px",
    color: "white",
    flexShrink: 0,
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  };

  const headerIconImgStyle: React.CSSProperties = {
    width: "28px",
    height: "28px",
    cursor: "pointer",
    objectFit: "contain",
    transition: "transform 0.2s",
  };

  const contentScrollableStyle: React.CSSProperties = {
    flexGrow: 1,
    overflowY: "auto",
    padding: "0",
  };

  return (
    <div style={layoutStyle}>
      {/* === SIDEBAR KIRI === */}
      <aside style={sidebarStyle}>
        <div style={logoAreaStyle}>
          <img src={iconKasirku} alt="Logo" style={logoImgStyle} />
          <h3
            style={{
              margin: 0,
              letterSpacing: "1px",
              fontSize: "18px",
              fontWeight: "bold",
            }}
          >
            KASIRKU
          </h3>
        </div>

        <ul style={sidebarMenuStyle}>
          <li
            style={getSidebarItemStyle("/dashboard")}
            onClick={() => navigate("/dashboard")}
          >
            <img
              src={iconDashboard}
              alt="Dashboard"
              style={getSidebarIconStyle("/dashboard")}
            />
            Dashboard
          </li>

          {/* <li
            style={getSidebarItemStyle("/feature/gudang")}
            onClick={() => navigate("/feature/gudang")}
          >
            <img
              src={iconGudang}
              alt="Gudang"
              style={getSidebarIconStyle("/feature/gudang")}
            />
            Gudang
          </li> */}

          <li
            style={getSidebarItemStyle("/karyawan")}
            onClick={() => navigate("/karyawan")}
          >
            <img
              src={iconKaryawan}
              alt="Karyawan"
              style={getSidebarIconStyle("/karyawan")}
            />
            Karyawan
          </li>

          <li
            style={getSidebarItemStyle("/restok")}
            onClick={() => navigate("/restok")}
          >
            <img
              src={iconRestok}
              alt="Restok"
              style={getSidebarIconStyle("/restok")}
            />
            Restok
          </li>

          <li
            style={getSidebarItemStyle("/kategori")}
            onClick={() => navigate("/kategori")}
          >
            <img
              src={iconKategori}
              alt="Kategori"
              style={getSidebarIconStyle("/kategori")}
            />
            Kategori
          </li>
        </ul>

        <div style={{ padding: "10px 15px 20px 15px", marginTop: "auto" }}>
          <div
            style={{
              padding: "10px 20px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              fontSize: "15px",
              fontWeight: "500",
              color: "#ff8a80",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderRadius: "8px",
              transition: "0.3s",
            }}
            onClick={handleLogout}
          >
            <img
              src={iconKeluar}
              alt="Keluar"
              style={{
                width: "22px",
                height: "22px",
                marginRight: "15px",
                objectFit: "contain",
              }}
            />
            Keluar
          </div>
        </div>
      </aside>

      {/* === HEADER (NAVBAR ATAS) & KONTEN === */}
      <div style={mainContentAreaStyle}>
        <header style={headerStyle}>
          {/* 1. Icon Dashboard */}
          <img
            src={iconDashboard}
            alt="Dashboard"
            title="Dashboard"
            style={headerIconImgStyle}
            onClick={() => navigate("/dashboard")}
            onMouseOver={(e) =>
              (e.currentTarget.style.transform = "scale(1.2)")
            }
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />

          {/* 2. Icon Jurnal */}
          <img
            src={iconJurnal}
            alt="Jurnal"
            title="Jurnal"
            style={headerIconImgStyle}
            onClick={() => navigate("/feature/jurnal")}
            onMouseOver={(e) =>
              (e.currentTarget.style.transform = "scale(1.2)")
            }
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />

          {/* 3. Icon Pembayaran (Keranjang) */}
          <img
            src={iconPembayaran}
            alt="Pembayaran"
            title="Pembayaran"
            style={headerIconImgStyle}
            onClick={() => navigate("/feature/pembayaran")}
            onMouseOver={(e) =>
              (e.currentTarget.style.transform = "scale(1.2)")
            }
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />

          {/* 4. Icon Penjualan (Toko) */}
          <img
            src={iconPenjualan}
            alt="Penjualan"
            title="Penjualan"
            style={headerIconImgStyle}
            onClick={() => navigate("/penjualan")}
            onMouseOver={(e) =>
              (e.currentTarget.style.transform = "scale(1.2)")
            }
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />
        </header>

        <main style={contentScrollableStyle}>{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
