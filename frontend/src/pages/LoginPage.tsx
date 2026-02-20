import { useMemo } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  Paper,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { useTranslation } from "react-i18next";

import { setToken } from "../auth";
import { useToast } from "../ui/toast";

const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      user {
        id
        username
        role
      }
    }
  }
`;

type LoginData = {
  login: { token: string; user: { id: string; username: string; role: string } };
};

type LoginVars = {
  username: string;
  password: string;
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showToast } = useToast();

  const loginSchema = useMemo(
    () =>
      z.object({
        username: z.string().min(1, t("validation.usernameRequired")),
        password: z.string().min(6, t("validation.passwordMin")),
      }),
    [t]
  );

  type LoginForm = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: { username: "", password: "" },
  });

  const [loginMutation, { loading }] = useMutation<LoginData, LoginVars>(LOGIN_MUTATION);

  const disabled = useMemo(
    () => !isValid || isSubmitting || loading,
    [isValid, isSubmitting, loading]
  );

  const onSubmit = async (values: LoginForm) => {
    try {
      const res = await loginMutation({ variables: values });

      const token = res.data?.login?.token;
      if (!token) {
        showToast(t("toast.serverUnreachable"), "error");
        return;
      }

      setToken(token);
      navigate("/products", { replace: true });
    } catch (e: any) {
      const msg = String(e?.message ?? "").toLowerCase();

      if (
        msg.includes("failed to fetch") ||
        msg.includes("fetch failed") ||
        msg.includes("network") ||
        msg.includes("econnrefused") ||
        msg.includes("server unreachable")
      ) {
        showToast(t("toast.serverUnreachable"), "error");
        return;
      }

      if (msg.includes("invalid credentials")) {
        showToast(t("toast.invalidCredentials"), "error");
        return;
      }

      showToast(t("toast.invalidCredentials"), "error");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            mx: "auto",
            maxWidth: 520,
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
          }}
        >
          <Stack spacing={2}>
            <Typography variant="h5" fontWeight={700}>
              {t("auth.login")}
            </Typography>

            <TextField
              label={t("auth.username")}
              fullWidth
              {...register("username")}
              error={!!errors.username}
              helperText={errors.username?.message}
            />

            <TextField
              label={t("auth.password")}
              type="password"
              fullWidth
              {...register("password")}
              error={!!errors.password}
              helperText={errors.password?.message}
            />

            <Button
              variant="contained"
              fullWidth
              size="large"
              disabled={disabled}
              onClick={handleSubmit(onSubmit)}
            >
              {loading ? <CircularProgress size={22} /> : t("auth.submit")}
            </Button>

            {!isValid && (
              <Alert severity="info">
                {t("validation.usernameRequired")} / {t("validation.passwordMin")}
              </Alert>
            )}
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
