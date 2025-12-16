// client/src/pages/SalesCatalog.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import { useCart } from "../context/CartContext";

// Interface Data
interface Product {
  product_id: number;
  product_name: string;
  selling_price: number;
  current_stock: number;
  stock_management_type: string;
  category_name: string | null;
  image_url: string | null;
}

interface Category {
  category_id: number;
  category_name: string;
}

// --- KOMPONEN KARTU PRODUK ---
const SalesProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const isOutOfStock =
    product.stock_management_type === "stock_based" &&
    product.current_stock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    if (
      product.stock_management_type === "stock_based" &&
      quantity > product.current_stock
    ) {
      alert(`Stok tidak cukup! Tersisa ${product.current_stock}`);
      return;
    }
    addToCart(product, quantity);
    setQuantity(1);
  };

  const stockColor = isOutOfStock ? "red" : "#777";
  const stockText =
    product.stock_management_type === "no_stock_management"
      ? "Tanpa stok"
      : `Stok: ${product.current_stock}`;

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "15px",
        backgroundColor: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        opacity: isOutOfStock ? 0.7 : 1,
        boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{ display: "flex", gap: "15px" }}>
        {/* Gambar Produk */}
        <div
          style={{
            width: "80px",
            height: "80px",
            backgroundColor: "#f0f0f0",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: "6px",
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          {product.image_url ? (
            <img
              src={`http://localhost:5000${product.image_url}`}
              alt={product.product_name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span style={{ fontSize: "30px" }}>📦</span>
          )}
        </div>

        <div>
          <strong style={{ color: "#0056b3", fontSize: "12px" }}>
            {product.category_name || "Umum"}
          </strong>
          <div
            style={{
              fontSize: "16px",
              fontWeight: "bold",
              color: "#333",
              margin: "5px 0",
            }}
          >
            {product.product_name}
          </div>
          <div style={{ fontSize: "15px", color: "#333", fontWeight: "bold" }}>
            Rp {product.selling_price.toLocaleString("id-ID")}
          </div>
          <small
            style={{
              color: stockColor,
              fontWeight: isOutOfStock ? "bold" : "normal",
            }}
          >
            {stockText}
          </small>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "15px",
        }}
      >
        {/* Stepper Quantity */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            border: "1px solid #ccc",
            borderRadius: "4px",
            opacity: isOutOfStock ? 0.5 : 1,
          }}
        >
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={isOutOfStock}
            style={{
              padding: "5px 12px",
              border: "none",
              background: "white",
              cursor: isOutOfStock ? "not-allowed" : "pointer",
              fontSize: "16px",
              borderRight: "1px solid #eee",
            }}
          >
            -
          </button>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
            disabled={isOutOfStock}
            style={{
              width: "40px",
              textAlign: "center",
              border: "none",
              fontWeight: "bold",
              background: "white",
            }}
          />
          <button
            onClick={() => setQuantity((q) => q + 1)}
            disabled={isOutOfStock}
            style={{
              padding: "5px 12px",
              border: "none",
              background: "white",
              cursor: isOutOfStock ? "not-allowed" : "pointer",
              fontSize: "16px",
              borderLeft: "1px solid #eee",
            }}
          >
            +
          </button>
        </div>

        {/* Tombol Keranjang */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          style={{
            backgroundColor: isOutOfStock ? "#ccc" : "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            padding: "8px 15px",
            cursor: isOutOfStock ? "not-allowed" : "pointer",
            fontSize: "20px",
            display: "flex",
            alignItems: "center",
          }}
          title={isOutOfStock ? "Stok Habis" : "Tambah ke Keranjang"}
        >
          🛒
        </button>
      </div>
    </div>
  );
};

// --- HALAMAN UTAMA KATALOG ---
const SalesCatalog: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // State Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // 1. Fetch Data Produk & Kategori
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // Ambil Produk
        const resProd = await axios.get("http://localhost:5000/api/products", {
          headers,
        });
        setProducts(resProd.data);

        // Ambil Kategori
        const resCat = await axios.get("http://localhost:5000/api/categories", {
          headers,
        });
        setCategories(resCat.data);
      } catch (error) {
        console.error("Gagal ambil data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 2. Logika Filtering
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.product_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory
      ? product.category_name === selectedCategory
      : true;

    return matchesSearch && matchesCategory;
  });

  return (
    <MainLayout>
      <div style={{ padding: "20px", fontFamily: "sans-serif", color: "#333" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "15px",
          }}
        >
          <h2 style={{ margin: 0, color: "#333" }}>PENJUALAN</h2>
          <button
            onClick={() => navigate("/pembayaran")}
            style={{
              padding: "10px 20px",
              backgroundColor: "#00acc1",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            PEMBAYARAN
          </button>
        </div>

        {/* Filter Bar */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          {/* Tombol Refresh */}
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("");
            }}
            style={{
              width: "50px",
              height: "40px",
              border: "1px solid #ccc",
              background: "#f0f0f0",
              borderRadius: "4px",
              fontSize: "20px",
              cursor: "pointer",
            }}
            title="Reset Filter"
          >
            🔄
          </button>

          {/* Input Search */}
          <input
            type="text"
            placeholder="Cari produk"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flexGrow: 1,
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />

          {/* Tombol Grafik (Placeholder) */}
          <button
            onClick={() => navigate("/grafik")}
            style={{
              width: "50px",
              height: "40px",
              border: "none",
              background: "#00acc1",
              color: "white",
              borderRadius: "4px",
              fontSize: "20px",
              cursor: "pointer",
            }}
            title="Lihat Grafik"
          >
            📊
          </button>
        </div>

        {/* Dropdown Kategori */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            marginBottom: "20px",
          }}
        >
          <option value="">Semua Kategori</option>
          {categories.map((cat) => (
            <option key={cat.category_id} value={cat.category_name}>
              {cat.category_name}
            </option>
          ))}
        </select>

        {/* Grid Produk */}
        {loading ? (
          <p>Memuat...</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "15px",
            }}
          >
            {filteredProducts.length > 0 ? (
              filteredProducts.map((prod) => (
                <SalesProductCard key={prod.product_id} product={prod} />
              ))
            ) : (
              <p
                style={{
                  color: "#777",
                  gridColumn: "1 / -1",
                  textAlign: "center",
                }}
              >
                Tidak ada produk yang cocok.
              </p>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default SalesCatalog;
