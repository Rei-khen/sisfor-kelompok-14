// client/src/components/RestockHistoryModal.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";

interface RestockHistoryModalProps {
  productId: number;
  productName: string;
  onClose: () => void;
}

interface HistoryItem {
  movement_id: number;
  movement_date: string;
  quantity: number;
  unit_cost: number;
  pic_name: string;
}

const RestockHistoryModal: React.FC<RestockHistoryModalProps> = ({
  productId,
  productName,
  onClose,
}) => {
  const [history, setHistory] = useState<HistoryItem[]>([]); // Data mentah dari API
  const [filteredHistory, setFilteredHistory] = useState<HistoryItem[]>([]); // Data setelah difilter
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("newest"); // State untuk pilihan filter

  // 1. Fetch Data Awal
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:5000/api/restock/${productId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setHistory(res.data);
        setFilteredHistory(res.data); // Inisialisasi data filter
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [productId]);

  // 2. Logika Filtering (Jalan setiap kali filterType atau history berubah)
  useEffect(() => {
    let data = [...history]; // Buat salinan array agar tidak merusak data asli
    const now = new Date();

    switch (filterType) {
      case "newest":
        // Urutkan dari tanggal terbesar (terbaru) ke terkecil
        data.sort(
          (a, b) =>
            new Date(b.movement_date).getTime() -
            new Date(a.movement_date).getTime()
        );
        break;
      case "oldest":
        // Urutkan dari tanggal terkecil (terlama) ke terbesar
        data.sort(
          (a, b) =>
            new Date(a.movement_date).getTime() -
            new Date(b.movement_date).getTime()
        );
        break;
      case "today":
        // Filter hanya tanggal hari ini
        data = data.filter((item) => {
          const date = new Date(item.movement_date);
          return date.toDateString() === now.toDateString();
        });
        break;
      case "week":
        // Filter 7 hari terakhir
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        data = data.filter(
          (item) => new Date(item.movement_date) >= sevenDaysAgo
        );
        break;
      case "month":
        // Filter bulan ini dan tahun ini
        data = data.filter((item) => {
          const date = new Date(item.movement_date);
          return (
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear()
          );
        });
        break;
      default:
        break;
    }

    setFilteredHistory(data);
  }, [filterType, history]);

  const formatDate = (date: string) => new Date(date).toLocaleString("id-ID");

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
    width: "700px",
    maxWidth: "90%",
    maxHeight: "85vh",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
    color: "#333", // PERBAIKAN: Set warna teks utama jadi gelap
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  };

  const selectStyle: React.CSSProperties = {
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "14px",
    outline: "none",
    cursor: "pointer",
    backgroundColor: "white",
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
    color: "#333", // PERBAIKAN: Warna teks sel tabel
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        {/* Header & Filter */}
        <div style={headerStyle}>
          <h3 style={{ margin: 0, fontSize: "20px", color: "#050542" }}>
            Histori Restok:{" "}
            <span style={{ fontWeight: "normal" }}>{productName}</span>
          </h3>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {/* Dropdown Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={selectStyle}
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

        {/* Table Content */}
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
                  <th style={tableHeaderStyle}>Jumlah</th>
                  <th style={tableHeaderStyle}>Harga Beli/Unit</th>
                  <th style={tableHeaderStyle}>PIC</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((item) => (
                  <tr
                    key={item.movement_id}
                    style={{ backgroundColor: "white" }}
                  >
                    <td style={tableCellStyle}>
                      {formatDate(item.movement_date)}
                    </td>
                    <td
                      style={{
                        ...tableCellStyle,
                        color: "green",
                        fontWeight: "bold",
                      }}
                    >
                      +{item.quantity}
                    </td>
                    <td style={tableCellStyle}>
                      Rp {Number(item.unit_cost).toLocaleString("id-ID")}
                    </td>
                    <td style={tableCellStyle}>{item.pic_name}</td>
                  </tr>
                ))}
                {filteredHistory.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      style={{
                        padding: "30px",
                        textAlign: "center",
                        color: "#888",
                      }}
                    >
                      Tidak ada data restok untuk filter ini.
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

export default RestockHistoryModal;
