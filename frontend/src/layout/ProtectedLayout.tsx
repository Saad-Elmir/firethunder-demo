import LightModeIcon from "@mui/icons-material/LightMode";
import Tooltip from "@mui/material/Tooltip";
import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Switch,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import LogoutIcon from "@mui/icons-material/Logout";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LanguageIcon from "@mui/icons-material/Language";

import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { clearToken } from "../auth";
import { useAppTheme } from "../theme";
import { getLang, toggleLang } from "../i18n";

export default function ProtectedLayout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, toggleMode } = useAppTheme();
  const [lang, setLang] = useState(getLang());

  const go = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  const logout = () => {
    clearToken();
    navigate("/login", { replace: true });
  };

  const onToggleLang = () => {
    const next = toggleLang();
    setLang(next);
  };

  const isProducts = location.pathname.startsWith("/products");

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setOpen(true)} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            FireThunder Demo
          </Typography>

          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {lang.toUpperCase()} • {mode.toUpperCase()}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mr: 1 }}>
            {lang.toUpperCase()}
          </Typography>

          <Tooltip title={mode === "dark" ? "Light mode" : "Dark mode"}>
            <IconButton color="inherit" onClick={toggleMode}>
               {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>

        </Toolbar>
      </AppBar>

      <Drawer open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 280 }} role="presentation">
          <List>
            <ListItemButton selected={isProducts} onClick={() => go("/products")}>
              <ListItemIcon>
                <Inventory2Icon />
              </ListItemIcon>
              <ListItemText primary="Products" />
            </ListItemButton>

            <Divider sx={{ my: 1 }} />

            <ListItemButton onClick={toggleMode}>
              <ListItemIcon>
                <DarkModeIcon />
              </ListItemIcon>
              <ListItemText primary="Theme switch" />
              <Switch edge="end" checked={mode === "dark"} />
            </ListItemButton>

            <ListItemButton onClick={onToggleLang}>
              <ListItemIcon>
                <LanguageIcon />
              </ListItemIcon>
              <ListItemText primary="Language switch" secondary={`Current: ${lang.toUpperCase()}`} />
            </ListItemButton>

            <Divider sx={{ my: 1 }} />

            <ListItemButton onClick={logout}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>

      <Box sx={{ p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
