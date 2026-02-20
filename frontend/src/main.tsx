import "./i18n";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ToastProvider } from "./ui/toast";

import { BrowserRouter } from "react-router-dom";
import { ApolloProvider } from "@apollo/client/react";
import { apolloClient } from "./apollo/client";
import { AppThemeProvider } from "./theme";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ApolloProvider client={apolloClient}>
      <AppThemeProvider>
        <ToastProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ToastProvider>
      </AppThemeProvider>
    </ApolloProvider>
  </React.StrictMode>
);
