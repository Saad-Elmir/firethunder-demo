import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "../i18n";
import { ToastProvider } from "../ui/toast";
import { AppThemeProvider } from "../theme";

type Options = {
  route?: string;
};

export function renderWithProviders(ui: React.ReactElement, options: Options = {}) {
  const { route = "/" } = options;

  return render(
    <I18nextProvider i18n={i18n}>
      <AppThemeProvider>
        <ToastProvider>
          <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
        </ToastProvider>
      </AppThemeProvider>
    </I18nextProvider>
  );
}
