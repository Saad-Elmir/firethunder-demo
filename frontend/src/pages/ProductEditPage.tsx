import { Container, Typography } from "@mui/material";
import { useParams } from "react-router-dom";

export default function ProductEditPage() {
  const { id } = useParams();

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h5">Edit Product</Typography>
      <Typography sx={{ mt: 2 }}>Product ID: {id}</Typography>
    </Container>
  );
}
