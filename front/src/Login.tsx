import logo from './assets/logo-edify-Preto.svg';
import { Link } from 'react-router';

function Login() {
  return (
    <main className="w-screen h-screen flex flex-col items-center pt-10">
      <img src={logo} alt="Edify" className="w-40 h-auto sm:mb-10" />
      <div className="flex items-center justify-center h-full w-full">
        <div className="flex flex-col items-center h-full w-full sm:w-120 sm:h-fit py-10 md:w-160 shadow-lg rounded-md sm:border border-stone-400/50">
          <div className="h-full w-full px-10 flex flex-col justify-center items-center">
            <h1 className="font-bold text-xl sm:text-2xl mb-10">
              Vocabulary Learning Tracker
            </h1>
            <form className="w-full flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label htmlFor="username" className="text-sm font-medium">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  className="h-12 w-full rounded-md border border-stone-300 px-3 outline-none ring-0 focus:border-stone-400 hover:border-stone-400 transition-colors"
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
                  className="h-12 w-full rounded-md border border-stone-300 px-3 outline-none ring-0 focus:border-stone-400 hover:border-stone-400 transition-colors"
                />
              </div>

              <button
                type="submit"
                className="mt-2 h-12 w-full rounded-md bg-primary-blue font-semibold text-white hover:bg-primary-blue/90 transition-colors cursor-pointer"
              >
                Sign in
              </button>
            </form>
            <button
              type="button"
              className="hover:text-stone-600 cursor-pointer mt-5 text-sm transition-colors"
            >
              Forgot my password
            </button>
            <Link
              to="/register"
              className="hover:text-stone-600 cursor-pointer mt-2 text-sm transition-colors"
            >
              Create account
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Login;
