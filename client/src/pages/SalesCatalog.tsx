import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import { useCart } from "../context/CartContext";

// 1. INTERFACE
interface Product {
  product_id: number;
  product_name: string;
  selling_price: number;
  current_stock: number;
  stock_management_type: string;
  category_name: string | null;
  image_url?: string;
}

interface Category {
  category_id: number;
  category_name: string;
}

// Komponen Kartu Produk
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
      ? "Stok: -"
      : `Stok: ${product.current_stock}`;

  const imageSrc = product.image_url 
    ? `http://localhost:5000${product.image_url}` 
    : null;

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
        color: "#333" // Pastikan teks dalam kartu hitam
      }}
    >
      <div style={{ display: "flex", gap: "15px" }}>
        {/* Gambar Produk */}
        <div
          style={{
            width: "80px",
            height: "80px",
            backgroundColor: "#f8f9fa",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: "6px",
            flexShrink: 0,
            overflow: "hidden"
          }}
        >
          {imageSrc ? (
             <img src={imageSrc} alt={product.product_name} style={{width:"100%", height:"100%", objectFit:"cover"}} />
          ) : (
             <span style={{ fontSize: "30px" }}>📦</span>
          )}
        </div>
        
        <div>
          <strong style={{ color: "#00acc1", fontSize: "12px", textTransform: "uppercase" }}>
            {product.category_name || "UMUM"}
          </strong>
          <div
            style={{
              fontSize: "16px",
              fontWeight: "bold",
              color: "#333",
              margin: "5px 0",
              lineHeight: "1.2"
            }}
          >
            {product.product_name}
          </div>
          <div style={{ fontSize: "15px", color: "#333", fontWeight: "bold" }}>
            Rp {product.selling_price.toLocaleString("id-ID")}
          </div>

          <small style={{ color: stockColor, fontWeight: isOutOfStock ? "bold" : "normal" }}>
            {isOutOfStock ? "Habis" : stockText}
          </small>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "15px" }}>
        {/* Stepper */}
        <div style={{ display: "flex", alignItems: "center", border: "1px solid #ccc", borderRadius: "4px" }}>
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={isOutOfStock}
            style={{ padding: "5px 10px", border: "none", background: "white", cursor: isOutOfStock ? "not-allowed" : "pointer", borderRight: "1px solid #eee", color: "#333" }}
          > - </button>
          <input
            type="number"
            value={quantity}
            readOnly
            style={{ width: "35px", textAlign: "center", border: "none", fontWeight: "bold", background: "white", color: "#333" }}
          />
          <button
            onClick={() => setQuantity((q) => q + 1)}
            disabled={isOutOfStock}
            style={{ padding: "5px 10px", border: "none", background: "white", cursor: isOutOfStock ? "not-allowed" : "pointer", borderLeft: "1px solid #eee", color: "#333" }}
          > + </button>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          style={{
            backgroundColor: isOutOfStock ? "#ccc" : "#00acc1",
            color: "white",
            border: "none",
            borderRadius: "4px",
            padding: "8px 15px",
            cursor: isOutOfStock ? "not-allowed" : "pointer",
            fontWeight: "bold"
          }}
        >
          {isOutOfStock ? "Habis" : "+ Keranjang"}
        </button>
      </div>
    </div>
  );
};

// Halaman Utama Katalog
const SalesCatalog: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const resProd = await axios.get("http://localhost:5000/api/products", {
          headers,
          params: { 
             page: 1, 
             limit: 100,
             search: searchTerm,
             ...(selectedCategory && { category_id: selectedCategory })
          },
        });
        
        if (resProd.data && Array.isArray(resProd.data.data)) {
            setProducts(resProd.data.data);
        } else {
            setProducts([]);
        }

        const resCat = await axios.get("http://localhost:5000/api/categories", { headers });
        setCategories(resCat.data);

      } catch (error) {
        console.error("Gagal ambil data", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
        fetchData();
    }, 500);
    return () => clearTimeout(timer);

  }, [searchTerm, selectedCategory]);

  return (
    <MainLayout>
      <div style={{ padding: "30px", fontFamily: "Montserrat, sans-serif", color: "#333", backgroundColor: "#f0f2f5", minHeight: "100vh" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ margin: 0, color: "#050542", fontSize: "28px" }}>PENJUALAN</h2>
          <button
            onClick={() => navigate("/pembayaran")}
            style={{
              padding: "12px 25px",
              backgroundColor: "#00acc1",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              boxShadow: "0 4px 10px rgba(0,172,193,0.3)"
            }}
          >
            PEMBAYARAN 🛒
          </button>
        </div>

        {/* Filter Bar */}
        <div style={{ display: "flex", gap: "15px", marginBottom: "20px", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="🔍 Cari nama produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              minWidth: "200px",
              padding: "12px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none",
              backgroundColor: "white", // Background putih
              color: "#333" // Teks gelap
            }}
          />
          
          <select
            style={{
              width: "200px",
              padding: "12px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              fontSize: "14px",
              cursor: "pointer",
              backgroundColor: "white", // Background putih
              color: "#333" // Teks gelap
            }}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Semua Kategori</option>
            {categories.map((cat) => (
                <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>
            ))}
          </select>
        </div>

        {/* Grid Produk */}
        {loading ? (
          <p style={{textAlign:"center", marginTop:"50px", color: "#666"}}>Sedang memuat katalog...</p>
        ) : products.length === 0 ? (
          <div style={{textAlign: "center", marginTop: "50px", color: "#888"}}>
             <h3>Produk tidak ditemukan</h3>
             <p>Coba kata kunci lain atau tambah produk di menu Gudang.</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            {products.map((prod) => (
              <SalesProductCard key={prod.product_id} product={prod} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default SalesCatalog;