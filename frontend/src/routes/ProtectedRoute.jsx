import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ROUTES } from '../constants/routes.js';
import Spinner from '../components/common/Spinner.jsx';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, emailVerified, codeforcesConnected, codeforcesVerified } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (!emailVerified) {
    return <Navigate to={ROUTES.VERIFY_EMAIL} replace />;
  }

  if (!codeforcesConnected) {
    return <Navigate to={ROUTES.CONNECT_CODEFORCES} replace />;
  }

  if (!codeforcesVerified) {
    return <Navigate to={ROUTES.VERIFY_CODEFORCES} replace />;
  }

  return children;
}
