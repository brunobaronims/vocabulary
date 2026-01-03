import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Login from './Login.tsx';
import Register from './Register.tsx';
import { BrowserRouter, Routes, Route } from 'react-router';
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';

const apiUrl = import.meta.env.VITE_API_URL;

const client = new ApolloClient({
  link: new HttpLink({ uri: `${apiUrl}/graphql` }),
  cache: new InMemoryCache(),
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </ApolloProvider>
  </StrictMode>,
);
