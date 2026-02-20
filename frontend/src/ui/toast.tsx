/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from "react";
import { Snackbar, Alert } from "@mui/material";
import { toast, type ToastSeverity } from "./toastBus";

type ToastCtx = {
  showToast: (message: string, severity?: ToastSeverity) => void;
};

const ToastContext = createContext<ToastCtx | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<ToastSeverity>("info");

  const showToast = (msg: string, sev: ToastSeverity = "info") => {
    setMessage(msg);
    setSeverity(sev);
    setOpen(true);
  };

  useEffect(() => {
    toast._bind(showToast);
    return () => toast._unbind();
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Snackbar open={open} autoHideDuration={2500} onClose={() => setOpen(false)}>
        <Alert severity={severity} onClose={() => setOpen(false)} sx={{ width: "100%" }}>
          {message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}
