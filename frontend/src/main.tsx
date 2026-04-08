import React from "react";
import { createRoot } from "react-dom/client";
import { ApolloProvider } from "@apollo/client";
import client from "./graphql/client";
import App from "./App";
import "./styles/index.css";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
      <Toaster position="top-right" />
    </ApolloProvider>
  </React.StrictMode>
);
