import { Suspense, useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { gql } from '@apollo/client';
import { useMutation, useSuspenseQuery } from '@apollo/client/react';
import { toast } from 'sonner';
import { Navigate, useNavigate } from 'react-router';
import { getUserIdFromToken } from './lib/auth';
import { Skeleton } from './components/ui/skeleton';

const SESSION_DIFFICULTIES = gql`
  query SessionDifficulties {
    sessionDifficulties
  }
`;

const CREATE_SESSION = gql`
  mutation CreateSession($input: CreateSessionInput!) {
    createSession(input: $input) {
      id
      createdAt
      endsAt
      difficulty
    }
  }
`;

const ACTIVE_SESSION = gql`
  query ActiveSession($userId: Int!) {
    activeSession(userId: $userId) {
      id
      remainingSeconds
    }
  }
`;

type Difficulty = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

type SessionDifficultiesResult = {
  sessionDifficulties: Difficulty[];
};

type CreateSessionResult = {
  createSession: {
    id: number;
    createdAt: string;
    endsAt: string;
    difficulty: Difficulty;
  };
};

type CreateSessionVars = {
  input: {
    userId: number;
    durationMinutes: number;
    difficulty: Difficulty;
  };
};

type ActiveSessionResult = {
  activeSession: {
    id: number;
    remainingSeconds: number;
  } | null;
};

const DURATION_OPTIONS = [1, 2, 5, 10] as const;

function StudentHome() {
  return (
    <Suspense fallback={<StudentHomeFallback />}>
      <StudentHomeContent />
    </Suspense>
  );
}

function StudentHomeContent() {
  const userId = getUserIdFromToken(localStorage.getItem('accessToken'));
  if (!userId) {
    return <Navigate to="/" replace />;
  }
  const { data } = useSuspenseQuery<ActiveSessionResult>(ACTIVE_SESSION, {
    variables: { userId },
  });

  if (data.activeSession) {
    return <Navigate to="/session" replace />;
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="flex-col w-full h-full sm:w-120 sm:h-fit py-6 flex items-center justify-center shadow-lg rounded-md sm:border border-stone-400/50">
        <div className="h-full w-full px-6 flex flex-col justify-center items-center">
          <h1 className="font-bold text-xl sm:text-2xl mb-10">
            Vocabulary Learning Tracker
          </h1>
          <Suspense fallback={<SessionFormFallback />}>
            <SessionForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function SessionForm() {
  const userId = getUserIdFromToken(localStorage.getItem('accessToken'));
  const navigate = useNavigate();
  const { data } =
    useSuspenseQuery<SessionDifficultiesResult>(SESSION_DIFFICULTIES);
  const [createSession, { loading: creating }] = useMutation<
    CreateSessionResult,
    CreateSessionVars
  >(CREATE_SESSION);
  const difficulties = data.sessionDifficulties;
  const [values, setValues] = useState<{
    duration: string;
    difficulty: Difficulty | '';
  }>({
    duration: String(DURATION_OPTIONS[0]),
    difficulty: '',
  });

  useEffect(() => {
    if (!values.difficulty && difficulties.length > 0) {
      setValues((prev) => ({ ...prev, difficulty: difficulties[0] }));
    }
  }, [values.difficulty, difficulties]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      if (!userId) {
        toast.error('Unable to start session.');
        return;
      }
      if (!values.difficulty) {
        toast.error('Select a difficulty to continue.');
        return;
      }
      await createSession({
        variables: {
          input: {
            userId,
            durationMinutes: Number(values.duration),
            difficulty: values.difficulty,
          },
        },
        refetchQueries: [
          {
            query: ACTIVE_SESSION,
            variables: { userId },
          },
        ],
        awaitRefetchQueries: true,
      });
      navigate('/session');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to start session.';
      toast.error(message);
    }
  };

  const handleChange = (
    event: ChangeEvent<HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form
      className="w-full flex flex-col gap-3"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="duration" className="text-sm font-bold">
          Session duration <span className="text-stone-500">*</span>
        </label>
        <select
          id="duration"
          name="duration"
          value={values.duration}
          onChange={handleChange}
          className="h-10 w-full cursor-pointer rounded-md border border-stone-300 bg-white px-3 outline-none ring-0 focus:border-stone-400 hover:border-stone-400 transition-colors"
        >
          {DURATION_OPTIONS.map((minutes) => (
            <option key={minutes} value={String(minutes)}>
              {minutes} minutes
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="difficulty" className="text-sm font-bold">
          Difficulty <span className="text-stone-500">*</span>
        </label>
        <select
          id="difficulty"
          name="difficulty"
          value={values.difficulty}
          onChange={handleChange}
          disabled={difficulties.length === 0}
          className="h-10 w-full cursor-pointer rounded-md border border-stone-300 bg-white px-3 outline-none ring-0 focus:border-stone-400 hover:border-stone-400 transition-colors disabled:cursor-not-allowed disabled:opacity-70"
        >
          {difficulties.map((difficulty) => (
            <option key={difficulty} value={difficulty}>
              {difficulty}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className="mt-4 h-10 w-full rounded-md bg-primary-blue font-semibold text-white transition-colors duration-300 enabled:hover:bg-primary-blue/90 cursor-pointer disabled:cursor-not-allowed disabled:bg-primary-blue/70 flex items-center justify-center gap-2"
        disabled={creating}
      >
        {creating ? (
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white"
            aria-hidden="true"
          />
        ) : null}
        <span>Start session</span>
      </button>
    </form>
  );
}

function SessionFormFallback() {
  return (
    <form className="w-full flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="duration" className="text-sm font-bold">
          Session duration <span className="text-stone-500">*</span>
        </label>
        <Skeleton className="h-6 w-full" />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="difficulty" className="text-sm font-bold">
          Difficulty <span className="text-stone-500">*</span>
        </label>
        <Skeleton className="h-6 w-full" />
      </div>
      <Skeleton className="mt-4 h-7 w-full" />
    </form>
  );
}

function StudentHomeFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="flex-col w-full h-full sm:w-120 sm:h-fit py-6 flex items-center justify-center shadow-lg rounded-md sm:border border-stone-400/50">
        <div className="h-full w-full px-6 flex flex-col justify-center items-center">
          <Skeleton className="h-7 w-56 mb-6" />
          <SessionFormFallback />
        </div>
      </div>
    </div>
  );
}

export default StudentHome;
