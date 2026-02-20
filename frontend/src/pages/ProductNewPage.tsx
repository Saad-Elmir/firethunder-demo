import { useMemo } from "react";
import { Container, Typography, TextField, Button, Stack, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@apollo/client/react";
import { useTranslation } from "react-i18next";

import { CREATE_PRODUCT_MUTATION } from "../graphql/products";
import { useToast } from "../ui/toast";
import { isUnauthorized } from "../graphql/errors";
import { clearToken } from "../auth";

const CreateVarsSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  price: z.number().min(0),
  quantity: z.number().int().min(0),
});

type FormValues = z.infer<typeof CreateVarsSchema>;

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
  const { t } = useTranslation();

  //  schema avec messages traduits
  const schema = useMemo(
    () =>
      z.object({
        name: z.string().min(2, t("validation.nameMin2")),
        description: z.string().optional(),
        price: z.number().min(0, t("validation.priceGte0")),
        quantity: z.number().int().min(0, t("validation.qtyGte0")),
      }),
    [t]
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: { name: "", description: "", price: 0, quantity: 0 },
  });

  const [createProduct, { loading }] = useMutation<CreateData, CreateVars>(CREATE_PRODUCT_MUTATION);

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    try {
      await createProduct({
        variables: {
          input: {
            name: values.name,
            description: values.description?.trim() ? values.description.trim() : null,
            price: values.price,
            quantity: values.quantity,
          },
        },
      });

      showToast(t("toast.productCreated"), "success");
      navigate("/products", { replace: true });
    } catch (e: any) {
      const msg = String(e?.message ?? "");
      if (isUnauthorized(msg)) {
        clearToken();
        navigate("/login", { replace: true });
        return;
      }
      showToast(t("toast.createProductFailed"), "error");
    }
  };

  return (
    <Container sx={{ py: 4, maxWidth: 640 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {t("products.newTitle")}
      </Typography>

      <Stack spacing={2}>
        <TextField
          label={t("products.name")}
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

        <TextField
          label={t("products.price")}
          type="number"
          inputProps={{ min: 0, step: "0.01" }}
          {...register("price", { valueAsNumber: true })}
          error={!!errors.price}
          helperText={errors.price?.message}
        />

        <TextField
          label={t("products.quantity")}
          type="number"
          inputProps={{ min: 0, step: "1" }}
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
  {t("buttons.cancel")}
          </Button>

          <Button
              variant="contained"
              onClick={handleSubmit(onSubmit)}
              disabled={!isValid || loading || isSubmitting}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : undefined}
          > 
             {t("buttons.create")}
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}
