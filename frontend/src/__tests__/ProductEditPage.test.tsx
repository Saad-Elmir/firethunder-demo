import { describe, it, expect } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";

import { renderProductForm } from "../test/renderProductForm";
import { PRODUCT_BY_ID_QUERY, UPDATE_PRODUCT_MUTATION } from "../graphql/products";

describe("ProductEditPage", () => {
  it("prefill: charge le produit et pré-remplit le formulaire", async () => {
    const mocks = [
      {
        request: { query: PRODUCT_BY_ID_QUERY, variables: { id: "p1" } },
        result: {
          data: {
            productById: {
              id: "p1",
              name: "Laptop",
              description: "Lenovo",
              price: "1300.99",
              quantity: 2,
              createdAt: "2026-01-01",
              updatedAt: "2026-01-01",
            },
          },
        },
      },
    ];

    renderProductForm("edit", { route: "/products/p1/edit", mocks });

    await waitFor(() => expect(screen.getByDisplayValue("Laptop")).toBeInTheDocument());
    expect(screen.getByDisplayValue("Lenovo")).toBeInTheDocument();
  });

  it("success: update → toast + redirect /products", async () => {
    const mocks = [
      // query prefill
      {
        request: { query: PRODUCT_BY_ID_QUERY, variables: { id: "p1" } },
        result: {
          data: {
            productById: {
              id: "p1",
              name: "Laptop",
              description: "Lenovo",
              price: "1300.99",
              quantity: 2,
              createdAt: "2026-01-01",
              updatedAt: "2026-01-01",
            },
          },
        },
      },
      // mutation update
      {
        request: {
          query: UPDATE_PRODUCT_MUTATION,
          variables: {
            id: "p1",
            input: {
              name: "Laptop Pro",
              description: "Lenovo",
              price: 1400.5,
              quantity: 3,
            },
          },
        },
        result: {
          data: {
            updateProduct: {
              id: "p1",
              name: "Laptop Pro",
              description: "Lenovo",
              price: "1400.50",
              quantity: 3,
            },
          },
        },
      },
    ];

    renderProductForm("edit", { route: "/products/p1/edit", mocks });

    // attendre prefill
    await waitFor(() => expect(screen.getByDisplayValue("Laptop")).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText(/name|nom/i), { target: { value: "Laptop Pro" } });
    fireEvent.change(screen.getByLabelText(/price|prix/i), { target: { value: "1400.5" } });
    fireEvent.change(screen.getByLabelText(/quantity|quantité/i), { target: { value: "3" } });

    fireEvent.click(screen.getByRole("button", { name: /save|enregistrer/i }));

    // toast ok
    await waitFor(() => {
      const alerts = screen.getAllByRole("alert");
      const ok = alerts.some((a) =>
        /product updated successfully|produit mis à jour avec succès/i.test(a.textContent ?? "")
      );
      expect(ok).toBe(true);
    });

    // redirect
    await waitFor(() => expect(screen.getByText("PRODUCTS_LIST")).toBeInTheDocument());
  });

  it("product not found: affiche le message", async () => {
    const mocks = [
      {
        request: { query: PRODUCT_BY_ID_QUERY, variables: { id: "p1" } },
        result: { data: { productById: null } },
      },
    ];

    renderProductForm("edit", { route: "/products/p1/edit", mocks });

    await waitFor(() => {
      expect(screen.getByText(/product not found|produit introuvable/i)).toBeInTheDocument();
    });
  });
});
