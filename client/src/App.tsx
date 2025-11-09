// client/src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";

function App() {
  return (
    <Routes>
      {/* Redirect halaman utama ke /register untuk sementara */}
      <Route path="/" element={<Navigate to="/register" replace />} />
      <Route path="/register" element={<Register />} />
      {/* Route login kita siapkan placeholder-nya dulu */}
      <Route path="/login" element={<div>Halaman Login (Segera Hadir)</div>} />
    </Routes>
  );
}

export default App;
