// client/src/pages/CheckoutPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import MainLayout from "../components/MainLayout";
import PaymentSuccessPopup from "../components/PaymentSuccessPopup";
import axios from "axios";

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, cartSubtotal, clearCart } =
    useCart();

  // State Halaman
  const [discountPercent, setDiscountPercent] = useState(0);
  const [amountPaid, setAmountPaid] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("non-tunai");

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [loading, setLoading] = useState(false);

  // Kalkulasi
  const discountAmount = (cartSubtotal * discountPercent) / 100;
  const totalAfterDiscount = cartSubtotal - discountAmount;
  const change = amountPaid - totalAfterDiscount;

  // Fungsi untuk menyimpan ke DB
  const saveTransaction = async (finalPaymentMethod: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        cartItems: cart,
        paymentMethod: finalPaymentMethod,
        customerName: customerName,
        subtotal: cartSubtotal,
        discountAmount: discountAmount,
        total: totalAfterDiscount,
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

  // Logika Tombol BAYAR
  const handlePayment = () => {
    if (cart.length === 0) {
      alert("Keranjang masih kosong!");
      return;
    }

    if (paymentMethod === "non-tunai") {
      navigate("/pilih-metode"); // Arahkan ke halaman pilih e-wallet (pastikan route ini ada)
    } else {
      // Jika tunai, langsung simpan & tampilkan popup
      saveTransaction("Tunai");
    }
  };

  // Handle saat popup ditutup
  const handleClosePopup = () => {
    clearCart(); // Kosongkan keranjang
    setShowSuccessPopup(false);
    // Reset state
    setDiscountPercent(0);
    setAmountPaid(0);
    setCustomerName("");
    navigate("/penjualan"); // Kembali ke katalog
  };

  // Style
  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px",
    fontSize: "16px",
    border: "1px solid #ccc",
    borderRadius: "4px",
  };
  const textRed: React.CSSProperties = { color: "red", fontWeight: "bold" };

  return (
    <MainLayout>
      {showSuccessPopup && (
        <PaymentSuccessPopup
          onClose={handleClosePopup}
          onPrint={() => alert("Printing...")}
        />
      )}

      <div
        style={{ display: "flex", gap: "20px", padding: "20px", color: "#333" }}
      >
        {/* Kolom Kiri: Kalkulasi */}
        <div
          style={{
            flex: 1,
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "15px",
            }}
          >
            <h3 style={textRed}>HARGA</h3>
            <span style={textRed}>{cartSubtotal.toLocaleString("id-ID")}</span>
          </div>
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "15px",
              alignItems: "center",
            }}
          >
            <label>Diskon</label>
            <input
              type="number"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(Number(e.target.value))}
              style={{ width: "60px", padding: "5px", textAlign: "center" }}
            />{" "}
            %
            <input
              type="text"
              value={discountAmount.toLocaleString("id-ID")}
              style={{ flex: 1, padding: "5px" }}
              readOnly
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h3 style={textRed}>TOTAL {cart.length} QTY</h3>
            <span style={textRed}>
              {totalAfterDiscount.toLocaleString("id-ID")}
            </span>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label>Bayar</label>
            <input
              type="number"
              value={amountPaid}
              onChange={(e) => setAmountPaid(Number(e.target.value))}
              style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label>Kembalian</label>
            <input
              type="text"
              value={change >= 0 ? change.toLocaleString("id-ID") : "-"}
              style={{ ...inputStyle, backgroundColor: "#eee" }}
              readOnly
            />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label>Nama pembeli</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="opsional"
              style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label>Pembayaran</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={{ ...inputStyle, backgroundColor: "white" }}
            >
              <option value="non-tunai">non-tunai</option>
              <option value="tunai">tunai</option>
            </select>
          </div>

          <button
            onClick={handlePayment}
            disabled={loading}
            style={{
              width: "100%",
              padding: "15px",
              backgroundColor: "#0277bd",
              color: "white",
              border: "none",
              borderRadius: "5px",
              fontSize: "18px",
              cursor: "pointer",
            }}
          >
            {loading ? "Menyimpan..." : "BAYAR"}
          </button>
        </div>

        {/* Kolom Kanan: Keranjang */}
        <div
          style={{
            flex: 1.5,
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
          }}
        >
          {cart.length === 0 ? (
            <p>Keranjang kosong.</p>
          ) : (
            cart.map((item) => (
              <div
                key={item.product_id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                  borderBottom: "1px solid #eee",
                  paddingBottom: "10px",
                  marginBottom: "10px",
                }}
              >
                {/* --- UPDATE: TAMPILKAN GAMBAR --- */}
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    backgroundColor: "#f0f0f0",
                    borderRadius: "4px",
                    overflow: "hidden", // Agar gambar tidak keluar
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexShrink: 0,
                  }}
                >
                  {(item as any).image_url ? ( // Cast ke any jika type CartItem belum diupdate
                    <img
                      src={`http://localhost:5000${(item as any).image_url}`}
                      alt={item.product_name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <span>🖼️</span>
                  )}
                </div>
                {/* -------------------------------- */}

                <div style={{ flexGrow: 1 }}>
                  <strong>{item.product_name}</strong>
                  <div style={{ fontSize: "14px" }}>
                    Rp {item.selling_price.toLocaleString("id-ID")} x{" "}
                    {item.quantity}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid #ccc",
                  }}
                >
                  <button
                    onClick={() =>
                      updateQuantity(item.product_id, item.quantity - 1)
                    }
                    style={{ padding: "5px", border: "none" }}
                  >
                    -
                  </button>
                  <input
                    value={item.quantity}
                    style={{
                      width: "30px",
                      textAlign: "center",
                      border: "none",
                    }}
                    readOnly
                  />
                  <button
                    onClick={() =>
                      updateQuantity(item.product_id, item.quantity + 1)
                    }
                    style={{ padding: "5px", border: "none" }}
                  >
                    +
                  </button>
                </div>
                <strong>
                  Rp{" "}
                  {(item.selling_price * item.quantity).toLocaleString("id-ID")}
                </strong>
                <button
                  onClick={() => removeFromCart(item.product_id)}
                  style={{
                    border: "none",
                    background: "none",
                    color: "red",
                    fontSize: "20px",
                    cursor: "pointer",
                  }}
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default CheckoutPage;
