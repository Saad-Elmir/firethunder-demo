import { Container, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { clearToken } from "../auth";

export default function ProductsPage() {
  const navigate = useNavigate();

  const logout = () => {
    clearToken();
    navigate("/login", { replace: true });
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Products
      </Typography>

      {/* Placeholder: on fera le listing produits (US-9) */}
      <Typography sx={{ mb: 3 }}>Module produits à venir.</Typography>

      <Button variant="outlined" onClick={logout}>
        Logout
      </Button>
    </Container>
  );
}
