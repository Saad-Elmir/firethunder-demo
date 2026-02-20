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
  Container,
} from "@mui/material";
import Tooltip from "@mui/material/Tooltip";

import MenuIcon from "@mui/icons-material/Menu";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import LogoutIcon from "@mui/icons-material/Logout";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import LanguageIcon from "@mui/icons-material/Language";

import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { clearToken } from "../auth";
import { useAppTheme } from "../theme";
import { getLang, setLang } from "../i18n";

export default function ProtectedLayout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { t } = useTranslation();
  const { mode, toggleMode } = useAppTheme();

  const lang = getLang().toUpperCase();

  const go = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  const logout = () => {
    clearToken();
    navigate("/login", { replace: true });
  };

  const onToggleLang = () => {
    const next = getLang() === "fr" ? "en" : "fr";
    setLang(next); //  localStorage + i18n.changeLanguage
  };

  const isProducts = location.pathname.startsWith("/products");

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <AppBar position="static">
        <Container maxWidth={false} disableGutters sx={{ px: 2 }}>
           <Toolbar disableGutters>
             <IconButton
                color="inherit"
                edge="start"
                onClick={() => setOpen(true)}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>

              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                 {t("app.title")}
              </Typography>

              <Typography variant="body2" sx={{ opacity: 0.9, mr: 1 }}>
                {lang}
              </Typography>

              <Tooltip title={mode === "dark" ? "Light mode" : "Dark mode"}>
                <IconButton color="inherit" onClick={toggleMode}>
                  {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
              </Tooltip>
            </Toolbar>
        </Container>
      </AppBar>


      <Drawer open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 280 }} role="presentation">
          <List>
            <ListItemButton selected={isProducts} onClick={() => go("/products")}>
              <ListItemIcon>
                <Inventory2Icon />
              </ListItemIcon>
              <ListItemText primary={t("menu.products")} />
            </ListItemButton>

            <Divider sx={{ my: 1 }} />

            <ListItemButton onClick={toggleMode}>
              <ListItemIcon>
                <DarkModeIcon />
              </ListItemIcon>
              <ListItemText primary={t("menu.themeSwitch")} />
              <Switch edge="end" checked={mode === "dark"} />
            </ListItemButton>

            <ListItemButton onClick={onToggleLang}>
              <ListItemIcon>
                <LanguageIcon />
              </ListItemIcon>
              <ListItemText
                primary={t("menu.languageSwitch")}
                secondary={`${t("menu.current")}: ${lang}`}
              />
            </ListItemButton>

            <Divider sx={{ my: 1 }} />

            <ListItemButton onClick={logout}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary={t("menu.logout")} />
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
