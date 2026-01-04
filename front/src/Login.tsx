import { useState } from 'react';
import logo from './assets/logo-edify-Preto.svg';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { toast } from 'sonner';
import { Navigate, useNavigate } from 'react-router';

const REFRESH_TOKEN = gql`
  mutation RefreshToken {
    refreshToken {
      accessToken
    }
  }
`;

const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(loginInput: $input) {
      accessToken
    }
  }
`;

type LoginResult = {
  login: {
    accessToken: string;
  } | null;
};

type LoginVars = {
  input: {
    name: string;
    password: string;
  };
};

type RefreshTokenResult = {
  refreshToken: {
    accessToken: string;
  } | null;
};

function Login() {
  const [refresh, { data, loading: refreshLoading, called }] =
    useMutation<RefreshTokenResult>(REFRESH_TOKEN);
  const [mutate, { loading }] = useMutation<LoginResult, LoginVars>(LOGIN);
  const [values, setValues] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  if (!called) {
    refresh();
    return null;
  }

  if (refreshLoading) {
    return null;
  }

  if (data?.refreshToken?.accessToken) {
    localStorage.setItem('accessToken', data.refreshToken.accessToken);
    return <Navigate to="/" replace />;
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await mutate({
        variables: {
          input: {
            name: values.username,
            password: values.password,
          },
        },
      });
      if (!response.data?.login) {
        toast.error('Invalid credentials.');
        return;
      }
      localStorage.setItem('accessToken', response.data.login.accessToken);
      navigate('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to login.';
      toast.error(message);
    }
  };

  return (
    <main className="w-screen h-screen flex flex-col items-center pt-10">
      <img src={logo} alt="Edify" className="w-40 h-auto sm:mb-10" />
      <div className="flex items-center justify-center h-full w-full">
        <div className="flex flex-col items-center h-full w-full sm:w-120 sm:h-fit py-10 md:w-160 shadow-lg rounded-md sm:border border-stone-400/50">
          <div className="h-full w-full px-10 flex flex-col justify-center items-center">
            <h1 className="font-bold text-xl sm:text-2xl mb-10">
              Vocabulary Learning Tracker
            </h1>
            <form
              className="w-full flex flex-col gap-3"
              onSubmit={handleSubmit}
            >
              <div className="flex flex-col gap-1">
                <label htmlFor="username" className="text-sm font-medium">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={values.username}
                  onChange={handleChange}
                  className="h-10 w-full rounded-md border border-stone-300 px-3 outline-none ring-0 focus:border-stone-400 hover:border-stone-400 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={values.password}
                  onChange={handleChange}
                  className="h-10 w-full rounded-md border border-stone-300 px-3 outline-none ring-0 focus:border-stone-400 hover:border-stone-400 transition-colors"
                />
              </div>

              <button
                type="submit"
                className="mt-2 h-10 w-full rounded-md bg-primary-blue font-semibold text-white hover:bg-primary-blue/90 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-70 flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white"
                    aria-hidden="true"
                  />
                ) : null}
                <span>Sign in</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Login;
