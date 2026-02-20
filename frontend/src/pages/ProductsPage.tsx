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
  Box,
  Paper,
  TableContainer,
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
import { useTranslation } from "react-i18next";

type Product = {
  id: string;
  name: string;
  price: string; // backend renvoie string
  quantity: number;
};

type ProductsData = { products: Product[] };
type DeleteVars = { id: string };
type DeleteData = { deleteProduct: boolean };

function PageShell({ children }: { children: React.ReactNode }) {
    return (
      <Container maxWidth={false} disableGutters sx={{ py: 4, px: 3 }}>
        <Box sx={{ width: "100%", maxWidth: 1100, mx: "auto" }}>{children}</Box>
      </Container>
    );
  }
export default function ProductsPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useTranslation();

  const [toDelete, setToDelete] = useState<Product | null>(null);

  const { data, loading, error, refetch } = useQuery<ProductsData>(PRODUCTS_QUERY, {
    fetchPolicy: "no-cache",
  });

  useEffect(() => {
    if (!error) return;
    const msg = error.message || "";
    if (isUnauthorized(msg)) {
      clearToken();
      navigate("/login", { replace: true });
      return;
    }
    showToast(t("toast.failedLoadProducts"), "error");
  }, [error, navigate, showToast, t]);

  const [deleteProduct, { loading: deleting }] = useMutation<DeleteData, DeleteVars>(
    DELETE_PRODUCT_MUTATION
  );

  const products = useMemo(() => data?.products ?? [], [data]);

  const confirmDelete = async () => {
    if (!toDelete) return;

    try {
      await deleteProduct({ variables: { id: toDelete.id } });
      showToast(t("toast.productDeleted"), "success");
      setToDelete(null);
      await refetch();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);

      if (isUnauthorized(msg)) {
        clearToken();
        navigate("/login", { replace: true });
        return;
      }

      if (isForbidden(msg)) {
        showToast(t("toast.notAllowedDelete"), "error");
        return;
      }

      showToast(t("toast.failedLoadProducts"), "error");
    }
  };

  //  Container full width + contenu centré large
  

  if (loading) {
    return (
      <PageShell>
        <Stack direction="row" spacing={2} alignItems="center">
          <CircularProgress size={22} />
          <Typography>{t("common.loading") ?? "Loading..."}</Typography>
        </Stack>
      </PageShell>
    );
  }

  if (error && !data) {
    return (
      <PageShell>
        <Typography>—</Typography>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5">{t("products.title")}</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/products/new")}>
          {t("products.new")}
        </Button>
      </Stack>

      <TableContainer component={Paper} variant="outlined">
        <Table sx={{ width: "100%" }}>
          <TableHead>
            <TableRow>
              <TableCell>
                <b>{t("products.name")}</b>
              </TableCell>
              <TableCell>
                <b>{t("products.price")}</b>
              </TableCell>
              <TableCell>
                <b>{t("products.quantity")}</b>
              </TableCell>
              <TableCell align="right">
                <b>{t("products.actions")}</b>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id} hover>
                <TableCell>{p.name}</TableCell>
                <TableCell>{Number(p.price).toFixed(2)}</TableCell>
                <TableCell>{p.quantity}</TableCell>
                <TableCell align="right">
                  <IconButton aria-label={t("buttons.edit")} onClick={() => navigate(`/products/${p.id}/edit`)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton aria-label={t("buttons.delete")} onClick={() => setToDelete(p)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>{t("products.noProducts")}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={!!toDelete} onClose={() => setToDelete(null)}>
        <DialogTitle>{t("products.confirmDeletionTitle")}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t("products.confirmDeletionMessage")}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setToDelete(null)} disabled={deleting}>
            {t("buttons.cancel")}
          </Button>
          <Button variant="contained" color="error" disabled={deleting} onClick={confirmDelete} startIcon={deleting ? <CircularProgress size={18} color="inherit" /> : undefined}>
            {t("buttons.delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  );
}
