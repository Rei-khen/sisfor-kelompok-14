// client/src/components/MainLayout.tsx
import React, { type ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// --- IMPORT ICON DARI ASSETS ---
// Pastikan nama file sama persis dengan di folder (besar/kecil hurufnya)
import iconDashboard from "../assets/icon/dashboard.png";
import iconGudang from "../assets/icon/gudang.png";
import iconKaryawan from "../assets/icon/karyawan.png";
import iconRestok from "../assets/icon/restok.png";
import iconKategori from "../assets/icon/kategori.png";
import iconKeluar from "../assets/icon/keluar.png";
import iconKasirku from "../assets/icon/kasirku.png"; // Logo bulat

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
    backgroundColor: "#050542", // Warna biru gelap
    color: "white",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    boxShadow: "2px 0 5px rgba(0,0,0,0.1)",
  };

  const logoAreaStyle: React.CSSProperties = {
    height: "140px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    marginBottom: "10px",
  };

  const logoImgStyle: React.CSSProperties = {
    width: "70px",
    height: "70px",
    objectFit: "contain",
    marginBottom: "10px",
    // Tidak perlu filter karena ini logo utama
  };

  const sidebarMenuStyle: React.CSSProperties = {
    listStyle: "none",
    padding: "0 15px",
    margin: "10px 0",
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  };

  // Fungsi Style untuk Container Tombol Menu
  const getSidebarItemStyle = (path: string): React.CSSProperties => {
    // Cek apakah menu ini sedang aktif
    const isActive = location.pathname.startsWith(path);

    return {
      padding: "12px 20px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      fontSize: "16px",
      fontWeight: isActive ? "bold" : "500",
      transition: "all 0.3s",

      // Jika aktif: Background Putih, Teks Biru Gelap
      // Jika tidak: Background Transparan, Teks Putih agak transparan
      backgroundColor: isActive ? "white" : "transparent",
      color: isActive ? "#050542" : "rgba(255,255,255,0.8)",

      borderRadius: "8px",
      textDecoration: "none",
    };
  };

  // Fungsi Style Khusus Icon (SOLUSI MASALAH WARNA PUTIH)
  const getIconStyle = (path: string): React.CSSProperties => {
    const isActive = location.pathname.startsWith(path);

    return {
      width: "24px",
      height: "24px",
      marginRight: "15px",
      objectFit: "contain",

      // LOGIKA FILTER:
      // Jika Aktif (Background Putih) -> Invert warna icon (Putih jadi Hitam)
      // Jika Tidak Aktif -> Biarkan Putih
      filter: isActive ? "invert(1) brightness(0.2)" : "none",
      transition: "filter 0.3s",
    };
  };

  const mainContentAreaStyle: React.CSSProperties = {
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  };

  const headerStyle: React.CSSProperties = {
    height: "60px",
    backgroundColor: "#00acc1",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: "0 30px",
    color: "white",
    flexShrink: 0,
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  };

  const headerIconStyle: React.CSSProperties = {
    marginLeft: "20px",
    fontSize: "20px",
    cursor: "pointer",
  };

  const contentScrollableStyle: React.CSSProperties = {
    flexGrow: 1,
    overflowY: "auto",
    padding: "0",
  };

  return (
    <div style={layoutStyle}>
      {/* === LEFT SIDEBAR === */}
      <aside style={sidebarStyle}>
        {/* LOGO AREA */}
        <div style={logoAreaStyle}>
          <img src={iconKasirku} alt="Logo" style={logoImgStyle} />
          <h3
            style={{
              margin: 0,
              letterSpacing: "1px",
              fontSize: "20px",
              fontWeight: "bold",
            }}
          >
            KASIRKU
          </h3>
        </div>

        {/* MENU ITEMS */}
        <ul style={sidebarMenuStyle}>
          <li
            style={getSidebarItemStyle("/dashboard")}
            onClick={() => navigate("/dashboard")}
          >
            <img
              src={iconDashboard}
              alt="Dashboard"
              style={getIconStyle("/dashboard")} // Pakai fungsi getIconStyle
            />
            Dashboard
          </li>

          <li
            style={getSidebarItemStyle("/feature/gudang")}
            onClick={() => navigate("/feature/gudang")}
          >
            <img
              src={iconGudang}
              alt="Gudang"
              style={getIconStyle("/feature/gudang")}
            />
            Gudang
          </li>

          <li
            style={getSidebarItemStyle("/karyawan")}
            onClick={() => navigate("/karyawan")}
          >
            <img
              src={iconKaryawan}
              alt="Karyawan"
              style={getIconStyle("/karyawan")}
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
              style={getIconStyle("/restok")}
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
              style={getIconStyle("/kategori")}
            />
            Kategori
          </li>
        </ul>

        {/* LOGOUT BUTTON */}
        <div style={{ padding: "0 15px 20px 15px", marginTop: "auto" }}>
          <div
            style={{
              padding: "12px 20px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              fontSize: "16px",
              fontWeight: "500",
              color: "#ff8a80", // Merah muda untuk teks
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderRadius: "8px",
              transition: "0.3s",
            }}
            onClick={handleLogout}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                "rgba(255, 255, 255, 0.2)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor =
                "rgba(255, 255, 255, 0.1)")
            }
          >
            <img
              src={iconKeluar}
              alt="Keluar"
              style={{
                width: "24px",
                height: "24px",
                marginRight: "15px",
                objectFit: "contain",
                // Tombol keluar tidak pernah aktif (putih), jadi tidak perlu invert
                // Tapi karena gambarnya putih, kita biarkan saja.
              }}
            />
            Keluar
          </div>
        </div>
      </aside>

      {/* === MAIN CONTENT AREA === */}
      <div style={mainContentAreaStyle}>
        <header style={headerStyle}>
          <span
            style={headerIconStyle}
            onClick={() => navigate("/dashboard")}
            title="Dashboard"
          >
            🏠
          </span>
          <span style={headerIconStyle} title="Jadwal">
            📅
          </span>
          <span style={headerIconStyle} title="Transaksi">
            🛒
          </span>
          <span style={headerIconStyle} title="Toko">
            🏪
          </span>
        </header>

        <main style={contentScrollableStyle}>{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
