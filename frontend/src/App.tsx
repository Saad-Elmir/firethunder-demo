import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { isAuthed, clearToken } from "./auth";
import AppRoutes from "./AppRoutes";

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const authed = isAuthed();
  const onLogin = () => navigate("/login");
  const onLogout = () => {
    clearToken();
    navigate("/login", { replace: true });
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            FireThunder Demo
          </Typography>

          {authed ? (
            <Button color="inherit" onClick={onLogout}>
              Logout
            </Button>
          ) : (
            location.pathname !== "/login" && (
              <Button color="inherit" onClick={onLogin}>
                Login
              </Button>
            )
          )}
        </Toolbar>
      </AppBar>

      <AppRoutes />
    </>
  );
}

