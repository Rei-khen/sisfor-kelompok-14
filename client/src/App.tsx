// client/src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
// import CreateStore from "./pages/CreateStore";
import SetupPage from "./pages/SetupPage";
import Placeholder from "./pages/Placeholder"; // Import placeholder

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/create-store" element={<SetupPage />} />
      <Route path="/feature/:menuName" element={<Placeholder />} />
    </Routes>
  );
}

export default App;
