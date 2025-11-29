// client/src/pages/AnalyticsPage.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "../components/MainLayout";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// --- TIPE DATA ---
interface AnalyticsData {
  summary: {
    today_revenue: number;
    today_transactions: number;
    total_revenue: number;
    products_sold: number;
    total_transactions: number;
    low_stock_count: number;
  };
  trend: { date: string; total: number }[];
  categories: { name: string; value: number }[];
  topProducts: {
    name: string;
    sold: number;
    stock: number;
    min_stock_alert: number;
  }[];
}

const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- FETCH DATA ---
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/analytics", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // --- PERBAIKAN PENTING: KONVERSI DATA KE NUMBER ---
      const raw = res.data;
      const cleanData: AnalyticsData = {
        summary: {
          today_revenue: Number(raw.summary.today_revenue),
          today_transactions: Number(raw.summary.today_transactions),
          total_revenue: Number(raw.summary.total_revenue),
          products_sold: Number(raw.summary.products_sold),
          total_transactions: Number(raw.summary.total_transactions),
          low_stock_count: Number(raw.summary.low_stock_count),
        },
        trend: raw.trend.map((t: any) => ({
          date: t.date,
          total: Number(t.total),
        })),
        categories: raw.categories.map((c: any) => ({
          name: c.name,
          value: Number(c.value), // Pastikan ini Number agar Pie Chart muncul
        })),
        topProducts: raw.topProducts.map((p: any) => ({
          name: p.name,
          sold: Number(p.sold),
          stock: Number(p.stock),
          min_stock_alert: Number(p.min_stock_alert),
        })),
      };

      setData(cleanData);
    } catch (err: any) {
      console.error("Error fetch analytics", err);
      setError(
        err.response?.data?.message || err.message || "Gagal memuat data."
      );
    } finally {
      setLoading(false);
    }
  };

  // Warna untuk Pie Chart
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  // Format Rupiah
  const formatRp = (val: number) => "Rp " + Number(val).toLocaleString("id-ID");

  // --- TAMPILAN LOADING & ERROR ---
  if (loading) {
    return (
      <MainLayout>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            color: "#666",
          }}
        >
          <p>Memuat data grafik...</p>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div style={{ padding: "40px", textAlign: "center", color: "#d32f2f" }}>
          <h3>Terjadi Kesalahan</h3>
          <p>{error}</p>
          <button
            onClick={fetchData}
            style={{
              padding: "10px 20px",
              backgroundColor: "#00acc1",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              marginTop: "10px",
            }}
          >
            Coba Lagi
          </button>
        </div>
      </MainLayout>
    );
  }

  if (!data) return null;

  // --- STYLES ---
  const containerStyle: React.CSSProperties = {
    padding: "20px",
    fontFamily: "sans-serif",
    color: "#333",
    backgroundColor: "#f4f7fe",
    minHeight: "100%",
  };
  const cardStyle: React.CSSProperties = {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
    border: "1px solid #eee",
  };
  const grid4Style: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    marginBottom: "20px",
  };
  const grid2Style: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: "20px",
    marginBottom: "20px",
  };

  const iconBoxStyle = (color: string) => ({
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: color,
    color: "white",
    fontSize: "20px",
    marginBottom: "10px",
  });

  // --- RENDER UTAMA ---
  return (
    <MainLayout>
      <div style={containerStyle}>
        <h2 style={{ margin: "0 0 20px 0", color: "#050542" }}>
          Grafik Penjualan
        </h2>

        {/* 1. BIG SUMMARY CARD */}
        <div
          style={{
            ...cardStyle,
            marginBottom: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div>
            <p style={{ margin: 0, color: "#888", fontSize: "14px" }}>
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <h2 style={{ margin: "5px 0", fontSize: "24px" }}>
              Penjualan Hari Ini: {formatRp(data.summary.today_revenue)}
            </h2>
            <p style={{ margin: 0, color: "#555" }}>
              Transaksi: <strong>{data.summary.today_transactions}</strong>
            </p>
          </div>
          <div
            style={{
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              fontSize: "14px",
              backgroundColor: "#f9f9f9",
            }}
          >
            7 Hari Terakhir
          </div>
        </div>

        {/* 2. METRICS CARDS (4 KOTAK) */}
        <div style={grid4Style}>
          {/* Total Penjualan */}
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "14px", color: "#888" }}>
                  Total Penjualan
                </div>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    margin: "5px 0",
                  }}
                >
                  {formatRp(data.summary.total_revenue)}
                </div>
                <div style={{ fontSize: "12px", color: "green" }}>↗ +15.3%</div>
              </div>
              <div style={iconBoxStyle("#4fd1c5")}>$</div>
            </div>
          </div>
          {/* Produk Terjual */}
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "14px", color: "#888" }}>
                  Produk Terjual
                </div>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    margin: "5px 0",
                  }}
                >
                  {data.summary.products_sold}
                </div>
                <div style={{ fontSize: "12px", color: "green" }}>↗ +8.1%</div>
              </div>
              <div style={iconBoxStyle("#48bb78")}>📦</div>
            </div>
          </div>
          {/* Transaksi */}
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "14px", color: "#888" }}>Transaksi</div>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    margin: "5px 0",
                  }}
                >
                  {data.summary.total_transactions}
                </div>
                <div style={{ fontSize: "12px", color: "green" }}>↗ +12.5%</div>
              </div>
              <div style={iconBoxStyle("#ecc94b")}>🛒</div>
            </div>
          </div>
          {/* Stok Rendah */}
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "14px", color: "#888" }}>
                  Stok Rendah
                </div>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    margin: "5px 0",
                  }}
                >
                  {data.summary.low_stock_count} Produk
                </div>
                <div style={{ fontSize: "12px", color: "red" }}>
                  Perlu Restok
                </div>
              </div>
              <div style={iconBoxStyle("#f56565")}>⚠️</div>
            </div>
          </div>
        </div>

        {/* 3. GRAPHS ROW 1 */}
        <div style={grid2Style}>
          {/* Tren Penjualan (Area Chart) */}
          <div style={cardStyle}>
            <h4 style={{ margin: "0 0 20px 0" }}>Tren Penjualan 7 Hari</h4>
            <div style={{ height: "300px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.trend}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" style={{ fontSize: "12px" }} />
                  <YAxis style={{ fontSize: "12px" }} />
                  <Tooltip formatter={(value) => formatRp(Number(value))} />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#8884d8"
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Penjualan per Produk (Bar Chart) */}
          <div style={cardStyle}>
            <h4 style={{ margin: "0 0 20px 0" }}>Penjualan per Produk</h4>
            <div style={{ height: "300px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topProducts}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" style={{ fontSize: "12px" }} />
                  <YAxis style={{ fontSize: "12px" }} />
                  <Tooltip />
                  <Bar dataKey="sold" fill="#4299e1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 4. GRAPHS ROW 2 & TABLE */}
        <div style={grid2Style}>
          {/* Distribusi Kategori (Pie Chart) - SUDAH DIPERBAIKI */}
          <div style={cardStyle}>
            <h4 style={{ margin: "0 0 20px 0" }}>Distribusi Kategori</h4>
            <div style={{ height: "300px", position: "relative" }}>
              {/* Cek data valid */}
              {data.categories.length === 0 ||
              data.categories.reduce((acc, curr) => acc + curr.value, 0) ===
                0 ? (
                <div
                  style={{
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "#999",
                    fontSize: "14px",
                    flexDirection: "column",
                  }}
                >
                  <span style={{ fontSize: "40px", marginBottom: "10px" }}>
                    📉
                  </span>
                  Belum ada data penjualan kategori
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.categories}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {data.categories.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [
                        value + " Terjual",
                        "Jumlah",
                      ]}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Top Produk Terlaris (Table) */}
          <div style={cardStyle}>
            <h4 style={{ margin: "0 0 20px 0" }}>Top Produk Terlaris</h4>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "14px",
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "2px solid #f0f0f0",
                    textAlign: "left",
                  }}
                >
                  <th style={{ padding: "10px 0" }}>Nama Produk</th>
                  <th style={{ padding: "10px 0" }}>Terjual</th>
                  <th style={{ padding: "10px 0" }}>Stok</th>
                  <th style={{ padding: "10px 0" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.topProducts.map((prod, idx) => {
                  const isLow = prod.stock <= prod.min_stock_alert;
                  return (
                    <tr key={idx} style={{ borderBottom: "1px solid #f9f9f9" }}>
                      <td style={{ padding: "10px 0" }}>{prod.name}</td>
                      <td style={{ padding: "10px 0" }}>{prod.sold}</td>
                      <td style={{ padding: "10px 0" }}>{prod.stock}</td>
                      <td style={{ padding: "10px 0" }}>
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            backgroundColor: isLow ? "#fde8e8" : "#def7ec",
                            color: isLow ? "#c53030" : "#03543f",
                          }}
                        >
                          {isLow ? "Stok Rendah" : "Normal"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {data.topProducts.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      style={{
                        textAlign: "center",
                        padding: "20px",
                        color: "#888",
                      }}
                    >
                      Belum ada data penjualan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AnalyticsPage;
