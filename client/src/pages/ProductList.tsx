// client/src/pages/ProductList.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import RestockHistoryModal from "../components/RestockHistoryModal";
import SalesHistoryModal from "../components/SalesHistoryModal";

// Tipe Data Variasi
interface Variant {
  variant_id: number;
  variant_name: string;
  price: number;
}

// Tipe Data Produk (Updated)
interface Product {
  product_id: number;
  product_name: string;
  category_name: string | null;
  purchase_price: number;
  selling_price: number;
  current_stock: number;
  stock_management_type: string;
  variants: Variant[]; // Array variasi harga
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showRestockHistory, setShowRestockHistory] = useState(false);
  const [selectedProductHistory, setSelectedProductHistory] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [showSalesHistory, setShowSalesHistory] = useState(false);
  const [selectedProductSales, setSelectedProductSales] = useState<{
    id: number;
    name: string;
  } | null>(null);

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

      const resProd = await axios.get("http://localhost:5000/api/products", {
        headers,
      });
      setProducts(resProd.data);

      const resCat = await axios.get("http://localhost:5000/api/categories", {
        headers,
      });
      setCategories(resCat.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchName = p.product_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory
      ? p.category_name === selectedCategory
      : true;
    return matchName && matchCat;
  });

  const formatRp = (val: number | undefined | null) => {
    if (val === undefined || val === null) return "Rp 0";
    return "Rp " + Number(val).toLocaleString("id-ID");
  };

  // STYLES
  const primaryColor = "#00acc1";

  // ... (Style container, header, searchBar, dll sama seperti sebelumnya)
  const containerStyle: React.CSSProperties = {
    padding: "20px",
    fontFamily: "sans-serif",
    color: "#333",
  };
  const headerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  };
  const btnHeaderStyle: React.CSSProperties = {
    padding: "8px 15px",
    backgroundColor: primaryColor,
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginLeft: "10px",
    fontWeight: "bold",
  };
  const searchContainerStyle: React.CSSProperties = {
    display: "flex",
    gap: "10px",
    marginBottom: "10px",
  };
  const iconBoxStyle: React.CSSProperties = {
    backgroundColor: primaryColor,
    color: "white",
    width: "40px",
    height: "40px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "4px",
    fontSize: "20px",
    cursor: "pointer",
  };
  const searchInputStyle: React.CSSProperties = {
    flexGrow: 1,
    padding: "8px 12px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "16px",
  };
  const dropdownStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    marginBottom: "15px",
    backgroundColor: "white",
    fontSize: "14px",
  };
  const filterBtnContainer: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
    fontSize: "14px",
  };
  const filterBtnStyle: React.CSSProperties = {
    padding: "5px 15px",
    border: "1px solid #ccc",
    backgroundColor: "white",
    borderRadius: "4px",
    cursor: "pointer",
  };

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: "white",
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "15px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
    height: "100%",
  };

  const actionGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "5px",
    marginTop: "auto", // UBAH INI: 'auto' akan mendorong tombol ke paling bawah
    paddingTop: "15px", // Tambahan: Agar tetap ada jarak minimal dengan konten di atasnya
  };
  const actionBtnStyle: React.CSSProperties = {
    backgroundColor: primaryColor,
    color: "white",
    border: "none",
    padding: "8px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "bold",
  };

  // Style khusus Dropdown Variasi (di dalam kartu)
  const variantSelectStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    marginTop: "10px",
    backgroundColor: "#f9f9f9",
    fontSize: "13px",
    color: "#333",
  };

  return (
    <MainLayout>
      <div style={containerStyle}>
        {/* Header & Filter (Sama) */}
        <div style={headerStyle}>
          <h2 style={{ margin: 0, color: "#333" }}>Produk</h2>
          <div>
            <button
              onClick={() => navigate("/kategori")}
              style={btnHeaderStyle}
            >
              Kategori
            </button>
            <button
              onClick={() => navigate("/produk/tambah")}
              style={btnHeaderStyle}
            >
              Tambah Produk
            </button>
          </div>
        </div>
        <div style={searchContainerStyle}>
          <div style={iconBoxStyle} onClick={fetchData}>
            🔄
          </div>
          <input
            type="text"
            placeholder="cari produk"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInputStyle}
          />
        </div>
        <select
          style={dropdownStyle}
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">semua kategori</option>
          {categories.map((cat) => (
            <option key={cat.category_id} value={cat.category_name}>
              {cat.category_name}
            </option>
          ))}
        </select>
        <div style={filterBtnContainer}>
          <span>Filter berdasarkan :</span>
          <button style={filterBtnStyle}>Nama produk</button>
          <button style={filterBtnStyle}>A....Z</button>
        </div>

        {/* GRID PRODUK */}
        {loading ? (
          <p>Memuat data...</p>
        ) : (
          <div style={gridStyle}>
            {filteredProducts.map((prod) => (
              <div key={prod.product_id} style={cardStyle}>
                <small style={{ color: "#666", marginBottom: "5px" }}>
                  {prod.category_name || "Umum"}
                </small>
                <div style={{ display: "flex", gap: "15px" }}>
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      backgroundColor: "#f0f0f0",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: "6px",
                    }}
                  >
                    <span style={{ fontSize: "30px" }}>📦</span>
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <strong
                      style={{
                        display: "block",
                        fontSize: "16px",
                        marginBottom: "5px",
                      }}
                    >
                      {prod.product_name}
                    </strong>
                    <div
                      style={{
                        fontSize: "13px",
                        lineHeight: "1.5",
                        color: "#444",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>Pokok :</span>{" "}
                        <span>{formatRp(prod.purchase_price)}</span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>Jual :</span>{" "}
                        <span>{formatRp(prod.selling_price)}</span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>Stok :</span>
                        <span>
                          {prod.stock_management_type === "no_stock_management"
                            ? "∞"
                            : prod.current_stock}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* DROPDOWN VARIASI HARGA (Hanya muncul jika produk punya variasi) */}
                {prod.variants && prod.variants.length > 0 && (
                  <select style={variantSelectStyle}>
                    <option value="">
                      Variasi Harga ({prod.variants.length})
                    </option>
                    {prod.variants.map((v) => (
                      <option key={v.variant_id} value={v.variant_id}>
                        {v.variant_name} - {formatRp(v.price)}
                      </option>
                    ))}
                  </select>
                )}

                <div style={actionGridStyle}>
                  <button
                    style={actionBtnStyle}
                    onClick={() => handleOpenSalesHistory(prod)}
                  >
                    Histori Jual
                  </button>
                  <button
                    style={actionBtnStyle}
                    onClick={() => navigate(`/produk/edit/${prod.product_id}`)}
                  >
                    Edit Produk
                  </button>
                  <button
                    style={actionBtnStyle}
                    onClick={() => handleOpenHistory(prod)}
                  >
                    Histori Restok
                  </button>
                  <button style={actionBtnStyle}>Kelola Stok</button>
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && filteredProducts.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
            Tidak ada produk.
          </div>
        )}

        {/* Pagination */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "30px",
          }}
        >
          <button
            style={{
              padding: "8px 20px",
              backgroundColor: "white",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          >
            PREV
          </button>
          <span style={{ color: "#666", fontSize: "14px" }}>
            1 sd {filteredProducts.length} dr {filteredProducts.length} data
          </span>
          <button
            style={{
              padding: "8px 20px",
              backgroundColor: "white",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          >
            NEXT
          </button>
        </div>
      </div>

      {/* === TARUH KODENYA DI SINI (SEBELUM PENUTUP MAINLAYOUT) === */}
      {showRestockHistory && selectedProductHistory && (
        <RestockHistoryModal
          productId={selectedProductHistory.id}
          productName={selectedProductHistory.name}
          onClose={() => setShowRestockHistory(false)}
        />
      )}

      {/* Modal Histori Jual (BARU) */}
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
