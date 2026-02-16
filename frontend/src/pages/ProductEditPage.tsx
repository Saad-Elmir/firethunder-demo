import { useEffect, useMemo } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Stack,
  CircularProgress,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client/react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";

import { PRODUCT_BY_ID_QUERY, UPDATE_PRODUCT_MUTATION } from "../graphql/products";
import { useToast } from "../ui/toast";
import { isUnauthorized } from "../graphql/errors";
import { clearToken } from "../auth";

// types for queries/mutations
type Product = {
  id: string;
  name: string;
  description?: string | null;
  price: string; // backend returns Decimal as string
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

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: { name: "", description: "", price: 0, quantity: 0 },
  });

  // Query product
  const { data, loading, error: queryError } = useQuery<ByIdData, ByIdVars>(
    PRODUCT_BY_ID_QUERY,
    {
      variables: { id: id ?? "" },
      skip: !id,
      fetchPolicy: "no-cache",
    }
  );

  //  Gestion safe des erreurs query
  useEffect(() => {
    if (!queryError) return;
    const msg = queryError.message || "";
    if (isUnauthorized(msg)) {
      clearToken();
      navigate("/login", { replace: true });
      return;
    }
    showToast(t("toast.updateFailed"), "error");
  }, [queryError, navigate, showToast, t]);

  // Prefill form
  useEffect(() => {
    if (!data?.productById) return;
    reset({
      name: data.productById.name,
      description: data.productById.description ?? "",
      price: Number(data.productById.price),
      quantity: data.productById.quantity,
    });
  }, [data, reset]);

  // Mutation update
  const [updateProduct, { loading: saving }] = useMutation<UpdateData, UpdateVars>(
    UPDATE_PRODUCT_MUTATION
  );

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    if (!id) return;

    try {
      await updateProduct({
        variables: {
          id,
          input: {
            name: values.name,
            description: values.description?.trim() ? values.description.trim() : null,
            price: values.price,
            quantity: values.quantity,
          },
        },
      });

      showToast(t("toast.productUpdated"), "success");
      navigate("/products", { replace: true });
    } catch (e: any) {
      const msg = String(e?.message ?? "");
      if (isUnauthorized(msg)) {
        clearToken();
        navigate("/login", { replace: true });
        return;
      }
      showToast(t("toast.updateFailed"), "error");
    }
  };

  // UI states
  if (loading) {
    return (
      <Container sx={{ py: 4 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <CircularProgress size={22} />
          <Typography>{t("common.loading", "Loading...")}</Typography>
        </Stack>
      </Container>
    );
  }

  if (!data?.productById) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h6">{t("products.notFound")}</Typography>
        <Button sx={{ mt: 2 }} variant="outlined" onClick={() => navigate("/products")}>
          {t("buttons.back")}
        </Button>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4, maxWidth: 640 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {t("products.editTitle")}
      </Typography>

      <Stack spacing={2}>
        <TextField
          label={t("products.name")}
          {...register("name")}
          error={!!errors.name}
          helperText={errors.name?.message}
        />

        <TextField
          label={t("products.description", "Description")}
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
            disabled={saving || isSubmitting}
          >
            {t("buttons.cancel")}
          </Button>

          <Button
            variant="contained"
            onClick={handleSubmit(onSubmit)}
            disabled={!isValid || saving || isSubmitting}
          >
            {t("buttons.save")}
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}
