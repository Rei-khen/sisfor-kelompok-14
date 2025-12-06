import React, { useState, useEffect, useRef } from "react";
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

  // State Gambar
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch Kategori
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/categories", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(res.data);
      } catch (error) {
        console.error("Gagal load kategori", error);
      }
    };
    fetchCategories();
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
            initial_stock: 0, 
            min_stock_alert: data.min_stock_alert,
            total_purchase_price: 0,
            unit_purchase_price: 0,
            selling_price_method: "HJ ditentukan",
            unit: data.unit || "",
            weight: data.weight || "",
            serial_number: data.serial_number || "",
          });

          setVariants(data.price_variants || []);

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

  // Handler Form Change
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    let newFormData = { ...formData, [name]: value };

    // Auto calculate total purchase price
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

  // Handler Gambar
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
    e.stopPropagation();
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Handler Variant
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

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const dataToSend = new FormData();

      Object.keys(formData).forEach((key) => {
        dataToSend.append(key, String(formData[key as keyof FormDataState]));
      });

      dataToSend.append("price_variants", JSON.stringify(variants));

      if (imageFile) {
        dataToSend.append("image", imageFile);
      }

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

  // --- STYLES (DIPERBAIKI WARNA TEKSNYA) ---
  const primaryColor = "#00acc1";
  const fontStyle = { fontFamily: "'Montserrat', sans-serif" };

  const pageStyle: React.CSSProperties = {
    maxWidth: "1000px",
    margin: "auto",
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "12px",
    color: "#333", // PERBAIKAN: Warna teks utama hitam
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
    ...fontStyle
  };

  const layoutStyle: React.CSSProperties = { display: "flex", gap: "30px", flexWrap: "wrap" };
  const colLeftStyle: React.CSSProperties = { flex: 2, minWidth: "300px" };
  const colRightStyle: React.CSSProperties = { flex: 1, minWidth: "250px" };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    backgroundColor: "#fff", // Input background putih
    color: "#333", // PERBAIKAN: Teks input hitam
    fontSize: "14px",
    outline: "none",
    ...fontStyle
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontWeight: "600",
    marginBottom: "8px",
    fontSize: "13px",
    color: "#555", // Label abu tua
    ...fontStyle
  };

  const buttonStyle: React.CSSProperties = {
    padding: "10px 20px",
    fontSize: "14px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    ...fontStyle
  };

  const dividerStyle: React.CSSProperties = {
    border: 0,
    borderTop: "1px solid #eee",
    margin: "30px 0",
  };

  return (
    <MainLayout>
      <div style={{ backgroundColor: "#f4f7fe", minHeight: "100vh", padding: "30px" }}> {/* Wrapper background luar */}
        <div style={pageStyle}>
          <form onSubmit={handleSubmit}>
            
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
              <h2 style={{ margin: 0, color: "#050542", fontSize: "24px" }}>
                {isEditMode ? "EDIT PRODUK" : "TAMBAH PRODUK"}
              </h2>
              <div>
                <button
                  type="button"
                  onClick={() => navigate("/produk")}
                  style={{ ...buttonStyle, backgroundColor: "#fff", border: "1px solid #ccc", color: "#555", marginRight: "10px" }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{ ...buttonStyle, backgroundColor: primaryColor, color: "white" }}
                >
                  Simpan
                </button>
              </div>
            </div>

            <div style={layoutStyle}>
              {/* Kolom Kiri */}
              <div style={colLeftStyle}>
                <div>
                  <label style={labelStyle}>Nama Produk</label>
                  <input
                    type="text"
                    name="product_name"
                    value={formData.product_name}
                    onChange={handleChange}
                    style={inputStyle}
                    required
                    placeholder="Contoh: Indomie Goreng"
                  />
                </div>
                
                <div>
                  <label style={labelStyle}>Kategori Produk</label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    style={{...inputStyle, cursor: "pointer"}}
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map((c) => (
                      <option key={c.category_id} value={c.category_id}>
                        {c.category_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{display: "flex", gap: "15px"}}>
                    <div style={{flex: 1}}>
                        <label style={labelStyle}>Harga Pokok (Beli)</label>
                        <input
                            type="number"
                            name="price_cost_determination"
                            value={formData.price_cost_determination}
                            onChange={handleChange}
                            style={inputStyle}
                            placeholder="0"
                        />
                    </div>
                    <div style={{flex: 1}}>
                        <label style={labelStyle}>Harga Jual</label>
                        <input
                            type="number"
                            name="price_sell"
                            value={formData.price_sell}
                            onChange={handleChange}
                            style={inputStyle}
                            required
                            placeholder="0"
                        />
                    </div>
                </div>
              </div>

              {/* Kolom Kanan (Upload Gambar) */}
              <div style={colRightStyle}>
                <label style={labelStyle}>Foto Produk (Opsional)</label>
                <div
                  style={{
                    border: "2px dashed #ccc",
                    borderRadius: "8px",
                    height: "220px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#fcfcfc",
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
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                  ) : (
                    <>
                      <span style={{ fontSize: "40px", marginBottom: "10px" }}>📷</span>
                      <p style={{fontSize: "13px", margin: 0}}>Klik atau drag foto ke sini</p>
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

                {imagePreview && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    style={{
                      width: "100%",
                      marginTop: "10px",
                      padding: "8px",
                      backgroundColor: "#ffebee",
                      color: "#d32f2f",
                      border: "1px solid #ffcdd2",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "12px"
                    }}
                  >
                    Hapus Foto
                  </button>
                )}
              </div>
            </div>

            <hr style={dividerStyle} />

            {/* Bagian Detail Tambahan */}
            <div>
              <label style={labelStyle}>Deskripsi Produk</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                style={{ ...inputStyle, height: "100px", fontFamily: "inherit", resize: "vertical" }}
                placeholder="Deskripsi singkat produk..."
              />
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div>
                  <label style={labelStyle}>Barcode / SKU</label>
                  <input
                    type="text"
                    name="barcode"
                    value={formData.barcode}
                    onChange={handleChange}
                    style={inputStyle}
                    placeholder="Scan atau ketik kode"
                  />
                  
                  <label style={labelStyle}>Tipe Stok</label>
                  <select
                    name="stock_management_type"
                    value={formData.stock_management_type}
                    onChange={handleChange}
                    style={{...inputStyle, cursor: "pointer"}}
                  >
                    <option value="stock_based">Manajemen Stok (Dihitung)</option>
                    <option value="no_stock_management">Tanpa Stok (Jasa/Unlimited)</option>
                  </select>

                  {!isEditMode && (
                    <>
                      <label style={labelStyle}>Stok Awal</label>
                      <input
                        type="number"
                        name="initial_stock"
                        value={formData.initial_stock}
                        onChange={handleChange}
                        style={inputStyle}
                        placeholder="0"
                      />
                    </>
                  )}
                  
                  <label style={labelStyle}>Batas Minimum Stok (Alert)</label>
                  <input
                    type="number"
                    name="min_stock_alert"
                    value={formData.min_stock_alert}
                    onChange={handleChange}
                    style={inputStyle}
                    placeholder="Contoh: 10"
                  />
                </div>

                <div>
                  <label style={labelStyle}>Satuan (Unit)</label>
                  <input
                    type="text"
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    style={inputStyle}
                    placeholder="Pcs, Kg, Box, dll"
                  />
                  
                  <label style={labelStyle}>Berat (Gram)</label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    style={inputStyle}
                    placeholder="0"
                  />
                  
                  <label style={labelStyle}>Serial Number (SN)</label>
                  <input
                    type="text"
                    name="serial_number"
                    value={formData.serial_number}
                    onChange={handleChange}
                    style={inputStyle}
                    placeholder="Nomor Seri Unik"
                  />
                </div>
              </div>
            </div>

            {/* Bagian Variasi Harga */}
            <div>
              <hr style={dividerStyle} />
              <h3 style={{ color: "#050542", fontSize: "18px", marginTop: 0 }}>Variasi Harga Jual</h3>
              <p style={{color: "#666", fontSize: "13px", marginBottom: "15px"}}>Tambahkan jika produk memiliki harga berbeda (misal: Grosir)</p>
              
              {variants.map((v, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 15px",
                    backgroundColor: "#f9f9f9",
                    marginBottom: "8px",
                    borderRadius: "6px",
                    border: "1px solid #eee"
                  }}
                >
                  <span style={{fontWeight: "600"}}>
                    {v.variant_name} - <span style={{color: primaryColor}}>Rp {Number(v.price).toLocaleString("id-ID")}</span>
                  </span>
                  <span
                    onClick={() => handleRemoveVariant(i)}
                    style={{ color: "#d32f2f", cursor: "pointer", fontWeight: "bold", fontSize: "12px" }}
                  >
                    Hapus
                  </span>
                </div>
              ))}

              <div style={{ display: "flex", gap: "10px", marginTop: "15px", alignItems: "flex-end" }}>
                <div style={{flex: 2}}>
                    <label style={{...labelStyle, fontSize: "12px"}}>Nama Variasi</label>
                    <input
                        type="text"
                        placeholder="Contoh: Harga Grosir"
                        value={variantName}
                        onChange={(e) => setVariantName(e.target.value)}
                        style={{ ...inputStyle, marginBottom: 0 }}
                    />
                </div>
                <div style={{flex: 1}}>
                    <label style={{...labelStyle, fontSize: "12px"}}>Harga</label>
                    <input
                        type="number"
                        placeholder="0"
                        value={variantPrice}
                        onChange={(e) => setVariantPrice(Number(e.target.value))}
                        style={{ ...inputStyle, marginBottom: 0 }}
                    />
                </div>
                <button
                  type="button"
                  onClick={handleAddVariant}
                  style={{
                    ...buttonStyle,
                    backgroundColor: "#e0f7fa",
                    color: "#006064",
                    border: "1px solid #b2ebf2",
                    height: "45px" // Samakan tinggi dengan input
                  }}
                >
                  + Tambah
                </button>
              </div>
            </div>

          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProductForm;