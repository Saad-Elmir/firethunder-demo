import { Routes, Route } from "react-router-dom";
import { MockedProvider } from "@apollo/client/testing/react";

import ProductNewPage from "../pages/ProductNewPage";
import ProductEditPage from "../pages/ProductEditPage";
import { renderWithProviders } from "./testUtils";

// type léger compatible apollo mocks
type ApolloMock = {
  request: { query: any; variables?: Record<string, any> };
  result?: { data?: any };
  error?: Error;
};

type Options = {
  route?: string;
  mocks?: ApolloMock[];
};

/**
 * Helper commun pour tester ProductNewPage & ProductEditPage
 * - wrap Apollo MockedProvider
 * - wrap Router (routes nécessaires)
 * - wrap providers via renderWithProviders
 */
export function renderProductForm(kind: "new" | "edit", options: Options = {}) {
  const route = options.route ?? (kind === "new" ? "/products/new" : "/products/p1/edit");
  const mocks = options.mocks ?? [];

  return renderWithProviders(
    <MockedProvider mocks={mocks}>
      <Routes>
        <Route path="/products" element={<div>PRODUCTS_LIST</div>} />
        <Route path="/products/new" element={<ProductNewPage />} />
        <Route path="/products/:id/edit" element={<ProductEditPage />} />
      </Routes>
    </MockedProvider>,
    { route }
  );
}
