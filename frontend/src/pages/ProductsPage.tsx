import { useEffect, useMemo, useState } from "react";
import {
  Container,
  Typography,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";

import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client/react";
import { PRODUCTS_QUERY, DELETE_PRODUCT_MUTATION } from "../graphql/products";
import { useToast } from "../ui/toast";
import { isForbidden, isUnauthorized } from "../graphql/errors";
import { clearToken } from "../auth";

// string type for price
type Product = {
  id: string;
  name: string;
  price: string;
  quantity: number;
};

type ProductsData = { products: Product[] };

type DeleteVars = { id: string };
type DeleteData = { deleteProduct: boolean };

export default function ProductsPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [toDelete, setToDelete] = useState<Product | null>(null);

  const { data, loading, error, refetch } = useQuery<ProductsData>(PRODUCTS_QUERY, {
    fetchPolicy: "no-cache",
  });

  // ✅ Gestion safe des erreurs query
  useEffect(() => {
    if (!error) return;
    const msg = error.message || "";
    if (isUnauthorized(msg)) {
      clearToken();
      navigate("/login", { replace: true });
      return;
    }
    showToast("Failed to load products", "error");
  }, [error, navigate, showToast]);

  const [deleteProduct, { loading: deleting }] = useMutation<DeleteData, DeleteVars>(DELETE_PRODUCT_MUTATION);

  const products = useMemo(() => data?.products ?? [], [data]);

  const confirmDelete = async () => {
    if (!toDelete) return;

    try {
      await deleteProduct({ variables: { id: toDelete.id } });
      showToast("Product deleted", "success");
      setToDelete(null);
      await refetch();
    } catch (e: any) {
      const msg = e?.message || "";

      if (isUnauthorized(msg)) {
        clearToken();
        navigate("/login", { replace: true });
        return;
      }

      if (isForbidden(msg)) {
        showToast("You are not allowed to delete products", "error");
        return;
      }

      showToast("Failed to load products", "error");
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 4 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <CircularProgress size={22} />
          <Typography>Loading...</Typography>
        </Stack>
      </Container>
    );
  }

  // S'il y a une erreur, le toast est déjà géré via useEffect
  if (error && !data) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography>—</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5">Products</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/products/new")}>
          New
        </Button>
      </Stack>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <b>Name</b>
            </TableCell>
            <TableCell>
              <b>Price</b>
            </TableCell>
            <TableCell>
              <b>Quantity</b>
            </TableCell>
            <TableCell align="right">
              <b>Actions</b>
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {products.map((p) => (
            <TableRow key={p.id}>
              <TableCell>{p.name}</TableCell>
              <TableCell>{Number(p.price).toFixed(2)}</TableCell>
              <TableCell>{p.quantity}</TableCell>
              <TableCell align="right">
                <IconButton onClick={() => navigate(`/products/${p.id}/edit`)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => setToDelete(p)}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}

          {products.length === 0 && (
            <TableRow>
              <TableCell colSpan={4}>No products yet.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog open={!!toDelete} onClose={() => setToDelete(null)}>
        <DialogTitle>Confirm deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this product?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setToDelete(null)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="contained" color="error" disabled={deleting} onClick={confirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
