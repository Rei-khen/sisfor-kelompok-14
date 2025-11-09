// client/src/components/MainLayout.tsx
import React, { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // --- STYLES (Dipindahkan dari Dashboard) ---
  const layoutStyle: React.CSSProperties = {
    display: "flex",
    height: "100vh",
    width: "100vw",
    overflow: "hidden",
    fontFamily: "sans-serif",
    backgroundColor: "#f0f2f5", // Background umum untuk semua halaman
  };

  const sidebarStyle: React.CSSProperties = {
    width: "250px",
    backgroundColor: "#050542",
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
    fontSize: "16px",
    fontWeight: "500",
    transition: "0.3s",
    color: "rgba(255,255,255,0.8)",
    textDecoration: "none",
  };

  const mainContentAreaStyle: React.CSSProperties = {
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  };

  const headerStyle: React.CSSProperties = {
    height: "60px",
    backgroundColor: "#00acc1", // Sesuaikan warna header kategori (biru muda/tosca)
    display: "flex",
    justifyContent: "flex-end", // Menu di kanan
    alignItems: "center",
    padding: "0 30px",
    color: "white",
    flexShrink: 0,
  };

  const headerIconStyle: React.CSSProperties = {
    marginLeft: "20px",
    fontSize: "20px",
    cursor: "pointer",
  };

  const contentScrollableStyle: React.CSSProperties = {
    flexGrow: 1,
    overflowY: "auto",
    padding: "20px",
  };

  return (
    <div style={layoutStyle}>
      {/* === LEFT SIDEBAR === */}
      <aside style={sidebarStyle}>
        <div style={logoAreaStyle}>
          <div
            style={{
              width: "50px",
              height: "50px",
              backgroundColor: "#00acc1",
              borderRadius: "50%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "25px",
            }}
          >
            🛒
          </div>
          <h3 style={{ marginTop: "10px", letterSpacing: "1px" }}>KASIRKU</h3>
        </div>

        <ul style={sidebarMenuStyle}>
          <li style={sidebarItemStyle} onClick={() => navigate("/dashboard")}>
            <span style={{ marginRight: "10px" }}>🏠</span> Dashboard
          </li>
          <li
            style={sidebarItemStyle}
            onClick={() => navigate("/feature/gudang")}
          >
            <span style={{ marginRight: "10px" }}>🏭</span> Gudang
          </li>
          <li
            style={sidebarItemStyle}
            onClick={() => navigate("/feature/karyawan")}
          >
            <span style={{ marginRight: "10px" }}>👥</span> Karyawan
          </li>
          <li
            style={sidebarItemStyle}
            onClick={() => navigate("/feature/restok")}
          >
            <span style={{ marginRight: "10px" }}>🔄</span> Restok
          </li>
          {/* Menu Kategori aktif */}
          <li
            style={{
              ...sidebarItemStyle,
              color: "white",
              backgroundColor: "rgba(255,255,255,0.1)",
            }}
            onClick={() => navigate("/kategori")}
          >
            <span style={{ marginRight: "10px" }}>🏷️</span> Kategori
          </li>
        </ul>

        <div
          style={{
            ...sidebarItemStyle,
            marginTop: "auto",
            borderTop: "1px solid rgba(255,255,255,0.1)",
          }}
          onClick={handleLogout}
        >
          <span style={{ marginRight: "10px" }}>🚪</span> Keluar
        </div>
      </aside>

      {/* === MAIN CONTENT AREA (Header + Page Content) === */}
      <div style={mainContentAreaStyle}>
        {/* NAVBAR / HEADER */}
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

        {/* ISI HALAMAN BERUBAH-UBAH DI SINI */}
        <main style={contentScrollableStyle}>{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
