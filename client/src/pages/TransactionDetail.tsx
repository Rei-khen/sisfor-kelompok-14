// client/src/pages/TransactionDetail.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";

const TransactionDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<any>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:5000/api/transactions/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setDetail(res.data);
      } catch (error) {
        alert("Gagal memuat detail.");
        navigate("/histori-penjualan");
      }
    };
    fetchDetail();
  }, [id, navigate]);

  if (!detail) return <p>Memuat detail...</p>;

  // Format Tanggal
  const formattedDate = new Date(detail.transaction_time).toLocaleString(
    "id-ID"
  );

  return (
    <MainLayout>
      <div
        style={{
          padding: "20px",
          fontFamily: "sans-serif",
          color: "#333",
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        {/* Bagian Atas: Ringkasan */}
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            border: "1px solid #eee",
            marginBottom: "20px",
          }}
        >
          <h3 style={{ margin: "0 0 15px 0", color: "#555" }}>
            HISTORI PENJUALAN
          </h3>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "5px",
              fontSize: "14px",
            }}
          >
            <span>Status</span> <span>Lunas</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "5px",
              fontSize: "14px",
            }}
          >
            <span>Pembayaran</span> <span>{detail.payment_method}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "5px",
              fontSize: "14px",
            }}
          >
            <span>Tanggal</span> <span>{formattedDate}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "5px",
              fontSize: "14px",
            }}
          >
            <span>No Struk</span> <span>SR{detail.transaction_id}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "20px",
              fontSize: "14px",
            }}
          >
            <span>Kasir</span> <span>{detail.cashier_name}</span>
          </div>

          <hr
            style={{
              border: "0",
              borderTop: "1px dashed #ccc",
              marginBottom: "15px",
            }}
          />

          {/* List Item */}
          {detail.items.map((item: any) => (
            <div key={item.detail_id} style={{ marginBottom: "10px" }}>
              <div style={{ fontWeight: "bold" }}>{item.product_name}</div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "14px",
                  color: "#555",
                }}
              >
                <span>
                  Rp {item.price_per_unit.toLocaleString()} x {item.quantity}
                </span>
                <span>Rp {item.total_price.toLocaleString()}</span>
              </div>
            </div>
          ))}

          <hr
            style={{
              border: "0",
              borderTop: "1px dashed #ccc",
              margin: "15px 0",
            }}
          />

          {/* Total */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "5px",
              fontSize: "14px",
            }}
          >
            <span>TOTAL {detail.items.length} QTY</span>
            <span style={{ fontWeight: "bold" }}>
              Rp {detail.subtotal.toLocaleString()}
            </span>
          </div>
          {/* (Diskon jika ada) */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "5px",
              fontSize: "14px",
            }}
          >
            <span>Bayar</span>
            <span style={{ fontWeight: "bold" }}>
              Rp {detail.total_price.toLocaleString()}
            </span>{" "}
            {/* Anggap bayar pas dulu */}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "14px",
            }}
          >
            <span>Kembali</span>
            <span style={{ fontWeight: "bold" }}>Rp 0</span>
          </div>
        </div>

        {/* Bagian Bawah: Histori Pembayaran (Log) */}
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            border: "1px solid #eee",
          }}
        >
          <h4 style={{ margin: "0 0 15px 0", color: "#555" }}>
            HISTORI PEMBAYARAN
          </h4>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontWeight: "bold" }}>{detail.payment_method}</div>
              <div style={{ fontSize: "12px", color: "#888" }}>
                Kasir {detail.cashier_name}
              </div>
              <div style={{ fontSize: "12px", color: "#888" }}>
                {formattedDate}
              </div>
            </div>
            <div style={{ fontWeight: "bold" }}>
              {detail.total_price.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default TransactionDetail;
