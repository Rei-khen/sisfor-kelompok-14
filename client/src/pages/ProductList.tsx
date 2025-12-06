import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import RestockHistoryModal from "../components/RestockHistoryModal";
import SalesHistoryModal from "../components/SalesHistoryModal";

// --- KONFIGURASI API ---
const API_BASE_URL = "http://localhost:5000/api";

// Tipe Data Variasi
interface Variant {
  variant_id: number;
  variant_name: string;
  price: number;
}

// Tipe Data Produk
interface Product {
  product_id: number;
  product_name: string;
  category_name: string | null;
  purchase_price: number;
  selling_price: number;
  current_stock: number;
  stock_management_type: string;
  image_url: string | null;
  variants: Variant[];
}

interface Category {
  category_id: number;
  category_name: string;
}

const ProductList: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  
  // State Modal History
  const [showRestockHistory, setShowRestockHistory] = useState(false);
  const [selectedProductHistory, setSelectedProductHistory] = useState<{ id: number; name: string; } | null>(null);
  const [showSalesHistory, setShowSalesHistory] = useState(false);
  const [selectedProductSales, setSelectedProductSales] = useState<{ id: number; name: string; } | null>(null);

  const handleOpenHistory = (prod: Product) => {
    setSelectedProductHistory({ id: prod.product_id, name: prod.product_name });
    setShowRestockHistory(true);
  };

  const handleOpenSalesHistory = (prod: Product) => {
    setSelectedProductSales({ id: prod.product_id, name: prod.product_name });
    setShowSalesHistory(true);
  };

  // FETCH DATA
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // API Call dengan Pagination params agar backend mengerti
      const resProd = await axios.get(`${API_BASE_URL}/products`, {
        headers,
        params: { page: 1, limit: 1000 } // Ambil banyak data sekaligus
      });
      
      // Ambil data array dari .data.data (Sesuai format baru backend)
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

  // LOGIKA FILTER
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchName = p.product_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = selectedCategory ? p.category_name === selectedCategory : true;
      return matchName && matchCat;
    });
  }, [products, searchTerm, selectedCategory]);

  const formatRp = (val: number | undefined | null) => {
    if (val === undefined || val === null) return "Rp 0";
    return "Rp " + Number(val).toLocaleString("id-ID");
  };

  // --- STYLES ---
  const primaryColor = "#00acc1";
  const fontStyle = { fontFamily: "'Montserrat', sans-serif" };

  const containerStyle: React.CSSProperties = {
    padding: "20px",
    backgroundColor: "#f4f7fe", // Background Halaman Abu-abu muda
    minHeight: "100vh",
    color: "#333", // PERBAIKAN UTAMA: Teks Hitam
    ...fontStyle
  };

  const headerStyle: React.CSSProperties = {
    display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px"
  };

  const titleStyle: React.CSSProperties = {
    margin: 0,
    color: "#050542", // Judul Biru Tua
    fontSize: "28px",
    fontWeight: "bold"
  };

  const btnHeaderStyle: React.CSSProperties = {
    padding: "10px 20px",
    backgroundColor: primaryColor,
    color: "white", 
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginLeft: "10px",
    fontWeight: "600",
    ...fontStyle
  };

  const searchContainerStyle: React.CSSProperties = {
    display: "flex", gap: "10px", marginBottom: "15px"
  };

  const iconBoxStyle: React.CSSProperties = {
    backgroundColor: primaryColor,
    color: "white",
    width: "45px",
    height: "45px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "6px",
    fontSize: "20px",
    cursor: "pointer",
  };

  const searchInputStyle: React.CSSProperties = {
    flexGrow: 1,
    padding: "10px 15px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "14px",
    outline: "none",
    backgroundColor: "white", 
    color: "#333", // Input Teks Hitam
    ...fontStyle
  };

  const dropdownStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 15px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    marginBottom: "20px",
    backgroundColor: "white",
    fontSize: "14px",
    color: "#333", // Dropdown Teks Hitam
    cursor: "pointer",
    ...fontStyle
  };

  const filterBtnContainer: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", fontSize: "14px", color: "#555"
  };

  const filterBtnStyle: React.CSSProperties = {
    padding: "6px 15px",
    border: "1px solid #ccc",
    backgroundColor: "white",
    borderRadius: "4px",
    cursor: "pointer",
    color: "#333",
    ...fontStyle
  };

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: "white",
    border: "1px solid #eee",
    borderRadius: "12px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
    height: "100%",
    color: "#333" // Isi Kartu Teks Hitam
  };

  const actionGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
    marginTop: "auto",
    paddingTop: "15px",
    borderTop: "1px solid #f0f0f0"
  };

  const actionBtnStyle: React.CSSProperties = {
    backgroundColor: "white",
    color: primaryColor,
    border: `1px solid ${primaryColor}`,
    padding: "8px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
    ...fontStyle
  };

  const variantSelectStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px",
    borderRadius: "4px",
    border: "1px solid #eee",
    marginTop: "10px",
    backgroundColor: "#f9f9f9",
    fontSize: "12px",
    color: "#333",
    ...fontStyle
  };

  return (
    <MainLayout>
      <div style={containerStyle}>
        {/* Header & Filter */}
        <div style={headerStyle}>
          <h2 style={titleStyle}>Produk</h2>
          <div>
            <button onClick={() => navigate("/kategori")} style={btnHeaderStyle}>Kategori</button>
            <button onClick={() => navigate("/produk/tambah")} style={btnHeaderStyle}>+ Tambah Produk</button>
          </div>
        </div>
        
        <div style={searchContainerStyle}>
          <div style={iconBoxStyle} onClick={fetchData}>🔄</div>
          <input type="text" placeholder="Cari nama produk..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={searchInputStyle} />
        </div>
        
        <select style={dropdownStyle} value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          <option value="">Semua Kategori</option>
          {categories.map((cat) => (
            <option key={cat.category_id} value={cat.category_name}>{cat.category_name}</option>
          ))}
        </select>
        
        <div style={filterBtnContainer}>
          <span>Urutkan :</span>
          <button style={filterBtnStyle}>Nama (A-Z)</button>
          <button style={filterBtnStyle}>Harga (Terendah)</button>
        </div>

        {/* GRID PRODUK */}
        {loading ? (
          <p style={{textAlign:"center", marginTop:"30px", color: "#666"}}>Memuat data...</p>
        ) : (
          <div style={gridStyle}>
            {filteredProducts.map((prod) => (
              <div key={prod.product_id} style={cardStyle}>
                <small style={{ color: primaryColor, fontWeight:"bold", marginBottom: "5px", textTransform:"uppercase", fontSize: "11px" }}>
                  {prod.category_name || "UMUM"}
                </small>

                {/* --- BAGIAN GAMBAR & INFO --- */}
                <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
                  {/* Container Gambar */}
                  <div style={{ width: "80px", height: "80px", backgroundColor: "#f8f9fa", display: "flex", justifyContent: "center", alignItems: "center", borderRadius: "8px", overflow: "hidden" }}>
                    {prod.image_url ? (
                      <img src={`http://localhost:5000${prod.image_url}`} alt={prod.product_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <span style={{ fontSize: "30px" }}>📦</span>
                    )}
                  </div>

                  {/* Info Produk */}
                  <div style={{ flexGrow: 1 }}>
                    <strong style={{ display: "block", fontSize: "16px", marginBottom: "8px", color: "#333", lineHeight: "1.4" }}>
                      {prod.product_name}
                    </strong>
                    <div style={{ fontSize: "13px", lineHeight: "1.6", color: "#555" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Pokok:</span> <span>{formatRp(prod.purchase_price)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Jual:</span> <span style={{fontWeight:"bold", color: "#333"}}>{formatRp(prod.selling_price)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop:"5px" }}>
                        <span>Stok:</span>
                        <span style={{fontWeight:"bold", color: prod.current_stock <= 0 ? "red" : "#28a745"}}>
                          {prod.stock_management_type === "no_stock_management" ? "∞" : prod.current_stock}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dropdown Variasi */}
                {prod.variants && prod.variants.length > 0 && (
                  <select style={variantSelectStyle}>
                    <option value="">Variasi Harga ({prod.variants.length})</option>
                    {prod.variants.map((v) => (
                      <option key={v.variant_id} value={v.variant_id}>
                        {v.variant_name} - {formatRp(v.price)}
                      </option>
                    ))}
                  </select>
                )}

                {/* Tombol Aksi */}
                <div style={actionGridStyle}>
                  <button style={actionBtnStyle} onClick={() => handleOpenSalesHistory(prod)}>Histori Jual</button>
                  <button style={{...actionBtnStyle, backgroundColor: primaryColor, color:"white"}} onClick={() => navigate(`/produk/edit/${prod.product_id}`)}>Edit</button>
                  <button style={actionBtnStyle} onClick={() => handleOpenHistory(prod)}>Riwayat Stok</button>
                  <button style={{...actionBtnStyle, borderColor: "#ccc", color:"#666"}}>Stok Opname</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px", color: "#555" }}>
            Tidak ada produk ditemukan.
          </div>
        )}

        {/* Pagination Dummy */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "30px" }}>
          <button style={{ padding: "8px 20px", backgroundColor: "white", border: "1px solid #ccc", borderRadius: "6px", cursor:"pointer", color: "#333", ...fontStyle }}>PREV</button>
          <span style={{ color: "#666", fontSize: "14px", fontWeight: "600" }}>
            Menampilkan {filteredProducts.length} data
          </span>
          <button style={{ padding: "8px 20px", backgroundColor: "white", border: "1px solid #ccc", borderRadius: "6px", cursor:"pointer", color: "#333", ...fontStyle }}>NEXT</button>
        </div>
      </div>

      {/* Modal Histori Restok */}
      {showRestockHistory && selectedProductHistory && (
        <RestockHistoryModal
          productId={selectedProductHistory.id}
          productName={selectedProductHistory.name}
          onClose={() => setShowRestockHistory(false)}
        />
      )}

      {/* Modal Histori Jual */}
      {showSalesHistory && selectedProductSales && (
        <SalesHistoryModal
          productId={selectedProductSales.id}
          productName={selectedProductSales.name}
          onClose={() => setShowSalesHistory(false)}
        />
      )}
    </MainLayout>
  );
};

export default ProductList;