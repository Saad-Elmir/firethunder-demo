import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ProductsPage from "./pages/ProductsPage";
import ProductNewPage from "./pages/ProductNewPage";
import ProductEditPage from "./pages/ProductEditPage";
import RequireAuth from "./routes/RequireAuth";
import ProtectedLayout from "./layout/ProtectedLayout";
import { isAuthed } from "./auth";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Protected area: Commun Layout*/}
      <Route
        element={
          <RequireAuth>
            <ProtectedLayout />
          </RequireAuth>
        }
      >
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/new" element={<ProductNewPage />} />
        <Route path="/products/:id/edit" element={<ProductEditPage />} />
      </Route>

      <Route path="/" element={<Navigate to={isAuthed() ? "/products" : "/login"} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
