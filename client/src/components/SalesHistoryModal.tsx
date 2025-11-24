// client/src/components/SalesHistoryModal.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";

interface SalesHistoryModalProps {
  productId: number;
  productName: string;
  onClose: () => void;
}

interface SalesItem {
  transaction_time: string;
  quantity: number;
  price_per_unit: number;
  total_price: number;
  cashier_name: string;
}

const SalesHistoryModal: React.FC<SalesHistoryModalProps> = ({
  productId,
  productName,
  onClose,
}) => {
  const [history, setHistory] = useState<SalesItem[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<SalesItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("newest");

  // 1. Fetch Data
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:5000/api/products/${productId}/sales`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setHistory(res.data);
        setFilteredHistory(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [productId]);

  // 2. Logika Filter
  useEffect(() => {
    let data = [...history];
    const now = new Date();

    switch (filterType) {
      case "newest":
        data.sort(
          (a, b) =>
            new Date(b.transaction_time).getTime() -
            new Date(a.transaction_time).getTime()
        );
        break;
      case "oldest":
        data.sort(
          (a, b) =>
            new Date(a.transaction_time).getTime() -
            new Date(b.transaction_time).getTime()
        );
        break;
      case "today":
        data = data.filter(
          (item) =>
            new Date(item.transaction_time).toDateString() ===
            now.toDateString()
        );
        break;
      case "week":
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        data = data.filter(
          (item) => new Date(item.transaction_time) >= sevenDaysAgo
        );
        break;
      case "month":
        data = data.filter((item) => {
          const date = new Date(item.transaction_time);
          return (
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear()
          );
        });
        break;
    }
    setFilteredHistory(data);
  }, [filterType, history]);

  const formatDate = (date: string) => new Date(date).toLocaleString("id-ID");
  const formatRp = (val: number) => "Rp " + Number(val).toLocaleString("id-ID");

  // Styles
  const modalOverlayStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  };

  const modalContentStyle: React.CSSProperties = {
    backgroundColor: "white",
    padding: "25px",
    borderRadius: "10px",
    width: "750px",
    maxWidth: "90%",
    maxHeight: "85vh",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
    color: "#333",
  };

  const tableHeaderStyle: React.CSSProperties = {
    padding: "12px",
    textAlign: "left",
    borderBottom: "2px solid #eee",
    color: "#555",
    fontWeight: "bold",
  };

  const tableCellStyle: React.CSSProperties = {
    padding: "12px",
    borderBottom: "1px solid #eee",
    color: "#333",
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "20px", color: "#050542" }}>
            Histori Penjualan:{" "}
            <span style={{ fontWeight: "normal" }}>{productName}</span>
          </h3>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                backgroundColor: "white",
                color: "#333",
              }}
            >
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="today">Hari Ini</option>
              <option value="week">7 Hari Terakhir</option>
              <option value="month">Bulan Ini</option>
            </select>
            <button
              onClick={onClose}
              style={{
                border: "none",
                background: "transparent",
                fontSize: "24px",
                cursor: "pointer",
                color: "#999",
              }}
            >
              &times;
            </button>
          </div>
        </div>

        <div
          style={{
            overflowY: "auto",
            flexGrow: 1,
            border: "1px solid #eee",
            borderRadius: "6px",
          }}
        >
          {loading ? (
            <p style={{ padding: "20px", textAlign: "center" }}>
              Memuat data...
            </p>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "14px",
              }}
            >
              <thead
                style={{
                  backgroundColor: "#f9f9f9",
                  position: "sticky",
                  top: 0,
                }}
              >
                <tr>
                  <th style={tableHeaderStyle}>Tanggal</th>
                  <th style={tableHeaderStyle}>Terjual</th>
                  <th style={tableHeaderStyle}>Harga Satuan</th>
                  <th style={tableHeaderStyle}>Total</th>
                  <th style={tableHeaderStyle}>Kasir</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((item, idx) => (
                  <tr key={idx} style={{ backgroundColor: "white" }}>
                    <td style={tableCellStyle}>
                      {formatDate(item.transaction_time)}
                    </td>
                    {/* PERBAIKAN DISINI: Menggunakan Math.abs() agar angka selalu positif */}
                    <td
                      style={{
                        ...tableCellStyle,
                        color: "#d32f2f",
                        fontWeight: "bold",
                      }}
                    >
                      {Math.abs(item.quantity)}
                    </td>
                    <td style={tableCellStyle}>
                      {formatRp(item.price_per_unit)}
                    </td>
                    <td style={tableCellStyle}>{formatRp(item.total_price)}</td>
                    <td style={tableCellStyle}>{item.cashier_name}</td>
                  </tr>
                ))}
                {filteredHistory.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        padding: "30px",
                        textAlign: "center",
                        color: "#888",
                      }}
                    >
                      Tidak ada penjualan untuk filter ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <button
          onClick={onClose}
          style={{
            marginTop: "20px",
            padding: "12px",
            backgroundColor: "#0277bd",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          Tutup
        </button>
      </div>
    </div>
  );
};

export default SalesHistoryModal;
