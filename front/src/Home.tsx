import { getRoleFromToken } from './lib/auth';
import TeacherHome from './TeacherHome';
import UserHome from './StudentHome';

function Home() {
  const role = getRoleFromToken(localStorage.getItem('accessToken'));
  const isTeacherOrAdmin = role === 'TEACHER' || role === 'ADMIN';

  return isTeacherOrAdmin ? <TeacherHome /> : <UserHome />;
}

export default Home;
