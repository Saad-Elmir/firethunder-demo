// src/__tests__/ProductNewPage.test.tsx
import { describe, it, expect, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { gql } from "@apollo/client";

import { renderProductForm } from "../test/renderProductForm";

// même mutation que dans src/graphql/products.ts
const CREATE_PRODUCT_MUTATION = gql`
  mutation ($input: ProductInput!) {
    createProduct(input: $input) {
      id
      name
      description
      price
      quantity
    }
  }
`;

describe("ProductNewPage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("validation: bouton Create désactivé si form invalide", async () => {
    renderProductForm("new", { mocks: [] });

    const btnCreate = screen.getByRole("button", { name: /create|créer/i });
    expect(btnCreate).toBeDisabled();

    // name trop court => invalid
    fireEvent.change(screen.getByLabelText(/name|nom/i), { target: { value: "A" } });
    fireEvent.change(screen.getByLabelText(/price|prix/i), { target: { value: "10" } });
    fireEvent.change(screen.getByLabelText(/quantity|quantité/i), { target: { value: "1" } });

    await waitFor(() => expect(btnCreate).toBeDisabled());
  });

  it("success: create → toast + redirect /products", async () => {
    const mocks = [
      {
        request: {
          query: CREATE_PRODUCT_MUTATION,
          variables: {
            input: {
              name: "Laptop",
              // IMPORTANT: description doit matcher la logique trim() -> null
              description: null,
              price: 1300.99,
              quantity: 3,
            },
          },
        },
        result: {
          data: {
            createProduct: {
              id: "p1",
              name: "Laptop",
              description: null,
              price: "1300.99",
              quantity: 3,
            },
          },
        },
      },
    ];

    renderProductForm("new", { mocks });

    fireEvent.change(screen.getByLabelText(/name|nom/i), { target: { value: "Laptop" } });

    // Mets description vide => trim() => null
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: "   " } });

    fireEvent.change(screen.getByLabelText(/price|prix/i), { target: { value: "1300.99" } });
    fireEvent.change(screen.getByLabelText(/quantity|quantité/i), { target: { value: "3" } });

    const btnCreate = screen.getByRole("button", { name: /create|créer/i });
    await waitFor(() => expect(btnCreate).toBeEnabled());

    fireEvent.click(btnCreate);

    // redirect (route /products dans helper)
    await waitFor(() => expect(screen.getByText("PRODUCTS_LIST")).toBeInTheDocument());

    // toast texte (EN/FR)
    await waitFor(() => {
      expect(
        screen.getByText(/product created successfully|produit créé avec succès/i)
      ).toBeInTheDocument();
    });
  });

  it("error: server error → toast Create product failed", async () => {
    const mocks = [
      {
        request: {
          query: CREATE_PRODUCT_MUTATION,
          variables: {
            input: {
              name: "Laptop",
              description: null,
              price: 1300.99,
              quantity: 3,
            },
          },
        },
        error: new Error("boom"),
      },
    ];

    renderProductForm("new", { mocks });

    fireEvent.change(screen.getByLabelText(/name|nom/i), { target: { value: "Laptop" } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: "" } });
    fireEvent.change(screen.getByLabelText(/price|prix/i), { target: { value: "1300.99" } });
    fireEvent.change(screen.getByLabelText(/quantity|quantité/i), { target: { value: "3" } });

    const btnCreate = screen.getByRole("button", { name: /create|créer/i });
    await waitFor(() => expect(btnCreate).toBeEnabled());

    fireEvent.click(btnCreate);

    await waitFor(() => {
      expect(
        screen.getByText(/create product failed|échec de création du produit/i)
      ).toBeInTheDocument();
    });
  });
});
