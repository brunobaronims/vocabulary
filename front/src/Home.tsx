import { getRoleFromToken } from './lib/auth';
import TeacherHome from './TeacherHome';
import StudentHome from './StudentHome';

function Home() {
  const role = getRoleFromToken(localStorage.getItem('accessToken'));
  const isTeacherOrAdmin = role === 'TEACHER' || role === 'ADMIN';

  return isTeacherOrAdmin ? <TeacherHome /> : <StudentHome />;
}

export default Home;
