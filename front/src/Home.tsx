import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { Navigate } from 'react-router';

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

function Home() {
  const [refresh, { data, loading, error, called }] =
    useMutation<RefreshTokenResult>(REFRESH_TOKEN);

  if (!called) {
    refresh();
    return null;
  }

  if (loading) {
    return null;
  }

  if (error || !data?.refreshToken?.accessToken) {
    return <Navigate to="/login" replace />;
  }

  localStorage.setItem('accessToken', data.refreshToken.accessToken);

  return <main></main>;
}

export default Home;
