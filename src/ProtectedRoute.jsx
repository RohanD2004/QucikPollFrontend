import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('quick_poll_user_id');

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
