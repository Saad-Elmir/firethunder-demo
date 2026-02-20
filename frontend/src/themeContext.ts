import { createContext } from "react";

export type ThemeMode = "light" | "dark";

export type ThemeCtx = {
  mode: ThemeMode;
  toggleMode: () => void;
};

export const ThemeContext = createContext<ThemeCtx | null>(null);
