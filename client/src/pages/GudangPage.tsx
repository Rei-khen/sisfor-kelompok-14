import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import MainLayout from "../components/MainLayout"; 

// --- KONFIGURASI API ---
const API_BASE_URL = "http://localhost:5000/api"; 

// Tipe Data (Saya lengkapi agar tidak error 'Property does not exist')
interface Product {
  product_id: number;
  barcode: string;
  product_name: string;
  category_name: string; 
  store_name: string;    
  current_stock: number;   
  warehouse_stock: number; // Baru
  min_stock_alert: number; // Baru
  selling_price: number;
  category_id?: number;
}

interface Category {
  category_id: number;
  category_name: string;
}

const GudangPage: React.FC = () => {
  // --- STATE ---
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  // Filter & Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  
  // FIX 1: Tambahkan State yang hilang (Penyebab error 'Cannot find name selectedOutlet')
  const [selectedOutlet, setSelectedOutlet] = useState(""); 
  
  const [isRestockFilterActive, setIsRestockFilterActive] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10; 

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Product | null>(null);

  // FIX 2: Tambahkan State untuk Transfer (Penyebab error 'Cannot find name transferItem')
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferQty, setTransferQty] = useState(0);
  const [transferItem, setTransferItem] = useState<Product | null>(null);
  
  // Form Data
  const [formData, setFormData] = useState({
    barcode: "", 
    product_name: "", 
    category_id: "", 
    outlet: "", 
    warehouse_stock: 0, 
    min_stock_alert: 10,
    selling_price: 0
  });

  // --- FETCH DATA ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Backend sekarang support pagination
      const resProd = await axios.get(`${API_BASE_URL}/products`, {
        headers,
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm,
          ...(selectedCategory && { category_id: selectedCategory })
        }
      });

      // FIX 3: Ambil data dari .data.data (Karena backend pagination return object)
      if (resProd.data && Array.isArray(resProd.data.data)) {
         setProducts(resProd.data.data);
         setTotalPages(resProd.data.totalPages);
      } else {
         setProducts([]); 
      }

      const resCat = await axios.get(`${API_BASE_URL}/categories`, { headers });
      setCategories(resCat.data);

    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, selectedCategory]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchData();
    }, 500); 
    return () => clearTimeout(delayDebounce);
  }, [fetchData]);

  // FIX 4: Gunakan useMemo untuk outlets dan beri tipe data explicit string
  const outlets = useMemo(() => {
    const list = products
        .map((p) => p.store_name)
        .filter((name): name is string => !!name); 
    return [...new Set(list)];
  }, [products]);


  // --- HANDLERS ---
  const handleExportCSV = () => {
    if (products.length === 0) return alert("Tidak ada data.");
    const headers = ["Kode", "Nama Produk", "Kategori", "Outlet", "Stok Gudang", "Stok Toko"];
    const rows = products.map(item => [
      `"${item.barcode || "-"}"`, `"${item.product_name}"`, `"${item.category_name || "-"}"`,
      `"${item.store_name || "Pusat"}"`, item.warehouse_stock, item.current_stock
    ]);
    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Gudang_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const payload = {
        product_name: formData.product_name,
        barcode: formData.barcode,
        category_id: Number(formData.category_id) || null,
        min_stock_alert: Number(formData.min_stock_alert),
        initial_stock: Number(formData.warehouse_stock), // Masuk Gudang
        location_source: 'gudang', 
        selling_price: 0, 
        store_id: 1 
      };

      if (editingItem) {
        await axios.put(`${API_BASE_URL}/products/${editingItem.product_id}`, payload, { headers });
        alert("Data diperbarui!");
      } else {
        await axios.post(`${API_BASE_URL}/products`, payload, { headers });
        alert("Barang berhasil masuk Gudang!");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) { alert("Gagal menyimpan."); }
  };

  const handleTransferSubmit = async () => {
      if(!transferItem || transferQty <= 0) return alert("Jumlah minimal 1");
      if(transferQty > transferItem.warehouse_stock) return alert("Stok gudang kurang!");

      try {
          const token = localStorage.getItem("token");
          await axios.post(`${API_BASE_URL}/products/${transferItem.product_id}/transfer`, 
            { quantity: transferQty },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          alert("Stok dikirim ke Toko!");
          setIsTransferModalOpen(false);
          fetchData();
      } catch (error) { alert("Gagal transfer."); }
  };

  const openTransferModal = (item: Product) => {
    setTransferItem(item);
    setTransferQty(0);
    setIsTransferModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Hapus data?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${API_BASE_URL}/products/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchData();
      } catch (error) { alert("Gagal hapus."); }
    }
  };

  const handleOpenNotif = (item: Product) => {
    setEditingItem(item);
    setFormData({ ...formData, min_stock_alert: item.min_stock_alert });
    setIsNotifModalOpen(true);
  };

  const handleSaveNotif = async () => {
    if (!editingItem) return;
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_BASE_URL}/products/${editingItem.product_id}`, {
        ...editingItem,
        min_stock_alert: Number(formData.min_stock_alert)
      }, { headers: { Authorization: `Bearer ${token}` } });

      setIsNotifModalOpen(false);
      fetchData();
    } catch (error) { alert("Gagal update."); }
  };

  const openModal = (item?: Product) => {
      if(item) {
          setEditingItem(item);
          setFormData({
              barcode: item.barcode, product_name: item.product_name, category_id: String(item.category_id),
              outlet: "", warehouse_stock: item.warehouse_stock, min_stock_alert: item.min_stock_alert, selling_price: 0
          });
      } else {
          setEditingItem(null);
          setFormData({ barcode: "", product_name: "", category_id: "", outlet: "", warehouse_stock: 0, min_stock_alert: 10, selling_price: 0 });
      }
      setIsModalOpen(true);
  }

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // --- STYLES (ASLI DARI ANDA) ---
  const fontStyle = { fontFamily: "'Montserrat', sans-serif" };
  const primaryColor = "#00acc1";

  const containerStyle: React.CSSProperties = { padding: "30px", backgroundColor: "transparent", minHeight: "100vh", color: "#333", ...fontStyle };
  const pageTitleStyle: React.CSSProperties = { fontSize: "36px", fontWeight: "bold", color: "#050542", margin: 0 };
  const separatorLineStyle: React.CSSProperties = { width: "100%", height: "1px", backgroundColor: "black", marginTop: "20px", marginBottom: "20px" };
  const tableHeaderStyle: React.CSSProperties = { backgroundColor: "#BBDCE5", color: "#333", padding: "15px", textAlign: "left", fontWeight: "700", fontSize: "14px", borderBottom: "1px solid #ccc" };
  const cellStyle: React.CSSProperties = { padding: "15px", fontSize: "14px", color: "#333", verticalAlign: "middle", borderBottom: "1px solid #eee" };
  const btnStyle = { backgroundColor: primaryColor, color: "white", border: "none", padding: "8px 15px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", ...fontStyle };
  const btnOutlineStyle = { backgroundColor: "white", color: primaryColor, border: `1px solid ${primaryColor}`, padding: "8px 15px", borderRadius: "4px", cursor: "pointer", fontWeight: "600", ...fontStyle };
  const modalOverlayStyle: React.CSSProperties = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 };
  const modalContentStyle: React.CSSProperties = { backgroundColor: "white", padding: "30px", borderRadius: "12px", width: "500px", maxWidth: "90%", boxShadow: "0 10px 30px rgba(0,0,0,0.2)", color: "#333" };
  const toolbarContainerStyle: React.CSSProperties = { padding: "20px", backgroundColor: "transparent", borderBottom: "none" };
  const toolbarContentStyle: React.CSSProperties = { display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "15px" };
  const toolbarInputStyle: React.CSSProperties = { padding: "10px 15px", borderRadius: "8px", border: "1px solid #ccc", backgroundColor: "white", outline: "none", fontSize: "14px", color: "#495057", transition: "0.2s" };
  const chipStyle: React.CSSProperties = { padding: "10px 15px", borderRadius: "20px", cursor: "pointer", fontSize: "13px", fontWeight: "600", display: "flex", alignItems: "center", border: isRestockFilterActive ? "2px solid #ff9800" : "1px solid #ccc", backgroundColor: "white", color: isRestockFilterActive ? "#e65100" : "#666", transition: "0.2s" };
  
  // FIX 5: Tambahkan inputStyle yang hilang (Penyebab error 'Cannot find name inputStyle')
  const inputStyle: React.CSSProperties = { ...toolbarInputStyle, border: "1px solid #e0e0e0", margin: "5px 0 15px 0", width: "100%" };
  
  // FIX 6: Tambahkan btnPrimaryStyle yang hilang
  const btnPrimaryStyle = { ...btnStyle }; 
  
  // FIX 7: Alias formInputStyle agar kompatibel dengan kode Anda
  const formInputStyle = inputStyle; 
  
  const paginationContainerStyle: React.CSSProperties = { padding: "15px 20px", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "8px", borderTop: "1px solid #eee", backgroundColor: "#fafafa" };
  const pageBtnStyle = (isActive: boolean): React.CSSProperties => ({ padding: "8px 12px", borderRadius: "6px", border: isActive ? "1px solid #00acc1" : "1px solid #ddd", backgroundColor: isActive ? "#00acc1" : "white", color: isActive ? "white" : "#333", cursor: "pointer", fontSize: "13px", fontWeight: "600", transition: "0.2s" });

  return (
    <MainLayout>
      <div style={containerStyle}>
        
        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h1 style={pageTitleStyle}>Gudang</h1>
            <div style={{display:"flex", gap:"10px"}}>
                <button onClick={handleExportCSV} style={btnOutlineStyle}>📄 Export CSV</button>
                <button onClick={() => openModal()} style={btnPrimaryStyle}>+ Barang Masuk</button>
            </div>
        </div>
        
        {/* Fix: Pakai separatorLineStyle */}
        <div style={separatorLineStyle}></div>

        {/* KARTU UTAMA */}
        <div style={{ backgroundColor: "white", border: "1px solid #eee", borderRadius: "8px", overflow: "hidden", color: "#333" }}>
            
            {/* TOOLBAR */}
            <div style={toolbarContainerStyle}>
                <div style={toolbarContentStyle}>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                    <input type="text" placeholder="Cari Nama / Kode..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ ...toolbarInputStyle, width: "250px" }} />
                    <select style={{...toolbarInputStyle, cursor: "pointer"}} value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                        <option value="">Semua Kategori</option>
                        {categories.map((cat) => (
                            <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>
                        ))}
                    </select>
                    <select style={{...toolbarInputStyle, cursor: "pointer"}} value={selectedOutlet} onChange={(e) => setSelectedOutlet(e.target.value)}>
                        <option value="">Semua Outlet</option>
                        {outlets.map((outlet, idx) => (
                           // FIX: Type safe mapping
                           <option key={idx} value={outlet as string}>{outlet as string}</option>
                        ))}
                    </select>
                    </div>
                    <div style={chipStyle} onClick={() => setIsRestockFilterActive(!isRestockFilterActive)} title="Filter stok menipis">
                        <span style={{marginRight: "5px", fontSize: "16px"}}>⚠️</span> Cek Stok Menipis {isRestockFilterActive && " (Aktif)"}
                    </div>
                </div>
            </div>

            {/* TABEL DATA GUDANG */}
            <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#BBDCE5", textAlign: "left" }}>
                            <th style={{ padding: "15px", fontWeight: "700" }}>Kode</th>
                            <th style={{ padding: "15px", fontWeight: "700" }}>Nama Produk</th>
                            <th style={{ padding: "15px", fontWeight: "700" }}>Kategori</th>
                            <th style={{ padding: "15px", textAlign: "center", fontWeight: "700" }}>Stok Gudang</th>
                            <th style={{ padding: "15px", textAlign: "center", fontWeight: "700" }}>Stok Toko</th>
                            <th style={{ padding: "15px", fontWeight: "700" }}>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                             <tr><td colSpan={6} style={{textAlign:"center", padding:"30px"}}>Memuat data...</td></tr>
                        ) : products.length === 0 ? (
                             <tr><td colSpan={6} style={{textAlign:"center", padding:"30px", color:"#888"}}>Gudang kosong.</td></tr>
                        ) : (
                            products.map((item, i) => {
                                if (isRestockFilterActive && item.warehouse_stock > item.min_stock_alert) return null;
                                if (selectedOutlet && item.store_name !== selectedOutlet) return null;

                                const isCritical = item.warehouse_stock <= item.min_stock_alert;
                                let rowBgColor = i % 2 !== 0 ? "#f9fafb" : "white"; 
                                if (isCritical) rowBgColor = "#fff4f4"; 

                                return (
                                    <tr key={item.product_id} style={{ borderBottom: "1px solid #eee", backgroundColor: rowBgColor, borderLeft: isCritical ? "4px solid #d32f2f" : "4px solid transparent" }}>
                                        <td style={{ padding: "15px", fontWeight: "600", color: "#555" }}>{item.barcode || "-"}</td>
                                        <td style={{ padding: "15px", fontWeight: "500" }}>{item.product_name}</td>
                                        <td style={{ padding: "15px", color: "#666" }}>{item.category_name || "-"}</td>
                                        
                                        {/* STOK GUDANG */}
                                        <td style={{ ...cellStyle, textAlign: "center", fontWeight: "bold", color: "#00acc1", fontSize: "16px" }}>
                                            {item.warehouse_stock}
                                        </td>
                                        {/* STOK TOKO */}
                                        <td style={{ ...cellStyle, textAlign: "center", color: "#888" }}>
                                            {item.current_stock}
                                        </td>

                                        <td style={{ padding: "15px" }}>
                                            <div style={{display: "flex", gap: "5px"}}>
                                                <button 
                                                    title="Kirim ke Toko" 
                                                    onClick={() => openTransferModal(item)} 
                                                    style={{border:'1px solid #00acc1', background:'white', cursor:'pointer', padding: "5px 8px", borderRadius: "4px", fontSize: "16px"}}
                                                >
                                                    🚚
                                                </button>
                                                <button title="Edit Data" onClick={() => openModal(item)} style={{border:"1px solid #ddd", background:"white", cursor:"pointer", borderRadius:"4px", padding:"6px"}}>✏️</button>
                                                <button title="Notif" onClick={() => handleOpenNotif(item)} style={{border:'1px solid #ddd', background:'white', cursor:'pointer', padding: "6px", borderRadius: "4px", color: "#f39c12"}}>🔔</button>
                                                <button title="Hapus" onClick={() => handleDelete(item.product_id)} style={{border:"1px solid #ddd", background:"white", cursor:"pointer", borderRadius:"4px", padding:"6px", color:"red"}}>🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div style={paginationContainerStyle}>
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} style={{...pageBtnStyle(false), opacity: currentPage === 1 ? 0.5 : 1}}>Prev</button>
                    <span style={{alignSelf:"center", fontSize:"14px", fontWeight:"600"}}>Hal {currentPage} / {totalPages}</span>
                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} style={{...pageBtnStyle(false), opacity: currentPage === totalPages ? 0.5 : 1}}>Next</button>
                </div>
            )}
        </div>

      </div>

      {/* --- MODAL TRANSFER (BARU) --- */}
      {isTransferModalOpen && transferItem && (
          <div style={modalOverlayStyle}>
              <div style={modalContentStyle}>
                  <h3 style={{ marginTop: 0, color: "#050542" }}>🚚 Kirim ke Toko</h3>
                  <div style={{marginBottom:"15px", fontSize:"14px", color:"#555", lineHeight:"1.6"}}>
                      <div>Produk: <strong>{transferItem.product_name}</strong></div>
                      <div>Stok Gudang Tersedia: <strong style={{color:"#00acc1"}}>{transferItem.warehouse_stock}</strong></div>
                  </div>
                  
                  <label style={{fontWeight: "bold", display:"block", marginBottom:"5px", fontSize:"13px", color:"#333"}}>Jumlah yang dikirim:</label>
                  <input type="number" style={inputStyle} value={transferQty} onChange={(e) => setTransferQty(Number(e.target.value))} placeholder="0" />
                  
                  <div style={{ display: "flex", gap: "10px", marginTop: "10px", justifyContent:"flex-end" }}>
                      <button onClick={() => setIsTransferModalOpen(false)} style={{ ...btnStyle, backgroundColor: "#ccc", color: "#333", flex: 1 }}>Batal</button>
                      <button onClick={handleTransferSubmit} style={btnStyle}>Kirim Stok</button>
                  </div>
              </div>
          </div>
      )}

      {/* --- MODAL INPUT BARANG --- */}
      {isModalOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={{marginTop: 0, marginBottom: "20px", color: "#050542"}}>{editingItem ? "Edit Data Barang" : "Input Barang Masuk Gudang"}</h3>
            
            <div style={{marginBottom: "10px"}}>
                <label style={{fontSize:"13px", fontWeight:"600", color:"#555"}}>Nama Produk</label>
                <input style={formInputStyle} value={formData.product_name} onChange={(e) => setFormData({...formData, product_name: e.target.value})} placeholder="Contoh: Kripik Tempe" />
            </div>

            <div style={{display: "flex", gap: "15px", marginBottom: "10px"}}>
                <div style={{flex: 1}}>
                     <label style={{fontSize:"13px", fontWeight:"600", color:"#555"}}>Barcode / Kode</label>
                     <input style={formInputStyle} value={formData.barcode} onChange={(e) => setFormData({...formData, barcode: e.target.value})} placeholder="Scan..." />
                </div>
                <div style={{flex: 1}}>
                    <label style={{fontSize:"13px", fontWeight:"600", color:"#555"}}>Kategori</label>
                    <select style={{...inputStyle, cursor:"pointer"}} value={formData.category_id} onChange={(e) => setFormData({...formData, category_id: e.target.value})}>
                        <option value="">Pilih Kategori</option>
                        {categories.map((cat) => (
                            <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <label style={{fontSize:"13px", fontWeight:"600", color:"#555"}}>Jumlah Masuk Gudang</label>
            <input type="number" style={{...formInputStyle, backgroundColor: editingItem ? "#f5f5f5" : "white"}} value={formData.warehouse_stock} disabled={!!editingItem} onChange={(e) => setFormData({...formData, warehouse_stock: Number(e.target.value)})} placeholder="0" />
            
            <div style={{ display: "flex", gap: "10px", marginTop: "20px", justifyContent: "flex-end" }}>
                <button onClick={() => setIsModalOpen(false)} style={{ ...btnStyle, backgroundColor: "#ccc", color: "#333" }}>Batal</button>
                <button onClick={handleSave} style={btnStyle}>Simpan ke Gudang</button>
            </div>
          </div>
        </div>
      )}
      
      {/* MODAL NOTIFIKASI */}
      {isNotifModalOpen && (
        <div style={modalOverlayStyle}>
            <div style={{...modalContentStyle, width: "400px", textAlign: "center"}}>
                <h3 style={{marginTop: 0, color: "#050542"}}>Atur Batas Stok</h3>
                <input 
                    type="number" 
                    style={{...formInputStyle, textAlign: "center", fontSize: "24px", width: "120px", margin: "10px auto"}} 
                    value={formData.min_stock_alert} 
                    onChange={(e) => setFormData({...formData, min_stock_alert: Number(e.target.value)})} 
                />
                <div style={{display: "flex", justifyContent: "center", gap: "10px", marginTop: "20px"}}>
                    <button onClick={() => setIsNotifModalOpen(false)} style={{...btnOutlineStyle, border: "1px solid #ccc", color: "#555"}}>Batal</button>
                    <button onClick={handleSaveNotif} style={btnStyle}>Simpan Pengaturan</button>
                </div>
            </div>
        </div>
      )}

    </MainLayout>
  );
};

export default GudangPage;