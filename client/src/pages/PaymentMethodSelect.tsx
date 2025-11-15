// client/src/pages/PaymentMethodSelect.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";

const methods = ["gopay", "DANA", "OVO", "SPay", "LinkAja"];

const PaymentMethodSelect: React.FC = () => {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState("");

  const btnStyle = (method: string): React.CSSProperties => ({
    padding: "20px",
    border: `2px solid ${selectedMethod === method ? "#007bff" : "#ccc"}`,
    borderRadius: "8px",
    cursor: "pointer",
    backgroundColor: "white",
    fontWeight: "bold",
  });

  return (
    <MainLayout>
      <div
        style={{
          maxWidth: "600px",
          margin: "auto",
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          color: "#333",
        }}
      >
        <button
          onClick={() => navigate("/pembayaran")}
          style={{ marginBottom: "15px" }}
        >
          ← Kembali
        </button>
        <h2>Pilih Metode Pembayaran</h2>

        <h3 style={{ borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
          E-Wallet
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "15px",
          }}
        >
          {methods.map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMethod(m)}
              style={btnStyle(m)}
            >
              {m} {/* Ganti dengan logo nanti */}
            </button>
          ))}
        </div>

        <h3
          style={{
            borderBottom: "1px solid #eee",
            paddingBottom: "10px",
            marginTop: "30px",
          }}
        >
          Bank Digital
        </h3>
        {/* ... (Placeholder) ... */}

        <button
          onClick={() => navigate(`/payment-gateway/${selectedMethod}`)}
          disabled={!selectedMethod}
          style={{
            float: "right",
            marginTop: "30px",
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Lanjut
        </button>
      </div>
    </MainLayout>
  );
};

export default PaymentMethodSelect;
