export type ToastSeverity = "success" | "error" | "info" | "warning";

let _showToast: ((msg: string, sev?: ToastSeverity) => void) | null = null;

export const toast = {
  show: (msg: string, sev: ToastSeverity = "info") => _showToast?.(msg, sev),
  _bind: (fn: (msg: string, sev?: ToastSeverity) => void) => {
    _showToast = fn;
  },
  _unbind: () => {
    _showToast = null;
  },
};
