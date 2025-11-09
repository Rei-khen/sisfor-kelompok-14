// client/src/pages/Dashboard.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  // Ambil data user dari localStorage untuk ditampilkan
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  const handleLogout = () => {
    // Hapus token saat logout
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!localStorage.getItem("token")) {
    // Proteksi sederhana: jika tidak ada token, tendang ke login
    window.location.href = "/login";
    return null;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Selamat Datang di Dashboard, {user?.username}!</h1>
      <p>
        Role kamu saat ini: <strong>{user?.role}</strong>
      </p>
      <p>Di sini nanti akan ada menu-menu Kasirku.</p>
      <button
        onClick={handleLogout}
        style={{
          padding: "10px 20px",
          backgroundColor: "red",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
