// client/src/pages/EmployeeForm.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../components/MainLayout";

const EmployeeForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Cek apakah ada ID di URL
  const isEditMode = !!id; // True jika sedang edit

  const [activeTab, setActiveTab] = useState<"info" | "fitur">("info");
  const [storeName, setStoreName] = useState("");
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    phone_number: "",
    role: "kasir",
    status: "aktif",
  });

  // Permissions State
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

  // 1. Ambil Store Name (Selalu dijalankan)
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
        console.error(error);
      }
    };
    fetchStore();
  }, []);

  // 2. Jika Edit Mode: Ambil data karyawan yang mau diedit
  useEffect(() => {
    if (isEditMode) {
      const fetchEmployee = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await axios.get(
            `http://localhost:5000/api/employees/${id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          const emp = res.data;

          // Isi Form Data
          setFormData({
            username: emp.username,
            password: "", // Kosongkan password (biar tidak terekspos hash-nya)
            email: emp.email,
            phone_number: emp.phone_number,
            role: emp.role,
            status: emp.status,
          });

          // Isi Checkbox Permissions
          // Backend mengirim array ['produk', 'jurnal'], kita ubah jadi object {produk: true, ...}
          const serverPermissions = emp.permissions || [];
          const newPerms = { ...permissions };
          Object.keys(newPerms).forEach((key) => {
            // @ts-ignore
            newPerms[key] = serverPermissions.includes(key);
          });
          setPermissions(newPerms);
        } catch (error) {
          alert("Gagal mengambil data karyawan.");
          navigate("/karyawan");
        }
      };
      fetchEmployee();
    }
  }, [isEditMode, id, navigate]);

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
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const activePermissions = Object.keys(permissions).filter(
        (key) => permissions[key as keyof typeof permissions]
      );

      const payload = {
        ...formData,
        permissions: activePermissions,
      };

      if (isEditMode) {
        // API UPDATE
        await axios.put(`http://localhost:5000/api/employees/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Data karyawan berhasil diperbarui!");
      } else {
        // API CREATE
        await axios.post("http://localhost:5000/api/employees", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Karyawan berhasil ditambahkan!");
      }

      navigate("/karyawan");
    } catch (error: any) {
      alert("Gagal: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Styles (Sama seperti sebelumnya)
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
          <h2 style={{ margin: 0, color: "#333" }}>
            {isEditMode ? "Edit Pegawai" : "Tambah Pegawai"}
          </h2>
          <button
            onClick={handleSubmit}
            disabled={loading}
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
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>

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

            <label style={labelStyle}>email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={inputStyle}
            />

            <label style={labelStyle}>
              password{" "}
              {isEditMode && (
                <span
                  style={{
                    fontWeight: "normal",
                    fontSize: "12px",
                    color: "#888",
                  }}
                >
                  (Isi hanya jika ingin mengubah)
                </span>
              )}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={inputStyle}
              placeholder={
                isEditMode
                  ? "Biarkan kosong jika tidak ingin mengubah password"
                  : ""
              }
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
          {activeTab === "info" && (
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
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default EmployeeForm;
