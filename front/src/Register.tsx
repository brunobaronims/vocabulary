import { useState } from 'react';
import { z } from 'zod';
import { Link, Navigate } from 'react-router';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { toast } from 'sonner';
import { getRoleFromToken } from './lib/auth';

const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(createUserInput: $input) {
      id
      displayName
      role
      name
    }
  }
`;

type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN';

type CreateUserResult = {
  createUser: {
    id: string;
    displayName?: string | null;
    role: UserRole;
    name: string;
  } | null;
};

type CreateUserVars = {
  input: {
    name: string;
    displayName?: string | null;
    password: string;
    role: UserRole;
  };
};

const NAME_LENGTH_ERROR = 'Name must be 1 to 128 characters long';
const NAME_ALPHANUMERIC_ERROR = 'Name must contain only letters or numbers';
const NAME_REQUIRED_ERROR = 'Name is required';
const ROLE_REQUIRED_ERROR = 'User role is required';
const ROLE_ENUM_ERROR = 'User role must be Student, Teacher, or Admin';
const PASSWORD_LENGTH_ERROR = 'Password must be 6 to 128 characters long';
const PASSWORD_COMPLEXITY_ERROR =
  'Password must include at least one lowercase letter, one uppercase letter, one number, and one special character';
const PASSWORD_REQUIRED_ERROR = 'Password is required';
const CONFIRM_PASSWORD_REQUIRED_ERROR = 'Confirm password is required';
const CONFIRM_PASSWORD_MATCH_ERROR = 'Passwords do not match';

const registerSchema = z
  .object({
    username: z
      .string()
      .min(1, NAME_REQUIRED_ERROR)
      .max(128, NAME_LENGTH_ERROR)
      .regex(/^[A-Za-z0-9]+$/, NAME_ALPHANUMERIC_ERROR),
    displayName: z.preprocess(
      (value) => (value === '' ? undefined : value),
      z.string().optional(),
    ),
    role: z
      .string()
      .min(1, ROLE_REQUIRED_ERROR)
      .refine(
        (value) =>
          value === 'STUDENT' || value === 'TEACHER' || value === 'ADMIN',
        {
          message: ROLE_ENUM_ERROR,
        },
      ),
    password: z
      .string()
      .min(1, PASSWORD_REQUIRED_ERROR)
      .refine((value) => value.length >= 6 && value.length <= 128, {
        message: PASSWORD_LENGTH_ERROR,
      })
      .refine(
        (value) =>
          /[a-z]/.test(value) &&
          /[A-Z]/.test(value) &&
          /[0-9]/.test(value) &&
          /[^A-Za-z0-9]/.test(value),
        { message: PASSWORD_COMPLEXITY_ERROR },
      ),
    confirmPassword: z.string().min(1, CONFIRM_PASSWORD_REQUIRED_ERROR),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: CONFIRM_PASSWORD_MATCH_ERROR,
  });

type RegisterValues = z.infer<typeof registerSchema>;

function Register() {
  const role = getRoleFromToken(localStorage.getItem('accessToken'));
  const allowedRoles: UserRole[] =
    role === 'ADMIN' ? ['STUDENT', 'TEACHER', 'ADMIN'] : ['STUDENT'];
  const defaultRole: UserRole = allowedRoles[0];
  const [mutate, { loading }] = useMutation<CreateUserResult, CreateUserVars>(
    CREATE_USER,
  );

  const [values, setValues] = useState<RegisterValues>({
    username: '',
    displayName: '',
    role: defaultRole,
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof RegisterValues, string>>
  >({});

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = registerSchema.safeParse(values);
    if (!result.success) {
      const nextErrors: Partial<Record<keyof RegisterValues, string>> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof RegisterValues | undefined;
        if (key && !nextErrors[key]) {
          nextErrors[key] = issue.message;
        }
      }
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    const nextRole: UserRole = allowedRoles.includes(result.data.role)
      ? result.data.role
      : defaultRole;
    try {
      const response = await mutate({
        variables: {
          input: {
            name: result.data.username,
            displayName: result.data.displayName,
            password: result.data.password,
            role: nextRole,
          },
        },
      });

      if (!response.data?.createUser) {
        toast.error('Failed to create account.');
        return;
      }

      toast.success('User created successfully');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to create account.';
      toast.error(message);
    }
  };
  if (role !== 'ADMIN' && role !== 'TEACHER') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex items-center justify-center h-full w-full">
      <div className="flex flex-col items-center h-full w-full sm:w-120 sm:h-fit shadow-lg rounded-md sm:border border-stone-400/50">
        <div className="h-full w-full px-6 pb-6 flex flex-col justify-center items-center">
          <div className="w-full pt-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-stone-800 transition-colors"
            >
              <span aria-hidden="true">←</span>
              Back
            </Link>
          </div>
          <h1 className="font-bold text-xl sm:text-2xl mb-8">Create user</h1>
          <form className="w-full flex flex-col gap-3" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1">
              <label htmlFor="username" className="text-sm font-bold">
                Username <span className="text-stone-500">*</span>
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
              {errors.username ? (
                <span className="text-xs text-rose-600">{errors.username}</span>
              ) : null}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="displayName" className="text-sm font-medium">
                Display name
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                autoComplete="name"
                value={values.displayName}
                onChange={handleChange}
                className="h-10 w-full rounded-md border border-stone-300 px-3 outline-none ring-0 focus:border-stone-400 hover:border-stone-400 transition-colors"
              />
              {errors.displayName ? (
                <span className="text-xs text-rose-600">
                  {errors.displayName}
                </span>
              ) : null}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-sm font-bold">
                Password <span className="text-stone-500">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={values.password}
                onChange={handleChange}
                className="h-10 w-full rounded-md border border-stone-300 px-3 outline-none ring-0 focus:border-stone-400 hover:border-stone-400 transition-colors"
              />
              {errors.password ? (
                <span className="text-xs text-rose-600">{errors.password}</span>
              ) : null}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="confirmPassword" className="text-sm font-bold">
                Confirm password <span className="text-stone-500">*</span>
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={values.confirmPassword}
                onChange={handleChange}
                className="h-10 w-full rounded-md border border-stone-300 px-3 outline-none ring-0 focus:border-stone-400 hover:border-stone-400 transition-colors"
              />
              {errors.confirmPassword ? (
                <span className="text-xs text-rose-600">
                  {errors.confirmPassword}
                </span>
              ) : null}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="role" className="text-sm font-bold">
                Role <span className="text-stone-500">*</span>
              </label>
                <select
                  id="role"
                  name="role"
                  value={values.role}
                  onChange={handleChange}
                  className="h-10 w-full cursor-pointer rounded-md border border-stone-300 bg-white px-3 outline-none ring-0 focus:border-stone-400 hover:border-stone-400 transition-colors"
                >
                {allowedRoles.map((option) => (
                  <option key={option} value={option}>
                    {option[0] + option.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
              {errors.role ? (
                <span className="text-xs text-rose-600">{errors.role}</span>
              ) : null}
            </div>

            <button
              type="submit"
              className="mt-2 h-10 w-full rounded-md bg-primary-blue font-semibold text-white transition-colors duration-300 enabled:hover:bg-primary-blue/90 cursor-pointer disabled:cursor-not-allowed disabled:bg-primary-blue/70 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white"
                  aria-hidden="true"
                />
              ) : null}
              <span>Create account</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
