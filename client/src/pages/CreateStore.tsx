// client/src/pages/CreateStore.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreateStore: React.FC = () => {
  const [storeName, setStoreName] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Cek apakah user sudah login saat halaman dibuka
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const token = localStorage.getItem("token");
      // Kirim request dengan header Authorization berisi token JWT
      await axios.post(
        "http://localhost:5000/api/store/create",
        {
          store_name: storeName,
          address: address,
          phone_number: phoneNumber,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Penting! Backend butuh ini.
          },
        }
      );

      alert("Toko berhasil dibuat!");
      navigate("/dashboard"); // Kembali ke dashboard setelah sukses
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal membuat toko.");
    }
  };

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "50px auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
      }}
    >
      <h2>Setup Toko Kamu</h2>
      <p>Halo! Sebelum mulai, yuk isi data tokomu dulu.</p>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Nama Toko (Wajib):
          </label>
          <input
            type="text"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            required
            placeholder="Contoh: Toko Kelontong Berkah"
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Alamat:
          </label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Alamat lengkap tokomu"
            style={{
              width: "100%",
              padding: "8px",
              boxSizing: "border-box",
              minHeight: "80px",
            }}
          />
        </div>
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Nomor Telepon Toko:
          </label>
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Contoh: 08123456789"
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          />
        </div>
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "blue",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Simpan & Mulai Berjualan
        </button>
      </form>
    </div>
  );
};

export default CreateStore;
