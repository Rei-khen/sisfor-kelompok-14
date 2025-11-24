// client/src/pages/RestockPage.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";

// Tipe Data
interface Product {
  product_id: number;
  product_name: string;
  category_name: string | null;
  current_stock: number;
  stock_management_type: string;
  // Kita tidak butuh harga jual di sini, tapi butuh ID dan Nama
}

interface Category {
  category_id: number;
  category_name: string;
}

const RestockPage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // State Modal Restok
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [restockQty, setRestockQty] = useState(0);
  const [unitCost, setUnitCost] = useState(0);

  // FETCH DATA
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Kita bisa pakai API products yang sudah ada karena datanya sama
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

  // FILTERING
  const filteredProducts = products.filter((p) => {
    // Hanya tampilkan produk yang manajemen stoknya aktif
    if (p.stock_management_type === "no_stock_management") return false;

    const matchName = p.product_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory
      ? p.category_name === selectedCategory
      : true;
    return matchName && matchCat;
  });

  // HANDLER RESTOK
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
      await axios.post(
        "http://localhost:5000/api/restock",
        {
          product_id: selectedProduct.product_id,
          quantity: restockQty,
          unit_cost: unitCost,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Stok berhasil ditambahkan!");
      setIsModalOpen(false);
      fetchData(); // Refresh data agar stok terupdate di layar
    } catch (error) {
      alert("Gagal restok.");
    }
  };

  // --- STYLES (Mirip ProductList tapi disederhanakan) ---
  const primaryColor = "#00acc1";
  const containerStyle: React.CSSProperties = {
    padding: "20px",
    fontFamily: "sans-serif",
    color: "#333",
  };
  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
    marginTop: "20px",
  };
  const cardStyle: React.CSSProperties = {
    backgroundColor: "white",
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "15px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  };

  // Modal Style
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
    borderRadius: "8px",
    width: "400px",
    maxWidth: "90%",
  };

  return (
    <MainLayout>
      <div style={containerStyle}>
        {/* HEADER & SEARCH (Sama seperti Produk) */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "15px",
          }}
        >
          <h2 style={{ margin: 0, color: "#333" }}>RESTOK</h2>
        </div>

        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          <div
            onClick={fetchData}
            style={{
              backgroundColor: primaryColor,
              color: "white",
              width: "40px",
              height: "40px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            🔄
          </div>
          <input
            type="text"
            placeholder="Cari produk untuk restok"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flexGrow: 1,
              padding: "8px 12px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "16px",
            }}
          />
        </div>

        <select
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            marginBottom: "20px",
          }}
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">Semua Kategori</option>
          {categories.map((cat) => (
            <option key={cat.category_id} value={cat.category_name}>
              {cat.category_name}
            </option>
          ))}
        </select>

        {/* GRID PRODUK */}
        {loading ? (
          <p>Memuat...</p>
        ) : (
          <div style={gridStyle}>
            {filteredProducts.map((prod) => (
              <div key={prod.product_id} style={cardStyle}>
                <div
                  style={{ display: "flex", gap: "15px", marginBottom: "15px" }}
                >
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
                  <div>
                    <small style={{ color: "#666" }}>
                      {prod.category_name || "Umum"}
                    </small>
                    <strong
                      style={{
                        display: "block",
                        fontSize: "16px",
                        margin: "5px 0",
                      }}
                    >
                      {prod.product_name}
                    </strong>
                    <div style={{ fontSize: "14px", color: "#444" }}>
                      Stok saat ini: <strong>{prod.current_stock}</strong>
                    </div>
                  </div>
                </div>
                {/* Satu Tombol Besar */}
                <button
                  onClick={() => openRestockModal(prod)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: primaryColor,
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  TAMBAH STOK
                </button>
              </div>
            ))}
          </div>
        )}

        {/* MODAL POPUP RESTOK */}
        {isModalOpen && selectedProduct && (
          <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
              <h3 style={{ marginTop: 0, color: "#050542" }}>
                Restok: {selectedProduct.product_name}
              </h3>
              <p style={{ color: "#666", fontSize: "14px" }}>
                Stok saat ini: {selectedProduct.current_stock}
              </p>

              <div style={{ marginBottom: "15px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontWeight: "bold",
                  }}
                >
                  Jumlah Penambahan
                </label>
                <input
                  type="number"
                  value={restockQty}
                  onChange={(e) => setRestockQty(Number(e.target.value))}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                  placeholder="0"
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontWeight: "bold",
                  }}
                >
                  Harga Beli per Unit (Rp)
                </label>
                <input
                  type="number"
                  value={unitCost}
                  onChange={(e) => setUnitCost(Number(e.target.value))}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                  placeholder="0"
                />
                <small style={{ color: "#888", fontSize: "12px" }}>
                  *Kosongkan jika tidak ada perubahan harga beli
                </small>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    backgroundColor: "#eee",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Batal
                </button>
                <button
                  onClick={handleRestockSubmit}
                  style={{
                    flex: 1,
                    padding: "12px",
                    backgroundColor: "#0277bd",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default RestockPage;
