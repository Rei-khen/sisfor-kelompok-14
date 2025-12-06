import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";

// --- KONFIGURASI API ---
const API_BASE_URL = "http://localhost:5000/api";

// Tipe Data
interface Product {
  product_id: number;
  product_name: string;
  category_name: string | null;
  category_id?: number; // Penting untuk update balik ke backend
  current_stock: number;
  min_stock_alert?: number; // Penting
  selling_price?: number;   // Penting
  stock_management_type: string;
  store_name?: string;
  barcode?: string;
}

interface Category {
  category_id: number;
  category_name: string;
}

const RestockPage: React.FC = () => {
  const navigate = useNavigate();
  
  // --- STATE ---
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedOutlet, setSelectedOutlet] = useState("");

  // State Modal Restok
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [restockQty, setRestockQty] = useState(0);
  const [unitCost, setUnitCost] = useState(0);

  // --- FETCH DATA ---
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const resProd = await axios.get(`${API_BASE_URL}/products`, {
        headers,
        params: { page: 1, limit: 1000 } 
      });
      
      if (resProd.data && Array.isArray(resProd.data.data)) {
          setProducts(resProd.data.data);
      } else {
          setProducts([]);
      }

      const resCat = await axios.get(`${API_BASE_URL}/categories`, { headers });
      setCategories(resCat.data);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIKA FILTER ---
  const filteredProducts = products.filter((p) => {
    if (p.stock_management_type === "no_stock_management") return false;

    const matchName = p.product_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory ? p.category_name === selectedCategory : true;
    const matchOutlet = selectedOutlet ? p.store_name === selectedOutlet : true;

    return matchName && matchCat && matchOutlet;
  });

  const outlets = useMemo(() => {
    const list = products
      .map((p) => p.store_name)
      .filter((name): name is string => !!name);
    return [...new Set(list)];
  }, [products]);

  // --- HANDLER RESTOK ---
  const openRestockModal = (product: Product) => {
    setSelectedProduct(product);
    setRestockQty(0);
    setUnitCost(0);
    setIsModalOpen(true);
  };

  const handleRestockSubmit = async () => {
    if (!selectedProduct || restockQty <= 0) {
      alert("Jumlah stok harus lebih dari 0");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // PERBAIKAN LOGIKA: Kirim data lengkap agar backend tidak menolak (karena validasi require)
      // Kita update stoknya saja, tapi field lain tetap disertakan
      const payload = {
        ...selectedProduct, // Sertakan data lama
        current_stock: Number(selectedProduct.current_stock) + Number(restockQty),
        // Pastikan field wajib backend ada (mapping manual jika perlu)
        category_id: selectedProduct.category_id, 
        min_stock_alert: selectedProduct.min_stock_alert || 0,
        selling_price: selectedProduct.selling_price || 0,
        // (Optional) Kirim unitCost jika backend Anda mencatat riwayat pembelian (perlu endpoint khusus di masa depan)
      };

      await axios.put(`${API_BASE_URL}/products/${selectedProduct.product_id}`, payload, { headers });

      alert(`Berhasil menambahkan ${restockQty} stok!`);
      setIsModalOpen(false);
      fetchData(); // Refresh data
    } catch (error) {
      console.error(error);
      alert("Gagal restok. Pastikan data produk lengkap.");
    }
  };

  // --- STYLES (DIPERBAIKI: Input Putih, Teks Hitam) ---
  const primaryColor = "#00acc1";
  const fontStyle = { fontFamily: "'Montserrat', sans-serif" };

  const containerStyle: React.CSSProperties = { 
    padding: "20px", 
    backgroundColor: "#f4f7fe", 
    minHeight: "100vh",
    color: "#333", 
    ...fontStyle 
  };

  const gridStyle: React.CSSProperties = { 
    display: "grid", 
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
    gap: "20px", 
    marginTop: "20px" 
  };

  const cardStyle: React.CSSProperties = { 
    backgroundColor: "white", 
    border: "1px solid #eee", 
    borderRadius: "8px", 
    padding: "15px", 
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)", 
    display: "flex", 
    flexDirection: "column", 
    justifyContent: "space-between",
    color: "#333" 
  };

  const modalOverlayStyle: React.CSSProperties = { 
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0, 
    backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 
  };

  const modalContentStyle: React.CSSProperties = { 
    backgroundColor: "white", padding: "25px", borderRadius: "8px", width: "400px", maxWidth: "90%", color: "#333" 
  };

  // PERBAIKAN UTAMA STYLE INPUT
  const inputStyle: React.CSSProperties = { 
    width: "100%", 
    padding: "10px", 
    borderRadius: "4px", 
    border: "1px solid #ccc", 
    outline: "none",
    backgroundColor: "white", // Background Putih
    color: "#333", // Teks Hitam
    ...fontStyle
  };
  
  // Style khusus untuk Toolbar Filter
  const toolbarInputStyle: React.CSSProperties = {
      ...inputStyle,
      width: "auto",
      flexGrow: 1
  };
  
  const selectStyle: React.CSSProperties = {
      ...inputStyle,
      width: "auto",
      minWidth: "150px",
      cursor: "pointer"
  };

  return (
    <MainLayout>
      <div style={containerStyle}>
        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
          <h2 style={{ margin: 0, color: "#050542" }}>RESTOK</h2>
        </div>

        {/* TOOLBAR FILTER */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px", flexWrap: "wrap" }}>
          <div onClick={fetchData} style={{ backgroundColor: primaryColor, color: "white", width: "40px", height: "40px", display: "flex", justifyContent: "center", alignItems: "center", borderRadius: "4px", cursor: "pointer" }}>
            🔄
          </div>
          <input
            type="text"
            placeholder="Cari produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={toolbarInputStyle}
          />
        </div>

        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <select style={selectStyle} value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                <option value="">Semua Kategori</option>
                {categories.map((cat) => (
                    <option key={cat.category_id} value={cat.category_name}>{cat.category_name}</option>
                ))}
            </select>
            
            <select style={selectStyle} value={selectedOutlet} onChange={(e) => setSelectedOutlet(e.target.value)}>
                <option value="">Semua Outlet</option>
                {outlets.map((outlet, idx) => (
                    <option key={idx} value={outlet}>{outlet}</option>
                ))}
            </select>
        </div>

        {/* GRID DATA */}
        {loading ? (
          <p style={{textAlign:"center", color: "#666"}}>Memuat data...</p>
        ) : filteredProducts.length === 0 ? (
          <p style={{textAlign:"center", color: "#888"}}>Tidak ada produk ditemukan.</p>
        ) : (
          <div style={gridStyle}>
            {filteredProducts.map((prod) => (
              <div key={prod.product_id} style={cardStyle}>
                <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
                  <div style={{ width: "80px", height: "80px", backgroundColor: "#f0f0f0", display: "flex", justifyContent: "center", alignItems: "center", borderRadius: "6px" }}>
                    <span style={{ fontSize: "30px" }}>📦</span>
                  </div>
                  <div>
                    <small style={{ color: primaryColor, fontWeight: "bold", textTransform: "uppercase" }}>
                      {prod.category_name || "Umum"}
                    </small>
                    <strong style={{ display: "block", fontSize: "16px", margin: "5px 0", color: "#333" }}>
                      {prod.product_name}
                    </strong>
                    <div style={{ fontSize: "13px", color: "#666" }}>
                       {prod.store_name || "Outlet Pusat"}
                    </div>
                    <div style={{ fontSize: "14px", color: "#444", marginTop: "5px" }}>
                      Stok: <strong>{prod.current_stock}</strong>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => openRestockModal(prod)}
                  style={{ width: "100%", padding: "10px", backgroundColor: primaryColor, color: "white", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}
                >
                  TAMBAH STOK
                </button>
              </div>
            ))}
          </div>
        )}

        {/* MODAL RESTOK */}
        {isModalOpen && selectedProduct && (
          <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
              <h3 style={{ marginTop: 0, color: "#050542" }}>Restok: {selectedProduct.product_name}</h3>
              <p style={{ color: "#666", fontSize: "14px" }}>Stok saat ini: <strong>{selectedProduct.current_stock}</strong></p>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "12px", color: "#333" }}>Jumlah Penambahan</label>
                {/* Input Restok */}
                <input 
                    type="number" 
                    value={restockQty} 
                    onChange={(e) => setRestockQty(Number(e.target.value))} 
                    style={inputStyle} 
                    placeholder="0" 
                    autoFocus
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "12px", color: "#333" }}>Harga Beli Satuan (Rp)</label>
                {/* Input Harga Beli */}
                <input 
                    type="number" 
                    value={unitCost} 
                    onChange={(e) => setUnitCost(Number(e.target.value))} 
                    style={inputStyle} 
                    placeholder="0" 
                />
                <small style={{ color: "#888", fontSize: "11px" }}>*Opsional (Hanya untuk catatan)</small>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: "12px", backgroundColor: "#eee", border: "none", borderRadius: "4px", cursor: "pointer", color: "#333" }}>Batal</button>
                <button onClick={handleRestockSubmit} style={{ flex: 1, padding: "12px", backgroundColor: primaryColor, color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>Simpan</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default RestockPage;