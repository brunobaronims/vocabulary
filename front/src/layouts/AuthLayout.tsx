import { useEffect } from 'react';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { Navigate, Outlet } from 'react-router';
import {
  SidebarProvider,
  SidebarTrigger,
} from '../components/ui/sidebar';
import { AppSidebar } from '../components/ui/app-sidebar';

const REFRESH_TOKEN = gql`
  mutation RefreshToken {
    refreshToken {
      accessToken
    }
  }
`;

type RefreshTokenResult = {
  refreshToken: {
    accessToken: string;
  } | null;
};

function AuthLayout() {
  const [refresh, { data, loading, error, called }] =
    useMutation<RefreshTokenResult>(REFRESH_TOKEN);

  useEffect(() => {
    if (!called) {
      refresh();
    }
  }, [called, refresh]);

  useEffect(() => {
    if (data?.refreshToken?.accessToken) {
      localStorage.setItem('accessToken', data.refreshToken.accessToken);
    }
  }, [data]);

  if (!called || loading) {
    return null;
  }

  if (error || !data?.refreshToken?.accessToken) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex h-screen w-screen flex-col">
        <SidebarTrigger className='cursor-pointer ml-1 mt-1' />
        <Outlet />
      </main>
    </SidebarProvider>
  );
}

export default AuthLayout;
