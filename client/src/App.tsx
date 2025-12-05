// client/src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
// import CreateStore from "./pages/CreateStore";
import SetupPage from "./pages/SetupPage";
import Placeholder from "./pages/Placeholder"; // Import placeholder
import CategoryList from "./pages/CategoryList";
import CategoryForm from "./pages/CategoryForm";
import ProductList from "./pages/ProductList";
import ProductForm from "./pages/ProductForm";
import SalesCatalog from "./pages/SalesCatalog";
import CheckoutPage from "./pages/CheckoutPage"; // Halaman Pembayaran Utama
import PaymentMethodSelect from "./pages/PaymentMethodSelect"; // Halaman Pilih E-Wallet
import PaymentGateway from "./pages/PaymentGateway"; // Halaman Konfirmasi E-Wallet
import EmployeeList from "./pages/EmployeeList";
import EmployeeForm from "./pages/EmployeeForm";
import TransactionHistory from "./pages/TransactionHistory";
import TransactionDetail from "./pages/TransactionDetail";
import RestockPage from "./pages/RestockPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import Jurnal from "./pages/Jurnal";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/create-store" element={<SetupPage />} />
      
      <Route path="/feature/:menuName" element={<Placeholder />} />

      <Route path="/kategori" element={<CategoryList />} />
      <Route path="/kategori/tambah" element={<CategoryForm />} />
      <Route path="/kategori/edit/:id" element={<CategoryForm />} />

      {/* --- BAGIAN PRODUK --- */}
      <Route path="/produk" element={<ProductList />} />
      <Route path="/produk/tambah" element={<ProductForm />} />
      <Route path="/produk/edit/:id" element={<ProductForm />} />
      {/* Redirect feature/produk ke /produk */}
      <Route
        path="/feature/produk"
        element={<Navigate to="/produk" replace />}
      />

      {/* --- BAGIAN PENJUALAN --- */}
      <Route path="/penjualan" element={<SalesCatalog />} />
      {/* Arahkan placeholder 'Penjualan' dari Dashboard ke sini */}
      <Route
        path="/feature/penjualan"
        element={<Navigate to="/penjualan" replace />}
      />

      {/* --- BAGIAN PEMBAYARAN --- */}
      <Route path="/pembayaran" element={<CheckoutPage />} />
      <Route path="/pilih-metode" element={<PaymentMethodSelect />} />
      <Route path="/payment-gateway/:methodName" element={<PaymentGateway />} />
      <Route
        path="/feature/pembayaran"
        element={<Navigate to="/pembayaran" replace />}
      />

      {/* --- BAGIAN KARYAWAN --- */}
      <Route path="/karyawan" element={<EmployeeList />} />
      <Route path="/karyawan/tambah" element={<EmployeeForm />} />
      <Route path="/karyawan/edit/:id" element={<EmployeeForm />} />
      <Route
        path="/feature/karyawan"
        element={<Navigate to="/karyawan" replace />}
      />

      {/* --- BAGIAN HISTORI --- */}
      <Route path="/histori-penjualan" element={<TransactionHistory />} />
      <Route path="/histori-penjualan/:id" element={<TransactionDetail />} />
      <Route
        path="/feature/histori-penjualan"
        element={<Navigate to="/histori-penjualan" replace />}
      />

      {/* --- BAGIAN RESTOK --- */}
      <Route path="/restok" element={<RestockPage />} />
      <Route
        path="/feature/restok"
        element={<Navigate to="/restok" replace />}
      />

      {/* --- BAGIAN GRAFIK --- */}
      <Route path="/grafik" element={<AnalyticsPage />} />
      <Route
        path="/feature/grafik"
        element={<Navigate to="/grafik" replace />}
      />

      <Route path="/jurnal" element={<Jurnal />} />
      <Route
        path="/feature/jurnal"
        element={<Navigate to="/jurnal" replace />}
      />

    </Routes>
  );
}

export default App;
