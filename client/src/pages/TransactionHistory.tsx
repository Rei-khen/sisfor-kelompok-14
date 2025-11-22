// client/src/pages/TransactionHistory.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import ReceiptModal from "../components/ReceiptModal"; // Akan kita buat nanti

// Tipe Data
interface Transaction {
  transaction_id: number;
  transaction_time: string;
  total_price: number;
  payment_method: string;
  cashier_name: string;
  // Untuk detail nanti
  items?: any[];
  store_name?: string;
  discount?: number;
  subtotal?: number;
}

const TransactionHistory: React.FC = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // State untuk Modal Struk
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowReceipt = async (id: number) => {
    try {
      // Ambil detail lengkap dulu untuk struk
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5000/api/transactions/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSelectedTransaction(res.data);
      setShowReceipt(true);
    } catch (error) {
      alert("Gagal memuat struk.");
    }
  };

  // Helper Format Tanggal
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date
      .toLocaleString("id-ID", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(/\//g, "-")
      .replace(",", "");
  };

  return (
    <MainLayout>
      <div style={{ padding: "20px", fontFamily: "sans-serif", color: "#333" }}>
        <h2 style={{ marginTop: 0, marginBottom: "20px", color: "#555" }}>
          HISTORI PENJUALAN
        </h2>

        {/* Header Hijau (Rekap Placeholder) */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <div
            style={{
              flex: 1,
              backgroundColor: "#00c853",
              color: "white",
              padding: "10px",
              textAlign: "center",
              borderRadius: "4px",
              fontWeight: "bold",
            }}
          >
            REKAP BULANAN
          </div>
          <div
            style={{
              flex: 1,
              backgroundColor: "#00c853",
              color: "white",
              padding: "10px",
              textAlign: "center",
              borderRadius: "4px",
              fontWeight: "bold",
            }}
          >
            REKAP HARIAN
          </div>
        </div>

        {/* Filter Bar */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          <button
            style={{
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            onClick={fetchHistory}
          >
            🔄
          </button>
          <input
            type="date"
            style={{
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
          <input
            type="text"
            placeholder="Cari struk"
            style={{
              flexGrow: 1,
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <select
            style={{
              flex: 1,
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          >
            <option>Semua Status</option>
          </select>
          <select
            style={{
              flex: 1,
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          >
            <option>Semua Kasir</option>
          </select>
        </div>

        {/* List Transaksi */}
        {loading ? (
          <p>Memuat...</p>
        ) : (
          transactions.map((t) => (
            <div
              key={t.transaction_id}
              style={{
                border: "1px solid #eee",
                borderLeft: "5px solid #00c853",
                borderRadius: "4px",
                padding: "15px",
                marginBottom: "10px",
                backgroundColor: "white",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: "bold", color: "#555" }}>
                  SR{t.transaction_id}
                </div>
                <div
                  style={{ fontSize: "14px", color: "#888", margin: "5px 0" }}
                >
                  {formatDate(t.transaction_time)}
                </div>
                <div style={{ fontSize: "14px" }}>
                  Total Harga {t.total_price.toLocaleString("id-ID")}
                </div>
                <div
                  style={{
                    marginTop: "5px",
                    fontWeight: "bold",
                    color: "#00c853",
                  }}
                >
                  {t.payment_method}{" "}
                  {/* Menampilkan Tunai/Non-Tunai sesuai DB */}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: "10px",
                }}
              >
                <span style={{ fontSize: "18px", fontWeight: "bold" }}>
                  {t.total_price.toLocaleString("id-ID")}
                </span>
                <div style={{ display: "flex", gap: "5px" }}>
                  {/* Tombol Detail (Segitiga/Play) */}
                  <button
                    onClick={() =>
                      navigate(`/histori-penjualan/${t.transaction_id}`)
                    }
                    style={{
                      backgroundColor: "#00c853",
                      border: "none",
                      borderRadius: "4px",
                      width: "40px",
                      height: "40px",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "white",
                      fontSize: "20px",
                    }}
                  >
                    ▶
                  </button>
                  {/* Tombol Struk (Gambar Foto) */}
                  <button
                    onClick={() => handleShowReceipt(t.transaction_id)}
                    style={{
                      backgroundColor: "#00c853",
                      border: "none",
                      borderRadius: "4px",
                      width: "40px",
                      height: "40px",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "white",
                      fontSize: "20px",
                    }}
                  >
                    🖼️
                  </button>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Modal Struk */}
        {showReceipt && selectedTransaction && (
          <ReceiptModal
            transaction={selectedTransaction}
            onClose={() => setShowReceipt(false)}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default TransactionHistory;
