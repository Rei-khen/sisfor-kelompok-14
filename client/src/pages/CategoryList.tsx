// client/src/pages/CategoryList.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout"; // Import layout

interface Category {
  category_id: number;
  category_name: string;
  transaction_type: string;
  // product_count?: number; (Nanti jika sudah ada tabel produk)
}

const CategoryList: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data);
    } catch (error) {
      console.error("Gagal ambil kategori", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter kategori berdasarkan search
  const filteredCategories = categories.filter((cat) =>
    cat.category_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div
        style={{
          padding: "20px",
          fontFamily: "sans-serif",
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        {/* Header & Tombol Tambah */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ margin: 0, color: "#333" }}>KATEGORI PRODUK</h2>
          <button
            onClick={() => navigate("/kategori/tambah")}
            style={{
              padding: "10px 15px",
              backgroundColor: "#00acc1",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Tambah Kategori
          </button>
        </div>

        {/* Search Bar & Refresh */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <button
            onClick={fetchCategories}
            style={{
              padding: "10px",
              backgroundColor: "#00acc1",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "18px",
            }}
          >
            🔄
          </button>
          <input
            type="text"
            placeholder="cari kategori produk"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flexGrow: 1,
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        {/* List Kategori */}
        {loading ? (
          <p>Memuat...</p>
        ) : (
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            }}
          >
            {filteredCategories.map((cat) => (
              <div
                key={cat.category_id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "15px 20px",
                  borderBottom: "1px solid #eee",
                }}
              >
                <span style={{ fontSize: "16px", color: "#555" }}>
                  {cat.category_name}
                </span>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "20px" }}
                >
                  {/* Placeholder jumlah produk (sesuai gambar ada angkanya) */}
                  <span style={{ fontWeight: "bold", color: "#333" }}>0</span>
                  {/* Tombol Edit (Ikon Pensil Biru) */}
                  <button
                    onClick={() =>
                      navigate(`/kategori/edit/${cat.category_id}`)
                    }
                    style={{
                      backgroundColor: "#00acc1",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      width: "35px",
                      height: "35px",
                      cursor: "pointer",
                      fontSize: "18px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    ✏️
                  </button>
                </div>
              </div>
            ))}
            {filteredCategories.length === 0 && (
              <p
                style={{ padding: "20px", textAlign: "center", color: "#999" }}
              >
                Tidak ada kategori.
              </p>
            )}
          </div>
        )}

        {/* Pagination Placeholder (Sesuai gambar) */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "20px",
          }}
        >
          <button
            style={{
              padding: "8px 20px",
              border: "1px solid #ccc",
              backgroundColor: "white",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            PREV
          </button>
          <span style={{ color: "#666", fontSize: "14px" }}>
            1 sd {filteredCategories.length} dr {filteredCategories.length} data
          </span>
          <button
            style={{
              padding: "8px 20px",
              border: "1px solid #ccc",
              backgroundColor: "white",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            NEXT
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default CategoryList;
