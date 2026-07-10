import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL || "http://localhost:4000/graphql",
});

// Variável mutável que o AuthContext atualiza
let currentToken: string | null = null;

export function setAuthToken(token: string | null) {
  currentToken = token;
}

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      ...(currentToken ? { authorization: `Bearer ${currentToken}` } : {}),
    },
  };
});

const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, extensions }) => {
      if (extensions?.code === "UNAUTHENTICATED") {
        console.warn(`[Auth] ${operation.operationName}: não autenticado`);
      } else {
        console.error(`[GraphQL] ${operation.operationName} — ${message}`);
      }
    });
  }
  if (networkError) {
    console.error(`[Network] ${operation.operationName}:`, networkError);
  }
});

const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
});

export default client;
