import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

import { BrowserRouter, Routes, Route } from 'react-router';
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { Toaster } from '@/components/ui/sonner';

import Login from './Login.tsx';
import Register from './Register.tsx';
import Home from './Home.tsx';
import AuthLayout from './layouts/AuthLayout.tsx';

const apiUrl = import.meta.env.VITE_API_URL;

const client = new ApolloClient({
  link: new HttpLink({ uri: `${apiUrl}/graphql`, credentials: 'include' }),
  cache: new InMemoryCache(),
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<AuthLayout />}>
            <Route index element={<Home />} />
            <Route path="register" element={<Register />} />
          </Route>
        </Routes>
        <Toaster />
      </BrowserRouter>
    </ApolloProvider>
  </StrictMode>,
);
