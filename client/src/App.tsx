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
      <Route path="/produk" element={<ProductList />} />
      <Route path="/produk/tambah" element={<ProductForm />} />

      {/* Ganti placeholder produk yang lama */}
      <Route
        path="/feature/produk"
        element={<Navigate to="/produk" replace />}
      />

      <Route path="/penjualan" element={<SalesCatalog />} />

      {/* Siapkan rute untuk Pembayaran nanti */}
      {/* <Route path="/pembayaran" element={<CheckoutPage />} /> */}

      {/* Arahkan placeholder 'Penjualan' dari Dashboard ke sini */}
      <Route
        path="/feature/penjualan"
        element={<Navigate to="/penjualan" replace />}
      />

      <Route path="/penjualan" element={<SalesCatalog />} />

      {/* Rute Baru untuk Pembayaran */}
      <Route path="/pembayaran" element={<CheckoutPage />} />
      <Route path="/pilih-metode" element={<PaymentMethodSelect />} />
      <Route path="/payment-gateway/:methodName" element={<PaymentGateway />} />

      {/* Arahkan placeholder */}
      <Route
        path="/feature/penjualan"
        element={<Navigate to="/penjualan" replace />}
      />
      <Route
        path="/feature/pembayaran"
        element={<Navigate to="/pembayaran" replace />}
      />

      <Route path="/karyawan" element={<EmployeeList />} />
      <Route path="/karyawan/tambah" element={<EmployeeForm />} />
      <Route
        path="/feature/karyawan"
        element={<Navigate to="/karyawan" replace />}
      />
    </Routes>
  );
}

export default App;
