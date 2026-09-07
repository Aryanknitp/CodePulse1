import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ROUTES } from '../constants/routes.js';

export default function PublicRoute({ children }) {
  const { isAuthenticated, loading, emailVerified, codeforcesConnected, codeforcesVerified } = useAuth();

  if (loading) return null;

  if (isAuthenticated && emailVerified && codeforcesConnected && codeforcesVerified) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return children;
}
