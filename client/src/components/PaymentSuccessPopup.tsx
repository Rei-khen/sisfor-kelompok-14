// client/src/components/PaymentSuccessPopup.tsx
import React from "react";

interface PopupProps {
  onClose: () => void;
  onPrint: () => void;
}

const PaymentSuccessPopup: React.FC<PopupProps> = ({ onClose, onPrint }) => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "10px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "70px",
            color: "#28a745",
            borderRadius: "50%",
            width: "100px",
            height: "100px",
            lineHeight: "100px",
            margin: "0 auto 20px",
            border: "5px solid #28a745",
          }}
        >
          ✓
        </div>
        <h2 style={{ color: "#333", margin: "0 0 30px 0" }}>
          Pembayaran Selesai
        </h2>
        <div style={{ display: "flex", gap: "15px" }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "12px",
              fontSize: "16px",
              border: "1px solid #ccc",
              background: "#f0f0f0",
              borderRadius: "5px",
              cursor: "pointer",
              color: "#333",
            }}
          >
            Tutup
          </button>
          <button
            onClick={onPrint}
            style={{
              flex: 1,
              padding: "12px",
              fontSize: "16px",
              border: "none",
              background: "#007bff",
              color: "white",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Cetak Struk
          </button>
        </div>
      </div>
    </div>
  );
};
export default PaymentSuccessPopup;
