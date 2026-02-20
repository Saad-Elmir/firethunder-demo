import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useQuery, useMutation } from "@apollo/client/react";
import { MockedProvider } from "@apollo/client/testing/react";

import {
  PRODUCTS_QUERY,
  CREATE_PRODUCT_MUTATION,
  UPDATE_PRODUCT_MUTATION,
  DELETE_PRODUCT_MUTATION,
} from "../graphql/products";
import type { MockedResponse } from "@apollo/client/testing";

type Product = {
  id: string;
  name: string;
  description?: string | null;
  price: string;
  quantity: number;
  createdAt?: string;
  updatedAt?: string;
};

type ProductsData = { products: Product[] };

type CreateVars = {
  input: { name: string; description?: string | null; price: number; quantity: number };
};
type CreateData = { createProduct: Product };

type UpdateVars = {
  id: string;
  input: { name?: string; description?: string | null; price?: number; quantity?: number };
};
type UpdateData = { updateProduct: Product };

type DeleteVars = { id: string };
type DeleteData = { deleteProduct: boolean };

function ProductsWidget() {
  const { data, loading } = useQuery<ProductsData>(PRODUCTS_QUERY);
  if (loading) return <div>loading</div>;
  return <div>{data?.products?.[0]?.name ?? "empty"}</div>;
}

function CreateWidget() {
  const [mutate, { data }] = useMutation<CreateData, CreateVars>(CREATE_PRODUCT_MUTATION);
  return (
    <div>
      <button
        onClick={() =>
          mutate({
            variables: { input: { name: "Laptop", description: "Lenovo", price: 10, quantity: 1 } },
          })
        }
      >
        create
      </button>
      {data?.createProduct?.id && <div>created:{data.createProduct.id}</div>}
    </div>
  );
}

function UpdateWidget() {
  const [mutate, { data }] = useMutation<UpdateData, UpdateVars>(UPDATE_PRODUCT_MUTATION);
  return (
    <div>
      <button
        onClick={() =>
          mutate({
            variables: { id: "p1", input: { name: "Laptop2", price: 20, quantity: 2 } },
          })
        }
      >
        update
      </button>
      {data?.updateProduct?.name && <div>updated:{data.updateProduct.name}</div>}
    </div>
  );
}

function DeleteWidget() {
  const [mutate, { data }] = useMutation<DeleteData, DeleteVars>(DELETE_PRODUCT_MUTATION);
  return (
    <div>
      <button onClick={() => mutate({ variables: { id: "p1" } })}>delete</button>
      {data?.deleteProduct === true && <div>deleted:true</div>}
    </div>
  );
}

const mocks: MockedResponse[] = [
  {
    request: { query: PRODUCTS_QUERY },
    result: {
      data: {
        products: [
          { id: "p1", name: "Laptop", description: "Lenovo", price: "10.00", quantity: 1, createdAt: "", updatedAt: "" },
        ],
      },
    },
  },
  {
    request: {
      query: CREATE_PRODUCT_MUTATION,
      variables: { input: { name: "Laptop", description: "Lenovo", price: 10, quantity: 1 } },
    },
    result: {
      data: { createProduct: { id: "new1", name: "Laptop", description: "Lenovo", price: "10.00", quantity: 1 } },
    },
  },
  {
    request: {
      query: UPDATE_PRODUCT_MUTATION,
      variables: { id: "p1", input: { name: "Laptop2", price: 20, quantity: 2 } },
    },
    result: {
      data: { updateProduct: { id: "p1", name: "Laptop2", description: "Lenovo", price: "20.00", quantity: 2 } },
    },
  },
  {
    request: { query: DELETE_PRODUCT_MUTATION, variables: { id: "p1" } },
    result: { data: { deleteProduct: true } },
  },
];

describe("Product GraphQL logic", () => {
  it("products query returns results", async () => {
    render(
      <MockedProvider mocks={mocks}>
        <ProductsWidget />
      </MockedProvider>
    );
    expect(await screen.findByText("Laptop")).toBeInTheDocument();
  });

  it("create mutation returns created product", async () => {
    render(
      <MockedProvider mocks={mocks}>
        <CreateWidget />
      </MockedProvider>
    );
    fireEvent.click(screen.getByText("create"));
    expect(await screen.findByText("created:new1")).toBeInTheDocument();
  });

  it("update mutation returns updated product", async () => {
    render(
      <MockedProvider mocks={mocks}>
        <UpdateWidget />
      </MockedProvider>
    );
    fireEvent.click(screen.getByText("update"));
    expect(await screen.findByText("updated:Laptop2")).toBeInTheDocument();
  });

  it("delete mutation returns success response", async () => {
    render(
      <MockedProvider mocks={mocks}>
        <DeleteWidget />
      </MockedProvider>
    );
    fireEvent.click(screen.getByText("delete"));
    expect(await screen.findByText("deleted:true")).toBeInTheDocument();
  });
});
