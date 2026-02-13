import { Container, Typography, TextField, Button, Stack, CircularProgress } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client/react";
import type { SubmitHandler } from "react-hook-form";

import { PRODUCT_BY_ID_QUERY, UPDATE_PRODUCT_MUTATION } from "../graphql/products";
import { useToast } from "../ui/toast";
import { isUnauthorized } from "../graphql/errors";
import { clearToken } from "../auth";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  name: z.string().min(2, "name required, min 2 chars"),
  description: z.string().optional(),
  price: z.number().min(0, "price must be >= 0"),
  quantity: z.number().int().min(0, "quantity must be >= 0"),
});

type FormValues = z.infer<typeof schema>;

// types for queries/mutations
type Product = {
  id: string;
  name: string;
  description?: string | null;
  price: string;
  quantity: number;
};

type ByIdData = { productById: Product | null };
type ByIdVars = { id: string };

type UpdateVars = {
  id: string;
  input: {
    name: string;
    description?: string | null;
    price: number;
    quantity: number;
  };
};

type UpdateData = {
  updateProduct: {
    id: string;
    name: string;
    price: string;
    quantity: number;
  };
};

export default function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      quantity: 0,
    },
  });

  const { data, loading, error: queryError } = useQuery<ByIdData, ByIdVars>(PRODUCT_BY_ID_QUERY, {
    variables: { id: id ?? "" },
    skip: !id,
    fetchPolicy: "no-cache",
  });

  useEffect(() => {
    if (!queryError) return;
    const msg = queryError.message || "";
    if (isUnauthorized(msg)) {
      clearToken();
      navigate("/login", { replace: true });
      return;
    }
    showToast("Update failed", "error");
  }, [queryError, navigate, showToast]);

  useEffect(() => {
    if (!data?.productById) return;
    reset({
      name: data.productById.name,
      description: data.productById.description ?? "",
      price: Number(data.productById.price),
      quantity: data.productById.quantity,
    });
  }, [data, reset]);

  const [updateProduct, { loading: saving }] = useMutation<UpdateData, UpdateVars>(UPDATE_PRODUCT_MUTATION);

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    if (!id) return;

    try {
      await updateProduct({
        variables: {
          id,
          input: {
            name: values.name,
            description: values.description ? values.description : null,
            price: values.price,
            quantity: values.quantity,
          },
        },
      });

      showToast("Product updated successfully", "success");
      navigate("/products", { replace: true });
    } catch (e: any) {
      const msg = e?.message || "";
      if (isUnauthorized(msg)) {
        clearToken();
        navigate("/login", { replace: true });
        return;
      }
      showToast("Update failed", "error");
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

  if (!data?.productById) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h6">Product not found</Typography>
        <Button sx={{ mt: 2 }} variant="outlined" onClick={() => navigate("/products")}>
          Back
        </Button>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4, maxWidth: 640 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Edit Product
      </Typography>

      <Stack spacing={2}>
        <TextField
          label="Name"
          {...register("name")}
          error={!!errors.name}
          helperText={errors.name?.message}
        />

        <TextField
          label="Description"
          multiline
          minRows={3}
          {...register("description")}
          error={!!errors.description}
          helperText={errors.description?.message}
        />

        {/* valueAsNumber to convert string to number */}
        <TextField
          label="Price"
          type="number"
          {...register("price", { valueAsNumber: true })}
          error={!!errors.price}
          helperText={errors.price?.message}
        />

        <TextField
          label="Quantity"
          type="number"
          {...register("quantity", { valueAsNumber: true })}
          error={!!errors.quantity}
          helperText={errors.quantity?.message}
        />

        <Stack direction="row" spacing={2}>
          <Button variant="outlined" onClick={() => navigate("/products")} disabled={saving || isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit(onSubmit)}
            disabled={!isValid || saving || isSubmitting}
          >
            Save
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}
