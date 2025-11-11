// client/src/pages/ProductForm.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";

// Tipe data kategori untuk dropdown
interface Category {
  category_id: number;
  category_name: string;
}

// Tipe data untuk state form
interface FormData {
  product_name: string;
  category_id: string;
  price_cost_determination: number | string; // "Harga pokok ditentukan"
  price_sell: number | string;
  // --- Opsional ---
  description: string;
  barcode: string;
  stock_management_type: string;
  purchase_price_method: string;
  initial_stock: number | string;
  min_stock_alert: number | string;
  total_purchase_price: number | string; // Dihitung
  unit_purchase_price: number | string; // "Harga satu pembelian stok"
  selling_price_method: string;
  unit: string;
  weight: number | string;
  serial_number: string;
}

const ProductForm: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);

  // State utama untuk semua field
  const [formData, setFormData] = useState<FormData>({
    product_name: "",
    category_id: "",
    price_cost_determination: "",
    price_sell: "",
    description: "",
    barcode: "",
    stock_management_type: "stock_based",
    purchase_price_method: "HP ditentukan",
    initial_stock: 0,
    min_stock_alert: 0,
    total_purchase_price: 0,
    unit_purchase_price: 0,
    selling_price_method: "HJ ditentukan",
    unit: "",
    weight: "",
    serial_number: "",
  });

  // State untuk variasi harga
  const [variants, setVariants] = useState<
    { variant_name: string; price: number }[]
  >([]);
  const [variantName, setVariantName] = useState("");
  const [variantPrice, setVariantPrice] = useState(0);

  // Ambil data kategori untuk dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(res.data);
    };
    fetchCategories().catch(console.error);
  }, []);

  // Update form state
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    let newFormData = { ...formData, [name]: value };

    // Logika kalkulasi otomatis (sesuai UI)
    if (name === "initial_stock" || name === "unit_purchase_price") {
      const stock =
        name === "initial_stock"
          ? Number(value)
          : Number(newFormData.initial_stock);
      const price =
        name === "unit_purchase_price"
          ? Number(value)
          : Number(newFormData.unit_purchase_price);
      newFormData.total_purchase_price = (stock * price).toString();
    }

    setFormData(newFormData);
  };

  const handleAddVariant = () => {
    if (variantName && variantPrice > 0) {
      setVariants([
        ...variants,
        { variant_name: variantName, price: variantPrice },
      ]);
      setVariantName("");
      setVariantPrice(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      // Kirim payload lengkap sesuai yang diharapkan backend
      const payload = {
        ...formData,
        barcode: formData.barcode || null,
        price_variants: variants,
      };

      await axios.post("http://localhost:5000/api/products", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Produk berhasil ditambahkan!");
      navigate("/produk"); // Arahkan ke daftar produk
    } catch (error: any) {
      console.error("Submit error:", error.response);
      alert(
        "Gagal menambah produk: " +
          (error.response?.data?.message || "Error tidak diketahui")
      );
    }
  };

  // --- STYLES (Memperbaiki teks putih & layout) ---
  const pageStyle: React.CSSProperties = {
    maxWidth: "1000px",
    margin: "auto",
    backgroundColor: "white",
    padding: "25px",
    borderRadius: "8px",
    color: "#333", // Memperbaiki teks putih
  };
  const formStyle: React.CSSProperties = { color: "#333" };
  const layoutStyle: React.CSSProperties = { display: "flex", gap: "30px" };
  const colLeftStyle: React.CSSProperties = { flex: 2 };
  const colRightStyle: React.CSSProperties = { flex: 1 };
  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    backgroundColor: "#f9f9f9",
  };
  const labelStyle: React.CSSProperties = {
    display: "block",
    fontWeight: "bold",
    marginBottom: "5px",
    fontSize: "14px",
  };
  const buttonStyle: React.CSSProperties = {
    padding: "10px 20px",
    fontSize: "14px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  };
  const dividerStyle: React.CSSProperties = {
    border: 0,
    borderTop: "2px solid #eee",
    margin: "25px 0",
    textAlign: "center",
  };

  return (
    <MainLayout>
      <div style={pageStyle}>
        <form onSubmit={handleSubmit} style={formStyle}>
          {/* Header Form */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h2 style={{ margin: 0, color: "#050542" }}>TAMBAH PRODUK</h2>
            <div>
              <button
                type="button"
                onClick={() => navigate("/produk")}
                style={{
                  ...buttonStyle,
                  backgroundColor: "#00acc1",
                  color: "white",
                  marginRight: "10px",
                }}
              >
                Batal
              </button>
              <button
                type="submit"
                style={{
                  ...buttonStyle,
                  backgroundColor: "#00acc1",
                  color: "white",
                }}
              >
                Simpan
              </button>
            </div>
          </div>

          {/* --- Bagian Utama (Kiri) --- */}
          <div style={layoutStyle}>
            <div style={colLeftStyle}>
              <div>
                <label style={labelStyle}>Nama produk</label>
                <input
                  type="text"
                  name="product_name"
                  value={formData.product_name}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Kategori produk</label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((c) => (
                    <option key={c.category_id} value={c.category_id}>
                      {c.category_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Harga pokok ditentukan</label>
                <input
                  type="number"
                  name="price_cost_determination"
                  value={formData.price_cost_determination}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Harga jual</label>
                <input
                  type="number"
                  name="price_sell"
                  value={formData.price_sell}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
              </div>
            </div>

            {/* --- Bagian Upload (Kanan) --- */}
            <div style={colRightStyle}>
              <label style={labelStyle}>Foto Produk (Opsional)</label>
              <div
                style={{
                  border: "2px dashed #ccc",
                  borderRadius: "8px",
                  height: "250px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "#f9f9f9",
                  color: "#888",
                  textAlign: "center",
                  padding: "10px",
                }}
              >
                <span style={{ fontSize: "40px" }}>🖼️</span>
                <p>
                  drag foto kesini atau <strong>cari</strong>
                </p>
                <small>(Fitur upload belum aktif)</small>
              </div>
            </div>
          </div>

          {/* --- Divider Opsional --- */}
          <hr style={dividerStyle} />
          <span
            style={{
              display: "block",
              textAlign: "right",
              marginTop: "-35px",
              marginBottom: "20px",
              color: "#007bff",
            }}
          >
            opsional
          </span>

          {/* --- Bagian Opsional (Bawah) --- */}
          <div>
            {/* Masalah 4: Deskripsi di sini */}
            <div>
              <label style={labelStyle}>Deskripsi produk</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                style={{ ...inputStyle, height: "80px", fontFamily: "inherit" }}
              />
            </div>

            {/* Layout 2 kolom untuk opsional */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
              }}
            >
              <div>
                <label style={labelStyle}>Kode produk (barcode)</label>
                <input
                  type="text"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleChange}
                  style={inputStyle}
                />

                <label style={labelStyle}>Pengaturan stok produk</label>
                <select
                  name="stock_management_type"
                  value={formData.stock_management_type}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="stock_based">Manajemen Stok</option>
                  <option value="no_stock_management">Tanpa Stok (Jasa)</option>
                </select>

                <label style={labelStyle}>Jumlah stok</label>
                <input
                  type="number"
                  name="initial_stock"
                  value={formData.initial_stock}
                  onChange={handleChange}
                  style={inputStyle}
                />

                <label style={labelStyle}>Notifikasi limit stok</label>
                <input
                  type="number"
                  name="min_stock_alert"
                  value={formData.min_stock_alert}
                  onChange={handleChange}
                  style={inputStyle}
                />

                <label style={labelStyle}>Satuan</label>
                <input
                  type="text"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Pengaturan Harga pokok</label>
                <select
                  name="purchase_price_method"
                  value={formData.purchase_price_method}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="HP ditentukan">HP ditentukan</option>
                  <option value="HP rata pembelian stok">
                    HP rata pembelian stok
                  </option>
                  <option value="HP stok terakhir">HP stok terakhir</option>
                </select>

                <label style={labelStyle}>Harga satu pembelian stok</label>
                <input
                  type="number"
                  name="unit_purchase_price"
                  value={formData.unit_purchase_price}
                  onChange={handleChange}
                  style={inputStyle}
                />

                <label style={labelStyle}>Harga total pembelian stok Rp</label>
                <input
                  type="number"
                  name="total_purchase_price"
                  value={formData.total_purchase_price}
                  style={{ ...inputStyle, backgroundColor: "#eee" }}
                  readOnly
                />

                <label style={labelStyle}>Pengaturan harga jual</label>
                <select
                  name="selling_price_method"
                  value={formData.selling_price_method}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="HJ ditentukan">HJ ditentukan</option>
                  <option value="HJ Margin % harga pokok">
                    HJ Margin % harga pokok
                  </option>
                </select>

                <label style={labelStyle}>Berat</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  style={inputStyle}
                />

                <label style={labelStyle}>SN (serial number)</label>
                <input
                  type="text"
                  name="serial_number"
                  value={formData.serial_number}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* --- Variasi Harga Jual --- */}
          <div>
            <hr style={dividerStyle} />
            <h3 style={{ color: "#050542" }}>Variasi harga jual</h3>
            {variants.map((v, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "5px",
                  backgroundColor: "#f9f9f9",
                  marginBottom: "5px",
                }}
              >
                <span>{v.variant_name}</span>
                <span>Rp {v.price}</span>
              </div>
            ))}
            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <input
                type="text"
                placeholder="Nama Variasi (cth: Grosir)"
                value={variantName}
                onChange={(e) => setVariantName(e.target.value)}
                style={{ ...inputStyle, marginBottom: 0, flex: 2 }}
              />
              <input
                type="number"
                placeholder="Harga Jual"
                value={variantPrice}
                onChange={(e) => setVariantPrice(Number(e.target.value))}
                style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
              />
              <button
                type="button"
                onClick={handleAddVariant}
                style={{
                  ...buttonStyle,
                  backgroundColor: "#00acc1",
                  color: "white",
                }}
              >
                Tambah +
              </button>
            </div>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default ProductForm;
