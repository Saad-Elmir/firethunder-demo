import { useMemo, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Alert,
  TextField,
  Stack,
  Divider,
} from "@mui/material";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

const PING_QUERY = gql`
  query Ping {
    ping
  }
`;

const ME_QUERY = gql`
  query Me {
    me {
      id
      username
      role
    }
  }
`;

type PingData = { ping: string };
type MeData = { me: { id: string; username: string; role: string } };

export default function App() {
  const [tokenInput, setTokenInput] = useState<string>("");


  const storedToken = useMemo(() => localStorage.getItem("token") ?? "", []);

  const ping = useQuery<PingData>(PING_QUERY);
  const me = useQuery<MeData>(ME_QUERY, {
    fetchPolicy: "no-cache",
  });


  const isNetworkError = (err?: { message?: string } | null) => {
    const msg = (err?.message ?? "").toLowerCase();
    return (
      msg.includes("failed to fetch") ||
      msg.includes("fetch failed") ||
      msg.includes("network") ||
      msg.includes("econnrefused") ||
      msg.includes("connection refused") ||
      msg.includes("load failed")
    );
  };

  const pingNetwork = isNetworkError(ping.error);
  const meNetwork = isNetworkError(me.error);
  const showNetworkError = pingNetwork || meNetwork;

  const meUnauthorized =
    !!me.error && !meNetwork && (me.error.message ?? "").toLowerCase().includes("unauthorized");

  const applyToken = () => {
    if (!tokenInput.trim()) return;
    localStorage.setItem("token", tokenInput.trim());
    // Recharge pour que le client relise le token facilement (simple et fiable)
    window.location.reload();
  };

  const clearToken = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            FireThunder Demo
          </Typography>
          <Button color="inherit">Login</Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 4 }}>
        <Stack spacing={2}>
          {showNetworkError && <Alert severity="error">Network error</Alert>}

          {!showNetworkError && (ping.error || me.error) && (
            <Alert severity="error">
              {meUnauthorized ? "Unauthorized" : `Erreur: ${(ping.error ?? me.error)?.message}`}
            </Alert>
          )}

          <Divider />

          <Typography variant="h6">Tests Apollo</Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
            <TextField
              fullWidth
              label="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiNmM1MmJhMC0xYWFkLTQ4ZGEtYjUzNC01Yjc1MmYwYTJiZDMiLCJ1c2VybmFtZSI6InNhYWQiLCJyb2xlIjoiVVNFUiIsImV4cCI6MTc3MDgzMDU2MX0.9OC5qdeNGW-0hP-yMJVgYDmQx2SJubtAYGi4KUcUKOA"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Colle ici le token retourné par login"
            />
            <Button variant="contained" onClick={applyToken}>
              Enregistrer token
            </Button>
            <Button variant="outlined" onClick={clearToken}>
              Supprimer token
            </Button>
          </Stack>

          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Token stocké: {storedToken ? `${storedToken.slice(0, 18)}...` : "(aucun)"}
          </Typography>

          <Divider />

          <Typography variant="subtitle1">
            Ping:{" "}
            {ping.loading ? "Loading..." : ping.data?.ping ? ` ${ping.data.ping}` : "—"}
          </Typography>

          <Typography variant="subtitle1">
            Me:{" "}
            {me.loading
              ? "Loading..."
              : me.data?.me
              ? ` ${me.data.me.username} (${me.data.me.role})`
              : meUnauthorized
              ? " Unauthorized (token absent/invalide)"
              : "—"}
          </Typography>

          <div className="mt-6 text-lg font-semibold">Tailwind works correctly</div>
        </Stack>
      </Container>
    </>
  );
}
