import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { auth } from '../firebase/firebase';

// http link
const httpLink = createHttpLink({ uri: import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:4000/graphql' });

// auth link: injeta o token Firebase (se existir) no header Authorization
const authLink = setContext(async (_, { headers }) => {
  try {
    const user = auth.currentUser;
    const token = user ? await user.getIdToken() : null;
    return { headers: { ...headers, authorization: token ? `Bearer ${token}` : '' } };
  } catch {
    return { headers };
  }
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});

export default client;
