import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SetupPage: React.FC = () => {
  const navigate = useNavigate();
  // State untuk semua field sesuai gambar
  const [formData, setFormData] = useState({
    username: "",
    storename: "", // unik, lowercase biasanya
    namaToko: "", // display name
    alamatToko: "",
    provinsi: "",
    kabupaten: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("token")) navigate("/login");
  }, [navigate]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/store/create",
        {
          // Sesuaikan nama field dengan yang diminta backend
          username: formData.username,
          store_name: formData.storename,
          display_name: formData.namaToko,
          address: formData.alamatToko,
          province: formData.provinsi,
          regency: formData.kabupaten,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Setup Selesai! Selamat datang di Kasirku.");
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal setup.");
    }
  };

  // Style agar mirip desain (kotak putih, shadow halus, rounded)
  const inputStyle = {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    border: "1px solid #eee",
    borderRadius: "8px",
    backgroundColor: "#f9fafb",
    fontSize: "14px",
  };
  const labelStyle = {
    display: "block",
    marginBottom: "8px",
    fontWeight: "bold",
    fontSize: "14px",
    color: "#333",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        padding: "40px 20px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "40px",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          width: "100%",
          maxWidth: "500px",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "10px" }}>
          selamat datang di kasirku :)
        </h2>
        <p
          style={{
            textAlign: "center",
            color: "#666",
            marginBottom: "30px",
            fontSize: "14px",
          }}
        >
          Sebelum menggunakan aplikasi, Harap lengkapi informasi berikut.
        </p>

        {error && (
          <div
            style={{
              backgroundColor: "#ffebee",
              color: "#c62828",
              padding: "10px",
              borderRadius: "8px",
              marginBottom: "20px",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div>
            <label style={labelStyle}>username</label>
            <input
              type="text"
              name="username"
              placeholder="username"
              value={formData.username}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>storename</label>
            <input
              type="text"
              name="storename"
              placeholder="storename (ID unik toko)"
              value={formData.storename}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>nama toko</label>
            <input
              type="text"
              name="namaToko"
              placeholder="nama toko (yang tampil di pelanggan)"
              value={formData.namaToko}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>alamat toko</label>
            <textarea
              name="alamatToko"
              placeholder="alamat toko"
              value={formData.alamatToko}
              onChange={handleChange}
              required
              style={{
                ...inputStyle,
                minHeight: "80px",
                fontFamily: "inherit",
              }}
            />
          </div>

          {/* Dropdown Provinsi Sederhana */}
          <div>
            <label style={labelStyle}>provinsi</label>
            <select
              name="provinsi"
              value={formData.provinsi}
              onChange={handleChange}
              required
              style={inputStyle}
            >
              <option value="">Pilih Provinsi</option>
              <option value="Jawa Barat">Jawa Barat</option>
              <option value="DKI Jakarta">DKI Jakarta</option>
              <option value="Jawa Timur">Jawa Timur</option>
              {/* Tambahkan lainnya nanti */}
            </select>
          </div>

          {/* Dropdown Kabupaten Sederhana */}
          <div>
            <label style={labelStyle}>kabupaten</label>
            <select
              name="kabupaten"
              value={formData.kabupaten}
              onChange={handleChange}
              required
              style={inputStyle}
            >
              <option value="">Pilih Kabupaten</option>
              <option value="Bandung">Bandung</option>
              <option value="Jakarta Selatan">Jakarta Selatan</option>
              <option value="Surabaya">Surabaya</option>
              {/* Tambahkan lainnya nanti */}
            </select>
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "14px",
              backgroundColor: "#0a0a5e",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
              marginTop: "20px",
            }}
          >
            konfirmasi
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetupPage;
