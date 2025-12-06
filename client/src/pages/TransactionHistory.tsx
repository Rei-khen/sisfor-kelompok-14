// client/src/pages/TransactionHistory.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import ReceiptModal from "../components/ReceiptModal";

// Tipe Data
interface Transaction {
  transaction_id: number;
  transaction_time: string;
  total_price: number;
  payment_method: string;
  cashier_name: string;
}

interface Employee {
  user_id: number;
  username: string;
}

const TransactionHistory: React.FC = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // --- STATE FILTER ---
  const [filterDate, setFilterDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPayment, setFilterPayment] = useState("");
  const [filterCashier, setFilterCashier] = useState("");

  // State Modal Struk
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  // 1. Load Karyawan
  useEffect(() => {
    fetchEmployees();
  }, []);

  // 2. Load History
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchHistory();
    }, 500); 

    return () => clearTimeout(delayDebounceFn);
  }, [filterDate, searchTerm, filterPayment, filterCashier]);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/employees", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(res.data);
    } catch (error) {
      console.error("Gagal load karyawan", error);
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const params = new URLSearchParams();
      if (filterDate) params.append("date", filterDate);
      if (filterPayment) params.append("paymentType", filterPayment);
      if (filterCashier) params.append("cashierId", filterCashier);
      if (searchTerm) params.append("search", searchTerm);

      const res = await axios.get(
        `http://localhost:5000/api/transactions?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTransactions(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const resetFilter = () => {
    setFilterDate("");
    setSearchTerm("");
    setFilterPayment("");
    setFilterCashier("");
  };

  const handleShowReceipt = async (id: number) => {
    try {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString)
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

  // Styles (HANYA INI YANG DIMODIFIKASI UNTUK WARNA)
  const inputStyle: React.CSSProperties = {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    outline: "none",
    color: "#333", // Tambahan: Teks Hitam
    backgroundColor: "white", // Tambahan: Background Putih
  };
  
  const selectStyle = { ...inputStyle, flex: 1 };

  return (
    <MainLayout>
      {/* Container Utama: Paksa warna #333 agar semua teks child jadi hitam */}
      <div style={{ padding: "20px", fontFamily: "sans-serif", color: "#333" }}>
        <h2 style={{ marginTop: 0, marginBottom: "20px", color: "#555" }}>
          HISTORI PENJUALAN
        </h2>

        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <div
            style={{
              flex: 1,
              backgroundColor: "#00c853",
              color: "white",
              padding: "12px",
              textAlign: "center",
              borderRadius: "4px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            REKAP BULANAN
          </div>
          <div
            style={{
              flex: 1,
              backgroundColor: "#00c853",
              color: "white",
              padding: "12px",
              textAlign: "center",
              borderRadius: "4px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            REKAP HARIAN
          </div>
        </div>

        {/* --- FILTER BAR --- */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            marginBottom: "20px",
            backgroundColor: "#f5f5f5",
            padding: "15px",
            borderRadius: "8px",
          }}
        >
          <div style={{ display: "flex", gap: "10px" }}>
            {/* Tombol Reset */}
            <button
              onClick={resetFilter}
              style={{
                padding: "10px 15px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                cursor: "pointer",
                backgroundColor: "#e0e0e0",
                fontSize: "16px",
                color: "#333" // Pastikan icon terlihat
              }}
              title="Reset Filter"
            >
              🔄
            </button>

            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              style={inputStyle} // Menggunakan style baru
            />

            <input
              type="text"
              placeholder="Cari struk (contoh: SR1)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flexGrow: 1, ...inputStyle }} // Menggunakan style baru
            />
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              style={selectStyle} // Menggunakan style baru
            >
              <option value="">Semua Metode Bayar</option>
              <option value="tunai">Tunai</option>
              <option value="non-tunai">Non-Tunai</option>
            </select>

            <select
              value={filterCashier}
              onChange={(e) => setFilterCashier(e.target.value)}
              style={selectStyle} // Menggunakan style baru
            >
              <option value="">Semua Kasir</option>
              {employees.map((emp) => (
                <option key={emp.user_id} value={emp.user_id}>
                  {emp.username}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* LIST DATA */}
        {loading ? (
          <p style={{ textAlign: "center", color: "#666" }}>Memuat data...</p>
        ) : transactions.length === 0 ? (
          <p style={{ textAlign: "center", color: "#888", marginTop: "20px" }}>
            Tidak ada data transaksi yang cocok.
          </p>
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
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                color: "#333" // Pastikan teks di dalam kartu hitam
              }}
            >
              <div>
                <div style={{ fontWeight: "bold", color: "#333" }}>
                  SR{t.transaction_id}
                </div>
                <div
                  style={{ fontSize: "13px", color: "#888", margin: "4px 0" }}
                >
                  {formatDate(t.transaction_time)}
                </div>
                <div style={{ fontSize: "14px", color: "#333" }}>
                  Total:{" "}
                  <strong>Rp {t.total_price.toLocaleString("id-ID")}</strong>
                </div>

                <div
                  style={{
                    marginTop: "8px",
                    display: "inline-block",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    backgroundColor:
                      t.payment_method === "Tunai" ? "#e8f5e9" : "#e3f2fd",
                    color: t.payment_method === "Tunai" ? "#2e7d32" : "#1565c0",
                  }}
                >
                  {t.payment_method}
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
                <span
                  style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  {t.total_price.toLocaleString("id-ID")}
                </span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() =>
                      navigate(`/histori-penjualan/${t.transaction_id}`)
                    }
                    title="Lihat Detail"
                    style={{
                      backgroundColor: "#00c853",
                      border: "none",
                      borderRadius: "4px",
                      width: "36px",
                      height: "36px",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "white",
                      fontSize: "16px",
                    }}
                  >
                    ▶
                  </button>
                  <button
                    onClick={() => handleShowReceipt(t.transaction_id)}
                    title="Lihat Struk"
                    style={{
                      backgroundColor: "#0277bd",
                      border: "none",
                      borderRadius: "4px",
                      width: "36px",
                      height: "36px",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "white",
                      fontSize: "18px",
                    }}
                  >
                    📄
                  </button>
                </div>
              </div>
            </div>
          ))
        )}

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