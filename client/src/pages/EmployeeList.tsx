// client/src/pages/EmployeeList.tsx
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
      console.error("Error:", error);
    }
  };

  // Styles
  const headerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  };
  const searchStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    marginBottom: "20px",
  };
  const cardStyle: React.CSSProperties = {
    border: "1px solid #ccc",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "15px",
    backgroundColor: "white",
    position: "relative",
  };
  const btnStyle: React.CSSProperties = {
    padding: "10px 20px",
    backgroundColor: "#0277bd",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  };

  return (
    <MainLayout>
      <div
        style={{
          padding: "20px",
          maxWidth: "800px",
          margin: "0 auto",
          fontFamily: "sans-serif",
        }}
      >
        <div style={headerStyle}>
          <h1 style={{ margin: 0, color: "#333" }}>Pegawai</h1>
          <button onClick={() => navigate("/karyawan/tambah")} style={btnStyle}>
            Tambah pegawai
          </button>
        </div>

        <input
          type="text"
          placeholder="cari nama pegawai"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={searchStyle}
        />

        {employees.map((emp) => (
          <div key={emp.user_id} style={cardStyle}>
            {/* Ikon Edit di pojok kanan atas */}
            <div
              onClick={() => navigate(`/karyawan/edit/${emp.user_id}`)} // Update baris ini
              style={{
                position: "absolute",
                top: "15px",
                right: "15px",
                color: "#00acc1",
                cursor: "pointer",
              }}
            >
              ✏️
            </div>
            <h2 style={{ margin: "0 0 10px 0", color: "#333" }}>
              {emp.role === "admin" ? "Admin" : "Kasir"}
            </h2>
            <div style={{ color: "#555", lineHeight: "1.6" }}>
              <div>
                <strong>username :</strong> {emp.username}
              </div>
              <div>
                <strong>nama :</strong> {emp.username}
              </div>{" "}
              {/* Bisa disesuaikan jika ada kolom nama asli */}
              <div>
                <strong>no telepon :</strong> {emp.phone_number}
              </div>
              <div>
                <strong>status :</strong> {emp.status}
              </div>
            </div>
          </div>
        ))}

        {employees.length === 0 && (
          <p style={{ textAlign: "center", color: "#888" }}>
            Belum ada karyawan.
          </p>
        )}
      </div>
    </MainLayout>
  );
};

export default EmployeeList;
