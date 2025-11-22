import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";

const EmployeeForm: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"info" | "fitur">("info");
  const [storeName, setStoreName] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    username: "",
    password: "", // Password wajib untuk user baru
    email: "", // Butuh email untuk login sesuai sistem kita
    phone_number: "",
    role: "kasir",
    status: "aktif",
  });

  // Permissions State (Checkbox)
  const [permissions, setPermissions] = useState({
    produk: false,
    penjualan: false,
    histori_penjualan: false,
    rekap_penjualan: false,
    pengeluaran: false,
    jurnal: false,
    grafik: false,
    buat_barcode: false,
  });

  // Ambil Store Name saat load
  useEffect(() => {
    const fetchStore = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:5000/api/store/my-store",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setStoreName(res.data.store_name);
      } catch (error) {
        console.error("Gagal ambil toko", error);
      }
    };
    fetchStore();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (feature: string) => {
    setPermissions((prev) => ({
      ...prev,
      [feature]: !prev[feature as keyof typeof permissions],
    }));
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");

      // Konversi objek permissions menjadi array string ['produk', 'jurnal', ...]
      const activePermissions = Object.keys(permissions).filter(
        (key) => permissions[key as keyof typeof permissions]
      );

      const payload = {
        ...formData,
        permissions: activePermissions,
      };

      await axios.post("http://localhost:5000/api/employees", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Karyawan berhasil ditambahkan!");
      navigate("/karyawan");
    } catch (error: any) {
      alert("Gagal: " + (error.response?.data?.message || error.message));
    }
  };

  // STYLES
  const tabBtnStyle = (isActive: boolean): React.CSSProperties => ({
    flex: 1,
    padding: "12px",
    cursor: "pointer",
    textAlign: "center",
    backgroundColor: isActive ? "#00acc1" : "white",
    color: isActive ? "white" : "#00acc1",
    border: "1px solid #00acc1",
    fontWeight: "bold",
  });

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    marginBottom: "15px",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: "5px",
    fontWeight: "bold",
    color: "#333",
  };

  const checkboxRowStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 0",
    borderBottom: "1px solid #eee",
  };

  return (
    <MainLayout>
      <div
        style={{
          maxWidth: "600px",
          margin: "20px auto",
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ margin: 0, color: "#333" }}>Pegawai</h2>
          <button
            onClick={handleSubmit}
            style={{
              padding: "10px 20px",
              backgroundColor: "#0277bd",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            simpan
          </button>
        </div>

        {/* TAB NAVIGATION */}
        <div
          style={{
            display: "flex",
            marginBottom: "25px",
            borderRadius: "6px",
            overflow: "hidden",
          }}
        >
          <div
            style={tabBtnStyle(activeTab === "info")}
            onClick={() => setActiveTab("info")}
          >
            informasi dasar
          </div>
          <div
            style={tabBtnStyle(activeTab === "fitur")}
            onClick={() => setActiveTab("fitur")}
          >
            fitur aplikasi
          </div>
        </div>

        {/* KONTEN TAB 1: INFORMASI DASAR */}
        {activeTab === "info" && (
          <div>
            <label style={labelStyle}>storename</label>
            <input
              type="text"
              value={storeName}
              disabled
              style={{
                ...inputStyle,
                backgroundColor: "#f0f0f0",
                color: "#666",
              }}
            />

            <label style={labelStyle}>username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              style={inputStyle}
            />

            <label style={labelStyle}>email (untuk login)</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={inputStyle}
            />

            <label style={labelStyle}>password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={inputStyle}
            />

            <label style={labelStyle}>no telepon</label>
            <input
              type="text"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              style={inputStyle}
            />

            <label style={labelStyle}>status karyawan</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="aktif">aktif</option>
              <option value="tidak aktif">tidak aktif</option>
            </select>

            <label style={labelStyle}>tipe karyawan</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="kasir">Kasir</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        )}

        {/* KONTEN TAB 2: FITUR APLIKASI */}
        {activeTab === "fitur" && (
          <div>
            {[
              { key: "produk", label: "Produk" },
              { key: "penjualan", label: "Penjualan" },
              { key: "histori_penjualan", label: "Histori penjualan" },
              { key: "rekap_penjualan", label: "Rekap penjualan" },
              { key: "pengeluaran", label: "Pengeluaran" },
              { key: "jurnal", label: "Jurnal" },
              { key: "grafik", label: "Grafik" },
              { key: "buat_barcode", label: "Buat barcode" },
            ].map((item) => (
              <div key={item.key} style={checkboxRowStyle}>
                <span style={{ fontSize: "16px", color: "#333" }}>
                  {item.label}
                </span>
                {/* Checkbox Sederhana */}
                <input
                  type="checkbox"
                  checked={permissions[item.key as keyof typeof permissions]}
                  onChange={() => handleCheckboxChange(item.key)}
                  style={{ transform: "scale(1.5)", cursor: "pointer" }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Footer Navigasi Sederhana (Opsional) */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "20px",
          }}
        >
          <button
            onClick={() => navigate("/karyawan")}
            style={{
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              background: "white",
              cursor: "pointer",
            }}
          >
            {"<"} Kembali
          </button>
          {activeTab === "info" ? (
            <button
              onClick={() => setActiveTab("fitur")}
              style={{
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                background: "white",
                cursor: "pointer",
              }}
            >
              Lanjut {">"}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              style={{
                padding: "10px 20px",
                backgroundColor: "#0277bd",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              simpan
            </button>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default EmployeeForm;
