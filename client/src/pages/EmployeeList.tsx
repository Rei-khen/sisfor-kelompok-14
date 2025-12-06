import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";

interface Employee {
  user_id: number;
  username: string;
  role: string;
  phone_number: string;
  status: string;
}

const EmployeeList: React.FC = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/employees", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(res.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  // Filter local search
  const filteredEmployees = employees.filter(emp => 
    emp.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- STYLES (DIPERBAIKI: Text Color) ---
  const fontStyle = { fontFamily: "'Montserrat', sans-serif" };

  const containerStyle: React.CSSProperties = {
    padding: "20px",
    maxWidth: "800px",
    margin: "0 auto",
    color: "#333", // PERBAIKAN: Teks utama halaman jadi gelap
    ...fontStyle
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  };

  const titleStyle: React.CSSProperties = {
    margin: 0, 
    color: "#050542", // Judul Biru Tua
    fontWeight: "bold",
    fontSize: "28px"
  };

  const searchStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    marginBottom: "20px",
    outline: "none",
    fontSize: "14px",
    backgroundColor: "white", // Background input putih
    color: "#333", // Teks input gelap
    ...fontStyle
  };

  const cardStyle: React.CSSProperties = {
    border: "1px solid #eee",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "15px",
    backgroundColor: "white", // Kartu putih
    position: "relative",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
    color: "#333" // Isi kartu teks gelap
  };

  const btnStyle: React.CSSProperties = {
    padding: "10px 20px",
    backgroundColor: "#00acc1",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "14px",
    ...fontStyle
  };

  return (
    <MainLayout>
      <div style={containerStyle}>
        
        {/* Header */}
        <div style={headerStyle}>
          <h1 style={titleStyle}>Pegawai</h1>
          <button onClick={() => navigate("/karyawan/tambah")} style={btnStyle}>
            + Tambah Pegawai
          </button>
        </div>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Cari nama pegawai..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={searchStyle}
        />

        {/* List Karyawan */}
        {filteredEmployees.length > 0 ? (
          filteredEmployees.map((emp) => (
            <div key={emp.user_id} style={cardStyle}>
              {/* Ikon Edit */}
              <div
                onClick={() => navigate(`/karyawan/edit/${emp.user_id}`)}
                style={{
                  position: "absolute",
                  top: "20px",
                  right: "20px",
                  color: "#00acc1",
                  cursor: "pointer",
                  fontSize: "18px"
                }}
                title="Edit Pegawai"
              >
                ✏️
              </div>

              <h2 style={{ margin: "0 0 10px 0", color: "#050542", fontSize: "18px" }}>
                {emp.role === "admin" ? "Admin" : emp.role === "owner" ? "Owner" : "Kasir"}
              </h2>
              
              <div style={{ color: "#555", lineHeight: "1.8", fontSize: "14px" }}>
                <div style={{display: "flex", gap: "10px"}}>
                  <strong style={{minWidth: "100px"}}>Username:</strong> 
                  <span>{emp.username}</span>
                </div>
                <div style={{display: "flex", gap: "10px"}}>
                  <strong style={{minWidth: "100px"}}>No Telepon:</strong> 
                  <span>{emp.phone_number || "-"}</span>
                </div>
                <div style={{display: "flex", gap: "10px"}}>
                  <strong style={{minWidth: "100px"}}>Status:</strong> 
                  <span style={{
                      color: emp.status === "aktif" ? "green" : "red", 
                      fontWeight: "bold",
                      textTransform: "capitalize"
                  }}>
                      {emp.status}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
            <p>Tidak ada data pegawai.</p>
          </div>
        )}

      </div>
    </MainLayout>
  );
};

export default EmployeeList;