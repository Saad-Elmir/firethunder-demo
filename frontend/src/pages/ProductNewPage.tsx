import { Container, Typography, TextField, Button, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@apollo/client/react";

import { CREATE_PRODUCT_MUTATION } from "../graphql/products";
import { useToast } from "../ui/toast";
import { isUnauthorized } from "../graphql/errors";
import { clearToken } from "../auth";

// ✅ Ici on attend directement des numbers (pas de coerce)
const schema = z.object({
  name: z.string().min(2, "name required, min 2 chars"),
  description: z.string().optional(),
  price: z.number().min(0, "price must be >= 0"),
  quantity: z.number().int().min(0, "quantity must be >= 0"),
});

type FormValues = z.infer<typeof schema>;

type CreateVars = {
  input: {
    name: string;
    description?: string | null;
    price: number;
    quantity: number;
  };
};

type CreateData = { createProduct: { id: string } };

export default function ProductNewPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: { name: "", description: "", price: 0, quantity: 0 },
  });

  // ✅ Pas de onError/onCompleted dans options (typing + contrôle via try/catch)
  const [createProduct, { loading }] = useMutation<CreateData, CreateVars>(CREATE_PRODUCT_MUTATION);

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    try {
      await createProduct({
        variables: {
          input: {
            name: values.name,
            description: values.description ? values.description : null,
            price: values.price,
            quantity: values.quantity,
          },
        },
      });

      showToast("Product created successfully", "success");
      navigate("/products", { replace: true });
    } catch (e: any) {
      const msg = e?.message || "";
      if (isUnauthorized(msg)) {
        clearToken();
        navigate("/login", { replace: true });
        return;
      }
      showToast("Create product failed", "error");
    }
  };

  return (
    <Container sx={{ py: 4, maxWidth: 640 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        New Product
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

        {/* ✅ valueAsNumber pour fournir un number au resolver */}
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
          <Button
            variant="outlined"
            onClick={() => navigate("/products")}
            disabled={loading || isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit(onSubmit)}
            disabled={!isValid || loading || isSubmitting}
          >
            Create
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}
