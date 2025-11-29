// client/src/pages/ProductForm.tsx
import React, { useState, useEffect, useRef } from "react"; // Tambah useRef
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../components/MainLayout";

interface Category {
  category_id: number;
  category_name: string;
}

interface Variant {
  variant_name: string;
  price: number;
}

interface FormDataState {
  product_name: string;
  category_id: string;
  price_cost_determination: number | string;
  price_sell: number | string;
  description: string;
  barcode: string;
  stock_management_type: string;
  purchase_price_method: string;
  initial_stock: number | string;
  min_stock_alert: number | string;
  total_purchase_price: number | string;
  unit_purchase_price: number | string;
  selling_price_method: string;
  unit: string;
  weight: number | string;
  serial_number: string;
}

const ProductForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [categories, setCategories] = useState<Category[]>([]);

  // State Form
  const [formData, setFormData] = useState<FormDataState>({
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

  const [variants, setVariants] = useState<Variant[]>([]);
  const [variantName, setVariantName] = useState("");
  const [variantPrice, setVariantPrice] = useState(0);

  // --- STATE GAMBAR BARU ---
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch Kategori
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

  // 2. Fetch Data Produk (Edit Mode)
  useEffect(() => {
    if (isEditMode) {
      const fetchProduct = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await axios.get(
            `http://localhost:5000/api/products/${id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const data = res.data;

          setFormData({
            product_name: data.product_name,
            category_id: data.category_id || "",
            price_cost_determination: data.purchase_price,
            price_sell: data.selling_price,
            description: data.description || "",
            barcode: data.barcode || "",
            stock_management_type: data.stock_management_type,
            purchase_price_method: "HP ditentukan",
            initial_stock: 0, // Stok tidak diedit disini
            min_stock_alert: data.min_stock_alert,
            total_purchase_price: 0,
            unit_purchase_price: 0,
            selling_price_method: "HJ ditentukan",
            unit: data.unit || "",
            weight: data.weight || "",
            serial_number: data.serial_number || "",
          });

          setVariants(data.price_variants || []);

          // Set preview jika ada gambar lama
          // Asumsi backend kirim 'image_url' (perlu join di controller getProductById jika belum)
          if (data.image_url) {
            setImagePreview(`http://localhost:5000${data.image_url}`);
          }
        } catch (error) {
          console.error(error);
          alert("Gagal mengambil data produk.");
          navigate("/produk");
        }
      };
      fetchProduct();
    }
  }, [isEditMode, id, navigate]);

  // --- HANDLER FORM ---
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    let newFormData = { ...formData, [name]: value };

    if (
      !isEditMode &&
      (name === "initial_stock" || name === "unit_purchase_price")
    ) {
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

  // --- HANDLER GAMBAR ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation(); // Mencegah trigger klik container
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // --- HANDLER VARIANT ---
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

  const handleRemoveVariant = (index: number) => {
    const newVariants = [...variants];
    newVariants.splice(index, 1);
    setVariants(newVariants);
  };

  // --- SUBMIT DENGAN FORMDATA ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      // Gunakan FormData agar bisa kirim File
      const dataToSend = new FormData();

      // Append semua field text
      Object.keys(formData).forEach((key) => {
        dataToSend.append(key, String(formData[key as keyof FormDataState]));
      });

      // Append Variasi (sebagai JSON String)
      dataToSend.append("price_variants", JSON.stringify(variants));

      // Append File Gambar
      if (imageFile) {
        dataToSend.append("image", imageFile);
      }

      // Config Header Multipart
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      if (isEditMode) {
        await axios.put(
          `http://localhost:5000/api/products/${id}`,
          dataToSend,
          config
        );
        alert("Produk berhasil diperbarui!");
      } else {
        await axios.post(
          "http://localhost:5000/api/products",
          dataToSend,
          config
        );
        alert("Produk berhasil ditambahkan!");
      }

      navigate("/produk");
    } catch (error: any) {
      console.error("Submit error:", error.response);
      alert(
        "Gagal menyimpan produk: " +
          (error.response?.data?.message || "Error tidak diketahui")
      );
    }
  };

  // Styles
  const pageStyle: React.CSSProperties = {
    maxWidth: "1000px",
    margin: "auto",
    backgroundColor: "white",
    padding: "25px",
    borderRadius: "8px",
    color: "#333",
  };
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
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h2 style={{ margin: 0, color: "#050542" }}>
              {isEditMode ? "EDIT PRODUK" : "TAMBAH PRODUK"}
            </h2>
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

          <div style={layoutStyle}>
            {/* Kiri */}
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
                <label style={labelStyle}>Harga pokok</label>
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

            {/* Kanan - UPLOAD GAMBAR */}
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
                  cursor: "pointer",
                  overflow: "hidden",
                  position: "relative",
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <>
                    <span style={{ fontSize: "40px" }}>🖼️</span>
                    <p>
                      drag foto kesini atau <strong>cari</strong>
                    </p>
                  </>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>

              {/* Tombol Hapus Gambar */}
              {imagePreview && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  style={{
                    width: "100%",
                    marginTop: "10px",
                    padding: "8px",
                    backgroundColor: "#ff5252",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  Hapus Foto
                </button>
              )}
            </div>
          </div>

          <hr style={dividerStyle} />

          {/* Bagian Opsional */}
          <div>
            <div>
              <label style={labelStyle}>Deskripsi produk</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                style={{ ...inputStyle, height: "80px", fontFamily: "inherit" }}
              />
            </div>
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
                {!isEditMode && (
                  <>
                    <label style={labelStyle}>Jumlah stok awal</label>
                    <input
                      type="number"
                      name="initial_stock"
                      value={formData.initial_stock}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                  </>
                )}
                <label style={labelStyle}>Notifikasi limit stok</label>
                <input
                  type="number"
                  name="min_stock_alert"
                  value={formData.min_stock_alert}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Satuan</label>
                <input
                  type="text"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  style={inputStyle}
                />
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

          {/* Variasi */}
          <div>
            <hr style={dividerStyle} />
            <h3 style={{ color: "#050542" }}>Variasi harga jual</h3>
            {variants.map((v, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px",
                  backgroundColor: "#f0f0f0",
                  marginBottom: "5px",
                  borderRadius: "4px",
                }}
              >
                <span>
                  {v.variant_name} - Rp{" "}
                  {Number(v.price).toLocaleString("id-ID")}
                </span>
                <span
                  onClick={() => handleRemoveVariant(i)}
                  style={{
                    color: "red",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  Hapus
                </span>
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
