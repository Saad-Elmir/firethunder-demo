import { describe, it, expect } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { Routes, Route } from "react-router-dom";
import { MockedProvider } from "@apollo/client/testing/react";

import ProductsPage from "../pages/ProductsPage";
import { renderWithProviders } from "../test/testUtils";
import { PRODUCTS_QUERY, DELETE_PRODUCT_MUTATION } from "../graphql/products";

describe("ProductsPage", () => {
  it("render table + New/Edit/Delete actions", async () => {
    const mocks = [
      // 1) initial query
      {
        request: { query: PRODUCTS_QUERY },
        result: {
          data: {
            products: [
              {
                id: "p1",
                name: "Laptop",
                description: "Lenovo",
                price: "1300.99",
                quantity: 3,
                createdAt: "2026-01-01",
                updatedAt: "2026-01-01",
              },
              {
                id: "p2",
                name: "Mouse Pro",
                description: "Logi",
                price: "29.99",
                quantity: 12,
                createdAt: "2026-01-01",
                updatedAt: "2026-01-01",
              },
            ],
          },
        },
      },

      // 2) delete mutation
      {
        request: {
          query: DELETE_PRODUCT_MUTATION,
          variables: { id: "p1" },
        },
        result: {
          data: { deleteProduct: true },
        },
      },

      // 3) refetch after delete (ProductsPage appelle refetch())
      {
        request: { query: PRODUCTS_QUERY },
        result: {
          data: {
            products: [
              {
                id: "p2",
                name: "Mouse Pro",
                description: "Logi",
                price: "29.99",
                quantity: 12,
                createdAt: "2026-01-01",
                updatedAt: "2026-01-01",
              },
            ],
          },
        },
      },
    ];

    renderWithProviders(
      <MockedProvider mocks={mocks}>
        <Routes>
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/new" element={<div>NEW_PAGE</div>} />
          <Route path="/products/:id/edit" element={<div>EDIT_PAGE</div>} />
        </Routes>
      </MockedProvider>,
      { route: "/products" }
    );

    // Wait list loaded
    await waitFor(() => {
      expect(screen.getByText("Laptop")).toBeInTheDocument();
      expect(screen.getByText("Mouse Pro")).toBeInTheDocument();
    });

    // Headers exist (EN/FR)
    expect(screen.getByText(/name|nom/i)).toBeInTheDocument();
    expect(screen.getByText(/price|prix/i)).toBeInTheDocument();
    expect(screen.getByText(/quantity|quantité/i)).toBeInTheDocument();
    expect(screen.getByText(/actions/i)).toBeInTheDocument();

    // --- New button navigates
    fireEvent.click(screen.getByRole("button", { name: /new|nouveau/i }));
    await waitFor(() => expect(screen.getByText("NEW_PAGE")).toBeInTheDocument());

    // Back to products for remaining actions (render again)
    renderWithProviders(
      <MockedProvider mocks={mocks}>
        <Routes>
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/new" element={<div>NEW_PAGE</div>} />
          <Route path="/products/:id/edit" element={<div>EDIT_PAGE</div>} />
        </Routes>
      </MockedProvider>,
      { route: "/products" }
    );

    await waitFor(() => expect(screen.getByText("Laptop")).toBeInTheDocument());

    // --- Edit button navigates (aria-label translated)
    fireEvent.click(screen.getAllByLabelText(/edit|modifier/i)[0]);
    await waitFor(() => expect(screen.getByText("EDIT_PAGE")).toBeInTheDocument());

    // Back again to products to test delete flow
    renderWithProviders(
      <MockedProvider mocks={mocks} >
        <Routes>
          <Route path="/products" element={<ProductsPage />} />
        </Routes>
      </MockedProvider>,
      { route: "/products" }
    );

    await waitFor(() => expect(screen.getByText("Laptop")).toBeInTheDocument());

    // --- Delete opens dialog
    fireEvent.click(screen.getAllByLabelText(/delete|supprimer/i)[0]);
    expect(screen.getByText(/confirm deletion|confirmer la suppression/i)).toBeInTheDocument();

    // Confirm delete
    fireEvent.click(screen.getByRole("button", { name: /delete|supprimer/i }));

    // toast success appears
    await waitFor(() => {
      expect(screen.getByText(/product deleted|produit supprimé/i)).toBeInTheDocument();
    });

    // after refetch, Laptop should disappear
    await waitFor(() => {
      expect(screen.queryByText("Laptop")).not.toBeInTheDocument();
      expect(screen.getByText("Mouse Pro")).toBeInTheDocument();
    });
  });
});
