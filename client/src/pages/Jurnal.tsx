import React, { useState, useEffect } from "react";
import MainLayout from "../components/MainLayout";

interface Transaction {
  id: number;
  date: string;
  status: string; 
  kasir: string;
  hargaPokok: number;
  hargaJual: number;
  laba: number;
}

const Jurnal: React.FC = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [kasirFilter, setKasirFilter] = useState("Semua Kasir");

  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    totalHargaPokok: 0,
    totalHargaJual: 0,
    totalLaba: 0,
    totalData: 0,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [totalItems, setTotalItems] = useState(0);

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  const fetchTransactions = async (page: number) => {
    setLoading(true);

    setTimeout(() => {

      const allDummyData: Transaction[] = Array.from({ length: 55 }, (_, i) => ({
        id: i + 1,
        date: "2025-10-05", 
        status: i % 3 === 0 ? "Hutang" : "Lunas",
        kasir: i % 2 === 0 ? "Pemilik" : "Karyawan A",
        hargaPokok: 10000,
        hargaJual: 15000,
        laba: 5000,
      }));

      let filtered = allDummyData.filter((item) => {
        if (statusFilter !== "Semua Status" && item.status !== statusFilter) return false;
        if (kasirFilter !== "Semua Kasir" && item.kasir !== kasirFilter) return false;
        
        return true; 
      });

      const totalCount = filtered.length;
      setTotalItems(totalCount);

      if (totalCount > 0) {
        const totalPokok = filtered.reduce((acc, curr) => acc + curr.hargaPokok, 0);
        const totalJual = filtered.reduce((acc, curr) => acc + curr.hargaJual, 0);
        const totalLaba = filtered.reduce((acc, curr) => acc + curr.laba, 0);

        setSummary({
          totalHargaPokok: totalPokok,
          totalHargaJual: totalJual,
          totalLaba: totalLaba,
          totalData: totalCount,
        });

        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        setData(filtered.slice(startIndex, endIndex));
      } else {
        setData([]);
        setSummary({ totalHargaPokok: 0, totalHargaJual: 0, totalLaba: 0, totalData: 0 });
      }
      setLoading(false);
    }, 500); 
  };


  useEffect(() => {
    fetchTransactions(1);
  }, [statusFilter, kasirFilter]); 

  const handleRefresh = () => {
    setCurrentPage(1); 
    fetchTransactions(1);
  };

  const handleNext = () => {
    if (currentPage * itemsPerPage < totalItems) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchTransactions(nextPage);
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      fetchTransactions(prevPage);
    }
  };

  // --- STYLES ---
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
            title="Refresh Data"
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
          {/* LOGIKA: Saat diubah, state berubah -> useEffect terpanggil -> Data terefresh otomatis */}
          <select 
            style={selectStyle} 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>Semua Status</option>
            <option value="Lunas">Lunas</option>
            <option value="Hutang">Hutang</option>
          </select>

          <select 
            style={selectStyle} 
            value={kasirFilter} 
            onChange={(e) => setKasirFilter(e.target.value)}
          >
            <option>Semua Kasir</option>
            <option value="Pemilik">Pemilik</option>
            <option value="Karyawan A">Karyawan A</option>
          </select>
        </div>

        {/* --- SUMMARY --- */}
        <div style={summaryRowStyle}>
          <div style={summaryItemStyle}>
            <span>Harga pokok</span>
            <span style={{fontWeight: "bold", color: "#000"}}>{formatRupiah(summary.totalHargaPokok)}</span>
          </div>
          <div style={summaryItemStyle}>
            <span>Harga jual</span>
            <span style={{fontWeight: "bold", color: "#000"}}>{formatRupiah(summary.totalHargaJual)}</span>
          </div>
          <div style={{...summaryItemStyle, textAlign: "right"}}>
            <span>Laba</span>
            <span style={{fontWeight: "bold", color: "#000"}}>{formatRupiah(summary.totalLaba)}</span>
          </div>
        </div>

        {/* --- MAIN CONTENT (TABLE / EMPTY) --- */}
        <div style={contentAreaStyle}>
          {loading ? (
            <p>Memuat data...</p>
          ) : data.length > 0 ? (
            <div style={{ width: "100%", fontSize: "14px" }}>
               {/* Header Tabel */}
               <div style={{display:'flex', fontWeight:'bold', padding:'10px 5px', borderBottom:'2px solid #eee', color: '#000'}}>
                 <div style={{flex:1}}>Tanggal</div>
                 <div style={{flex:1}}>Kasir</div>
                 <div style={{flex:1}}>Status</div>
                 <div style={{flex:1, textAlign:'right'}}>Laba</div>
               </div>
               {/* Body Tabel */}
               {data.map((item) => (
                 <div key={item.id} style={{display:'flex', padding:'10px 5px', borderBottom:'1px solid #eee', color: '#333'}}>
                   <div style={{flex:1}}>{item.date}</div>
                   <div style={{flex:1}}>{item.kasir}</div>
                   <div style={{flex:1}}>{item.status}</div>
                   <div style={{flex:1, textAlign:'right'}}>{formatRupiah(item.laba)}</div>
                 </div>
               ))}
            </div>
          ) : (
            <p style={{ marginTop: "0", color: "#888" }}>Tidak ditemukan data</p>
          )}
        </div>

        {/* --- FOOTER PAGINATION --- */}
        <div style={footerStyle}>
          <button 
            style={{...navButtonStyle, opacity: currentPage === 1 ? 0.5 : 1}} 
            onClick={handlePrev} 
            disabled={currentPage === 1}
          >
            PREV
          </button>
          
          <div style={{flexGrow: 1, textAlign: "center", color: "#555"}}>
            {data.length === 0 
              ? "0 sd 0 dr 0 data" 
              : `${(currentPage - 1) * itemsPerPage + 1} sd ${Math.min(currentPage * itemsPerPage, totalItems)} dr ${totalItems} data`
            }
          </div>

          <button 
            style={{...navButtonStyle, opacity: currentPage * itemsPerPage >= totalItems ? 0.5 : 1}} 
            onClick={handleNext} 
            disabled={currentPage * itemsPerPage >= totalItems}
          >
            NEXT
          </button>
        </div>

      </div>
    </MainLayout>
  );
};

export default Jurnal;