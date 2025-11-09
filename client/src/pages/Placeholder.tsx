// client/src/pages/Placeholder.tsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";

const Placeholder: React.FC = () => {
  const { menuName } = useParams(); // Tangkap nama menu dari URL
  const navigate = useNavigate();

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f2f5",
        color: "#333",
      }}
    >
      <h1 style={{ fontSize: "2rem", color: "#0a0a5e" }}>
        🚧 Halaman Belum Siap 🚧
      </h1>
      <p style={{ fontSize: "1.2rem", marginTop: "10px" }}>
        Kamu ada di halaman{" "}
        <strong>{menuName?.replace("-", " ").toUpperCase()}</strong>
      </p>
      <button
        onClick={() => navigate("/dashboard")}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          backgroundColor: "#0a0a5e",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Kembali ke Dashboard
      </button>
    </div>
  );
};

export default Placeholder;
