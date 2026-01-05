import { Suspense, useEffect, useState } from 'react';
import { gql } from '@apollo/client';
import { useMutation, useSuspenseQuery } from '@apollo/client/react';
import { Navigate, useNavigate } from 'react-router';
import { Skeleton } from './components/ui/skeleton';
import { getUserIdFromToken } from './lib/auth';

const ACTIVE_SESSION = gql`
  query ActiveSession($userId: Int!) {
    activeSession(userId: $userId) {
      id
      createdAt
      endsAt
      difficulty
      remainingSeconds
      currentWord {
        term
        definition
        example
        difficulty
      }
    }
  }
`;

const END_SESSION = gql`
  mutation EndSession($sessionId: Int!) {
    endSession(sessionId: $sessionId)
  }
`;

const GUESS_WORD = gql`
  mutation GuessWord($sessionId: Int!, $guess: String!) {
    guessWord(sessionId: $sessionId, guess: $guess) {
      correct
      term
    }
  }
`;

const SESSION_SCORE = gql`
  query SessionScore($sessionId: Int!) {
    sessionScore(sessionId: $sessionId)
  }
`;

type Difficulty = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

type ActiveSessionResult = {
  activeSession: {
    id: number;
    createdAt: string;
    endsAt: string;
    difficulty: Difficulty;
    remainingSeconds: number;
    currentWord: {
      term: string;
      definition: string;
      example: string;
      difficulty: Difficulty;
    } | null;
  } | null;
};

type GuessWordResult = {
  guessWord: {
    correct: boolean;
    term: string;
  };
};

type SessionScoreResult = {
  sessionScore: number;
};

function Session() {
  return (
    <Suspense fallback={<SessionFallback />}>
      <SessionContent />
    </Suspense>
  );
}

function SessionContent() {
  const userId = getUserIdFromToken(localStorage.getItem('accessToken'));
  const navigate = useNavigate();
  if (!userId) {
    return <Navigate to="/" replace />;
  }
  const { data, refetch } = useSuspenseQuery<ActiveSessionResult>(
    ACTIVE_SESSION,
    {
      variables: { userId },
    },
  );

  const activeSession = data.activeSession;
  const [remainingSeconds, setRemainingSeconds] = useState<number>(
    activeSession?.remainingSeconds ?? 0,
  );
  const [endSession, { loading: ending }] = useMutation(END_SESSION);
  const [guessWord, { loading: guessing }] =
    useMutation<GuessWordResult>(GUESS_WORD);
  const [guess, setGuess] = useState('');
  const [guessResult, setGuessResult] = useState<{
    correct: boolean;
    term: string;
  } | null>(null);
  const [completedSessionId, setCompletedSessionId] = useState<number | null>(
    null,
  );

  useEffect(() => {
    if (activeSession) {
      setRemainingSeconds(activeSession.remainingSeconds);
    }
  }, [activeSession?.remainingSeconds]);

  useEffect(() => {
    if (!activeSession || completedSessionId) {
      return;
    }
    if (remainingSeconds > 0 && activeSession.currentWord) {
      return;
    }
    setCompletedSessionId(activeSession.id);
    endSession({ variables: { sessionId: activeSession.id } }).catch(() => null);
  }, [
    activeSession?.id,
    activeSession?.currentWord,
    completedSessionId,
    endSession,
    remainingSeconds,
  ]);

  useEffect(() => {
    if (!activeSession) {
      return;
    }
    const endsAtMs = new Date(activeSession.endsAt).getTime();
    const updateRemaining = () => {
      const nextRemaining = Math.max(
        0,
        Math.ceil((endsAtMs - Date.now()) / 1000),
      );
      setRemainingSeconds(nextRemaining);
    };
    updateRemaining();
    const intervalId = window.setInterval(updateRemaining, 1000);
    return () => window.clearInterval(intervalId);
  }, [activeSession?.endsAt]);

  const formattedRemaining = formatRemaining(remainingSeconds);

  const handleEndSession = async () => {
    try {
      await endSession({
        variables: { sessionId: activeSession?.id },
        refetchQueries: [
          {
            query: ACTIVE_SESSION,
            variables: { userId },
          },
        ],
      });
    } finally {
      setCompletedSessionId(activeSession?.id ?? null);
    }
  };

  const currentWord = activeSession?.currentWord ?? null;
  const canGuess = !!currentWord && guess.trim().length > 0 && !guessing;
  const hasAnswered = guessResult !== null;

  useEffect(() => {
    if (!activeSession) {
      return;
    }
    setGuess('');
    setGuessResult(null);
  }, [activeSession?.currentWord?.term]);

  if (completedSessionId) {
    return (
      <Suspense fallback={<SessionCompleteFallback />}>
        <SessionComplete
          sessionId={completedSessionId}
          onDone={async () => {
            await refetch();
            navigate('/');
          }}
        />
      </Suspense>
    );
  }

  if (!activeSession) {
    return <Navigate to="/" replace />;
  }

  if (remainingSeconds <= 0) {
    return null;
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="flex-col w-full h-full sm:w-120 sm:h-fit py-6 flex items-center justify-center shadow-lg rounded-md sm:border border-stone-400/50">
        <div className="h-full w-full px-6 flex flex-col justify-center items-center gap-6">
          <div className="w-full justify-between flex items-center">
            <h1 className="font-bold text-xl sm:text-xl">
              Do you know this word?
            </h1>
            <div className="text-sm font-semibold text-stone-700">
              {formattedRemaining}
            </div>
          </div>

          <form
            className="w-full flex flex-col gap-5 text-left"
            onSubmit={async (event) => {
              event.preventDefault();
              if (!currentWord) {
                return;
              }
              if (hasAnswered) {
                await refetch();
                return;
              }
              if (!canGuess) {
                return;
              }
              try {
                const result = await guessWord({
                  variables: {
                    sessionId: activeSession.id,
                    guess,
                  },
                });
                if (result.data?.guessWord) {
                  setGuessResult(result.data.guessWord);
                }
              } catch {
                return;
              }
            }}
          >
            <blockquote className="border-l-2 border-stone-300 pl-4 text-stone-700 italic">
              {currentWord?.definition ?? 'No hint available.'}
            </blockquote>
            <div className="flex flex-col gap-1">
              <div className="text-sm font-semibold text-stone-700">
                Example:
              </div>
              <div className="text-sm text-stone-600 italic">
                {currentWord?.example ?? 'No example available.'}
              </div>
            </div>
            <input
              type="text"
              placeholder="Your answer"
              id="answer"
              value={guess}
              onChange={(event) => setGuess(event.target.value)}
              disabled={hasAnswered}
              className={`h-10 w-full rounded-md border px-3 outline-none ring-0 transition-colors ${
                guessResult
                  ? guessResult.correct
                    ? 'border-emerald-400 bg-emerald-50 focus:border-emerald-500'
                    : 'border-rose-400 bg-rose-50 focus:border-rose-500'
                  : 'border-stone-300 bg-white focus:border-stone-400 hover:border-stone-400'
              }`}
            />
            {guessResult && !guessResult.correct ? (
              <div className="flex flex-wrap items-baseline gap-1 text-xs text-stone-700">
                <span className='text-sm'>The word was</span>
                <span className="text-base font-semibold text-emerald-600">
                  {guessResult.term}
                </span>
              </div>
            ) : null}
            <div className="flex w-full items-center justify-between">
              <button
                type="button"
                className="h-10 rounded-md border border-stone-300 px-4 text-sm font-semibold text-stone-700 transition-colors hover:border-stone-400 hover:text-stone-900 cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
                disabled={ending}
                onClick={handleEndSession}
              >
                End session
              </button>
              <button
                type="submit"
                className="h-10 rounded-md bg-primary-blue px-6 text-sm font-semibold text-white transition-colors enabled:hover:bg-primary-blue/90 cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
                disabled={hasAnswered ? false : !canGuess}
              >
                {hasAnswered ? 'Next word' : 'Guess'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function SessionFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="flex-col w-full h-full sm:w-120 sm:h-fit py-10 flex items-center justify-center shadow-lg rounded-md sm:border border-stone-400/50">
        <div className="h-full w-full px-10 flex flex-col justify-center items-center gap-4">
          <Skeleton className="h-7 w-44" />
          <Skeleton className="h-5 w-56" />
          <Skeleton className="h-5 w-40" />
        </div>
      </div>
    </div>
  );
}

type SessionCompleteProps = {
  sessionId: number;
  onDone: () => void;
};

function SessionComplete({ sessionId, onDone }: SessionCompleteProps) {
  const { data } = useSuspenseQuery<SessionScoreResult>(SESSION_SCORE, {
    variables: { sessionId },
  });

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="flex-col w-full h-full sm:w-120 sm:h-fit py-6 flex items-center justify-center shadow-lg rounded-md sm:border border-stone-400/50">
        <div className="h-full w-full px-6 flex flex-col justify-center items-center gap-4">
          <h1 className="font-bold text-xl sm:text-xl">Session complete!</h1>
          <div className="text-base text-stone-700">
            You scored{' '}
            <span className="font-semibold text-emerald-600">
              {data.sessionScore}
            </span>{' '}
            out of 100.
          </div>
          <button
            type="button"
            className="h-10 rounded-md border border-stone-300 px-6 text-sm font-semibold text-stone-700 transition-colors hover:border-stone-400 hover:text-stone-900 cursor-pointer"
            onClick={onDone}
          >
            End session
          </button>
        </div>
      </div>
    </div>
  );
}

function SessionCompleteFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="flex-col w-full h-full sm:w-120 sm:h-fit py-6 flex items-center justify-center shadow-lg rounded-md sm:border border-stone-400/50">
        <div className="h-full w-full px-6 flex flex-col justify-center items-center gap-4">
          <Skeleton className="h-7 w-44" />
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  );
}

export default Session;

function formatRemaining(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
    2,
    '0',
  )}`;
}
