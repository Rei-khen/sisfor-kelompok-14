// client/src/pages/SalesCatalog.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import { useCart } from "../context/CartContext"; // Import Cart

// client/src/pages/SalesCatalog.tsx

// Cari bagian ini di paling atas, lalu ubah menjadi:
interface Product {
  product_id: number;
  product_name: string;
  selling_price: number;
  current_stock: number;
  stock_management_type: string;
  category_name: string | null; // <--- TAMBAHKAN BARIS INI
}

// Komponen Kartu Produk terpisah
const SalesProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  // Cek apakah stok habis (Hanya jika tipe manajemennya 'stock_based')
  const isOutOfStock =
    product.stock_management_type === "stock_based" &&
    product.current_stock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return; // Cegah fungsi jika stok habis

    // Cek juga apakah quantity yang mau dimasukkan melebihi stok yang ada
    if (
      product.stock_management_type === "stock_based" &&
      quantity > product.current_stock
    ) {
      alert(`Stok tidak cukup! Hanya tersisa ${product.current_stock}`);
      return;
    }

    addToCart(product, quantity);
    setQuantity(1);
  };

  // Warna teks stok
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
      }}
    >
      <div style={{ display: "flex", gap: "15px" }}>
        <div
          style={{
            width: "80px",
            height: "80px",
            backgroundColor: "#f0f0f0",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: "4px",
            flexShrink: 0,
          }}
        >
          🖼️
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
            {isOutOfStock ? "Stok Habis" : stockText}
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
        {/* Stepper Kuantitas (Disable jika stok habis) */}
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

        {/* Tombol Add to Cart (Disable & Warna Abu jika stok habis) */}
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
