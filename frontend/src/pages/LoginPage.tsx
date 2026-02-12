import { useMemo, useState } from "react";
import { Container, Typography, TextField, Button, Alert, Snackbar, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { setToken } from "../auth";

const loginSchema = z.object({
  username: z.string().min(1, "Username required"),
  password: z.string().min(1, "Password required"),
});

type LoginForm = z.infer<typeof loginSchema>;

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

export default function LoginPage() {
  const navigate = useNavigate();
  const [toast, setToast] = useState<{ open: boolean; msg: string }>({ open: false, msg: "" });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: { username: "", password: "" },
  });

  const [loginMutation, { loading }] = useMutation<LoginData>(LOGIN_MUTATION);

  const disabled = useMemo(() => !isValid || isSubmitting || loading, [isValid, isSubmitting, loading]);

  const onSubmit = async (values: LoginForm) => {
    try {
      const res = await loginMutation({ variables: values });

      const token = res.data?.login?.token;
      if (!token) {
        setToast({ open: true, msg: "Server unreachable" });
        return;
      }

      setToken(token);
      navigate("/products", { replace: true });
    } catch (e: any) {
      const msg = String(e?.message ?? "").toLowerCase();

      // cas réseau
      if (
        msg.includes("failed to fetch") ||
        msg.includes("fetch failed") ||
        msg.includes("network") ||
        msg.includes("econnrefused") ||
        msg.includes("server unreachable")
      ) {
        setToast({ open: true, msg: "Server unreachable" });
        return;
      }

      // cas invalid credentials (message exact côté backend)
      if (msg.includes("invalid credentials")) {
        setToast({ open: true, msg: "Invalid credentials" });
        return;
      }

      // fallback
      setToast({ open: true, msg: "Invalid credentials" });
    }
  };

  return (
    <Container sx={{ py: 6, maxWidth: 520 }}>
      <Stack spacing={2}>
        <Typography variant="h5">Login</Typography>

        <TextField
          label="Username"
          fullWidth
          {...register("username")}
          error={!!errors.username}
          helperText={errors.username?.message}
        />

        <TextField
          label="Password"
          type="password"
          fullWidth
          {...register("password")}
          error={!!errors.password}
          helperText={errors.password?.message}
        />

        <Button variant="contained" disabled={disabled} onClick={handleSubmit(onSubmit)}>
          {loading ? "Loading..." : "Sign in"}
        </Button>

        {!isValid && <Alert severity="info">Veuillez remplir les champs requis.</Alert>}
      </Stack>

      <Snackbar
        open={toast.open}
        autoHideDuration={2500}
        onClose={() => setToast({ open: false, msg: "" })}
        message={toast.msg}
      />
    </Container>
  );
}
