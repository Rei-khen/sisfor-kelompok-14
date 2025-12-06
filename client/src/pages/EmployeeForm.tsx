import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../components/MainLayout";

const EmployeeForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

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

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const token = localStorage.getItem("token");
        // Ganti URL ini jika backend Anda berbeda
        // const res = await axios.get("http://localhost:5000/api/store/my-store", ...
        // Simulasi nama toko
        setStoreName("Toko Anda"); 
      } catch (error) {
        console.error(error);
      }
    };
    fetchStore();
  }, []);

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
          setFormData({
            username: emp.username,
            password: "",
            email: emp.email,
            phone_number: emp.phone_number,
            role: emp.role,
            status: emp.status,
          });

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
        await axios.put(`http://localhost:5000/api/employees/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Data karyawan berhasil diperbarui!");
      } else {
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

  // --- STYLES (DIPERBAIKI) ---
  const fontStyle = { fontFamily: "'Montserrat', sans-serif" };

  const containerStyle: React.CSSProperties = {
    maxWidth: "600px",
    margin: "20px auto",
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    color: "#333", // Text hitam
    ...fontStyle
  };

  const tabBtnStyle = (isActive: boolean): React.CSSProperties => ({
    flex: 1,
    padding: "12px",
    cursor: "pointer",
    textAlign: "center",
    backgroundColor: isActive ? "#00acc1" : "#f5f5f5",
    color: isActive ? "white" : "#555",
    border: "1px solid #00acc1",
    fontWeight: "bold",
    ...fontStyle
  });

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    marginBottom: "15px",
    outline: "none",
    backgroundColor: "white", // Background input putih
    color: "#333", // Teks input hitam
    fontSize: "14px",
    ...fontStyle
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: "6px",
    fontWeight: "bold",
    color: "#444", // Label abu tua
    fontSize: "13px",
    ...fontStyle
  };

  const checkboxRowStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 0",
    borderBottom: "1px solid #eee",
    color: "#333"
  };

  return (
    <MainLayout>
      <div style={containerStyle}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
          <h2 style={{ margin: 0, color: "#050542", fontSize: "24px" }}>
            {isEditMode ? "Edit Pegawai" : "Tambah Pegawai"}
          </h2>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: "10px 25px",
              backgroundColor: "#0277bd",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
              ...fontStyle
            }}
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", marginBottom: "25px", borderRadius: "6px", overflow: "hidden" }}>
          <div style={tabBtnStyle(activeTab === "info")} onClick={() => setActiveTab("info")}>
            INFORMASI DASAR
          </div>
          <div style={tabBtnStyle(activeTab === "fitur")} onClick={() => setActiveTab("fitur")}>
            HAK AKSES FITUR
          </div>
        </div>

        {/* Tab Content: Info */}
        {activeTab === "info" && (
          <div>
            <label style={labelStyle}>Nama Toko</label>
            <input
              type="text"
              value={storeName}
              disabled
              style={{ ...inputStyle, backgroundColor: "#eee", color: "#666" }}
            />

            <label style={labelStyle}>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Masukkan username"
            />

            <label style={labelStyle}>Email (untuk login)</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={inputStyle}
              placeholder="contoh@email.com"
            />

            <label style={labelStyle}>
              Password
              {isEditMode && <span style={{ fontWeight: "normal", fontSize: "11px", color: "#888", marginLeft: "5px" }}>(Isi jika ingin mengubah)</span>}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={inputStyle}
              placeholder={isEditMode ? "Biarkan kosong jika tidak diubah" : "Masukkan password"}
            />

            <label style={labelStyle}>No Telepon</label>
            <input
              type="text"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              style={inputStyle}
              placeholder="08..."
            />

            <div style={{display: "flex", gap: "20px"}}>
                <div style={{flex: 1}}>
                    <label style={labelStyle}>Status Karyawan</label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        style={{...inputStyle, cursor: "pointer"}}
                    >
                        <option value="aktif">Aktif</option>
                        <option value="tidak aktif">Tidak Aktif</option>
                    </select>
                </div>
                <div style={{flex: 1}}>
                    <label style={labelStyle}>Tipe Karyawan</label>
                    <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        style={{...inputStyle, cursor: "pointer"}}
                    >
                        <option value="kasir">Kasir</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
            </div>
          </div>
        )}

        {/* Tab Content: Fitur */}
        {activeTab === "fitur" && (
          <div>
            <p style={{fontSize:"13px", color:"#666", marginBottom:"15px"}}>Centang fitur yang boleh diakses oleh karyawan ini:</p>
            {[
              { key: "produk", label: "Produk" },
              { key: "penjualan", label: "Penjualan" },
              { key: "histori_penjualan", label: "Histori Penjualan" },
              { key: "rekap_penjualan", label: "Rekap Penjualan" },
              { key: "pengeluaran", label: "Pengeluaran" },
              { key: "jurnal", label: "Jurnal" },
              { key: "grafik", label: "Grafik & Analitik" },
              { key: "buat_barcode", label: "Buat Barcode" },
            ].map((item) => (
              <div key={item.key} style={checkboxRowStyle}>
                <span style={{ fontSize: "15px", fontWeight: "500" }}>{item.label}</span>
                <input
                  type="checkbox"
                  checked={permissions[item.key as keyof typeof permissions]}
                  onChange={() => handleCheckboxChange(item.key)}
                  style={{ width: "20px", height: "20px", cursor: "pointer", accentColor: "#00acc1" }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Footer Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "30px" }}>
          <button
            onClick={() => navigate("/karyawan")}
            style={{ padding: "10px 15px", border: "1px solid #ccc", borderRadius: "6px", background: "white", cursor: "pointer", color: "#555", ...fontStyle }}
          >
            {"<"} Kembali
          </button>
          {activeTab === "info" && (
            <button
              onClick={() => setActiveTab("fitur")}
              style={{ padding: "10px 15px", border: "1px solid #ccc", borderRadius: "6px", background: "white", cursor: "pointer", color: "#00acc1", fontWeight: "bold", ...fontStyle }}
            >
              Lanjut Hak Akses {">"}
            </button>
          )}
        </div>

      </div>
    </MainLayout>
  );
};

export default EmployeeForm;