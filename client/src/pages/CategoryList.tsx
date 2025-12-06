import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";

interface Category {
  category_id: number;
  category_name: string;
  transaction_type: string;
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

  const filteredCategories = categories.filter((cat) =>
    cat.category_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- STYLES (DIPERBAIKI: Text Color) ---
  const fontStyle = { fontFamily: "'Montserrat', sans-serif" };
  const primaryColor = "#00acc1";

  const containerStyle: React.CSSProperties = {
    padding: "20px",
    maxWidth: "800px",
    margin: "0 auto",
    color: "#333", // PERBAIKAN: Teks utama hitam
    ...fontStyle
  };

  const headerStyle: React.CSSProperties = {
    display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px",
  };

  const btnPrimaryStyle: React.CSSProperties = {
    padding: "10px 15px",
    backgroundColor: primaryColor,
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    ...fontStyle
  };

  const searchContainerStyle: React.CSSProperties = {
    display: "flex", gap: "10px", marginBottom: "20px",
  };

  const refreshBtnStyle: React.CSSProperties = {
    padding: "10px",
    backgroundColor: primaryColor,
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "18px",
    display: "flex", justifyContent: "center", alignItems: "center",
  };

  const searchInputStyle: React.CSSProperties = {
    flexGrow: 1,
    padding: "10px 15px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    outline: "none",
    fontSize: "14px",
    backgroundColor: "white", // Background input putih
    color: "#333", // Teks input gelap
    ...fontStyle
  };

  const listContainerStyle: React.CSSProperties = {
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
    border: "1px solid #eee",
    overflow: "hidden"
  };

  const listItemStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 20px",
    borderBottom: "1px solid #f0f0f0",
    color: "#333" // Teks list item gelap
  };

  const editBtnStyle: React.CSSProperties = {
    backgroundColor: primaryColor,
    color: "white",
    border: "none",
    borderRadius: "4px",
    width: "32px",
    height: "32px",
    cursor: "pointer",
    fontSize: "16px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  const paginationStyle: React.CSSProperties = {
    display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", color: "#666"
  };

  const pageBtnStyle: React.CSSProperties = {
    padding: "8px 20px",
    border: "1px solid #ccc",
    backgroundColor: "white",
    borderRadius: "6px",
    cursor: "pointer",
    color: "#333",
    fontWeight: "600",
    ...fontStyle
  };

  return (
    <MainLayout>
      <div style={containerStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <h2 style={{ margin: 0, color: "#050542", fontSize: "24px" }}>KATEGORI PRODUK</h2>
          <button onClick={() => navigate("/kategori/tambah")} style={btnPrimaryStyle}>
            + Tambah Kategori
          </button>
        </div>

        {/* Search */}
        <div style={searchContainerStyle}>
          <button onClick={fetchCategories} style={refreshBtnStyle}>🔄</button>
          <input
            type="text"
            placeholder="Cari kategori produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInputStyle}
          />
        </div>

        {/* List */}
        {loading ? (
          <p style={{ textAlign: "center", color: "#666" }}>Memuat...</p>
        ) : (
          <div style={listContainerStyle}>
            {filteredCategories.length > 0 ? (
              filteredCategories.map((cat) => (
                <div key={cat.category_id} style={listItemStyle}>
                  <span style={{ fontSize: "15px", fontWeight: "500" }}>{cat.category_name}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                    <span style={{ fontWeight: "bold", color: "#333", fontSize: "14px" }}>0 Produk</span>
                    <button
                      onClick={() => navigate(`/kategori/edit/${cat.category_id}`)}
                      style={editBtnStyle}
                      title="Edit Kategori"
                    >
                      ✏️
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ padding: "20px", textAlign: "center", color: "#999" }}>
                Tidak ada kategori ditemukan.
              </p>
            )}
          </div>
        )}

        {/* Pagination */}
        <div style={paginationStyle}>
          <button style={pageBtnStyle}>PREV</button>
          <span style={{ fontSize: "13px" }}>
            1 sd {filteredCategories.length} dr {filteredCategories.length} data
          </span>
          <button style={pageBtnStyle}>NEXT</button>
        </div>
      </div>
    </MainLayout>
  );
};

export default CategoryList;