import { Navigate } from 'react-router-dom';
import useAuth from '../context/Auth';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const token = localStorage.getItem("token")

  if ((!user || !token) && !loading) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
