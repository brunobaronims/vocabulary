import { Suspense, useEffect, useState } from 'react';
import { gql } from '@apollo/client';
import { useSuspenseQuery } from '@apollo/client/react';
import { Skeleton } from './components/ui/skeleton';

const STUDENTS = gql`
  query Students {
    students {
      id
      name
      displayName
    }
  }
`;

const STUDENT_PROGRESS = gql`
  query StudentProgress($userId: Int!) {
    studentProgress(userId: $userId) {
      difficultyScores {
        difficulty
        score
      }
      topCorrectWords {
        term
        count
      }
      topIncorrectWords {
        term
        count
      }
    }
  }
`;

type Student = {
  id: number;
  name: string;
  displayName: string;
};

type StudentsResult = {
  students: Student[];
};

type StudentProgressResult = {
  studentProgress: {
    difficultyScores: { difficulty: string; score: number }[];
    topCorrectWords: { term: string; count: number }[];
    topIncorrectWords: { term: string; count: number }[];
  };
};

function TeacherHome() {
  return (
    <Suspense fallback={<TeacherHomeFallback />}>
      <TeacherHomeContent />
    </Suspense>
  );
}

function TeacherHomeContent() {
  const { data } = useSuspenseQuery<StudentsResult>(STUDENTS, {
    fetchPolicy: 'network-only',
  });
  const students = data.students;
  const [selectedId, setSelectedId] = useState<number | null>(
    students[0]?.id ?? null,
  );

  useEffect(() => {
    if (!selectedId && students.length > 0) {
      setSelectedId(students[0].id);
    }
  }, [selectedId, students]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="flex-col w-full h-full sm:w-120 sm:h-fit py-6 flex items-center justify-center shadow-lg rounded-md sm:border border-stone-400/50">
        <div className="h-full w-full px-6 flex flex-col justify-center items-center gap-6">
          <h1 className="font-bold text-xl sm:text-2xl">
            Acompanhamento de progresso
          </h1>
          <div className="w-full flex flex-col gap-2">
            <label htmlFor="student" className="text-sm font-bold">
              Student
            </label>
            <select
              id="student"
              value={selectedId ?? ''}
              onChange={(event) =>
                setSelectedId(Number(event.target.value))
              }
              className="h-10 w-full cursor-pointer rounded-md border border-stone-300 bg-white px-3 outline-none ring-0 focus:border-stone-400 hover:border-stone-400 transition-colors"
            >
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.displayName ?? student.name}
                </option>
              ))}
            </select>
          </div>
          {selectedId ? (
            <Suspense fallback={<ProgressFallback />}>
              <StudentProgress userId={selectedId} />
            </Suspense>
          ) : (
            <div className="text-sm text-stone-600">
              No students available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StudentProgress({ userId }: { userId: number }) {
  const { data } = useSuspenseQuery<StudentProgressResult>(STUDENT_PROGRESS, {
    variables: { userId },
  });

  return (
    <div className="w-full flex flex-col gap-5 text-left">
      <div className="flex flex-col gap-2">
        <div className="text-sm font-semibold text-stone-700">
          Scores by difficulty
        </div>
        <div className="grid grid-cols-2 gap-2">
          {data.studentProgress.difficultyScores.map((item) => (
            <div
              key={item.difficulty}
              className="flex items-center justify-between rounded-md border border-stone-200 px-3 py-2 text-sm text-stone-700"
            >
              <span>{item.difficulty}</span>
              <span className="font-semibold text-emerald-600">{item.score}</span>
            </div>
          ))}
          {data.studentProgress.difficultyScores.length === 0 ? (
            <div className="text-sm text-stone-600">
              No sessions yet.
            </div>
          ) : null}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="text-sm font-semibold text-stone-700">
          Words mastered
        </div>
        <div className="flex flex-col gap-1 text-sm text-stone-600">
          {data.studentProgress.topCorrectWords.map((item) => (
            <div key={item.term} className="flex items-center justify-between">
              <span>{item.term}</span>
              <span className="font-semibold text-emerald-600">
                {item.count}
              </span>
            </div>
          ))}
          {data.studentProgress.topCorrectWords.length === 0 ? (
            <div>No correct guesses yet.</div>
          ) : null}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="text-sm font-semibold text-stone-700">
          Words with difficulty
        </div>
        <div className="flex flex-col gap-1 text-sm text-stone-600">
          {data.studentProgress.topIncorrectWords.map((item) => (
            <div key={item.term} className="flex items-center justify-between">
              <span>{item.term}</span>
              <span className="font-semibold text-rose-600">
                {item.count}
              </span>
            </div>
          ))}
          {data.studentProgress.topIncorrectWords.length === 0 ? (
            <div>No incorrect guesses yet.</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function TeacherHomeFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="flex-col w-full h-full sm:w-120 sm:h-fit py-6 flex items-center justify-center shadow-lg rounded-md sm:border border-stone-400/50">
        <div className="h-full w-full px-6 flex flex-col justify-center items-center gap-6">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
        </div>
      </div>
    </div>
  );
}

function ProgressFallback() {
  return (
    <div className="w-full flex flex-col gap-4 text-left">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-16 w-full" />
    </div>
  );
}

export default TeacherHome;
