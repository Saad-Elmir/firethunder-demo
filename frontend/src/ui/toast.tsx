import React, { createContext, useContext, useEffect, useState } from "react";
import { Snackbar, Alert } from "@mui/material";

type ToastSeverity = "success" | "error" | "info" | "warning";

type ToastCtx = {
  showToast: (message: string, severity?: ToastSeverity) => void;
};

const ToastContext = createContext<ToastCtx | null>(null);

// --- Pont global (utilisable hors React, ex: Apollo ErrorLink)
let _showToast: ToastCtx["showToast"] | null = null;

export const toast = {
  show: (message: string, severity: ToastSeverity = "info") => {
    _showToast?.(message, severity);
  },
};

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

  // expose showToast au pont global
  useEffect(() => {
    _showToast = showToast;
    return () => {
      _showToast = null;
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={2500}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={severity}
          onClose={() => setOpen(false)}
          sx={{ width: "100%" }}
        >
          {message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}