// client/src/pages/CategoryForm.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../components/MainLayout";

const CategoryForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Ambil ID dari URL jika ada (mode edit)
  const isEditMode = !!id;

  const [name, setName] = useState("");
  const [type, setType] = useState("Umum");
  const [loading, setLoading] = useState(false);

  // Jika mode edit, ambil data kategori yang mau diedit
  useEffect(() => {
    if (isEditMode) {
      const fetchCategory = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(
            `http://localhost:5000/api/categories/${id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setName(response.data.category_name);
          setType(response.data.transaction_type);
        } catch (error) {
          alert("Gagal mengambil data kategori.");
          navigate("/kategori");
        }
      };
      fetchCategory();
    }
  }, [isEditMode, id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const payload = { category_name: name, transaction_type: type };
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (isEditMode) {
        await axios.put(
          `http://localhost:5000/api/categories/${id}`,
          payload,
          config
        );
        alert("Kategori berhasil diupdate!");
      } else {
        await axios.post(
          "http://localhost:5000/api/categories",
          payload,
          config
        );
        alert("Kategori berhasil ditambahkan!");
      }
      navigate("/kategori");
    } catch (error) {
      alert("Terjadi kesalahan saat menyimpan.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Yakin ingin menghapus kategori ini?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:5000/api/categories/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Kategori dihapus.");
        navigate("/kategori");
      } catch (error) {
        alert("Gagal menghapus.");
      }
    }
  };

  // Styles
  const labelStyle = {
    display: "block",
    marginBottom: "8px",
    fontWeight: "bold",
    color: "#333",
  };
  const inputStyle = {
    width: "100%",
    padding: "10px",
    marginBottom: "20px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  };

  return (
    <MainLayout>
      <div
        style={{
          padding: "20px",
          fontFamily: "sans-serif",
          maxWidth: "600px",
          margin: "0 auto",
        }}
      >
        <h2 style={{ color: "#333", marginBottom: "30px" }}>
          {isEditMode ? "EDIT KATEGORI PRODUK" : "TAMBAH KATEGORI PRODUK"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div>
            <label style={labelStyle}>Nama Kategori</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Jenis transaksi</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{ ...inputStyle, backgroundColor: "white" }}
            >
              <option value="Umum">Umum</option>
              <option value="Saldo">Saldo</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "30px" }}>
            {/* Tombol Delete hanya muncul saat Edit Mode */}
            {isEditMode && (
              <button
                type="button"
                onClick={handleDelete}
                style={{
                  backgroundColor: "#00acc1",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  width: "50px",
                  fontSize: "20px",
                  cursor: "pointer",
                }}
              >
                🗑️
              </button>
            )}
            {/* Tombol Simpan */}
            <button
              type="submit"
              disabled={loading}
              style={{
                flexGrow: 1,
                padding: "12px",
                backgroundColor: "#0277bd",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              {loading ? "Menyimpan..." : "simpan"}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default CategoryForm;
