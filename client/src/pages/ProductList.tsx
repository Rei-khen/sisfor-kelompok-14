// client/src/pages/ProductList.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";

// Tipe data produk sesuai database BARU
interface Product {
  product_id: number;
  product_name: string;
  category_name: string | null;
  price_cost: number;
  selling_price: number;
  current_stock: number;
  stock_management_type: string;
}

const ProductList: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

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

  return (
    <MainLayout>
      <div style={{ padding: "20px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2>DAFTAR PRODUK</h2>
          <div>
            <button
              onClick={() => navigate("/kategori")}
              style={{ marginRight: "10px" }}
            >
              Kelola Kategori
            </button>
            <button
              onClick={() => navigate("/produk/tambah")}
              style={{ backgroundColor: "blue", color: "white" }}
            >
              Tambah Produk
            </button>
          </div>
        </div>

        {/* Daftar Produk (Tampilan Tabel Sederhana) */}
        {loading ? (
          <p>Memuat...</p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "20px",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f0f0f0" }}>
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                  Nama Produk
                </th>
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                  Kategori
                </th>
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                  Harga Pokok
                </th>
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                  Harga Jual
                </th>
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                  Stok
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod) => (
                <tr key={prod.product_id}>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    {prod.product_name}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    {prod.category_name || "-"}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    Rp {prod.purchase_price}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    Rp {prod.selling_price}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    {prod.stock_management_type === "no_stock_management"
                      ? "Tanpa Stok"
                      : prod.current_stock}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && products.length === 0 && <p>Belum ada produk.</p>}
      </div>
    </MainLayout>
  );
};

export default ProductList;
