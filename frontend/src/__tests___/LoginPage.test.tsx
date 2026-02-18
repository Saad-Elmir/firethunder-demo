// src/__tests__/LoginPage.test.tsx
import { describe, it, expect, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { Routes, Route } from "react-router-dom";
import { gql } from "@apollo/client";
import { MockedProvider } from "@apollo/client/testing/react";

import LoginPage from "../pages/LoginPage";
import { renderWithProviders } from "../test/testUtils";
import { TOKEN_KEY } from "../auth";

// même mutation que LoginPage.tsx
const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      user {
        id
        username
        role
      }
    }
  }
`;

// helper: attendre qu'un des <Alert role="alert"> contienne le texte attendu (toast ou validation)
async function expectAnyAlertToContain(pattern: RegExp) {
  await waitFor(() => {
    const alerts = screen.getAllByRole("alert");
    const found = alerts.some((a) => pattern.test(a.textContent ?? ""));
    expect(found).toBe(true);
  });
}

describe("LoginPage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("validation: bouton désactivé + messages d'erreur", async () => {
    renderWithProviders(
      <MockedProvider mocks={[]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/products" element={<div>PRODUCTS_PAGE</div>} />
        </Routes>
      </MockedProvider>,
      { route: "/login" }
    );

    const submitBtn = screen.getByRole("button", { name: /sign in|se connecter/i });
    expect(submitBtn).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/username|nom d'utilisateur/i), {
      target: { value: "saad" },
    });
    fireEvent.change(screen.getByLabelText(/password|mot de passe/i), {
      target: { value: "123" },
    });

    await waitFor(() => expect(submitBtn).toBeDisabled());

    // Le message peut apparaître 2 fois (helperText + Alert). Donc on check ">=1"
    const matches = screen.getAllByText(
      /password required \(min 6\)|mot de passe requis \(min 6\)/i
    );
    expect(matches.length).toBeGreaterThan(0);
  });

  it("succès: stocke le token + redirect vers /products", async () => {
    const mocks = [
      {
        request: {
          query: LOGIN_MUTATION,
          variables: { username: "saad", password: "Admin12345!" },
        },
        result: {
          data: {
            login: {
              token: "jwt-token-123",
              user: { id: "u1", username: "saad", role: "USER" },
            },
          },
        },
      },
    ];

    renderWithProviders(
      <MockedProvider mocks={mocks}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/products" element={<div>PRODUCTS_PAGE</div>} />
        </Routes>
      </MockedProvider>,
      { route: "/login" }
    );

    fireEvent.change(screen.getByLabelText(/username|nom d'utilisateur/i), {
      target: { value: "saad" },
    });
    fireEvent.change(screen.getByLabelText(/password|mot de passe/i), {
      target: { value: "Admin12345!" },
    });

    const submitBtn = screen.getByRole("button", { name: /sign in|se connecter/i });
    await waitFor(() => expect(submitBtn).toBeEnabled());

    fireEvent.click(submitBtn);

    await waitFor(() => expect(screen.getByText("PRODUCTS_PAGE")).toBeInTheDocument());
    expect(localStorage.getItem(TOKEN_KEY)).toBe("jwt-token-123");
  });

  it("erreur: invalid credentials → toast", async () => {
    const mocks = [
      {
        request: {
          query: LOGIN_MUTATION,
          // IMPORTANT: password doit respecter min(6), sinon le submit ne part pas
          variables: { username: "saad", password: "wrongpass6" },
        },
        error: new Error("Invalid credentials"),
      },
    ];

    renderWithProviders(
      <MockedProvider mocks={mocks}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </MockedProvider>,
      { route: "/login" }
    );

    fireEvent.change(screen.getByLabelText(/username|nom d'utilisateur/i), {
      target: { value: "saad" },
    });
    fireEvent.change(screen.getByLabelText(/password|mot de passe/i), {
      target: { value: "wrongpass6" },
    });

    const submitBtn = screen.getByRole("button", { name: /sign in|se connecter/i });
    await waitFor(() => expect(submitBtn).toBeEnabled());
    fireEvent.click(submitBtn);

    // Ne pas faire findByRole("alert") car il existe aussi l'Alert de validation
    await expectAnyAlertToContain(/invalid credentials|identifiants invalides/i);

    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  it("erreur réseau → toast server unreachable", async () => {
    const mocks = [
      {
        request: {
          query: LOGIN_MUTATION,
          variables: { username: "saad", password: "Admin12345!" },
        },
        error: new Error("Failed to fetch"),
      },
    ];

    renderWithProviders(
      <MockedProvider mocks={mocks}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </MockedProvider>,
      { route: "/login" }
    );

    fireEvent.change(screen.getByLabelText(/username|nom d'utilisateur/i), {
      target: { value: "saad" },
    });
    fireEvent.change(screen.getByLabelText(/password|mot de passe/i), {
      target: { value: "Admin12345!" },
    });

    const submitBtn = screen.getByRole("button", { name: /sign in|se connecter/i });
    await waitFor(() => expect(submitBtn).toBeEnabled());
    fireEvent.click(submitBtn);

    await expectAnyAlertToContain(/server unreachable|serveur injoignable/i);
  });
});
