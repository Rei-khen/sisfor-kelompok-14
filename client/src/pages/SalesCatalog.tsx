// client/src/pages/SalesCatalog.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import { useCart } from "../context/CartContext"; // Import Cart

// Tipe data produk
interface Product {
  product_id: number;
  product_name: string;
  selling_price: number;
  current_stock: number;
  stock_management_type: string;
  // tambahkan properti lain jika perlu
}

// Komponen Kartu Produk terpisah
const SalesProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setQuantity(1); // Reset kuantitas setelah ditambahkan
    alert(`${product.product_name} ditambahkan ke keranjang!`);
  };

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "15px",
        backgroundColor: "white",
      }}
    >
      <div style={{ display: "flex", gap: "15px" }}>
        {/* Placeholder Gambar */}
        <div
          style={{
            width: "80px",
            height: "80px",
            backgroundColor: "#f0f0f0",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: "4px",
          }}
        >
          🖼️
        </div>
        <div>
          <strong style={{ color: "#0056b3" }}>Lainnya</strong>
          <div style={{ fontSize: "18px", fontWeight: "bold", color: "#333" }}>
            {product.product_name}
          </div>
          <div style={{ fontSize: "16px", color: "#333" }}>
            Rp {product.selling_price.toLocaleString("id-ID")}
          </div>
          <small style={{ color: "#777" }}>
            {product.stock_management_type === "no_stock_management"
              ? "Tanpa stok"
              : `Stok: ${product.current_stock}`}
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
        {/* Stepper Kuantitas */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        >
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            style={{
              padding: "5px 10px",
              border: "none",
              background: "none",
              cursor: "pointer",
              fontSize: "18px",
            }}
          >
            -
          </button>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            style={{
              width: "40px",
              textAlign: "center",
              border: "none",
              borderLeft: "1px solid #ccc",
              borderRight: "1px solid #ccc",
            }}
          />
          <button
            onClick={() => setQuantity((q) => q + 1)}
            style={{
              padding: "5px 10px",
              border: "none",
              background: "none",
              cursor: "pointer",
              fontSize: "18px",
            }}
          >
            +
          </button>
        </div>
        {/* Tombol Add to Cart */}
        <button
          onClick={handleAddToCart}
          style={{
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            padding: "10px 15px",
            cursor: "pointer",
            fontSize: "20px",
          }}
        >
          🛒
        </button>
      </div>
    </div>
  );
};

// Halaman Utama Katalog
const SalesCatalog: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/products", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProducts(response.data);
      } catch (error) {
        console.error("Gagal ambil produk", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

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
            onClick={() => navigate("/pembayaran")} // Arahkan ke halaman Pembayaran
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

        {/* Filter/Search Bar (Sesuai Gambar) */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          <button
            style={{
              width: "50px",
              height: "40px",
              border: "1px solid #ccc",
              background: "#f0f0f0",
              borderRadius: "4px",
              fontSize: "20px",
            }}
          >
            🔄
          </button>
          <input
            type="text"
            placeholder="Cari produk"
            style={{
              flexGrow: 1,
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
          <button
            style={{
              width: "50px",
              height: "40px",
              border: "none",
              background: "#00acc1",
              color: "white",
              borderRadius: "4px",
              fontSize: "20px",
            }}
          >
            📊
          </button>
        </div>
        <select
          style={{
            width: "100%",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            marginBottom: "20px",
          }}
        >
          <option value="">Semua Kategori</option>
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
