// client/src/pages/Jurnal.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import MainLayout from "../components/MainLayout";

// Interface sesuai response API
interface JournalItem {
  transaction_id: number;
  date: string;
  cashier: string;
  status: string; // Tunai / Non-Tunai
  profit: number;
}

interface Summary {
  total_cogs: number;
  total_revenue: number;
  total_profit: number;
}

interface Employee {
  user_id: number;
  username: string;
}

const Jurnal: React.FC = () => {
  // State Filter
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // Tunai/Non-Tunai
  const [kasirFilter, setKasirFilter] = useState(""); // ID Kasir

  // State Data
  const [data, setData] = useState<JournalItem[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [summary, setSummary] = useState<Summary>({
    total_cogs: 0,
    total_revenue: 0,
    total_profit: 0,
  });
  const [loading, setLoading] = useState(false);

  // Pagination Client-Side (karena API mengirim semua data sekaligus)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 1. Fetch Karyawan (untuk Dropdown)
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem("token");
        // TAMBAHKAN query param ?type=all di sini
        const res = await axios.get(
          "http://localhost:5000/api/employees?type=all",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setEmployees(res.data);
      } catch (e) {
        console.error("Gagal load karyawan", e);
      }
    };
    fetchEmployees();
  }, []);

  // 2. Fetch Data Jurnal (Setiap filter berubah)
  useEffect(() => {
    fetchTransactions();
    setCurrentPage(1); // Reset ke halaman 1 saat filter berubah
  }, [startDate, endDate, statusFilter, kasirFilter]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();

      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (statusFilter) params.append("paymentMethod", statusFilter); // API mengharapkan 'paymentMethod'
      if (kasirFilter) params.append("cashierId", kasirFilter);

      const res = await axios.get(
        `http://localhost:5000/api/journal?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setData(res.data.data);
      setSummary(res.data.summary);
    } catch (error) {
      console.error("Error fetching journal:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setStartDate("");
    setEndDate("");
    setStatusFilter("");
    setKasirFilter("");
    fetchTransactions();
  };

  // Helper Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
  const totalItems = data.length;

  const handleNext = () => {
    if (indexOfLastItem < totalItems) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // --- STYLES (Sama seperti kodemu) ---
  const containerStyle: React.CSSProperties = {
    padding: "30px",
    fontFamily: "sans-serif",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    backgroundColor: "#FFFFFF",
    color: "#333",
    boxSizing: "border-box",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "28px",
    fontWeight: "bold",
    marginBottom: "20px",
    textAlign: "left",
    color: "#000",
  };

  const filterRow1Style: React.CSSProperties = {
    display: "flex",
    gap: "10px",
    marginBottom: "15px",
    alignItems: "center",
  };

  const refreshBtnStyle: React.CSSProperties = {
    width: "45px",
    height: "45px",
    backgroundColor: "#fff",
    border: "1px solid #ccc",
    borderRadius: "5px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    fontSize: "24px",
    lineHeight: 0,
    padding: 0,
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  };

  const dateInputStyle: React.CSSProperties = {
    flex: 1,
    height: "45px",
    padding: "0 15px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    backgroundColor: "#fff",
    fontSize: "16px",
    outline: "none",
  };

  const filterRow2Style: React.CSSProperties = {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
  };

  const selectStyle: React.CSSProperties = {
    flex: 1,
    height: "45px",
    padding: "0 15px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    backgroundColor: "#fff",
    fontSize: "16px",
    outline: "none",
    cursor: "pointer",
  };

  const summaryRowStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px",
    padding: "0 5px",
    fontSize: "16px",
    color: "#555",
  };

  const summaryItemStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  };

  const contentAreaStyle: React.CSSProperties = {
    flexGrow: 1,
    borderTop: "1px solid #e0e0e0",
    borderBottom: "1px solid #e0e0e0",
    display: "flex",
    flexDirection: "column",
    justifyContent: data.length > 0 ? "flex-start" : "center",
    alignItems: data.length > 0 ? "stretch" : "center",
    padding: "20px 0",
    overflowY: "auto",
    minHeight: "200px",
  };

  const footerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "20px",
  };

  const navButtonStyle: React.CSSProperties = {
    width: "100px",
    height: "40px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    backgroundColor: "#fff",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#333",
  };

  return (
    <MainLayout>
      <div style={containerStyle}>
        <h2 style={titleStyle}>JURNAL</h2>

        {/* --- ROW 1: REFRESH + DATES --- */}
        <div style={filterRow1Style}>
          <button
            style={refreshBtnStyle}
            onClick={handleRefresh}
            title="Reset Filter"
          >
            🔄
          </button>

          <input
            type="date"
            style={dateInputStyle}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            style={dateInputStyle}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        {/* --- ROW 2: DROPDOWNS --- */}
        <div style={filterRow2Style}>
          <select
            style={selectStyle}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Semua Status</option>
            <option value="tunai">Tunai</option>
            <option value="non-tunai">Non-Tunai</option>
          </select>

          <select
            style={selectStyle}
            value={kasirFilter}
            onChange={(e) => setKasirFilter(e.target.value)}
          >
            <option value="">Semua Kasir</option>
            {employees.map((emp) => (
              <option key={emp.user_id} value={emp.user_id}>
                {emp.username}
              </option>
            ))}
          </select>
        </div>

        {/* --- SUMMARY --- */}
        <div style={summaryRowStyle}>
          <div style={summaryItemStyle}>
            <span>Harga pokok</span>
            <span style={{ fontWeight: "bold", color: "#000" }}>
              {formatRupiah(summary.total_cogs)}
            </span>
          </div>
          <div style={summaryItemStyle}>
            <span>Harga jual</span>
            <span style={{ fontWeight: "bold", color: "#000" }}>
              {formatRupiah(summary.total_revenue)}
            </span>
          </div>
          <div style={{ ...summaryItemStyle, textAlign: "right" }}>
            <span>Laba</span>
            <span
              style={{
                fontWeight: "bold",
                color: summary.total_profit >= 0 ? "#2e7d32" : "red",
              }}
            >
              {formatRupiah(summary.total_profit)}
            </span>
          </div>
        </div>

        {/* --- MAIN CONTENT (TABLE / EMPTY) --- */}
        <div style={contentAreaStyle}>
          {loading ? (
            <p>Memuat data...</p>
          ) : data.length > 0 ? (
            <div style={{ width: "100%", fontSize: "14px" }}>
              {/* Header Tabel */}
              <div
                style={{
                  display: "flex",
                  fontWeight: "bold",
                  padding: "10px 5px",
                  borderBottom: "2px solid #eee",
                  color: "#000",
                }}
              >
                <div style={{ flex: 1 }}>Tanggal</div>
                <div style={{ flex: 1 }}>Kasir</div>
                <div style={{ flex: 1 }}>Status</div>
                <div style={{ flex: 1, textAlign: "right" }}>Laba</div>
              </div>
              {/* Body Tabel */}
              {currentItems.map((item) => (
                <div
                  key={item.transaction_id}
                  style={{
                    display: "flex",
                    padding: "10px 5px",
                    borderBottom: "1px solid #eee",
                    color: "#333",
                  }}
                >
                  <div style={{ flex: 1 }}>{formatDate(item.date)}</div>
                  <div style={{ flex: 1 }}>{item.cashier || "-"}</div>
                  <div style={{ flex: 1 }}>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        backgroundColor:
                          item.status === "Tunai" ? "#e8f5e9" : "#e3f2fd",
                        color: item.status === "Tunai" ? "#2e7d32" : "#1565c0",
                      }}
                    >
                      {item.status}
                    </span>
                  </div>
                  <div style={{ flex: 1, textAlign: "right" }}>
                    {formatRupiah(item.profit)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ marginTop: "0", color: "#888" }}>
              Tidak ditemukan data
            </p>
          )}
        </div>

        {/* --- FOOTER PAGINATION --- */}
        <div style={footerStyle}>
          <button
            style={{
              ...navButtonStyle,
              opacity: currentPage === 1 ? 0.5 : 1,
            }}
            onClick={handlePrev}
            disabled={currentPage === 1}
          >
            PREV
          </button>

          <div style={{ flexGrow: 1, textAlign: "center", color: "#555" }}>
            {data.length === 0
              ? "0 sd 0 dr 0 data"
              : `${indexOfFirstItem + 1} sd ${Math.min(
                  indexOfLastItem,
                  totalItems
                )} dr ${totalItems} data`}
          </div>

          <button
            style={{
              ...navButtonStyle,
              opacity: indexOfLastItem >= totalItems ? 0.5 : 1,
            }}
            onClick={handleNext}
            disabled={indexOfLastItem >= totalItems}
          >
            NEXT
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default Jurnal;
