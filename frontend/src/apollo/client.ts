import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
  from,
} from "@apollo/client";
import { ErrorLink } from "@apollo/client/link/error";

import i18n from "../i18n";
import { toast } from "../ui/toastBus";
import { clearToken } from "../auth";
import { isUnauthorized, isForbidden } from "../graphql/errors";

// --- Type guards compatibles avec ErrorLike (Apollo v4)
type WithGraphQLErrors = { graphQLErrors?: Array<{ message?: string | null }> };
type WithNetworkError = { networkError?: unknown };

function hasGraphQLErrors(err: unknown): err is WithGraphQLErrors {
  return !!err && typeof err === "object" && "graphQLErrors" in err;
}

function hasNetworkError(err: unknown): err is WithNetworkError {
  return !!err && typeof err === "object" && "networkError" in err;
}

const httpLink = new HttpLink({
  uri: "http://127.0.0.1:8000/graphql",
});

const authLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem("token")?.trim();

  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }));

  return forward(operation);
});

const errorLink = new ErrorLink(({ error }) => {
  if (!error) return;

  // 1) Network error
  if (hasNetworkError(error) && error.networkError) {
    toast.show(i18n.t("toast.serverUnreachable"), "error");
    return;
  }

  // 2) GraphQL errors (Unauthorized / Forbidden)
  const gqlErrors = hasGraphQLErrors(error) ? error.graphQLErrors ?? [] : [];

  for (const ge of gqlErrors) {
    const msg = ge?.message ?? "";

    if (isUnauthorized(msg)) {
      clearToken();
      window.location.replace("/login");
      return;
    }

    if (isForbidden(msg)) {
      toast.show(i18n.t("toast.accessDenied"), "error");
      return;
    }
  }
});

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
});