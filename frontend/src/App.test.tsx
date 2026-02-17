import { beforeEach, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import App from "./App";
import "./i18n";

import { ApolloProvider } from "@apollo/client/react";
import { apolloClient } from "./apollo/client";
import { AppThemeProvider } from "./theme";
import { ToastProvider } from "./ui/toast";

function renderApp(initialPath: string) {
  return render(
    <ApolloProvider client={apolloClient}>
      <AppThemeProvider>
        <ToastProvider>
          <MemoryRouter initialEntries={[initialPath]}>
            <App />
          </MemoryRouter>
        </ToastProvider>
      </AppThemeProvider>
    </ApolloProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
});

test("renders app title in protected layout when authed", () => {
  localStorage.setItem("token", "fake-token");
  renderApp("/products");

  // Le titre est dans l'AppBar du layout protégé
  expect(screen.getByText("FireThunder Demo")).toBeInTheDocument();
});

test("redirects to login when not authed", () => {
  renderApp("/products");

  // page login affiche un <Typography variant="h5">Login</Typography>
  expect(screen.getByText("Login")).toBeInTheDocument();
});



