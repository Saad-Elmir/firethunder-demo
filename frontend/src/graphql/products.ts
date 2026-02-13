import { gql } from "@apollo/client";

export const PRODUCTS_QUERY = gql`
  query {
    products {
      id
      name
      description
      price
      quantity
      createdAt
      updatedAt
    }
  }
`;

export const PRODUCT_BY_ID_QUERY = gql`
  query ($id: String!) {
    productById(id: $id) {
      id
      name
      description
      price
      quantity
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_PRODUCT_MUTATION = gql`
  mutation ($input: ProductInput!) {
    createProduct(input: $input) {
      id
      name
      price
      quantity
    }
  }
`;

export const UPDATE_PRODUCT_MUTATION = gql`
  mutation ($id: String!, $input: ProductInput!) {
    updateProduct(id: $id, input: $input) {
      id
      name
      price
      quantity
    }
  }
`;

export const DELETE_PRODUCT_MUTATION = gql`
  mutation ($id: String!) {
    deleteProduct(id: $id)
  }
`;
