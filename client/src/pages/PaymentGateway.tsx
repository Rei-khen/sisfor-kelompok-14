// client/src/pages/PaymentGateway.tsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import MainLayout from "../components/MainLayout";
import PaymentSuccessPopup from "../components/PaymentSuccessPopup";
import axios from "axios";

const PaymentGateway: React.FC = () => {
  const { methodName } = useParams();
  const navigate = useNavigate();
  const { cart, cartSubtotal, clearCart } = useCart(); // Kita butuh cart-nya

  // (Idealnya, diskon/total dibawa dari halaman sebelumnya via state/context,
  // tapi untuk simulasi kita hitung ulang)
  const total = cartSubtotal; // (Simulasi tanpa diskon)

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fungsi SIMPAN (sama seperti di CheckoutPage, tapi untuk non-tunai)
  const saveTransaction = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        cartItems: cart,
        paymentMethod: methodName, // misal: 'gopay'
        customerName: "", // (Kita tidak punya data ini di sini, bisa ditambahkan nanti)
        subtotal: cartSubtotal,
        discountAmount: 0,
        total: total,
      };
      await axios.post("http://localhost:5000/api/transactions", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowSuccessPopup(true);
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan transaksi.");
    } finally {
      setLoading(false);
    }
  };

  const handleClosePopup = () => {
    clearCart();
    setShowSuccessPopup(false);
    navigate("/penjualan");
  };

  return (
    <MainLayout>
      {showSuccessPopup && (
        <PaymentSuccessPopup
          onClose={handleClosePopup}
          onPrint={() => alert("Printing...")}
        />
      )}

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
          onClick={() => navigate("/pilih-metode")}
          style={{ marginBottom: "15px" }}
        >
          ← Kembali
        </button>
        <h2>Konfirmasi Pembayaran</h2>
        <p>Ini adalah halaman simulasi untuk metode pembayaran:</p>
        <h1 style={{ color: "#007bff", textTransform: "uppercase" }}>
          {methodName}
        </h1>
        <p>
          Total yang harus dibayar:{" "}
          <strong>Rp {total.toLocaleString("id-ID")}</strong>
        </p>

        <button
          onClick={saveTransaction}
          disabled={loading}
          style={{
            width: "100%",
            padding: "15px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "5px",
            fontSize: "18px",
            cursor: "pointer",
          }}
        >
          {loading ? "Memproses..." : "Konfirmasi Pembayaran"}
        </button>
      </div>
    </MainLayout>
  );
};

export default PaymentGateway;
